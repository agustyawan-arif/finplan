# Pockit — Production-Ready Money Manager

Pockit is a premium, mobile-first personal finance and money management web application optimized for modern viewports. Built using React, Next.js (App Router with Turbopack), TailwindCSS v4, Lucide icons, and backed by Supabase with robust Row-Level Security (RLS).

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** Next.js (with React 19)
- **Styling:** TailwindCSS v4
- **Database & Auth:** Supabase (PostgreSQL with RLS and user ownership policies)
- **Icons:** Lucide React
- **Build Validation:** Strict TypeScript compilation check + optimized ESLint environment configuration for lightning-fast, production-ready static page generation and CI/CD pipelines.

---

## 🔒 Production Security & Data Isolation

1. **Row-Level Security (RLS):** 
   - All financial tables (`accounts`, `categories`, `budgets`, `investment_holdings`, `transactions`, `asset_valuations`, `exchange_rates`) have PostgreSQL Row-Level Security enabled.
   - Access policies strictly verify `user_id = auth.uid()` on all operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
   - The frontend exclusively utilizes the public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) for secure, client-side queries. User sessions are verified securely via the Supabase Auth listener.
   - High-privilege keys (`service_role`) are **never** committed or exposed to client-side code.

2. **Clean Mock Data Isolation:**
   - All mock financial data is isolated under the `src/data` directory and `src/lib/finance/mockDataValidation.ts`.
   - Production/authenticated database states strictly fetch user data relative to the logged-in user `id`. Real user records are never mixed, seeded, or polluted with developer mock data.

---

## 🔑 Environment Variables Setup

Before running the application, configure your local environment files.

Create a `.env.local` file in the root directory (this file is excluded from git control via `.gitignore`):

```bash
# Supabase Production or Development Project Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-sb-anon-key
```

An example template is available at [.env.local.example](file:///Users/arifagustyawan/Documents/projects/finplan/.env.local.example).

---

## 🚀 Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Open local application:**
   Navigate to [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 📦 Building & Validating for Production

To perform a production-ready sanity check and compile the static deployment assets locally:

1. **Type Check (Strict TypeScript compiler):**
   ```bash
   npx tsc --noEmit
   ```

2. **Lint Validation:**
   ```bash
   npm run lint
   ```

3. **Next.js Optimized Production Build:**
   ```bash
   npm run build
   ```

---

## 💾 Supabase Setup Reminder

To initialize your production database schema:

1. Create a new project in your **Supabase Dashboard**.
2. Run the migration scripts located in the [supabase/migrations/](file:///Users/arifagustyawan/Documents/projects/finplan/supabase/migrations) directory in order:
   - `20260526000000_init_schema.sql` (Creates tables, triggers, and configures basic RLS policies)
   - `20260526090000_grant_permissions.sql` (Grants public and authenticated API roles usage access to tables)
   - `20260526090500_add_category_columns.sql`
   - `20260526090600_align_schemas_with_types.sql`
   - `20260526090800_fix_category_kind_check.sql`

---

## 🌩️ Deploying to Vercel

1. Push your project commits to a **GitHub/GitLab/Bitbucket** repository.
2. Sign in to [Vercel](https://vercel.com) and create a **New Project**.
3. Select your repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically build the Next.js static files and configure optimized edge routing.
