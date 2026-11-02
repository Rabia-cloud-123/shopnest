import pg from 'pg'
import { loadEnv, requireEnv } from './env.js'

loadEnv()

const connectionString = requireEnv('DATABASE_URL')
const local = /localhost|127\.0\.0\.1/.test(connectionString)
const onVercel = Boolean(process.env.VERCEL)

if (onVercel && !local && !connectionString.includes('-pooler')) {
  console.error('DATABASE_URL on Vercel should be the Neon pooled connection string.')
}

// pg applies sslmode from the URL after the pool options, so an explicit ssl
// object is discarded. sslmode=require is also reported as an error-style
// warning because that alias currently means verify-full and will change.
// Drop sslmode and set TLS here, which is the setting the driver actually uses.
function connectionWithoutSslMode(value) {
  const queryIndex = value.indexOf('?')
  if (queryIndex === -1) return value
  const params = value
    .slice(queryIndex + 1)
    .split('&')
    .filter((part) => part && !/^sslmode=/i.test(part) && !/^uselibpqcompat=/i.test(part))
  return params.length ? `${value.slice(0, queryIndex)}?${params.join('&')}` : value.slice(0, queryIndex)
}

export const pool = new pg.Pool({
  connectionString: connectionWithoutSslMode(connectionString),
  ssl: local ? false : { rejectUnauthorized: true },
  max: onVercel ? 1 : 10,
  idleTimeoutMillis: onVercel ? 10_000 : 60_000,
  connectionTimeoutMillis: 10_000,
})

pool.on('error', (error) => {
  console.error('Database pool error:', error.message)
})
