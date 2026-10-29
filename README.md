# Bia's Collection

A basic interactive clothing shop. Browse dummy men's and women's pieces, choose a size, and add them to a bag. The bag stays in this browser. Nothing is charged and no order is sent.

## Features

- Twelve demonstration products, six for men and six for women
- Filter by All, Men, or Women
- Search by garment name or cloth
- Sort by featured order, price, or name
- Product page with a description and size choice
- Add to bag only after a size is selected
- Bag panel with quantity changes, removal, and a running total
- Bag saved in the browser with `localStorage`
- Clear bag empties the local bag and states that nothing was charged
- Layout for desktop and narrow screens

## Technologies

- React 19
- Vite 8
- Fonts: Unbounded and Figtree, self-hosted through Fontsource
- No backend, database, or payment service

## Install and run locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/Rabia-cloud-123/shopnest.git
cd shopnest
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

To build and preview the production files:

```bash
npm run build
npm run preview
```

No environment variables are required. Product names, prices, and descriptions live in `src/data/products.js`.

## Project structure

```
index.html                 Page entry and tab title
public/favicon.png         Tab icon
public/products            Demonstration photographs
src/main.jsx               React mount
src/App.jsx                Shop, product view, and bag
src/cart.js                Bag state, saved in localStorage
src/data/products.js       Dummy catalog
src/styles.css             Layout and visual styles
```

## Notes

Prices, names, and descriptions are sample data. Photographs are stock images used so the demo has clothing to look at. This shop does not take payment or create an account.
