import { pool } from './db.js'
import { sampleProducts } from './seed-data.js'

async function seed() {
  const client = await pool.connect()
  try {
    for (const product of sampleProducts) {
      await client.query(
        `INSERT INTO products (
           id, name, description, price, image_url, stock_quantity, department, fabric, sizes, sort_order
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.name,
          product.description,
          product.price,
          product.imageUrl,
          product.stockQuantity,
          product.department,
          product.fabric,
          product.sizes,
          product.sortOrder,
        ],
      )
    }
    console.log(`Seed checked ${sampleProducts.length} products. Existing rows were left unchanged.`)
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
