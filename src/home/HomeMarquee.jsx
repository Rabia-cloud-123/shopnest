function MarqueeLine() {
  return (
    <span className="marquee-line">
      Main Character Energy <i className="marquee-spark">✨</i> Your Style, Your Rules <i className="marquee-spark">✨</i> A Little Fashion, A Lot of Attitude <i className="marquee-spark">✨</i> Wear Your Mood <i className="marquee-spark">✨</i> Stay Unforgettable <i className="marquee-spark">✨</i>
    </span>
  )
}

function MarqueeGroup() {
  return (
    <div className="marquee-group" aria-hidden="true">
      <MarqueeLine />
      <MarqueeLine />
      <MarqueeLine />
    </div>
  )
}

export default function HomeMarquee() {
  return (
    <div
      className="marquee"
      role="region"
      aria-label="Main Character Energy. Your Style, Your Rules. A Little Fashion, A Lot of Attitude. Wear Your Mood. Stay Unforgettable."
    >
      <div className="marquee-track">
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  )
}
