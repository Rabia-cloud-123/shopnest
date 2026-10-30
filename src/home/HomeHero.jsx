export default function HomeHero({ product, onShop, onOpen }) {
  return (
    <section className={product ? 'nest-hero' : 'nest-hero is-quiet'} aria-labelledby="nest-hero-title">
      <div className="nest-hero-copy">
        <h1 id="nest-hero-title">Clothes for the week you actually wear.</h1>
        <p>A short rail for men and women. Choose a size, then pay the courier in cash.</p>
        <button className="nest-cta" type="button" onClick={onShop}>
          Shop now
        </button>
      </div>
      {product ? (
        <button
          className="nest-hero-photo"
          type="button"
          onClick={() => onOpen(product.id)}
          aria-label={`View ${product.name}`}
        >
          <img src={product.image} alt="" />
        </button>
      ) : (
        <p className="nest-hero-wait" role="status">
          Loading the rail…
        </p>
      )}
    </section>
  )
}
