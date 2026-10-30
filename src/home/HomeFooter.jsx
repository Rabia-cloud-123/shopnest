export default function HomeFooter() {
  return (
    <footer className="nest-foot">
      <div>
        <p className="nest-foot-brand">ShopNest</p>
        <p>Cash on delivery. No card payment.</p>
      </div>
      <nav aria-label="Footer">
        <a href="/">Shop</a>
        <a href="/?department=men">Men</a>
        <a href="/?department=women">Women</a>
        <a href="/about">About</a>
        <a href="/admin">Staff</a>
      </nav>
      <p className="nest-foot-note">Men’s and women’s clothes. Choose a size before anything enters the bag.</p>
    </footer>
  )
}
