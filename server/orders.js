import crypto from 'node:crypto'
import { pool } from './db.js'

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function orderReference() {
  const bytes = crypto.randomBytes(8)
  let code = ''
  for (const byte of bytes) code += alphabet[byte % alphabet.length]
  return `BC-${code}`
}

function mergeItems(items) {
  const merged = new Map()
  for (const item of items) {
    const key = `${item.productId}\u0000${item.size}`
    const current = merged.get(key)
    if (current) current.quantity += item.quantity
    else merged.set(key, { ...item })
  }
  return [...merged.values()]
}

export async function placeOrder(input) {
  const items = mergeItems(input.items)
  if (items.some((item) => item.quantity > 10)) {
    const error = new Error('Each piece must have a quantity from 1 to 10.')
    error.status = 400
    throw error
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const productIds = [...new Set(items.map((item) => item.productId))]
    const locked = await client.query(
      'SELECT id, name, price, sizes, stock_quantity FROM products WHERE id = ANY($1::text[]) FOR UPDATE',
      [productIds],
    )
    const byId = new Map(locked.rows.map((row) => [row.id, row]))
    const needed = new Map()

    for (const item of items) {
      const product = byId.get(item.productId)
      if (!product) {
        const error = new Error('A piece in the bag is no longer in the catalog.')
        error.status = 400
        throw error
      }
      if (!product.sizes.includes(item.size)) {
        const error = new Error(`${product.name} is not available in size ${item.size}.`)
        error.status = 400
        throw error
      }
      needed.set(item.productId, (needed.get(item.productId) ?? 0) + item.quantity)
    }

    for (const [productId, quantity] of needed) {
      const product = byId.get(productId)
      if (product.stock_quantity < quantity) {
        const error = new Error(
          product.stock_quantity === 0
            ? `${product.name} is out of stock.`
            : `Only ${product.stock_quantity} ${product.name} left.`,
        )
        error.status = 409
        throw error
      }
    }

    const lines = items.map((item) => {
      const product = byId.get(item.productId)
      const unitPrice = product.price
      return {
        productId: product.id,
        productName: product.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      }
    })
    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0)
    const orderId = crypto.randomUUID()
    const reference = orderReference()
    const created = await client.query(
      `INSERT INTO orders (
         id, reference, full_name, email, phone, address_line, city, postal_code, country,
         status, payment_method, total
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'placed', 'cash_on_delivery', $10)
       RETURNING created_at`,
      [
        orderId,
        reference,
        input.fullName,
        input.email,
        input.phone,
        input.address,
        input.city,
        input.postalCode,
        input.country,
        total,
      ],
    )

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (
           id, order_id, product_id, product_name, size, quantity, unit_price, line_total
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          crypto.randomUUID(),
          orderId,
          line.productId,
          line.productName,
          line.size,
          line.quantity,
          line.unitPrice,
          line.lineTotal,
        ],
      )
    }

    for (const [productId, quantity] of needed) {
      const updated = await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $2
         WHERE id = $1 AND stock_quantity >= $2`,
        [productId, quantity],
      )
      if (updated.rowCount !== 1) {
        const error = new Error('Stock changed before the order could be saved.')
        error.status = 409
        throw error
      }
    }

    await client.query('COMMIT')
    return {
      reference,
      status: 'placed',
      paymentMethod: 'cash_on_delivery',
      total,
      createdAt: created.rows[0].created_at,
      items: lines.map((line) => ({
        name: line.productName,
        size: line.size,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
      })),
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // The original error is the one the shop should report.
    }
    throw error
  } finally {
    client.release()
  }
}
