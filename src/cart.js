import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bias-collection-bag'

function readBag() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (line) =>
        line &&
        typeof line.id === 'string' &&
        typeof line.size === 'string' &&
        Number.isInteger(line.qty) &&
        line.qty > 0,
    )
  } catch {
    return []
  }
}

export function useCart() {
  const [lines, setLines] = useState(readBag)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  function add(product, size) {
    setLines((current) => {
      const index = current.findIndex((line) => line.id === product.id && line.size === size)
      if (index === -1) {
        return [...current, { id: product.id, size, qty: 1 }]
      }
      return current.map((line, i) => (i === index ? { ...line, qty: line.qty + 1 } : line))
    })
  }

  function setQty(id, size, qty) {
    setLines((current) =>
      current.flatMap((line) => {
        if (line.id !== id || line.size !== size) return [line]
        if (qty < 1) return []
        return [{ ...line, qty }]
      }),
    )
  }

  function remove(id, size) {
    setLines((current) => current.filter((line) => !(line.id === id && line.size === size)))
  }

  function clear() {
    setLines([])
  }

  const count = lines.reduce((sum, line) => sum + line.qty, 0)

  return { lines, add, setQty, remove, clear, count }
}
