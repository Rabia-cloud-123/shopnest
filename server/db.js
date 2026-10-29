import pg from 'pg'
import { loadEnv, requireEnv } from './env.js'

loadEnv()

const connectionString = requireEnv('DATABASE_URL')
const local = /localhost|127\.0\.0\.1/.test(connectionString)

export const pool = new pg.Pool({
  connectionString,
  ssl: local ? false : { rejectUnauthorized: false },
  max: 10,
})

pool.on('error', (error) => {
  console.error('Database pool error:', error.message)
})
