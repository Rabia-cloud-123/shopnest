import { pool } from './db.js'

const ttlMs = 30_000
let cached = null
let inflight = null

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

export function clearCatalogCache() {
  cached = null
}

const productColumns = 'id, name, description, price, image_url, stock_quantity, department, fabric, sizes'

export function readCatalog() {
  if (cached && Date.now() - cached.at < ttlMs) return Promise.resolve(cached.products)
  if (!inflight) {
    inflight = pool
      .query(
        `SELECT ${productColumns}
         FROM products
         ORDER BY sort_order, name`,
      )
      .then((result) => {
        const products = result.rows.map(toProduct)
        cached = { at: Date.now(), products }
        return products
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function readArrivals(limit = 2) {
  return pool
    .query(
      `SELECT ${productColumns}
       FROM products
       ORDER BY created_at DESC, id ASC
       LIMIT $1`,
      [limit],
    )
    .then((result) => result.rows.map(toProduct))
}

// A checkout is stored as status "placed". That is the only completed order.
// Any other status is left out, so a cancelled or failed row cannot affect rank.
export function readBestsellers(limit = 2) {
  return pool
    .query(
      `SELECT p.id, p.name, p.description, p.price, p.image_url, p.stock_quantity,
              p.department, p.fabric, p.sizes
       FROM products p
       LEFT JOIN (
         SELECT i.product_id, SUM(i.quantity)::int AS units_sold
         FROM order_items i
         INNER JOIN orders o ON o.id = i.order_id AND o.status = 'placed'
         GROUP BY i.product_id
       ) sales ON sales.product_id = p.id
       ORDER BY COALESCE(sales.units_sold, 0) DESC, p.sort_order ASC, p.name ASC
       LIMIT $1`,
      [limit],
    )
    .then((result) => result.rows.map(toProduct))
}
