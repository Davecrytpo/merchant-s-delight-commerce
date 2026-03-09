import { Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

import StorefrontLayout from "@/components/storefront/StorefrontLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import AIChatWidget from "@/components/storefront/AIChatWidget";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Wishlist from "@/pages/Wishlist";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import FAQ from "@/pages/FAQ";
import SizeGuide from "@/pages/SizeGuide";
import TrackOrder from "@/pages/TrackOrder";
import Returns from "@/pages/Returns";
import Account from "@/pages/Account";
import Orders from "@/pages/Orders";
import NotFound from "@/pages/NotFound";

import AdminAuth from "@/pages/admin/AdminAuth";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminShipping from "@/pages/admin/AdminShipping";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminReturns from "@/pages/admin/AdminReturns";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Toaster position="top-right" theme="dark" />
          <Routes>
            {/* Storefront */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<AdminAuth />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="shipping" element={<AdminShipping />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* AI Chat Widget — available on all storefront pages */}
          <AIChatWidget />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
