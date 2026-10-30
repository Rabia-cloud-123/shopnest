import ProductShot from './ProductShot.jsx'

export default function ArrivalSection({ products, title, onOpen }) {
  return (
    <section className="nest-arrivals" aria-labelledby="nest-arrivals-title">
      <div className="nest-section-head">
        <h2 id="nest-arrivals-title">{title}</h2>
      </div>
      {products.length === 0 ? (
        <p className="nest-empty">New pieces will show here once the rail loads.</p>
      ) : (
        <ul className={`nest-arrival-grid${products.length === 1 ? ' is-single' : ''}`}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductShot product={product} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
