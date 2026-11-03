import { followImageLight } from './imageLight.js'

export default function CategorySection({ men, women, menCount, womenCount, onDepartment }) {
  return (
    <section className="nest-categories" aria-labelledby="nest-categories-title">
      <div className="nest-section-head rise">
        <h2 id="nest-categories-title">Shop by category</h2>
      </div>
      <div className="nest-cat-grid">
        <CategoryPanel
          label="Men"
          count={menCount}
          image={men?.image}
          imageAlt={men ? `${men.name}, ${men.fabric}` : ''}
          onSelect={() => onDepartment('men')}
        />
        <CategoryPanel
          label="Women"
          count={womenCount}
          image={women?.image}
          imageAlt={women ? `${women.name}, ${women.fabric}` : ''}
          lag="1"
          onSelect={() => onDepartment('women')}
        />
      </div>
    </section>
  )
}

function CategoryPanel({ label, count, image, imageAlt, lag, onSelect }) {
  return (
    <button className="nest-cat rise" type="button" data-lag={lag} onClick={onSelect} onPointerMove={followImageLight}>
      {image ? <img src={image} alt={imageAlt} /> : null}
      <span className="image-light" aria-hidden="true" />
      <span className="nest-cat-copy">
        <strong>{label}</strong>
        {count > 0 ? <span>{count === 1 ? '1 piece' : `${count} pieces`}</span> : null}
      </span>
    </button>
  )
}
