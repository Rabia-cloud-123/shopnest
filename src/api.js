async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export async function getProducts() {
  const response = await fetch('/api/products')
  const data = await readJson(response)
  if (!response.ok) throw new Error(data.error || 'The shop could not load clothes.')
  return data.products
}

export async function placeOrder(payload) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await readJson(response)
  if (!response.ok) throw new Error(data.error || 'The order could not be placed.')
  return data.order
}
