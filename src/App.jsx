import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { getProducts, placeOrder } from './api.js'
import { useCart } from './cart.js'
import { departmentLabel, formatPrice } from './data/products.js'
import HomeFooter from './home/HomeFooter.jsx'
import HomeNav from './home/HomeNav.jsx'
import HomePage from './home/HomePage.jsx'
import './home/pages.css'

const departments = ['all', 'men', 'women']
const bestsellers = new Set(['heavyweight-tee', 'camel-coat'])
const arrivals = new Set(['ivory-coat', 'embroidered-shirt'])

function badgeFor(product) {
  if (bestsellers.has(product.id)) return 'Bestseller'
  if (arrivals.has(product.id)) return 'New arrival'
  return ''
}

function readDepartment() {
  const value = new URLSearchParams(window.location.search).get('department')
  return value === 'men' || value === 'women' ? value : 'all'
}

export default function App() {
  const cart = useCart()
  const [products, setProducts] = useState([])
  const [catalogStatus, setCatalogStatus] = useState('loading')
  const [catalogError, setCatalogError] = useState('')
  const [department, setDepartment] = useState(readDepartment)
  const [veil, setVeil] = useState(null)
  const page = window.location.pathname === '/about' ? 'about' : 'shop'
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [activeId, setActiveId] = useState(null)
  const [pickingId, setPickingId] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const bagButtonRef = useRef(null)

  const active = products.find((product) => product.id === activeId) ?? null

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const inDepartment = department === 'all' || product.department === department
      const inSearch =
        needle.length === 0 ||
        product.name.toLowerCase().includes(needle) ||
        product.fabric.toLowerCase().includes(needle)
      return inDepartment && inSearch
    })

    const sorted = [...filtered]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [products, department, query, sort])

  function openCart() {
    setCartOpen(true)
  }

  function chooseDepartment(value) {
    if (value !== department) {
      const leads = { all: 'ivory-coat', men: 'chambray-shirt', women: 'camel-coat' }
      const sample =
        products.find((product) => product.id === leads[value]) ??
        products.find((product) => value === 'all' || product.department === value)
      setVeil({ id: Date.now(), label: departmentLabel(value), image: sample?.image ?? '' })
    }
    setDepartment(value)
    setActiveId(null)
    setPickingId(null)
    const next = value === 'all' ? '/' : `/?department=${value}`
    if (window.location.pathname !== '/') {
      window.location.assign(next)
      return
    }
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, '', next)
    }
  }

  function addToBag(product, size) {
    const existing = cart.lines.find((line) => line.id === product.id && line.size === size)
    const nextQuantity = (existing?.qty ?? 0) + 1
    if (product.stockQuantity < 1) {
      setNotice(`${product.name} is out of stock.`)
      return
    }
    if (nextQuantity > product.stockQuantity) {
      setNotice(`Only ${product.stockQuantity} ${product.name} left.`)
      return
    }
    cart.add(product, size)
    setPickingId(null)
    setNotice(`${product.name} added in size ${size}.`)
    setCartOpen(true)
  }

  function changeQty(id, size, qty) {
    const product = products.find((item) => item.id === id)
    if (product && qty > product.stockQuantity) {
      setNotice(`Only ${product.stockQuantity} ${product.name} left.`)
      cart.setQty(id, size, product.stockQuantity)
      return
    }
    cart.setQty(id, size, qty)
  }

  async function loadProducts({ quiet = false } = {}) {
    if (!quiet) {
      setCatalogStatus('loading')
      setCatalogError('')
    }
    try {
      setProducts(await getProducts())
      setCatalogStatus('ready')
    } catch (error) {
      if (!quiet) {
        setCatalogError(error.message)
        setCatalogStatus('error')
      }
    }
  }

  useEffect(() => {
    let ignore = false
    getProducts()
      .then((next) => {
        if (ignore) return
        setProducts(next)
        setCatalogStatus('ready')
      })
      .catch((error) => {
        if (ignore) return
        setCatalogError(error.message)
        setCatalogStatus('error')
      })
    return () => {
      ignore = true
    }
  }, [])

  function openProduct(id) {
    setActiveId(id)
    setPickingId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') {
        setCartOpen(false)
        setPickingId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('bag-open', cartOpen)
    return () => document.body.classList.remove('bag-open')
  }, [cartOpen])

  useEffect(() => {
    if (!veil) return undefined
    const timer = window.setTimeout(() => setVeil(null), 780)
    return () => window.clearTimeout(timer)
  }, [veil])

  useEffect(() => {
    const nodes = [...document.querySelectorAll('.reveal')]
    if (!nodes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-in'))
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          entry.target.classList.remove('reveal-wait')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0, rootMargin: '0px 0px 12% 0px' },
    )
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect()
      const inView = rect.bottom > 0 && rect.top < window.innerHeight
      if (inView) node.classList.add('is-in')
      else {
        node.classList.add('reveal-wait')
        observer.observe(node)
      }
    })
    return () => observer.disconnect()
  }, [catalogStatus, page, activeId])

  const landing = page === 'shop' && !active
  const story =
    page === 'about' && !active && !(catalogStatus === 'error' && products.length === 0)

  function shopNow() {
    chooseDepartment('all')
    document.getElementById('the-rail')?.scrollIntoView({ behavior: 'smooth' })
  }

  function shopDepartment(value) {
    chooseDepartment(value)
    document.getElementById('the-rail')?.scrollIntoView({ behavior: 'smooth' })
  }

  function goHome() {
    setActiveId(null)
    setDepartment('all')
    setQuery('')
    setPickingId(null)
    if (`${window.location.pathname}${window.location.search}` !== '/') {
      window.history.replaceState(null, '', '/')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <a className="skip" href={landing ? '#the-rail' : story ? '#about-title' : '#catalog'}>
        Skip to clothes
      </a>
      {landing || story ? null : (
      <header className="mast">
        <div className="mast-bar">
          <a
            className="wordmark"
            href="/"
            onClick={(event) => {
              if (window.location.pathname !== '/') return
              event.preventDefault()
              setActiveId(null)
              setDepartment('all')
              setQuery('')
              setPickingId(null)
              if (window.location.search) window.history.replaceState(null, '', '/')
            }}
          >
            Bia's
          </a>
          <nav className="departments" aria-label="Departments">
            {departments.map((value) => (
              <div className="dept" key={value}>
                <button
                  type="button"
                  className={page === 'shop' && department === value && !active ? 'is-active' : ''}
                  aria-pressed={page === 'shop' && department === value && !active}
                  onClick={() => chooseDepartment(value)}
                >
                  {departmentLabel(value)}
                </button>
                {value !== 'all' ? (
                  <div className="mega">
                    {products
                      .filter((product) => product.department === value)
                      .slice(0, 3)
                      .map((product) => (
                        <button key={product.id} type="button" onClick={() => chooseDepartment(value)}>
                          <img src={product.image} alt="" />
                          <span>{product.name}</span>
                        </button>
                      ))}
                  </div>
                ) : null}
              </div>
            ))}
            <a className={page === 'about' ? 'nav-link is-active' : 'nav-link'} href="/about">
              About
            </a>
          </nav>
          <div className="bag-slot">
            <p className="notice" role="status">
              {notice}
            </p>
            <button
              ref={bagButtonRef}
              className={`bag-button${cart.count > 0 ? ' has-items' : ''}`}
              type="button"
              onClick={() => (cartOpen ? setCartOpen(false) : openCart())}
              aria-expanded={cartOpen}
            >
              <BagIcon />
              Bag
              <span className="bag-count" key={cart.count}>
                {cart.count}
              </span>
            </button>
          </div>
        </div>
      </header>
      )}

      <main id="catalog">
        {!landing && catalogStatus === 'error' && products.length === 0 ? (
          <div className="empty-rail">
            <p>{catalogError}</p>
            <button type="button" onClick={loadProducts}>
              Try again
            </button>
          </div>
        ) : active ? (
          <ProductDetail
            product={active}
            onBack={() => setActiveId(null)}
            onAdd={addToBag}
          />
        ) : page === 'about' ? (
          <div className="nest nest-story">
            <HomeNav
              bagRef={bagButtonRef}
              cartCount={cart.count}
              cartOpen={cartOpen}
              notice={notice}
              onBrand={() => window.location.assign('/')}
              onShop={shopNow}
              onDepartment={shopDepartment}
              onToggleCart={() => (cartOpen ? setCartOpen(false) : openCart())}
            />
            <About products={products} />
            <HomeFooter />
          </div>
        ) : (
          <HomePage
            products={products}
            notice={notice}
            bagRef={bagButtonRef}
            cartCount={cart.count}
            cartOpen={cartOpen}
            onBrand={goHome}
            onShop={shopNow}
            onDepartment={shopDepartment}
            onOpen={openProduct}
            onToggleCart={() => (cartOpen ? setCartOpen(false) : openCart())}
          >
            <section className="catalog" id="the-rail" aria-labelledby="catalog-title">
              <div className="catalog-head">
                <h2 id="catalog-title">{department === 'all' ? 'All clothes' : departmentLabel(department)}</h2>
                <div className="tools">
                  <label className="search">
                    <span className="sr-only">Search clothes</span>
                    <SearchIcon />
                    <input
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value)
                        setPickingId(null)
                      }}
                      type="search"
                      placeholder="Search name or cloth"
                    />
                  </label>
                  <label className="sort">
                    <span className="sr-only">Sort</span>
                    <select value={sort} onChange={(event) => setSort(event.target.value)}>
                      <option value="featured">Featured</option>
                      <option value="price-asc">Price, low to high</option>
                      <option value="price-desc">Price, high to low</option>
                      <option value="name">Name</option>
                    </select>
                  </label>
                </div>
              </div>

              {catalogStatus === 'error' && products.length === 0 ? (
                <div className="empty-rail">
                  <p>{catalogError}</p>
                  <button type="button" onClick={loadProducts}>
                    Try again
                  </button>
                </div>
              ) : catalogStatus === 'loading' ? (
                <p className="section-loading" role="status">
                  Loading clothes…
                </p>
              ) : visible.length === 0 ? (
                <div className="empty-rail">
                  <p>No clothes match that search.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setDepartment('all')
                    }}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <ul className="rail">
                  {visible.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        badge={badgeFor(product)}
                        picking={pickingId === product.id}
                        onOpen={() => openProduct(product.id)}
                        onStartPick={() => setPickingId(product.id)}
                        onAdd={(size) => addToBag(product, size)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </HomePage>
        )}
      </main>

      {landing || story ? null : (
      <footer className="colophon">
        <nav aria-label="Shop">
          <a href="/">Shop</a>
          <a href="/about">About</a>
          <a href="/?department=men">Men</a>
          <a href="/?department=women">Women</a>
          <a href="/admin">Staff</a>
        </nav>
        <p>Cash on delivery. No card payment.</p>
      </footer>
      )}
      {veil ? (
        <div className="dept-veil" key={veil.id} aria-hidden="true">
          {veil.image ? <img src={veil.image} alt="" /> : null}
          <p>{veil.label}</p>
        </div>
      ) : null}

      <CartDrawer
        open={cartOpen}
        products={products}
        lines={cart.lines}
        onClose={() => {
          setCartOpen(false)
          bagButtonRef.current?.focus()
        }}
        onQty={changeQty}
        onRemove={cart.remove}
        onClear={() => {
          cart.clear()
          setNotice('Bag cleared.')
        }}
        onPlaced={(order) => {
          cart.clear()
          setNotice(`Order ${order.reference} placed.`)
          loadProducts({ quiet: true })
        }}
        onKeepShopping={() => setCartOpen(false)}
      />
    </>
  )
}

