import fs from 'node:fs'
import path from 'node:path'
import { pool } from './db.js'

const migrationsDir = path.join(import.meta.dirname, 'migrations')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `)

    const applied = await client.query('SELECT id FROM schema_migrations')
    const done = new Set(applied.rows.map((row) => row.id))
    const files = fs
      .readdirSync(migrationsDir)
      .filter((name) => name.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (done.has(file)) continue
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`Applied ${file}`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    }

    console.log('Migrations are up to date.')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
