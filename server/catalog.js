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

export function readCatalog() {
  if (cached && Date.now() - cached.at < ttlMs) return Promise.resolve(cached.products)
  if (!inflight) {
    inflight = pool
      .query(
        `SELECT id, name, description, price, image_url, stock_quantity, department, fabric, sizes
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
