export default function AboutBand({ image, imageAlt }) {
  return (
    <section className="nest-about" aria-labelledby="nest-about-title">
      {image ? <img src={image} alt={imageAlt} /> : <div className="nest-about-fallback" />}
      <div className="nest-about-copy">
        <h2 id="nest-about-title">About ShopNest</h2>
        <p>
          ShopNest keeps a short rail of men’s and women’s clothes. Each piece shows its cloth, its
          sizes, and how many are left. The bag stays on this device until checkout. You pay the
          courier in cash. No card number is taken.
        </p>
        <a className="nest-text-link" href="/about">
          Read the shop story
        </a>
      </div>
    </section>
  )
}
