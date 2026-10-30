# Bia's Collection

A clothing shop with a React storefront and an Express API. Products, stock, and cash-on-delivery orders are stored in cloud PostgreSQL. Card details are never collected, and orders are not marked paid.

## Features

- Twelve sample products, six for men and six for women, loaded from the API
- Filter, search, and sort the catalog
- Product page with a description, size choice, and stock
- Bag with quantity changes and removal
- Checkout collects the buyer's name, email, phone, and shipping address
- The API checks stock and calculates the total from database prices
- The order and the stock update are saved in one database transaction
- Confirmation shows an order reference
- Staff page at `/admin` lists orders and requires a password
- About page at `/about` describes the shop, the two collections, and cash on delivery
- Customer details are not available from public API routes

## Technologies

- React 19 and Vite 8
- Express 5
- PostgreSQL on [Neon](https://neon.tech)
- Fonts: Cormorant Garamond and Inter, self-hosted through Fontsource. The storefront follows the VARENNE luxury fashion layout: cream ground, centered serif wordmark, and black actions.

## Neon setup

1. Create a Neon account at https://neon.tech and sign in.
2. Create a project named `shopnest`.
3. Open the project dashboard and copy the **pooled** connection string.
4. On your computer, copy `.env.example` to `.env`.
5. Paste the connection string into `DATABASE_URL` in that local file.
6. Choose your own `ADMIN_PASSWORD` (at least 12 characters) and `SESSION_SECRET` (at least 24 characters).
7. Leave `.env` on this machine. Do not commit it, and do not paste those values into chat or into frontend files.

The React app only calls `/api`. It never receives `DATABASE_URL`.

## Install and run locally

Requires Node.js 20 or newer, plus the Neon project above.

```bash
git clone https://github.com/Rabia-cloud-123/shopnest.git
cd shopnest
npm install
```

Create the local env file, then edit it. On Windows:

```bash
copy .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Create the tables and sample products:

```bash
npm run migrate
npm run seed
npm run dev
```

Open http://localhost:5173. The API runs on port 3001, and Vite proxies `/api` to it.

`npm run seed` inserts sample products only when they are missing. It does not reset stock after orders.

To serve the built site and the API from one process:

```bash
npm run build
npm start
```

## Deploy on Vercel

The storefront and the API deploy as one Vercel project. Vite serves the site, and `api/index.js` runs the Express app for every `/api` request. `/admin` is rewritten to the storefront so the staff page loads on a refresh.

1. Import https://github.com/Rabia-cloud-123/shopnest.git in Vercel.
2. Leave the framework preset as Vite. The build command is `npm run build` and the output directory is `dist`.
3. In Project Settings → Environment Variables, add `DATABASE_URL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` for Production and Preview. Use the Neon **pooled** connection string (the hostname contains `-pooler`). Do not commit those values.
4. Deploy. The tables and sample products already live in Neon, so a new deploy uses that same database.

`npm run migrate` and `npm run seed` still run on your computer against `DATABASE_URL`. Run them again only if you point the project at an empty Neon database.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | Signs the staff session cookie |
| `PORT` | API port, default `3001` |

See `.env.example`. No real credentials belong in Git.

## Project structure

```
api/index.js               Vercel entry for the Express app
vercel.json                Sends /api to that function and other routes to the storefront
server/index.js            API, staff routes, and local production static files
server/orders.js           Checkout transaction
server/migrations/         SQL migrations
server/seed-data.js        Sample catalog
src/App.jsx                Shop, bag, and checkout
src/Admin.jsx              Staff order list
src/cart.js                Bag draft saved in this browser until checkout
public/products            Product photographs
```

## Orders

Checkout is cash on delivery. A successful order is stored with status `placed` and payment method `cash_on_delivery`. The confirmation reference looks like `BC-XXXXXXXX`. Staff can read orders only after signing in at `/admin`.
