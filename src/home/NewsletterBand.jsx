import { useEffect, useState } from 'react'

const storageKey = 'shopnest-newsletter'

export default function NewsletterBand() {
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey) ?? ''
      if (stored) setSaved(stored)
    } catch {
      setSaved('')
    }
  }, [])

  function submit(event) {
    event.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a full email address, including the domain.')
      return
    }
    try {
      window.localStorage.setItem(storageKey, value)
    } catch {
      // The address still confirms for this visit if storage is blocked.
    }
    setSaved(value)
    setEmail('')
    setError('')
  }

  return (
    <section className="nest-news" aria-labelledby="nest-news-title">
      <div>
        <h2 id="nest-news-title">Newsletter</h2>
        <p>Leave an address on this device. ShopNest does not send mail from the shop.</p>
      </div>
      {saved ? (
        <p className="nest-news-saved" role="status">
          {saved} is noted in this browser.
        </p>
      ) : (
        <form className="nest-news-form" onSubmit={submit} noValidate>
          <label htmlFor="nest-email">Email</label>
          <div className="nest-news-row">
            <input
              id="nest-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              placeholder="you@example.com"
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError('')
              }}
            />
            <button className="nest-cta nest-cta-light" type="submit">
              Subscribe
            </button>
          </div>
          {error ? (
            <p className="nest-news-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  )
}
