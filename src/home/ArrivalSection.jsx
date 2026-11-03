import ProductShot from './ProductShot.jsx'

export default function ArrivalSection({ products, title, onOpen }) {
  return (
    <section className="nest-arrivals" aria-labelledby="nest-arrivals-title">
      <div className="nest-section-head rise">
        <h2 id="nest-arrivals-title">{title}</h2>
      </div>
      {products.length === 0 ? (
        <p className="nest-empty rise">New pieces will show here once the rail loads.</p>
      ) : (
        <ul className={`nest-arrival-grid${products.length === 1 ? ' is-single' : ''}`}>
          {products.map((product, index) => (
            <li key={product.id} className="rise" data-lag={index % 2 === 1 ? '1' : undefined}>
              <ProductShot product={product} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
