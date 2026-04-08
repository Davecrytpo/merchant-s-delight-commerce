## Phase 1: Complete UI/UX Redesign
- **New color scheme**: Move from dark/black to a fresh, premium light-luxury palette (warm whites, soft creams, rich navy/indigo accents, rose gold highlights)
- **Update `index.css`** with new design tokens
- **Update `tailwind.config.ts`** with new theme
- **Redesign Hero Carousel** with a more modern, unique animation style
- **Redesign all storefront pages**: Home, Shop, ProductDetail, Cart, Checkout, About, Contact, Blog, FAQ, etc.
- **Redesign admin dashboard** pages with the new theme
- **Ensure 100% mobile responsiveness** on every page

## Phase 2: AI Agent Separation
- **Shopping AI** stays on the homepage/storefront as a floating chat widget
- **Return AI** moves to the Returns page (`/returns`) - accessible from account/orders, not the homepage
- Refactor `AIChatWidget.tsx` to remove the dual-tab design

## Phase 3: Customer Return Dashboard
- Add a **Returns tab** in the Account page showing all return requests with status tracking
- Show return request ID, status, timeline, and details

## Phase 4: Return Status Email Notifications
- Set up email notifications when return status changes (pending → approved → shipped → completed)
- Create email templates for return status updates

## Phase 5: Admin Returns Verification
- Verify admin returns page works correctly
- Ensure status updates trigger notifications

This is a very large scope. I'll tackle it systematically across multiple files.