function ProductCard({ product, badge, picking, onOpen, onStartPick, onAdd }) {
  const sizeGroup = useId()
  const [added, setAdded] = useState(false)

  function chooseSize(size) {
    onAdd(size)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className="piece">
      <div className="piece-media">
        <button className="piece-view" type="button" onClick={onOpen} aria-label={`View ${product.name}`}>
          <img src={product.image} alt="" loading="lazy" decoding="async" />
        </button>
        {badge ? <span className="badge">{badge}</span> : null}
      </div>
      <div className="piece-body">
        <button className="piece-name" type="button" onClick={onOpen}>
          <h3>{product.name}</h3>
        </button>
        <p className="piece-meta">
          <span>
            {departmentLabel(product.department)} · {product.fabric}
          </span>
          <span className="price">{formatPrice(product.price)}</span>
        </p>
        {picking ? (
          <div className="sizes" role="group" aria-labelledby={sizeGroup}>
            <p id={sizeGroup}>Choose a size</p>
            <div className="size-row">
              {product.sizes.map((size) => (
                <button key={size} type="button" onClick={() => chooseSize(size)}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            className={`quick-add${added ? ' is-added' : ''}`}
            type="button"
            onClick={onStartPick}
            disabled={product.stockQuantity < 1}
          >
            {product.stockQuantity < 1 ? 'Out of stock' : added ? 'Added' : 'Quick add'}
          </button>
        )}
      </div>
    </article>
  )
}

function About({ products }) {
  const women = products.find((product) => product.id === 'ivory-coat') ?? products.find((product) => product.department === 'women')
  const men = products.find((product) => product.id === 'chambray-shirt') ?? products.find((product) => product.department === 'men')
  const promise = products.find((product) => product.id === 'camel-coat') ?? products[0]
  const gown = products.find((product) => product.id === 'red-gown') ?? women

  return (
    <article>
      <section className={promise ? 'nest-hero' : 'nest-hero is-quiet'} aria-labelledby="about-title">
        <div className="nest-hero-copy">
          <h1 id="about-title">A small shop, worn in the week.</h1>
        </div>
        {promise ? (
          <div className="nest-hero-photo">
            <img src={promise.image} alt={`${promise.name}, ${promise.fabric}`} />
          </div>
        ) : (
          <p className="nest-hero-wait" role="status">
            Loading the rail…
          </p>
        )}
      </section>
      <section className="nest-story-block" aria-labelledby="story-title">
        <h2 id="story-title">Our story</h2>
        <p>
          Bia's keeps twelve pieces on the rail, six for men and six for women. Each one is shown
          with its cloth, its sizes, and how many are left. The bag stays on this device until you
          place the order.
        </p>
      </section>
      <section className="nest-about">
        {men ? <img src={men.image} alt={`${men.name}, ${men.fabric}`} /> : <div className="nest-about-fallback" />}
        <div className="nest-about-copy">
          <h2>Our philosophy</h2>
          <p>
            The clothes are for days you actually dress. Names, fabrics, and prices stay next to
            the photograph, and a size is chosen before anything enters the bag.
          </p>
        </div>
      </section>
      <section className="nest-categories" aria-labelledby="collections-title">
        <div className="nest-section-head">
          <h2 id="collections-title">Our collections</h2>
        </div>
        <div className="nest-cat-grid">
          {men ? (
            <a className="nest-cat" href="/?department=men">
              <img src={men.image} alt="" />
              <span className="nest-cat-copy">
                <strong>Men</strong>
              </span>
            </a>
          ) : null}
          {women ? (
            <a className="nest-cat" href="/?department=women">
              <img src={women.image} alt="" />
              <span className="nest-cat-copy">
                <strong>Women</strong>
              </span>
            </a>
          ) : null}
        </div>
      </section>
      <section className="nest-promo">
        <div className="nest-promo-copy">
          <h2>Our promise</h2>
          <p>
            Checkout is cash on delivery. No card number is taken. The shop checks the stock, saves
            the order, and gives you a reference to pay the courier.
          </p>
        </div>
        {gown ? (
          <div className="nest-promo-photo">
            <img src={gown.image} alt={gown === women ? '' : `${gown.name}, ${gown.fabric}`} />
          </div>
        ) : null}
      </section>
    </article>
  )
}

function ProductDetail({ product, onBack, onAdd }) {
  const [size, setSize] = useState(null)
  const sizeGroup = useId()

  return (
    <article className="detail">
      <button className="back" type="button" onClick={onBack}>
        <ArrowIcon />
        Back to Page
      </button>
      <div className="detail-layout">
        <img src={product.image} alt={`${product.name}, ${product.fabric}`} />
        <div className="detail-copy">
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="detail-text">{product.description}</p>
          <p className="detail-fabric">
            {departmentLabel(product.department)} · {product.fabric}
            {product.stockQuantity < 1 ? ' · Out of stock' : ` · ${product.stockQuantity} in stock`}
          </p>
          <div className="sizes" role="group" aria-labelledby={sizeGroup}>
            <p id={sizeGroup}>Size</p>
            <div className="size-row">
              {product.sizes.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={size === value ? 'is-selected' : ''}
                  aria-pressed={size === value}
                  onClick={() => setSize(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <button
            className="add add-large"
            type="button"
            disabled={!size || product.stockQuantity < 1}
            onClick={() => size && onAdd(product, size)}
          >
            {product.stockQuantity < 1 ? 'Out of stock' : size ? `Add size ${size} to bag` : 'Choose a size'}
          </button>
        </div>
      </div>
    </article>
  )
}

const emptyCheckout = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
}

function CartDrawer({ open, products, lines, onClose, onQty, onRemove, onClear, onPlaced, onKeepShopping }) {
  const titleId = useId()
  const closeRef = useRef(null)
  const [step, setStep] = useState('bag')
  const [form, setForm] = useState(emptyCheckout)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const resolved = lines
    .map((line) => {
      const product = products.find((item) => item.id === line.id)
      return product ? { ...line, product } : null
    })
    .filter(Boolean)
  const total = resolved.reduce((sum, line) => sum + line.product.price * line.qty, 0)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (step === 'done' && lines.length > 0) {
      setStep('bag')
      setReceipt(null)
    }
  }, [lines.length, step])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitOrder(event) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      const order = await placeOrder({
        ...form,
        items: resolved.map((line) => ({
          productId: line.id,
          size: line.size,
          quantity: line.qty,
        })),
      })
      setReceipt(order)
      setStep('done')
      setForm(emptyCheckout)
      onPlaced(order)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`drawer-root${open ? ' is-open' : ''}`} inert={open ? undefined : true}>
      <button className="drawer-scrim" type="button" aria-label="Close bag" onClick={onClose} />
      <aside
        className="drawer"
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-labelledby={titleId}
      >
        <header className="drawer-head">
          <h2 id={titleId}>{step === 'done' ? 'Order placed' : 'Your bag'}</h2>
          <button ref={closeRef} className="icon-button" type="button" onClick={onClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </button>
        </header>

        {step === 'done' && receipt ? (
          <div className="drawer-confirm">
            <p>
              Reference <strong>{receipt.reference}</strong>. Pay the courier in cash when the order
              arrives. This order is not marked paid.
            </p>
            <p className="price">{formatPrice(receipt.total)}</p>
            <button
              className="add add-large"
              type="button"
              onClick={() => {
                setStep('bag')
                setReceipt(null)
                onKeepShopping()
              }}
            >
              Keep browsing
            </button>
          </div>
        ) : resolved.length === 0 ? (
          <div className="drawer-confirm">
            <p>Your bag is empty. Choose a size on any piece to add it.</p>
            <button className="add add-large" type="button" onClick={onKeepShopping}>
              Browse clothes
            </button>
          </div>
        ) : step === 'details' ? (
          <form className="checkout-form" onSubmit={submitOrder}>
            <CheckoutField label="Full name" name="fullName" value={form.fullName} autoComplete="name" onChange={updateField} />
            <CheckoutField label="Email" name="email" type="email" value={form.email} autoComplete="email" onChange={updateField} />
            <CheckoutField label="Phone" name="phone" type="tel" value={form.phone} autoComplete="tel" onChange={updateField} />
            <CheckoutField label="Address" name="address" value={form.address} autoComplete="street-address" onChange={updateField} />
            <CheckoutField label="City" name="city" value={form.city} autoComplete="address-level2" onChange={updateField} />
            <CheckoutField label="Postal code" name="postalCode" value={form.postalCode} autoComplete="postal-code" onChange={updateField} />
            <CheckoutField label="Country" name="country" value={form.country} autoComplete="country-name" onChange={updateField} />
            {formError ? <p className="form-error">{formError}</p> : null}
            <button className="add add-large" type="submit" disabled={submitting}>
              {submitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
            </button>
            <button className="text-button" type="button" onClick={() => setStep('bag')} disabled={submitting}>
              Back to bag
            </button>
            <p className="fine">Cash on delivery. No card details are collected.</p>
          </form>
        ) : (
          <>
            <ul className="bag-lines">
              {resolved.map((line) => (
                <li key={`${line.id}-${line.size}`}>
                  <img src={line.product.image} alt="" />
                  <div>
                    <h3>{line.product.name}</h3>
                    <p>
                      {departmentLabel(line.product.department)} · Size {line.size}
                    </p>
                    {line.qty > line.product.stockQuantity ? (
                      <p>Only {line.product.stockQuantity} left.</p>
                    ) : null}
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => onQty(line.id, line.size, line.qty - 1)}
                        aria-label={`Decrease ${line.product.name} size ${line.size}`}
                      >
                        −
                      </button>
                      <span>{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => onQty(line.id, line.size, line.qty + 1)}
                        aria-label={`Increase ${line.product.name} size ${line.size}`}
                        disabled={line.qty >= line.product.stockQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="line-end">
                    <p className="price">{formatPrice(line.product.price * line.qty)}</p>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => onRemove(line.id, line.size)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="drawer-total">
              <p>
                <span>Total</span>
                <strong className="price">{formatPrice(total)}</strong>
              </p>
              <button className="add add-large" type="button" onClick={() => setStep('details')}>
                Checkout
              </button>
              <button className="text-button" type="button" onClick={onClear}>
                Clear bag
              </button>
              <p className="fine">Cash on delivery. The total is calculated by the shop.</p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

function CheckoutField({ label, name, value, onChange, type = 'text', autoComplete }) {
  const id = useId()
  return (
    <label htmlFor={id}>
      {label}
      <input id={id} name={name} type={type} value={value} autoComplete={autoComplete} onChange={onChange} required />
    </label>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 8h11l-.8 12H7.3L6.5 8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 8V6.8A3 3 0 0 1 12 3.8 3 3 0 0 1 15 6.8V8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
