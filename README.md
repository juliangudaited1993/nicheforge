# NicheForge

**AI-powered niche research and validation platform.** Go from a vague idea to a scored, actionable market opportunity in minutes.

Built with Next.js 16 + TypeScript + Tailwind as the initial scaffold from `grok new NicheForge`.

## What it does

- **Seed any idea** — long-tail hobbies, emerging problems, audience segments, or product categories
- **Multi-angle research** — demand, audience, competitors, monetization, content angles, risks
- **Instant scored report** — 0-100 validation score + metrics with explanations
- **Actionable 5-step playbook** — concrete next actions you can run this week
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

## Key Features (MVP)

- Beautiful dark "forge" aesthetic with amber accents
- Example seeds for instant testing
- Controllable depth (Quick / Standard / Deep) and focus areas
- Save reports to browser (localStorage)
- One-click Markdown export
- Clickable related niches to chain research
- Fully responsive

## Future / Production Ideas

- Real-time web research via xAI / OpenAI / Perplexity (see `.env.example`)
- User accounts + saved reports in DB (Supabase / PlanetScale)
- PDF export, shareable public links
- Competitor deep-dive pages + historical trend charts
- Team workspaces + comment threads on reports
- API for bulk niche research

## Tech

- Next.js 16 (App Router, Turbopack)
- TypeScript + Tailwind v4
- lucide-react icons
- Zero external API calls in current build (pure client)

## Project Structure

```
nicheforge/
├── app/
│   ├── layout.tsx     # Metadata + dark forge theme
│   ├── page.tsx       # The entire interactive SPA + research engine
│   └── globals.css    # Custom design tokens + animations
├── .env.example
└── README.md
```

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

*Created via `grok new NicheForge` • April 2026*


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
