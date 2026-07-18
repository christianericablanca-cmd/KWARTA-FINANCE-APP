# Kwarta — Personal Finance App

A full-stack personal finance management dashboard built with Next.js 16, Supabase, and Tailwind CSS. Track your money, understand your spending, and take control of your finances.

## Features

### Financial Tracking
- **Accounts** — Track cash, bank, savings, credit cards, e-wallets, investments, and crypto
- **Transactions** — Record income and expenses with categories, tags, notes, and receipt images
- **Bills** — Manage recurring bills with due dates, auto-pay, reminders, and paid/unpaid status
- **Savings Goals** — Set target amounts with deadlines and track contributions

### Insights & Reports
- **Dashboard** — Summary cards, income vs expenses charts, spending breakdown, savings progress
- **Analytics** — Daily, weekly, and monthly spending trends with category breakdown
- **Reports** — Monthly and yearly financial reports with JSON export
- **Calendar** — Month view showing transactions and bills per day

### User Experience
- **Mobile-first** — Bottom navigation, floating quick-add button, card-based layouts
- **Dark mode** — Light and dark themes with persistent preference
- **Real-time sync** — Account balances auto-update when transactions are added
- **Notifications** — In-app notifications with real data from your account

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL, Auth, Row-Level Security) |
| Charts | ApexCharts |
| Calendar | FullCalendar |
| Forms | Custom CurrencyInput with formatting |
| State | React Context API |

## Database Schema

**9 tables** with Row-Level Security (RLS) — each user can only access their own data:

- `profiles` — User profile (auto-created on signup)
- `accounts` — Financial accounts (7 types supported)
- `categories` — Income and expense categories with icons and colors
- `transactions` — Income, expenses with category, account, date, notes, tags
- `budgets` — Category budgets with period tracking
- `savings_goals` — Target-based savings goals
- `contributions` — Individual contributions to savings goals
- `bills` — Recurring bills with due dates and status
- `notifications` — User notifications

All amounts stored as `DECIMAL(12,2)` for precise cents handling.

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account (free tier works)
- Git

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/christianericablanca-cmd/KWARTA-FINANCE-APP.git
cd KWARTA-FINANCE-APP
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run `supabase-schema.sql` to create all tables, RLS policies, and triggers
   - Get your project URL and anon key from Settings → API

4. **Configure environment**
```bash
# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

5. **Start the dev server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and sign up.

### Supabase SQL Setup

Run these files in Supabase SQL Editor in order:
1. `supabase-schema.sql` — Creates tables, indexes, RLS policies, and the auto-profile trigger
2. `supabase-seed.sql` (optional) — Seeds sample data for testing

> **Note:** The trigger `on_auth_user_created` automatically creates a profile row when a new user signs up.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with balance, charts, recent transactions |
| `/accounts` | Manage financial accounts |
| `/transactions` | View, add, edit, delete transactions |
| `/categories` | Organize income and expense categories |
| `/savings-goals` | Track savings goals with contributions |
| `/bills` | Manage recurring bills |
| `/analytics` | Spending patterns and trends |
| `/analytics/income` | Income source breakdown |
| `/reports/monthly` | Monthly financial report |
| `/reports/yearly` | Yearly financial overview |
| `/calendar` | Calendar view with activity per day |
| `/notifications` | View all notifications |
| `/search` | Search transactions with filters |
| `/profile` | User profile overview |
| `/settings` | Currency, theme, notifications, data export/reset |
| `/signin` | Sign in |
| `/signup` | Create account |

## Mobile Experience

Kwarta is built mobile-first with:
- **Bottom navigation bar** — Quick access to Home, Transactions, Quick-Add, Accounts, Bills
- **Floating action button** — Quick-add transaction directly from the dashboard
- **Bottom sheet modals** — Slide-up forms optimized for thumb reach
- **Card-based lists** — Transactions and bills use cards instead of tables on mobile
- **44px touch targets** — All buttons and inputs meet accessibility minimums
- **Currency input** — Formatted with commas and cents, optimized for mobile keyboards

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/publishable key |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploy to Vercel

The easiest way to deploy Kwarta is on [Vercel](https://vercel.com), the platform built by the creators of Next.js.

### One-Click Deploy

1. Push this repo to GitHub (already done)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo: `christianericablanca-cmd/KWARTA-FINANCE-APP`
4. Vercel auto-detects Next.js — no configuration needed
5. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
6. Click **Deploy**

Your app will be live at `https://kwarta.vercel.app` (or your custom domain).

### Supabase Production Checklist

Before going live:

1. **Run the schema** — Execute `supabase-schema.sql` in your Supabase project's SQL Editor
2. **Enable email auth** — In Supabase Dashboard → Authentication → Providers → Enable Email
3. **Set Site URL** — In Authentication → URL Configuration, add your Vercel domain
4. **Disable confirmations** (optional) — If you don't want email confirmation, uncheck "Confirm email" in Auth settings

### Custom Domain

In Vercel → Project Settings → Domains, add your custom domain. Update the Site URL in Supabase Auth settings to match. |

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (admin)/              # Authenticated pages (dashboard, accounts, etc.)
    (full-width-pages)/   # Auth pages (signin, signup)
  components/             # Reusable UI components
    form/                 # CurrencyInput, form elements
    header/               # NotificationDropdown, UserDropdown
    ui/                   # Dropdown, Modal, Button, Table, etc.
  context/                # React Context providers
    FinanceContext.tsx     # Central data management
    SidebarContext.tsx     # Sidebar state
    ThemeContext.tsx       # Dark/light mode
  layout/                 # Layout components
    AppHeader.tsx          # Top navigation bar
    AppSidebar.tsx         # Side navigation (desktop)
    MobileBottomNav.tsx    # Bottom nav (mobile)
  lib/                    # Utilities and types
    supabase/             # Supabase client and DB operations
    types.ts              # TypeScript interfaces
  icons/                  # SVG icon components
```

## License

MIT
