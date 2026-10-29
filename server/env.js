import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

export function loadEnv() {
  const file = path.join(root, '.env')
  if (!fs.existsSync(file)) return

  const text = fs.readFileSync(file, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

export function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env locally, or to the Vercel project environment variables in production. See .env.example.`,
    )
  }
  return value
}
