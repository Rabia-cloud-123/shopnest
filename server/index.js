import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express from 'express'
import { loadEnv, requireEnv } from './env.js'
import { pool } from './db.js'
import { clearCatalogCache, readCatalog } from './catalog.js'
import { placeOrder } from './orders.js'
import { validateCheckout, validateProductUpdate } from './validate.js'
import {
  checkAdminPassword,
  clearAdminCookie,
  requireAdmin,
  setAdminCookie,
  adminSession,
} from './auth.js'

loadEnv()

const app = express()
app.disable('x-powered-by')

if (process.env.VERCEL) {
  app.use((request, _response, next) => {
    const current = request.url || ''
    const pathname = current.split('?')[0]
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      next()
      return
    }
    const header =
      request.headers['x-invoke-path'] ||
      request.headers['x-forwarded-uri'] ||
      request.headers['x-vercel-original-path']
    const original = Array.isArray(header) ? header[0] : header
    if (typeof original === 'string' && (original === '/api' || original.startsWith('/api/'))) {
      const query = current.includes('?') ? current.slice(current.indexOf('?')) : ''
      request.url = original.includes('?') ? original : `${original}${query}`
    }
    next()
  })
}

app.use(express.json({ limit: '32kb' }))

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next)
  }
}

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image_url,
    stockQuantity: row.stock_quantity,
    department: row.department,
    fabric: row.fabric,
    sizes: row.sizes,
  }
}

app.get('/api/health', asyncRoute(async (_request, response) => {
  await pool.query('SELECT 1')
  response.json({ ok: true })
}))

app.get('/api/products', asyncRoute(async (_request, response) => {
  response.json({ products: await readCatalog() })
}))

app.get('/api/products/:id', asyncRoute(async (request, response) => {
  const result = await pool.query(
    `SELECT id, name, description, price, image_url, stock_quantity, department, fabric, sizes
     FROM products
     WHERE id = $1`,
    [request.params.id],
  )
  if (result.rowCount !== 1) {
    response.status(404).json({ error: 'That piece is not in the catalog.' })
    return
  }
  response.json({ product: toProduct(result.rows[0]) })
}))

app.post('/api/checkout', asyncRoute(async (request, response) => {
  const parsed = validateCheckout(request.body)
  if (parsed.error) {
    response.status(400).json({ error: parsed.error })
    return
  }
  const order = await placeOrder(parsed.value)
  response.status(201).json({ order })
}))

app.post('/api/admin/login', (request, response) => {
  const password = request.body?.password
  if (typeof password !== 'string' || password.length < 1 || password.length > 200) {
    response.status(400).json({ error: 'Enter the staff password.' })
    return
  }
  if (!checkAdminPassword(password)) {
    response.status(401).json({ error: 'That staff password is not correct.' })
    return
  }
  setAdminCookie(response)
  response.json({ ok: true })
})

app.post('/api/admin/logout', (_request, response) => {
  clearAdminCookie(response)
  response.json({ ok: true })
})

app.get('/api/admin/session', (request, response) => {
  response.json({ authenticated: Boolean(adminSession(request)) })
})

app.get('/api/admin/orders', asyncRoute(async (request, response) => {
  if (!requireAdmin(request, response)) return
  const result = await pool.query(
    `SELECT
       o.reference,
       o.full_name,
       o.email,
       o.phone,
       o.address_line,
       o.city,
       o.postal_code,
       o.country,
       o.status,
       o.payment_method,
       o.total,
       o.created_at,
       json_agg(
         json_build_object(
           'name', i.product_name,
           'size', i.size,
           'quantity', i.quantity,
           'unitPrice', i.unit_price,
           'lineTotal', i.line_total
         )
         ORDER BY i.product_name
       ) AS items
     FROM orders o
     JOIN order_items i ON i.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT 100`,
  )
  response.json({
    orders: result.rows.map((row) => ({
      reference: row.reference,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address_line,
      city: row.city,
      postalCode: row.postal_code,
      country: row.country,
      status: row.status,
      paymentMethod: row.payment_method,
      total: row.total,
      createdAt: row.created_at,
      items: row.items,
    })),
  })
}))

app.patch('/api/admin/products/:id', asyncRoute(async (request, response) => {
  if (!requireAdmin(request, response)) return
  const parsed = validateProductUpdate(request.body)
  if (parsed.error) {
    response.status(400).json({ error: parsed.error })
    return
  }
  const fields = []
  const values = []
  const mapping = {
    name: 'name',
    description: 'description',
    price: 'price',
    imageUrl: 'image_url',
    stockQuantity: 'stock_quantity',
  }
  for (const [key, column] of Object.entries(mapping)) {
    if (parsed.value[key] !== undefined) {
      values.push(parsed.value[key])
      fields.push(`${column} = $${values.length}`)
    }
  }
  values.push(request.params.id)
  const result = await pool.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${values.length}
     RETURNING id, name, description, price, image_url, stock_quantity, department, fabric, sizes`,
    values,
  )
  if (result.rowCount !== 1) {
    response.status(404).json({ error: 'That piece is not in the catalog.' })
    return
  }
  clearCatalogCache()
  response.json({ product: toProduct(result.rows[0]) })
}))

const dist = path.resolve(import.meta.dirname, '../dist')
app.use(express.static(dist))
app.use((request, response, next) => {
  if (request.path.startsWith('/api')) {
    response.status(404).json({ error: 'Not found.' })
    return
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    next()
    return
  }
  response.sendFile(path.join(dist, 'index.html'), (error) => {
    if (error) response.status(404).end()
  })
})

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'The request could not be read.' })
    return
  }
  const status = Number.isInteger(error.status) ? error.status : 500
  if (status === 500) console.error(error.message)
  response.status(status).json({
    error: status === 500 ? 'The shop could not complete that request.' : error.message,
  })
})

export { app }

function assertRuntimeConfig() {
  const adminPassword = requireEnv('ADMIN_PASSWORD')
  const sessionSecret = requireEnv('SESSION_SECRET')
  if (adminPassword.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters. Set it in .env or in Vercel.')
  }
  if (sessionSecret.length < 24) {
    throw new Error('SESSION_SECRET must be at least 24 characters. Set it in .env or in Vercel.')
  }
}

function runningAsCli() {
  if (process.env.VERCEL) return false
  const entry = process.argv[1]
  if (!entry) return false
  return import.meta.url === pathToFileURL(entry).href
}

if (runningAsCli()) {
  try {
    assertRuntimeConfig()
  } catch (error) {
    console.error(error.message)
    await pool.end()
    process.exit(1)
  }

  const port = Number(process.env.PORT) || 3001
  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
    pool.query('SELECT 1').catch((error) => {
      console.error('Database warmup failed:', error.message)
    })
  })

  function shutdown() {
    server.close(() => {
      pool.end()
    })
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
} else {
  assertRuntimeConfig()
}
