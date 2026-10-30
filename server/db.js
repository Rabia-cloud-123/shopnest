import pg from 'pg'
import { loadEnv, requireEnv } from './env.js'

loadEnv()

const connectionString = requireEnv('DATABASE_URL')
const local = /localhost|127\.0\.0\.1/.test(connectionString)
const onVercel = Boolean(process.env.VERCEL)

if (onVercel && !local && !connectionString.includes('-pooler')) {
  console.error('DATABASE_URL on Vercel should be the Neon pooled connection string.')
}

export const pool = new pg.Pool({
  connectionString,
  ssl: local ? false : { rejectUnauthorized: false },
  max: onVercel ? 1 : 10,
  idleTimeoutMillis: onVercel ? 10_000 : 60_000,
  connectionTimeoutMillis: 10_000,
})

pool.on('error', (error) => {
  console.error('Database pool error:', error.message)
})
