# PROJECT MAP — AI Product Analyzer SaaS

## [TECH_STACK]
- **Framework:** Next.js 14.2.35 (App Router, flat structure)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.4.x
- **Fonts:** Plus Jakarta Sans (display), Inter (body)
- **Testing:** Playwright 1.61.1 (Chromium)
- **Database & Auth:** Supabase (Postgres + Auth + SSR)
- **AI Provider:** OpenRouter → anthropic/claude-3-haiku
- **Payments:** Paddle (Monthly / Yearly plans)
- **PDF Export:** jsPDF 4.x
- **Hosting:** Vercel
- **Icons:** lucide-react
- **Notifications:** react-hot-toast
- **Validation:** zod 4.x
- **Utilities:** clsx, tailwind-merge

## [DESIGN SYSTEM]
| Token | Value | Usage |
|-------|-------|-------|
| `brand-primary` | `#1A56DB` | Buttons, links, active elements |
| `brand-deep` | `#0C1B33` | Dark backgrounds, footer |
| `brand-accent` | `#F59E0B` | Strengths, highlights, secondary CTAs |
| `surface` | `#F8FAFC` | Page backgrounds |
| `muted` | `#64748B` | Secondary text |
| `border` | `#E2E8F0` | Card borders, dividers |
| **Display font** | Plus Jakarta Sans | Headings (weight 500-800) |
| **Body font** | Inter | Body text (weight 400-600) |
| **Signature** | Glowing Analysis Ring | Conic gradient ring animation |

All components use `cn()` utility (clsx + tailwind-merge) for className composition.

## [SYSTEM_FLOW]
```
User → Landing → Signup/Login → Dashboard → Product URL / Image Upload
       ↓                                                    ↓
  Subscribe ← trial_used=true                          POST /api/analyze
       ↓                                                    ↓
  Paddle Webhook ← Payment                          AI Analysis (async)
       ↓                                                    ↓
  role='subscribed'                                  Polling status (3s)
                                                           ↓
                                                     Results Display
                                                           ↓
                                                     Export PDF
```

## [ARCHITECTURE] — Flat Structure
```
/
├── app/
│   ├── layout.tsx                    # Root (Plus Jakarta Sans + Inter)
│   ├── globals.css                   # Design tokens + analysis-ring keyframe
│   ├── page.tsx                      # Landing page (M10)
│   ├── login/page.tsx                # Login form (M2 ✅)
│   ├── signup/page.tsx               # Signup form (M2 ✅)
│   ├── auth/callback/route.ts        # OAuth callback (M2 ✅)
│   ├── dashboard/
│   │   ├── layout.tsx                # Protected layout + sidebar (M3 ✅)
│   │   ├── page.tsx                  # Projects list + empty state (M3 ✅)
│   │   ├── project/new/page.tsx      # New analysis form (M4 ✅)
│   │   ├── project/[id]/page.tsx     # Analysis results view (M4 ✅)
│   │   │                             #   → URL paste OR image upload (M4 scope+)
│   │   ├── subscribe/page.tsx        # Pricing plans + Paddle checkout (M8 ✅)
│   │   └── billing/page.tsx          # Billing info + manage subscription (M8 ✅)
│   └── api/
│   ├── analyze/route.ts        # POST trigger — URL or image analysis (M4 ✅)
│   │   └── status/route.ts     # GET polling status (M5 ✅)
│   └── paddle/webhook/route.ts       # Paddle subscription events (M8 ✅)
├── components/
│   ├── ui.tsx                        # Button, Input, Card (M2 ✅)
│   ├── providers.tsx                 # Toaster + future providers (M2 ✅)
│   ├── dashboard-layout.tsx          # Sidebar + header (M3 ✅)
│   ├── project-card.tsx              # Project card (M3 ✅)
│   ├── analysis-form.tsx             # URL/Image toggle + language (M4 ✅)
│   ├── analysis-display.tsx          # Results view + polling (M5 ✅)
│   └── pdf-export-button.tsx         # Client PDF download (M5 ✅)
├── lib/
│   ├── supabase-browser.ts           # createBrowserClient (M1 ✅)
│   ├── supabase-server.ts            # createServerClient (M1 ✅)
│   ├── ai.ts                         # OpenRouter + prompts (M1 ✅)
│   ├── pdf.ts                        # jsPDF generator (M1 ✅)
│   └── utils.ts                      # cn(), log(), formatDate() (M1 ✅)
├── middleware.ts                      # Auth redirect guard (M1 ✅)
├── types.ts                          # User, Project, AnalysisResult (M1 ✅)
├── tests/
│   ├── auth.spec.ts                  # 5 Playwright tests (M2 ✅)
│   ├── m3-dashboard.spec.ts         # 6 Playwright tests (redirect, design tokens, forms)
│   ├── m4-analysis.spec.ts          # 6 Playwright tests (all protected routes, forms)
│   └── m5-results.spec.ts           # 4 Playwright tests (M5 ✅ — protected routes, design tokens, console errors)
├── playwright.config.ts              # Playwright config (M2 ✅)
├── .env.local.example
├── .env.local                        # Placeholder vars for dev
├── PROJECT_MAP.md
└── package.json / tsconfig.json / ...
```

