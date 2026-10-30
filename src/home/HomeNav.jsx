import { useEffect, useState } from 'react'

export default function HomeNav({
  bagRef,
  cartCount,
  cartOpen,
  notice,
  onBrand,
  onShop,
  onDepartment,
  onToggleCart,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    function onScroll() {
      setStuck(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function go(action) {
    setMenuOpen(false)
    action()
  }

  return (
    <header className={`nest-nav${stuck ? ' is-stuck' : ''}`}>
      <a
        className="nest-brand"
        href="/"
        onClick={(event) => {
          event.preventDefault()
          go(onBrand)
        }}
      >
        ShopNest
      </a>
      <button
        className="nest-menu"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="nest-links"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        <MenuIcon open={menuOpen} />
      </button>
      <nav id="nest-links" className={menuOpen ? 'is-open' : ''} aria-label="Shop">
        <a
          href="/#the-rail"
          onClick={(event) => {
            event.preventDefault()
            go(onShop)
          }}
        >
          Shop
        </a>
        <a
          href="/?department=men"
          onClick={(event) => {
            event.preventDefault()
            go(() => onDepartment('men'))
          }}
        >
          Men
        </a>
        <a
          href="/?department=women"
          onClick={(event) => {
            event.preventDefault()
            go(() => onDepartment('women'))
          }}
        >
          Women
        </a>
        <a href="/about">About</a>
      </nav>
      <div className="nest-nav-end">
        <p className="nest-notice" role="status">
          {notice}
        </p>
        <button ref={bagRef} className="nest-bag" type="button" onClick={onToggleCart} aria-expanded={cartOpen}>
          <BagIcon />
          Bag
          <span className="nest-bag-count">{cartCount}</span>
        </button>
      </div>
    </header>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 8h11l-.8 12H7.3L6.5 8z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8V6.8A3 3 0 0 1 12 3.8 3 3 0 0 1 15 6.8V8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.6" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.6" />
      )}
    </svg>
  )
}
