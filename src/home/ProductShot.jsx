import { departmentLabel, formatPrice } from '../data/products.js'

export default function ProductShot({ product, onOpen }) {
  return (
    <button className="shot" type="button" onClick={() => onOpen(product.id)}>
      <span className="shot-media">
        <img src={product.image} alt="" />
      </span>
      <span className="shot-copy">
        <strong>{product.name}</strong>
        <span className="shot-meta">
          {departmentLabel(product.department)} · {product.fabric}
          <span className="shot-price">{formatPrice(product.price)}</span>
        </span>
      </span>
    </button>
  )
}
