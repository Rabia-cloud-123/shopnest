import { useEffect, useState } from 'react'

const HERO_TITLE = 'Clothes for the week you actually wear.'
const SLIDE_HOLD = 5000
const SLIDE_MOVE = 1500

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function TypeLine({ text }) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0))
  const [done, setDone] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (done) return undefined
    if (count >= text.length) {
      const timer = window.setTimeout(() => setDone(true), 420)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setCount((value) => value + 1), 48)
    return () => window.clearTimeout(timer)
  }, [count, done, text])

  return (
    <span className="type-lock">
      <span className="type-sizer" aria-hidden="true">
        {text}
      </span>
      <span className="type-live" aria-hidden="true">
        {text.slice(0, count)}
        <span className={done ? 'type-caret is-done' : 'type-caret'} />
      </span>
    </span>
  )
}

function HeroFrame({ motion, label, onOpen, children }) {
  if (onOpen) {
    return (
      <button className="nest-hero-photo" type="button" data-motion={motion} onClick={onOpen} aria-label={label}>
        {children}
      </button>
    )
  }
  return (
    <div className="nest-hero-photo" data-motion={motion}>
      {children}
    </div>
  )
}

export default function HomeHero({
  slides,
  onShop,
  onOpen,
  title = HERO_TITLE,
  titleId = 'nest-hero-title',
}) {
  const [active, setActive] = useState(0)
  const [leaving, setLeaving] = useState(null)
  const [cycled, setCycled] = useState(false)
  const [intro, setIntro] = useState(() => !prefersReducedMotion())
  const slideKey = slides.map((slide) => slide.id).join('|')
  const current = slides[active] ?? null

  useEffect(() => {
    setActive(0)
    setLeaving(null)
    setCycled(false)
  }, [slideKey])

  useEffect(() => {
    if (!intro) return undefined
    const timer = window.setTimeout(() => setIntro(false), SLIDE_MOVE)
    return () => window.clearTimeout(timer)
  }, [intro])

  useEffect(() => {
    if (prefersReducedMotion() || slides.length < 2) return undefined
    const timer = window.setTimeout(() => {
      setCycled(true)
      setLeaving(active)
      setActive((index) => (index + 1) % slides.length)
    }, SLIDE_HOLD)
    return () => window.clearTimeout(timer)
  }, [active, slides.length])

  useEffect(() => {
    if (leaving == null) return undefined
    const timer = window.setTimeout(() => setLeaving(null), SLIDE_MOVE)
    return () => window.clearTimeout(timer)
  }, [leaving])

  useEffect(() => {
    if (slides.length < 2) return undefined
    const next = slides[(active + 1) % slides.length]
    const image = new Image()
    image.src = next.image
    return undefined
  }, [active, slides])

  function slideClass(index) {
    if (index === leaving) return 'is-leave'
    if (index === active && leaving != null) return 'is-enter'
    if (index === active && !cycled) return 'is-first'
    if (index === active) return 'is-settled'
    return 'is-wait'
  }

  return (
    <section
      className={current ? 'nest-hero nest-hero-home' : 'nest-hero nest-hero-home is-quiet'}
      style={{ '--hero-move': `${SLIDE_MOVE}ms` }}
      aria-labelledby={titleId}
    >
      <div className="nest-hero-copy">
        <h1 id={titleId}>
          <span className="sr-only">{title}</span>
          <TypeLine text={title} />
        </h1>
        {onShop ? (
          <>
            <p>A short rail for men and women. Choose a size, then pay the courier in cash.</p>
            <button className="nest-cta" type="button" onClick={onShop}>
              Shop now
            </button>
          </>
        ) : null}
      </div>
      {current ? (
        <HeroFrame
          motion={leaving != null || intro ? 'run' : 'idle'}
          label={onOpen ? `View ${current.name}` : undefined}
          onOpen={onOpen ? () => onOpen(current.id) : undefined}
        >
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              className={slideClass(index)}
              src={slide.image}
              alt={onOpen || index !== active ? '' : slide.alt || ''}
              decoding="async"
            />
          ))}
          <span className="hero-rule hero-rule-left" aria-hidden="true" />
          <span className="hero-rule hero-rule-right" aria-hidden="true" />
        </HeroFrame>
      ) : (
        <p className="nest-hero-wait" role="status">
          Loading the rail…
        </p>
      )}
    </section>
  )
}