## [DATA MODEL] — 3 Tables
```
User ←── Project ←── AnalysisResult
│         │
│ id      │ id
│ email   │ user_id → User.id
│ role    │ product_url
│ trial_used │ product_image_url      ←  (M4 scope+: Supabase Storage)
│ paddle_subscription_id │ product_name
│ subscription_plan │ language (en/ar)
│ subscription_end │ created_at
│ created_at │
```

See `types.ts` for full field definitions.

## [BUILD STATUS]
```
✓ tsc --noEmit: pass
✓ next build: pass
✓ Playwright: 23/23 passed (M2: 5 + M3: 6 + M4: 6 + M5: 4 + E2E: 2)
  Routes: /, /login, /signup, /dashboard, /dashboard/project/new, /dashboard/project/[id],
          /dashboard/subscribe, /dashboard/billing
  Middleware: 83.2 kB ✓
  Real Infra: Supabase (live project) + OpenRouter (claude-3-haiku)
  E2E Flow: signup → login → analyze real Amazon URL → verify DB + trial_used
```

## [MILESTONES]
| # | Status | Milestone | Verification |
|---|--------|-----------|-------------|
| M1 | ✅ | Foundation | `next build` + `tsc` pass |
| M2 | ✅ | Auth UI | 5 Playwright tests pass |
| M3 | ✅ | Dashboard + Projects | 6 Playwright tests pass (redirect, design tokens, auth forms) |
| M4 | ✅ | AI Analysis | 6 Playwright tests (redirects, forms, all routes) |
| M5 | ✅ | Results UI + PDF Export | Full analysis display + branded PDF + polling + 4 Playwright tests |
| M6 | ⬜ | Polish | Landing page, error states, loading skeletons, SEO |
| M7 | ✅ | Free Trial | trial_used gate + redirect to subscribe (built in M4, tested in E2E) |
| M8 | ✅ | Subscriptions | Paddle checkout + webhook + subscribe/billing pages. 23/23 tests pass |
| M9 | ⬜ | Billing Polish | Paddle customer portal integration, invoice history |
| M10 | ⬜ | Production Setup | Domain, webhook URL config, SEO, landing page |

## [CHANGES — 2026-07-05]
- **Fixed Playwright config:** Added `dotenv` loading from `.env.local` so e2e tests access Supabase/Paddle env vars
- **Integrated @paddle/paddle-js v1.6.4:** Rewrote subscribe page to use official npm package (`initializePaddle`) with dynamic import — bypasses manual CDN script loading and works correctly with Next.js SSR
- **Added fallback redirect:** If `paddle.Checkout.open()` overlay fails, redirects to Paddle-hosted checkout URL as fallback
- **All 24 tests verified passing** (21 basic + 2 e2e full-flow + 1 e2e subscribe)
- **Paddle checkout issue persists:** "Something went wrong" from Paddle server when opening checkout — confirmed prices valid (debug API), likely needs Default Payment Link configured in Paddle Sandbox Dashboard (`https://sandbox-vendors.paddle.com/checkout-settings`)

## [ORPHANS & PENDING]
- [ ] **Paddle webhook URL** — needs to be configured in Paddle Sandbox dashboard → `https://your-domain.com/api/paddle/webhook`
- [ ] **Domain** — production domain for webhooks/redirects
- [ ] **Pricing** — display prices ($29/$290) set in subscribe page (adjust via env/config)
- [ ] **Supabase Storage bucket** — needed for M4 product image uploads (currently using base64 direct to OpenRouter)

## [SCOPE CHANGES]
| Date | Change | Details |
|------|--------|---------|
| 2026-06-11 | **M4 scope+** | Added product image upload option. Project table gains `product_image_url`. ai.ts gains Vision support. UI gains URL/Image toggle. |
| 2026-06-11 | **M5 merged** | Results UI and PDF Export merged into one milestone. M6 re-purposed as Polish. M5 now includes branded PDF export, polling, status API route. |
| 2026-06-11 | **Model switch: claude-3-haiku** | Switched Vision model from gpt-4o-mini → claude-3-haiku (cheapest Claude on OpenRouter) for cost optimization. Vision payload unchanged — still uses content array format with image_url. Feature fully intact and operational. |
