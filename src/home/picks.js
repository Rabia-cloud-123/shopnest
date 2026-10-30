export const arrivalIds = ['ivory-coat', 'embroidered-shirt']
export const bestsellerIds = ['heavyweight-tee', 'camel-coat']

export function byIds(products, ids) {
  return ids.map((id) => products.find((product) => product.id === id)).filter(Boolean)
}

export function findProduct(products, id) {
  return products.find((product) => product.id === id) ?? null
}
