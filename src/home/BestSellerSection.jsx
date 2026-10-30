import { departmentLabel, formatPrice } from '../data/products.js'

export default function BestSellerSection({ products, title, onOpen }) {
  const lead = products[0]
  const side = products[1] ?? products[0]

  return (
    <section className="nest-best" aria-labelledby="nest-best-title">
      {lead ? (
        <button className="nest-best-photo" type="button" onClick={() => onOpen(lead.id)} aria-label={`View ${lead.name}`}>
          <img src={lead.image} alt="" />
        </button>
      ) : (
        <p className="nest-empty">Bestsellers will show here once the rail loads.</p>
      )}
      <div className="nest-best-copy">
        <h2 id="nest-best-title">{title}</h2>
        {lead ? (
          <>
            <p className="nest-best-name">{lead.name}</p>
            <p className="nest-best-meta">
              {departmentLabel(lead.department)} · {lead.fabric}
            </p>
            <p className="nest-best-price">{formatPrice(lead.price)}</p>
            <button className="nest-cta nest-cta-light" type="button" onClick={() => onOpen(lead.id)}>
              View the piece
            </button>
            {side && side.id !== lead.id ? (
              <button className="nest-also" type="button" onClick={() => onOpen(side.id)}>
                Also {side.name}
              </button>
            ) : null}
          </>
        ) : (
          <p>The rail is still loading.</p>
        )}
      </div>
    </section>
  )
}
