import AboutBand from './AboutBand.jsx'
import ArrivalSection from './ArrivalSection.jsx'
import BestSellerSection from './BestSellerSection.jsx'
import CategorySection from './CategorySection.jsx'
import HomeFooter from './HomeFooter.jsx'
import HomeHero from './HomeHero.jsx'
import HomeNav from './HomeNav.jsx'
import NewsletterBand from './NewsletterBand.jsx'
import PromoSection from './PromoSection.jsx'
import { findProduct } from './picks.js'
import './home.css'

export default function HomePage({
  products,
  arrivals,
  bestsellers,
  notice,
  bagRef,
  cartCount,
  cartOpen,
  onBrand,
  onShop,
  onDepartment,
  onOpen,
  onToggleCart,
  children,
}) {
  const heroOrder = ['ivory-coat', 'camel-coat', 'red-gown', 'chambray-shirt', 'blossom-midi', 'linen-overshirt']
  const heroSlides = []
  for (const id of heroOrder) {
    const product = findProduct(products, id)
    if (product?.image) heroSlides.push(product)
  }
  for (const product of products) {
    if (heroSlides.length >= 5) break
    if (product?.image && !heroSlides.some((slide) => slide.id === product.id)) heroSlides.push(product)
  }
  const hero = heroSlides[0] ?? null
  const menLead = findProduct(products, 'chambray-shirt') ?? products.find((product) => product.department === 'men')
  const womenLead = findProduct(products, 'ivory-coat') ?? products.find((product) => product.department === 'women')
  const coats = findProduct(products, 'camel-coat') ?? findProduct(products, 'ivory-coat')
  const evening = findProduct(products, 'red-gown')
  const aboutImage = womenLead ?? hero

  return (
    <div className="nest">
      <HomeNav
        bagRef={bagRef}
        cartCount={cartCount}
        cartOpen={cartOpen}
        notice={notice}
        onBrand={onBrand}
        onShop={onShop}
        onDepartment={onDepartment}
        onToggleCart={onToggleCart}
      />
      <HomeHero slides={heroSlides} onShop={onShop} onOpen={onOpen} />
      <CategorySection
        men={menLead}
        women={womenLead}
        menCount={products.filter((product) => product.department === 'men').length}
        womenCount={products.filter((product) => product.department === 'women').length}
        onDepartment={onDepartment}
      />
      <ArrivalSection title="New arrivals" products={arrivals} onOpen={onOpen} />
      <BestSellerSection title="Best sellers" products={bestsellers} onOpen={onOpen} />
      {children}
      <PromoSection coats={coats} evening={evening} onOpen={onOpen} />
      <AboutBand
        image={aboutImage?.image}
        imageAlt={aboutImage ? `${aboutImage.name}, ${aboutImage.fabric}` : ''}
      />
      <NewsletterBand />
      <HomeFooter />
    </div>
  )
}
