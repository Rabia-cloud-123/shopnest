async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

let productsRequest = null

export function getProducts() {
  if (productsRequest) return productsRequest
  productsRequest = fetch('/api/products')
    .then(async (response) => {
      const data = await readJson(response)
      if (!response.ok) throw new Error(data.error || 'The shop could not load clothes.')
      return data.products
    })
    .finally(() => {
      productsRequest = null
    })
  return productsRequest
}

if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
  getProducts().catch(() => {})
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
