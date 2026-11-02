const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

export function followImageLight(event) {
  if (event.pointerType === 'touch' || reduceMotion.matches) return
  const media = event.currentTarget
  const rect = media.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  media.style.setProperty('--spot-x', `${x}%`)
  media.style.setProperty('--spot-y', `${y}%`)
}
