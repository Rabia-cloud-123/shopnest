import { pool } from './db.js'
import { sampleProducts } from './seed-data.js'

const retiredProductIds = ['black-slip', 'wool-polo']

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const referenced = await client.query(
      `SELECT DISTINCT product_id
       FROM order_items
       WHERE product_id = ANY($1::text[])`,
      [retiredProductIds],
    )
    if (referenced.rowCount > 0) {
      const ids = referenced.rows.map((row) => row.product_id).join(', ')
      throw new Error(`Cannot replace sample products that already have orders: ${ids}`)
    }

    const removed = await client.query(
      `DELETE FROM products WHERE id = ANY($1::text[]) RETURNING id`,
      [retiredProductIds],
    )

    let inserted = 0
    for (const product of sampleProducts) {
      const result = await client.query(
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
      inserted += result.rowCount
    }
    await client.query('COMMIT')
    const retired = removed.rows.map((row) => row.id).join(', ') || 'none'
    console.log(
      `Seed checked ${sampleProducts.length} products, inserted ${inserted}, retired ${retired}. Existing rows were left unchanged.`,
    )
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
