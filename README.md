# Merchant's Delight Commerce

Merchant's Delight Commerce is a full-stack footwear storefront built with React, Vite, Express, MongoDB, and Stripe. It includes a customer-facing shop, account and returns flows, an admin dashboard, shipping management, order tracking, and rewards support.

## Overview

This repository now runs on a custom Node and MongoDB backend.

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Express, MongoDB, JWT authentication
- Payments: Stripe Checkout
- Shipping: USPS and DHL shipping-method support in the checkout flow
- Admin: products, orders, customers, reviews, returns, and shipping management

## Features

- Product catalog with categories, variants, images, and featured products
- Customer authentication and profile management
- Cart, wishlist, and account pages
- Stripe-powered checkout
- Shipping method selection by destination
- Order history and order tracking
- Returns request flow for customers and admins
- Review and reward-points system
- Admin dashboard for day-to-day store operations

## Project Structure

```text
server/                  Express API and MongoDB logic
src/                     React application
src/components/          UI components
src/context/             Auth, cart, and wishlist providers
src/hooks/               Data and feature hooks
src/integrations/api/    Frontend API client
src/pages/               Storefront and admin pages
public/                  Static assets
```

## Environment Variables

Create a local `.env` file:

```env
VITE_API_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

PORT=4000
DEFAULT_SITE_URL=http://localhost:8080
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=merchants_delight
JWT_SECRET=replace-with-a-long-random-secret
STRIPE_SECRET_KEY=your_stripe_secret_key
DHL_API_KEY=your_dhl_api_key
DHL_API_SECRET=your_dhl_api_secret
```

An example file is included in `.env.example`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run server
```

Start the frontend in a second terminal:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

## Backend Notes

- The API runs on `http://localhost:4000` by default.
- The Vite frontend proxies `/api` requests to the backend during local development.
- The backend seeds default categories, products, product images, product variants, and shipping methods when the database is empty.
- The first account created becomes the bootstrap admin account.

## Current Status

- Runtime backend is MongoDB and Express
- Authentication is handled by the custom API client and JWT sessions
- Checkout is handled through Stripe
- Supabase runtime dependencies and legacy project files have been removed from the active app

## Verification

The project has been verified with:

- production build validation
- live MongoDB connectivity
- checkout session creation through Stripe
- order persistence and status updates
- rewards and notification flow checks

## Repository

Main branch:

```text
https://github.com/Davecrytpo/merchant-s-delight-commerce
```

Maintained by Dave.
