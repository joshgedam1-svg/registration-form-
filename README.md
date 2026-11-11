# Cricket Auction League — Player Registration & Administration System

A full-stack, mobile-first player registration and tournament administration portal built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Storage, Auth, Realtime)**.

Designed exclusively for competitive cricket leagues, tournament organizers, and players.

---

## 🌟 Key Features

### Player-Facing Portal
- **Open Player Registration (`/register`):** Single-column, touch-optimized responsive registration with real-time Zod field validation.
- **Personal & Cricket Profile:** Full contact info, age validation, batting style, bowling arm/style, and competitive experience tier.
- **Fixed ₹500 Registration Fee:** Direct UPI gateway integration with dynamic QR generation (NPCI standard) and one-click UPI ID clipboard copy.
- **Anti-Fraud Payment Proof:** 12-digit numeric UTR tracking and payment receipt screenshot upload with preview, replace, and delete actions.
- **Unique Registration ID:** Generates sequence-safe IDs (e.g. `CAL-2026-000001`).
- **Registration Confirmation (`/registration-success`):** Printable confirmation slip, celebration effects, and tracking link.
- **Live Status Tracker (`/track-status`):** Instant lookup by Registration ID to review committee approval and bank verification remarks.

### Admin-Facing Suite (`/admin`)
- **Secure Authentication (`/admin/login`):** Role-based access control protecting all administrative endpoints.
- **Live Telemetry Dashboard (`/admin/dashboard`):** 6 real-time stat cards (Total Registrations, Verified Players, Pending Verifications, Rejected Payments, Remaining Slots, Total Verified Collection in ₹).
- **Concurrency & Capacity Guard:** Automatic quota enforcement (`MAX(0, Capacity - Verified)`). Prevents overselling tournament slots.
- **Dedicated Payment Queue (`/admin/payments`):** Side-by-side screenshot lightbox inspector, 1-click atomic verification, and rejection with mandatory audit reason.
- **Player Management (`/admin/players`):** Search by name, city, registration ID, or mobile. Filter by roles (Batsmen, Bowlers, All-rounders, Wicketkeepers) and status. Full player dossier modal with squad CSV export.
- **In-Depth Cricket Analytics (`/admin/statistics`):** Technical breakdown of batting hands, bowling craft, and experience brackets.
- **Tournament Control Panel (`/admin/settings`):** Live toggles for registration open/closed status, fee adjustment, UPI ID updates, and capacity adjustments.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16+ (App Router)** |
| Language | **TypeScript 5+** |
| Styling | **Tailwind CSS v4** (Clean White & Emerald Green `#176B45`) |
| Font | **Poppins exclusively** (via `next/font/google`) |
| Validation | **Zod** + **React Hook Form** |
| Icons | **Lucide React** |
| Database | **Supabase PostgreSQL** with RLS & Stored Procedures |
| Auth & Storage | **Supabase Auth** & **Supabase Private Storage** |

---

## 🚀 Quick Start & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> **Note:** The application includes a self-contained in-memory fallback store with preloaded sample data (Rohit Sharma, Jasprit Bumrah, Ravindra Jadeja, Rishabh Pant). You can run, test, and demo the entire public and admin flow right out of the box even before provisioning a Supabase project!

### 3. Run Database Migrations (Supabase)
Run the SQL migration script in your Supabase SQL editor:
```sql
-- Located at: supabase/migrations/20261111000000_init_schema.sql
-- Optional Seed Data: supabase/seed.sql
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🔒 Security & Concurrency Design

- **Atomic Payment Verification (`verify_payment_transaction`):** PostgreSQL row-locking on `tournament_settings` during verification prevents race conditions and overselling when multiple administrators approve payments simultaneously.
- **Duplicate Prevention:** Strict uniqueness constraints on normalized 10-digit mobile numbers and 12-digit UTR references.
- **Anti-Tampering:** File extensions and MIME types are validated on the server. Payment screenshots are stored privately with short-lived access.
- **Row Level Security:** Strict RLS policies on `players`, `payments`, `tournament_settings`, and `admin_activity_logs`.

---

## 🌐 Production Deployment (Vercel)

1. Push code to GitHub repository.
2. Import project in Vercel.
3. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`).
4. Deploy!
