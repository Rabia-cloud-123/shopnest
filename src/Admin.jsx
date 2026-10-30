import { useEffect, useState } from 'react'
import { formatPrice } from './data/products.js'
import HomeFooter from './home/HomeFooter.jsx'
import './home/home.css'
import './home/pages.css'

async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

export default function Admin() {
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    let ignore = false
    fetch('/api/admin/session', { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        if (ignore) return
        setStatus(data.authenticated ? 'in' : 'out')
      })
      .catch(() => {
        if (!ignore) {
          setError('The staff desk could not be reached.')
          setStatus('out')
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (status !== 'in') return
    let ignore = false
    setLoadingOrders(true)
    fetch('/api/admin/orders', { credentials: 'include' })
      .then(async (response) => {
        const data = await readJson(response)
        if (!response.ok) throw new Error(data.error || 'Orders could not be loaded.')
        return data.orders
      })
      .then((next) => {
        if (!ignore) setOrders(next)
      })
      .catch((loadError) => {
        if (!ignore) setError(loadError.message)
      })
      .finally(() => {
        if (!ignore) setLoadingOrders(false)
      })
    return () => {
      ignore = true
    }
  }, [status])

  async function signIn(event) {
    event.preventDefault()
    setError('')
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await readJson(response)
    if (!response.ok) {
      setError(data.error || 'Sign-in failed.')
      return
    }
    setPassword('')
    setStatus('in')
  }

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    setOrders([])
    setStatus('out')
  }

  return (
    <div className="nest nest-staff">
      <StaffBar signedIn={status === 'in'} onSignOut={signOut} />
      <main className="staff-main">
        <h1>Orders</h1>
        {status === 'loading' ? <p className="staff-status">Checking the staff session…</p> : null}
        {status === 'out' ? (
          <div className="staff-gate">
            <p className="staff-lead">Sign in with the staff password to read orders placed at the shop.</p>
            <form className="staff-form" onSubmit={signIn}>
              <label htmlFor="staff-password">
                Staff password
                <input
                  id="staff-password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <button className="nest-cta" type="submit">
                Sign in
              </button>
            </form>
          </div>
        ) : null}
        {status === 'in' ? (
          <>
            {error ? <p className="form-error">{error}</p> : null}
            {loadingOrders ? <p className="staff-status">Loading orders…</p> : null}
            {!loadingOrders && orders.length === 0 ? <p className="staff-status">No orders yet.</p> : null}
            {orders.length > 0 ? (
              <div className="staff-scroll">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Placed</th>
                      <th>Buyer</th>
                      <th>Ship to</th>
                      <th>Pieces</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.reference}>
                        <td>{order.reference}</td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>
                          {order.fullName}
                          <br />
                          {order.email}
                          <br />
                          {order.phone}
                        </td>
                        <td>
                          {order.address}
                          <br />
                          {order.city} {order.postalCode}
                          <br />
                          {order.country}
                        </td>
                        <td>
                          {order.items.map((item) => (
                            <span key={`${item.name}-${item.size}`}>
                              {item.name}, size {item.size} × {item.quantity}
                              <br />
                            </span>
                          ))}
                        </td>
                        <td className="price">{formatPrice(order.total)}</td>
                        <td>Placed · cash on delivery</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        ) : null}
      </main>
      <HomeFooter />
    </div>
  )
}

function StaffBar({ signedIn, onSignOut }) {
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

  return (
    <header className={`nest-nav${stuck ? ' is-stuck' : ''}`}>
      <a className="nest-brand" href="/">
        ShopNest
      </a>
      <button
        className="nest-menu"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="staff-links"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        <MenuIcon open={menuOpen} />
      </button>
      <nav id="staff-links" className={menuOpen ? 'is-open' : ''} aria-label="Shop">
        <a href="/">Shop</a>
        <a href="/?department=men">Men</a>
        <a href="/?department=women">Women</a>
        <a href="/about">About</a>
        <a href="/admin" aria-current="page">
          Staff
        </a>
      </nav>
      <div className="nest-nav-end">
        {signedIn ? (
          <button className="nest-bag" type="button" onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <p className="nest-notice">Staff</p>
        )}
      </div>
    </header>
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
