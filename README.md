# ResearchForge

**Professional General Research Platform**

Deep AI-powered research reports on *any topic* — business, legal, medical, academic, personal, policy, scientific, or technical.

Customizable style • Variable length • Professional PDF • Visible multi-agent collaboration • Detailed sources & charts.

Built as `grok build --full-saas` on top of the initial Next.js 16 scaffold.

## What it does

- **Seed any idea** — long-tail hobbies, emerging problems, audience segments, or product categories
- **Multi-angle research** — evidence, stakeholders, risks, opportunities, and practical implications across domains
- **Instant scored report** — 0-100 validation score + metrics with explanations
- **Actionable recommendations** — clear next steps tailored to the chosen research style and depth
- **Save & export** — local history + clean Markdown export for sharing or Notion

Everything runs in-browser with a high-quality deterministic research engine (same seed + settings = reproducible result). Perfect for demos, prototyping, or offline use.

## Quick Start

```bash
# 1. Install dependencies (first time)
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment to Netlify (Production Ready)

### 1. Prerequisites
- Supabase project with the schema from `supabase/schema.sql` applied (including the updated profiles table with trial fields).
- (Recommended) xAI API key for real Grok-4 reports.
- Stripe keys (for paid plans).

### 2. Netlify Setup
1. Connect your GitHub repo to Netlify.
2. Build settings (usually auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Add the official plugin**:
   - Go to Site settings → Plugins → Search for "@netlify/plugin-nextjs" and install it.
4. Add **Environment Variables** (Site settings → Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `XAI_API_KEY` (strongly recommended)
   - `XAI_MODEL=grok-4`
   - Stripe keys
   - `NEXT_PUBLIC_SITE_URL` = your Netlify URL (e.g. https://your-app.netlify.app)
5. Deploy.

The app includes:
- Proper `netlify.toml` with security headers and plugin recommendation.
- `public/_redirects` as a safe fallback.
- Full demo mode when Supabase envs are missing.
- 7-day trial system that works immediately on real signups.

### 3. Post-Deploy
- Configure Supabase Auth URLs to include your Netlify domain.
- Set up Stripe webhook endpoint to `https://your-site.netlify.app/api/webhooks/stripe`.
- (Optional) Set up a cron or Edge Function later for real trend alert emails.

The full flow (Dashboard → New Report with live 10-agent visualization → Detailed PDF → Saved Reports with trial enforcement) has been internally validated for production.

**→ For complete deployment instructions, see [DEPLOY.md](./DEPLOY.md)**

## Key Features (MVP)

- Beautiful dark "forge" aesthetic with amber accents
- Example seeds for instant testing
- Controllable depth (Quick / Standard / Deep) and focus areas
- Save reports to browser (localStorage)
- One-click Markdown export
- Clickable related topics to chain research
- Fully responsive

## Full SaaS Features (Current)

- **Authentication** — Supabase Auth (magic links)
- **Real Grok-powered reports** — `/new-report` uses xAI Grok-3 via OpenAI-compatible SDK
- **Saved Reports** — Full database-backed history with detail views
- **Dashboard** — Clean professional overview with recent activity
- **Trend Alerts** — Users can create keyword monitors (email delivery ready for later)
- **Clear Pricing** — Free (5 reports + 7-day trial) / Basic $29/mo (20 reports) / Pro $59/mo (100 reports + customization) / Unlimited $99/mo
- **Settings + Quota** — Foundation for usage limits and profiles

## Tech Stack

- Next.js 16 App Router + TypeScript + Tailwind
- Supabase (Auth + Postgres + RLS)
- xAI Grok (via OpenAI SDK)
- Stripe (checkout + webhooks prepared)
- Sonner toasts + Framer Motion ready

## Project Structure (SaaS)

```
app/
├── (dashboard)/          # Protected SaaS area
│   ├── dashboard/
│   ├── reports/
│   ├── new-report/       # Real Grok generation + save
│   ├── alerts/
│   ├── pricing/
│   └── settings/
├── login/
├── signup/
├── actions.ts            # Server actions (generate + save)
└── layout.tsx

lib/
├── grok.ts               # Grok/xAI report generator
├── supabase/
├── types.ts
└── actions/
```

## Quick Start (Local Development)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at supabase.com
   - Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Also copy the **Service Role Key** (for webhooks)
   - Run the SQL in `supabase/schema.sql` in the SQL Editor

3. **Get Grok API key**
   - Go to https://console.x.ai
   - Create an API key → `XAI_API_KEY`

4. **Stripe (optional but recommended)**
   - Create products + prices in Stripe
   - Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and price IDs

5. **Create `.env.local`**
   ```bash
   cp .env.example .env.local
   # fill in the values
   ```

6. **Run the app**
   ```bash
   npm run dev
   ```

Visit http://localhost:3000 → Sign up → Go to Dashboard → Generate real reports with Grok.

## Deploy to Netlify (Recommended)

1. Push to GitHub
2. Import project in Netlify
3. Add all environment variables from `.env.local` in Netlify dashboard
4. Add a Stripe webhook endpoint pointing to `https://your-site.netlify.app/api/webhooks/stripe`
5. Deploy

The app is optimized for Netlify (server actions + API routes work via Netlify Functions).

## Scripts

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start local dev server       |
| `npm run build` | Production build             |
| `npm run start` | Run the production build     |
| `npm run lint`  | Lint with ESLint             |

## Roadmap (Post-MVP)

- [ ] Live research API route (`/api/research`) using XAI_API_KEY
- [ ] Trend charts (Recharts or Tremor)
- [ ] Authentication (NextAuth / Clerk)
- [ ] Public report sharing
- [ ] Mobile PWA support + offline cache

## License

MIT — build whatever you want with it.

---

*ResearchForge — General AI Research Platform • 2026*


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Force rebuild Mon Jun  1 07:31:12 -03 2026

# Netlify rebuild forced on Mon Jun  1 08:18:54 -03 2026
# Force rebuild - Mon Jun  1 08:56:02 -03 2026
# Force clean rebuild - Mon Jun  1 09:00:49 -03 2026
# Force clean rebuild with cache clear - Mon Jun  1 09:27:21 -03 2026
