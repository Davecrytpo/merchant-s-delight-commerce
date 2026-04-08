# Merchant's Delight Commerce

Merchant's Delight Commerce is a React, Vite, MongoDB, Express, and Stripe storefront for premium footwear. It includes a customer storefront, checkout flow, shipping management, returns, rewards, and an admin dashboard.

## Core Features

- MongoDB-backed product, order, customer, review, shipping, and return data
- Express API with JWT-based authentication
- Stripe checkout integration from the Node backend
- Country-aware shipping method selection with USPS and DHL defaults
- Returns workflow with customer and admin views
- Rewards, reviews, and discount-code support
- Admin areas for products, orders, returns, reviews, customers, and shipping

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Express
- MongoDB
- Stripe

## Local Setup

```bash
git clone https://github.com/Davecrytpo/merchant-s-delight-commerce.git
cd merchant-s-delight-commerce
npm install
npm run server
npm run dev
```

## Environment Variables

Create a `.env` file with:

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

## Notes

- Vite proxies `/api` requests to the Express server on `http://localhost:4000` during local development.
- The backend seeds default categories, products, product images, product variants, and shipping methods when the MongoDB database is empty.
- The first account created becomes the bootstrap admin account.
