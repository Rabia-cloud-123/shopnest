import { spawn } from 'node:child_process'
import path from 'node:path'
import { loadEnv } from './env.js'

loadEnv()

const port = '3099'
const base = `http://127.0.0.1:${port}`
const root = path.resolve(import.meta.dirname, '..')

function startServer() {
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: root,
    env: { ...process.env, PORT: port },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let logs = ''
  child.stdout.on('data', (chunk) => {
    logs += chunk
  })
  child.stderr.on('data', (chunk) => {
    logs += chunk
  })
  child.logs = () => logs
  return child
}

async function stopServer(child) {
  if (child.exitCode !== null) return
  child.kill()
  await new Promise((resolve) => child.once('exit', resolve))
}

async function waitForHealth(child) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`API exited early.\n${child.logs()}`)
    }
    try {
      const response = await fetch(`${base}/api/health`)
      if (response.ok) return
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`API did not become ready.\n${child.logs()}`)
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `Request failed with ${response.status}`)
  }
  return data
}

async function run() {
  if (!process.env.DATABASE_URL || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    throw new Error('DATABASE_URL, ADMIN_PASSWORD, and SESSION_SECRET must be set in .env before verification.')
  }

  let server = startServer()
  try {
    await waitForHealth(server)
    const catalog = await readJson(await fetch(`${base}/api/products`))
    const product = catalog.products.find((item) => item.id === 'heavyweight-tee' && item.stockQuantity > 0)
    if (!product) throw new Error('Heavyweight tee is missing or out of stock.')
    const stockBefore = product.stockQuantity

    const hidden = await fetch(`${base}/api/orders`)
    if (hidden.status !== 404) throw new Error('Public order list should not exist.')

    const tampered = await fetch(`${base}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Order Flow Check',
        email: 'order-flow@example.com',
        phone: '+1 202 555 0148',
        address: '18 Example Street',
        city: 'Karachi',
        postalCode: '75500',
        country: 'Pakistan',
        items: [{ productId: 'heavyweight-tee', size: 'M', quantity: 1, price: 1 }],
      }),
    })
    if (tampered.status !== 400) throw new Error('A client-supplied price should be rejected.')

    const placed = await readJson(
      await fetch(`${base}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Order Flow Check',
          email: 'order-flow@example.com',
          phone: '+1 202 555 0148',
          address: '18 Example Street',
          city: 'Karachi',
          postalCode: '75500',
          country: 'Pakistan',
          items: [{ productId: 'heavyweight-tee', size: 'M', quantity: 1 }],
        }),
      }),
    )
    if (!placed.order.reference.startsWith('BC-')) throw new Error('Order reference was not returned.')
    if (placed.order.total !== product.price) throw new Error('Total did not use the database price.')
    if (placed.order.status !== 'placed') throw new Error('Order was not left unpaid and placed.')

    const after = await readJson(await fetch(`${base}/api/products`))
    const updated = after.products.find((item) => item.id === 'heavyweight-tee')
    if (updated.stockQuantity !== stockBefore - 1) throw new Error('Stock was not reduced.')

    await stopServer(server)
    server = startServer()
    await waitForHealth(server)

    const restarted = await readJson(await fetch(`${base}/api/products`))
    const persistedProduct = restarted.products.find((item) => item.id === 'heavyweight-tee')
    if (persistedProduct.stockQuantity !== stockBefore - 1) {
      throw new Error('Stock did not remain saved after the API restarted.')
    }

    const denied = await fetch(`${base}/api/admin/orders`)
    if (denied.status !== 401) throw new Error('Orders were readable without staff sign-in.')

    const login = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    })
    const cookie = login.headers.getSetCookie?.() ?? []
    const session = cookie.map((entry) => entry.split(';')[0]).join('; ')
    if (!login.ok || !session) throw new Error('Staff sign-in did not set a session.')

    const orders = await readJson(
      await fetch(`${base}/api/admin/orders`, { headers: { cookie: session } }),
    )
    const saved = orders.orders.find((order) => order.reference === placed.order.reference)
    if (!saved) throw new Error('Order was not saved after the API restarted.')
    if (saved.email !== 'order-flow@example.com' || saved.total !== product.price) {
      throw new Error('Saved order details did not match the checkout.')
    }

    console.log(`Verified order ${saved.reference}. Stock and the order remained after an API restart.`)
  } finally {
    await stopServer(server)
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
