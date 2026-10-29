function text(value, label, min, max) {
  if (typeof value !== 'string') return `${label} is required.`
  const trimmed = value.trim()
  if (trimmed.length < min || trimmed.length > max) {
    return `${label} must be ${min} to ${max} characters.`
  }
  return null
}

export function validateCheckout(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'The order could not be read.' }
  }

  const forbidden = ['price', 'total', 'unitPrice', 'status', 'paid']
  if (forbidden.some((key) => Object.hasOwn(body, key))) {
    return { error: 'Prices are taken from the catalog, not the bag.' }
  }

  const checks = [
    text(body.fullName, 'Full name', 2, 80),
    text(body.email, 'Email', 5, 120),
    text(body.phone, 'Phone', 7, 20),
    text(body.address, 'Address', 5, 160),
    text(body.city, 'City', 2, 80),
    text(body.postalCode, 'Postal code', 2, 16),
    text(body.country, 'Country', 2, 80),
  ]
  const problem = checks.find(Boolean)
  if (problem) return { error: problem }

  const email = body.email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' }
  }
  const phone = body.phone.trim()
  if (!/^[0-9+().\-\s]+$/.test(phone)) {
    return { error: 'Enter a phone number using digits and the usual phone symbols.' }
  }

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
    return { error: 'Add at least one piece before checkout.' }
  }

  const items = []
  for (const item of body.items) {
    if (!item || typeof item !== 'object') return { error: 'A bag line could not be read.' }
    if (Object.hasOwn(item, 'price') || Object.hasOwn(item, 'unitPrice')) {
      return { error: 'Prices are taken from the catalog, not the bag.' }
    }
    const productId = typeof item.productId === 'string' ? item.productId.trim() : ''
    const size = typeof item.size === 'string' ? item.size.trim() : ''
    const quantity = item.quantity
    if (!productId || productId.length > 80) return { error: 'A product in the bag is not valid.' }
    if (!size || size.length > 16) return { error: 'Choose a size for every piece.' }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return { error: 'Each piece must have a quantity from 1 to 10.' }
    }
    items.push({ productId, size, quantity })
  }

  return {
    value: {
      fullName: body.fullName.trim(),
      email,
      phone,
      address: body.address.trim(),
      city: body.city.trim(),
      postalCode: body.postalCode.trim(),
      country: body.country.trim(),
      items,
    },
  }
}

export function validateProductUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'The product update could not be read.' }
  }
  const allowed = ['name', 'description', 'price', 'imageUrl', 'stockQuantity']
  if (Object.keys(body).some((key) => !allowed.includes(key))) {
    return { error: 'That product field cannot be changed here.' }
  }
  const value = {}
  if (body.name !== undefined) {
    const message = text(body.name, 'Name', 1, 120)
    if (message) return { error: message }
    value.name = body.name.trim()
  }
  if (body.description !== undefined) {
    const message = text(body.description, 'Description', 1, 1000)
    if (message) return { error: message }
    value.description = body.description.trim()
  }
  if (body.imageUrl !== undefined) {
    const message = text(body.imageUrl, 'Image URL', 1, 300)
    if (message) return { error: message }
    value.imageUrl = body.imageUrl.trim()
  }
  if (body.price !== undefined) {
    if (!Number.isInteger(body.price) || body.price < 0 || body.price > 100000) {
      return { error: 'Price must be a whole dollar amount from 0 to 100000.' }
    }
    value.price = body.price
  }
  if (body.stockQuantity !== undefined) {
    if (!Number.isInteger(body.stockQuantity) || body.stockQuantity < 0 || body.stockQuantity > 100000) {
      return { error: 'Stock must be a whole number from 0 to 100000.' }
    }
    value.stockQuantity = body.stockQuantity
  }
  if (Object.keys(value).length === 0) return { error: 'No product changes were sent.' }
  return { value }
}
