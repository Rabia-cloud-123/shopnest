export default function HomeFooter({ rise = false }) {
  return (
    <footer className="nest-foot">
      <div className={rise ? 'rise' : undefined}>
        <p className="nest-foot-brand">ShopNest</p>
        <p>Cash on delivery. No card payment.</p>
      </div>
      <nav aria-label="Footer" className={rise ? 'rise' : undefined} data-lag={rise ? '1' : undefined}>
        <a href="/">Shop</a>
        <a href="/?department=men">Men</a>
        <a href="/?department=women">Women</a>
        <a href="/about">About</a>
        <a href="/admin">Staff</a>
      </nav>
      <p className={rise ? 'nest-foot-note rise' : 'nest-foot-note'} data-lag={rise ? '2' : undefined}>
        Men’s and women’s clothes. Choose a size before anything enters the bag.
      </p>
    </footer>
  )
}
