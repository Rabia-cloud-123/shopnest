export default function PromoSection({ coats, evening, onOpen }) {
  if (!coats && !evening) return null

  return (
    <section className="nest-promos" aria-labelledby="nest-season-title">
      <div className="nest-section-head">
        <h2 id="nest-season-title">Seasonal collections</h2>
      </div>
      {coats ? (
        <article className="nest-promo">
          <div className="nest-promo-copy">
            <h3>The coat rail</h3>
            <p>{`${coats.name}, in ${coats.fabric.toLowerCase()}.`}</p>
            <button className="nest-cta" type="button" onClick={() => onOpen(coats.id)}>
              View the coat
            </button>
          </div>
          <button className="nest-promo-photo" type="button" onClick={() => onOpen(coats.id)} aria-label={`View ${coats.name}`}>
            <img src={coats.image} alt="" />
          </button>
        </article>
      ) : null}
      {evening ? (
        <article className="nest-promo nest-promo-flip">
          <button
            className="nest-promo-photo"
            type="button"
            onClick={() => onOpen(evening.id)}
            aria-label={`View ${evening.name}`}
          >
            <img src={evening.image} alt="" />
          </button>
          <div className="nest-promo-copy">
            <h3>Evening satin</h3>
            <p>{evening.name}. A fitted bodice and a skirt that moves when you walk.</p>
            <button className="nest-cta" type="button" onClick={() => onOpen(evening.id)}>
              View the gown
            </button>
          </div>
        </article>
      ) : null}
    </section>
  )
}
