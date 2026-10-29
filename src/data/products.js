export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function departmentLabel(department) {
  if (department === 'men') return 'Men'
  if (department === 'women') return 'Women'
  return 'All'
}
