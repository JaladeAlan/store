# LUXE — Premium E-Commerce Store

A production-ready clothing e-commerce platform built with **Next.js 14**, **Supabase**, **TailwindCSS**, and Nigerian payment gateways (Paystack + Monnify).

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + OTP magic link) |
| Storage | Supabase Storage |
| State | Zustand (cart + wishlist, localStorage persisted) |
| Styling | TailwindCSS (custom luxury design tokens) |
| Payments | Paystack (primary) + Monnify (secondary) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
luxe-store/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout (fonts, navbar, footer, cart)
│   ├── globals.css               # Design system + utility classes
│   ├── shop/
│   │   └── products/
│   │       ├── page.tsx          # Product listing with filters
│   │       └── [slug]/page.tsx   # Product detail + structured data
│   ├── cart/                     # Cart page (drawer-based)
│   ├── checkout/
│   │   ├── page.tsx              # Checkout form
│   │   └── success/page.tsx      # Payment confirmation
│   ├── search/page.tsx           # Live search
│   ├── auth/
│   │   ├── login/page.tsx        # Email/password + OTP
│   │   └── register/page.tsx     # Registration
│   ├── account/
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── orders/page.tsx       # Order history
│   │   └── profile/page.tsx      # Profile editor
│   ├── admin/
│   │   ├── layout.tsx            # Admin sidebar layout
│   │   ├── page.tsx              # Admin dashboard stats
│   │   ├── products/             # Product CRUD
│   │   ├── orders/               # Order management
│   │   └── users/                # Customer list
│   └── api/
│       ├── orders/               # Create orders, validate discounts
│       ├── payments/
│       │   ├── paystack/         # Initialize Paystack transaction
│       │   ├── monnify/          # Initialize Monnify transaction
│       │   └── verify/           # Verify payment after redirect
│       ├── webhooks/
│       │   ├── paystack/         # Paystack webhook handler
│       │   └── monnify/          # Monnify webhook handler
│       ├── admin/products/       # Admin product CRUD API
│       ├── admin/orders/         # Admin order status updates
│       ├── search/               # Product search
│       └── upload/               # Supabase Storage image upload
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Sticky navbar with cart badge
│   │   └── Footer.tsx            # Footer with payment badges
│   ├── shop/
│   │   ├── HeroSection.tsx       # Full-screen hero
│   │   ├── ProductCard.tsx       # Card with hover gallery swap
│   │   ├── ProductGallery.tsx    # Image gallery with zoom
│   │   ├── ProductInfo.tsx       # Size/variant selector + add to cart
│   │   ├── ProductFiltersPanel.tsx # Category, size, price filters
│   │   ├── FeaturedProducts.tsx
│   │   ├── CollectionsGrid.tsx
│   │   ├── BrandValues.tsx
│   │   └── NewsletterBanner.tsx
│   ├── cart/
│   │   └── CartDrawer.tsx        # Slide-in cart drawer
│   ├── checkout/
│   │   └── CheckoutSuccessContent.tsx
│   ├── admin/
│   │   ├── ProductForm.tsx       # Full product CRUD form with image upload
│   │   └── AdminOrderActions.tsx # Inline order status updater
│   └── ui/
│       └── ProductCardSkeleton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server + Admin Supabase clients
│   │   └── middleware.ts         # Session refresh + route protection
│   ├── products.ts               # Product data access layer
│   ├── orders.ts                 # Order data access layer
│   ├── paystack.ts               # Paystack API integration
│   ├── monnify.ts                # Monnify API integration
│   └── utils.ts                  # formatPrice, slugify, etc.
├── store/
│   ├── cart.ts                   # Zustand cart (localStorage persisted)
│   └── wishlist.ts               # Zustand wishlist (localStorage persisted)
├── hooks/
│   └── useAuth.ts                # Auth state hook
├── types/
│   └── index.ts                  # All TypeScript interfaces
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Full schema + RLS
```

---

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd luxe-store
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/migrations/001_initial_schema.sql`
3. Go to **Storage** → verify the `products` bucket was created (public)
4. Copy your project URL and API keys

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_WEBHOOK_SECRET=your-secret

MONNIFY_API_KEY=MK_TEST_...
MONNIFY_SECRET_KEY=...
MONNIFY_CONTRACT_CODE=...
MONNIFY_BASE_URL=https://sandbox.monnify.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Admin User

After signing up, run this in Supabase SQL Editor:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 💳 Payment Webhooks

Register these webhook URLs in your payment provider dashboards:

| Provider | Webhook URL |
|----------|------------|
| Paystack | `https://yourdomain.com/api/webhooks/paystack` |
| Monnify | `https://yourdomain.com/api/webhooks/monnify` |

**Paystack events to subscribe to:** `charge.success`, `charge.failed`, `refund.processed`

---

## 🚀 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

---

## 🔐 Security Notes

- All product prices are **verified server-side** — client cart prices are never trusted
- Payment webhooks verify **HMAC signatures** before processing
- RLS policies ensure users can **only access their own data**
- Admin routes are protected via **both middleware and server components**
- Image uploads validate **file type and size** server-side

---

## 🧩 Key Features

- ✅ Minimal luxury UI (Playfair Display + DM Sans)
- ✅ Server Components + ISR caching
- ✅ Zustand cart with localStorage persistence
- ✅ Paystack + Monnify payment integration
- ✅ Webhook verification (HMAC-SHA512)
- ✅ Supabase Auth (email/password + OTP magic link)
- ✅ Full RLS with admin bypass
- ✅ Product image gallery with zoom
- ✅ Size/color variant selection with stock tracking
- ✅ Discount codes (percentage + fixed)
- ✅ Admin panel (products CRUD, orders, users)
- ✅ SEO: dynamic metadata + JSON-LD structured data
- ✅ Mobile-first responsive design
- ✅ Optimistic UI + toast notifications
