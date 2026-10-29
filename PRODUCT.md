# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: interactive React app on Vite. The request rejected a static site and asked for modern languages and an interactive website. No deploy target was given.

## Users

Inferred from the brief: a person evaluating a local demonstration shop, browsing men's and women's clothing and adding pieces to a bag.

## Product Purpose

A local demonstration clothing store. Success means a visitor can browse dummy men's and women's clothes, choose a size, add them to a bag, change quantities, and remove them.

## Positioning

A single interactive storefront for both departments, with size-aware bag lines. No checkout processor and no account system.

## Operating Context

Runs locally in the browser through the Vite dev server. The bag is stored in the browser only.

## Capabilities and Constraints

- Dummy products only, split into men and women.
- Add to bag requires a size.
- Bag supports quantity changes, removal, and a running total.
- No payments, accounts, inventory backend, or live orders. A confirm action only clears the local bag and states that nothing was charged.
- The shop name is Bia's Collection.

## Evidence on Hand

No photography, prices, or catalog were supplied. Product names, prices, and descriptions are synthetic demonstration data. Photographs are stock images saved under `public/products` for the demo and are not original brand assets.

## Product Principles

- Show the clothes and the bag action immediately.
- Keep men's and women's departments equally available.
- Say when something is only a demonstration.
- Keep the bag on this device, with no pretend account.
