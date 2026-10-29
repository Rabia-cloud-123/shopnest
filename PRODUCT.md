# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React and Vite storefront with an Express API and cloud PostgreSQL.

## Users

Inferred from the brief: a person evaluating a local demonstration shop, browsing men's and women's clothing and adding pieces to a bag.

## Product Purpose

A local demonstration clothing store. Success means a visitor can browse dummy men's and women's clothes, choose a size, add them to a bag, change quantities, and remove them.

## Positioning

A single interactive storefront for both departments, with size-aware bag lines. No checkout processor and no account system.

## Operating Context

The storefront runs in the browser. Orders and stock are stored in cloud PostgreSQL through the API. The bag draft stays in the browser until checkout.

## Capabilities and Constraints

- Dummy products only, split into men and women.
- Add to bag requires a size.
- Bag supports quantity changes, removal, and a running total.
- Checkout is cash on delivery. Card details are not collected and orders are not marked paid.
- Customer details and the order list are available only on the staff page.
- The shop name is Bia's Collection.

## Evidence on Hand

No photography, prices, or catalog were supplied. Product names, prices, and descriptions are synthetic demonstration data. Photographs are stock images saved under `public/products` for the demo and are not original brand assets.

## Product Principles

- Show the clothes and the bag action immediately.
- Keep men's and women's departments equally available.
- Say when something is only a demonstration.
- Keep the bag on this device, with no pretend account.
