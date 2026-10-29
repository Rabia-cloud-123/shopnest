import { useEffect, useState } from 'react'
import { formatPrice } from './data/products.js'

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
    <>
      <header className="mast">
        <div className="mast-bar">
          <a className="wordmark" href="/">
            Bia's Collection
          </a>
          <p className="notice">Staff</p>
        </div>
      </header>
      <main className="admin">
        <h1>Orders</h1>
        {status === 'loading' ? <p>Checking the staff session…</p> : null}
        {status === 'out' ? (
          <form className="checkout-form admin-login" onSubmit={signIn}>
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
            <button className="add add-large" type="submit">
              Sign in
            </button>
          </form>
        ) : null}
        {status === 'in' ? (
          <>
            <button className="text-button" type="button" onClick={signOut}>
              Sign out
            </button>
            {error ? <p className="form-error">{error}</p> : null}
            {loadingOrders ? <p>Loading orders…</p> : null}
            {!loadingOrders && orders.length === 0 ? <p>No orders yet.</p> : null}
            {orders.length > 0 ? (
              <div className="admin-scroll">
                <table className="admin-table">
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
    </>
  )
}
