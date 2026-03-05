# 👞 Merchant's Delight Commerce (ShoeShop)

![Production Build](https://img.shields.io/badge/Production-Ready-green)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Stripe-blue)
![Mobile Responsive](https://img.shields.io/badge/Mobile-Optimized-orange)

Merchant's Delight Commerce is a high-performance, production-ready E-commerce platform specialized for premium footwear. Built with a focus on speed, aesthetics, and deep customer engagement features, it provides a seamless shopping experience from discovery to secure checkout.

---

## ✨ Core Features

### 🛒 Advanced Shopping Experience
*   **Persistent Shopping Cart:** Items remain in the cart across sessions using local storage.
*   **Multi-Variant Support:** Seamlessly choose between different sizes and colors with real-time stock verification.
*   **High-Fidelity Image Zoom:** Desktop hover zoom and mobile double-tap zoom for detailed product inspection.
*   **Wishlist System:** Save favorite products for later viewing.

### 💰 Customer Reward Point System (Loyalty)
*   **Earn Points:** 1 point for every $1 spent on the store.
*   **Review Rewards:** Earn 50 points for every approved product review.
*   **Point Redemption:** 100 points = $10 discount applied directly at checkout.
*   **Balance Tracking:** View current points in the customer dashboard.

### 💬 AI-Powered Support
*   **Smart Chat Widget:** Built-in AI assistant for shoe recommendations, return request guidance, and general FAQs.
*   **Context-Aware:** Suggests products directly within the chat interface.

### 💳 Secure Payment & Shipping
*   **Production Stripe Integration:** Secure redirect flow via Supabase Edge Functions.
*   **Dynamic Shipping:** Multiple carrier options (FedEx, UPS, USPS) with cost calculation and free shipping thresholds.
*   **Order Tracking:** Post-purchase order confirmation and tracking overview.

### 🛡️ Professional Admin Suite
*   **Inventory Management:** Add, edit, and delete products with support for multiple images and complex variants.
*   **Review Moderation:** Approve or delete customer reviews to maintain quality control.
*   **Customer Management:** View user profiles and manually adjust reward points if necessary.
*   **Business Dashboard:** Real-time analytics showing revenue, order counts, and top-performing categories.

---

## 🛠️ Tech Stack

*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion.
*   **Backend/Database:** Supabase (PostgreSQL), Row Level Security (RLS).
*   **Logic:** TanStack Query (React Query) for state management.
*   **Payments:** Stripe Checkout + Supabase Edge Functions (Deno).
*   **Icons:** Lucide React.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   Supabase Account
*   Stripe Account (for API keys)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Davecrytpo/merchant-s-delight-commerce.git

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
```

### 4. Database Setup
Apply the migrations found in `/supabase/migrations` to your Supabase project. These migrations set up:
*   `products`, `product_images`, `product_variants` tables.
*   `orders` and `reviews` systems.
*   Automatic triggers for reward point calculations.
*   RPC functions for purchase verification.

### 5. Edge Functions
Deploy the checkout function to Supabase:
```bash
supabase functions deploy create-checkout --project-ref iudmdldthlhrvofkjfvw
```
*Ensure you set `STRIPE_SECRET_KEY` in your Supabase project settings.*

### 6. Development
```bash
npm run dev
```

---

## 📱 Mobile Experience
The application has been audited for a premium mobile experience:
*   **Responsive Forms:** No layout breaking on small screens.
*   **Touch Interactions:** Mobile-specific zoom and navigation.
*   **Optimized Performance:** Fast loading times and smooth animations.

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

*Built with ❤️ for the premium footwear market.*
