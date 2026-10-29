import crypto from 'node:crypto'
import { requireEnv } from './env.js'

const COOKIE = 'staff_session'

function secret() {
  return requireEnv('SESSION_SECRET')
}

function sameSecret(input, expected) {
  const left = crypto.createHash('sha256').update(String(input)).digest()
  const right = crypto.createHash('sha256').update(String(expected)).digest()
  return crypto.timingSafeEqual(left, right)
}

export function checkAdminPassword(password) {
  return sameSecret(password, requireEnv('ADMIN_PASSWORD'))
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${signature}`
}

function readSession(token) {
  if (!token || !token.includes('.')) return null
  const [body, signature] = token.split('.')
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url')
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.role !== 'admin' || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

function cookieValue(request) {
  const header = request.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE) return decodeURIComponent(rest.join('='))
  }
  return null
}

export function adminSession(request) {
  return readSession(cookieValue(request))
}

export function requireAdmin(request, response) {
  if (adminSession(request)) return true
  response.status(401).json({ error: 'Staff sign-in is required.' })
  return false
}

export function setAdminCookie(response) {
  const token = sign({ role: 'admin', exp: Date.now() + 8 * 60 * 60 * 1000 })
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secure}`,
  )
}

export function clearAdminCookie(response) {
  response.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`)
}
