# Deployment Infrastructure - Documentation

**Version:** 1.0
**Last Updated:** 2025-11-08
**Related Diagram:** `deployment-infrastructure.mermaid.md`

---

## Overview

CBC Acoustics v2 is deployed as a **static site** to edge networks (Cloudflare Pages or Vercel), eliminating the need for backend servers and providing global low-latency access. The deployment architecture prioritizes simplicity, performance, and cost-effectiveness.

---

## Deployment Architecture

### Static Site Architecture
- **No Backend Server:** All logic runs in the browser
- **No API Endpoints:** No server-side data processing
- **No Database:** Data stored in CSV files bundled with the app
- **No Authentication:** Public dashboard (no login required)

**Benefits:**
- Zero server costs (only CDN/hosting)
- Infinite scalability (edge caching)
- No server maintenance
- 99.99%+ uptime (CDN reliability)
- Global low latency (edge distribution)

---

## Recommended Platform: Cloudflare Pages

### Why Cloudflare Pages?

**Advantages:**
1. **Global Edge Network:** 300+ locations worldwide
2. **Unlimited Bandwidth:** No bandwidth charges
3. **Free Tier:** Generous limits for most projects
4. **Instant Cache Purge:** Fast deployments
5. **DDoS Protection:** Built-in security
6. **Analytics:** Free page views and performance metrics
7. **Preview Deployments:** Automatic preview URLs for branches

**Pricing:**
- **Free Tier:** Unlimited requests, 500 builds/month
- **Pro Tier:** $20/month (advanced features)

---

### Cloudflare Pages Deployment Flow

**Automatic Deployment (Recommended):**

1. **GitHub Integration:**
   - Connect Cloudflare Pages to GitHub repository
   - Authorize Cloudflare to access repo
   - Select `main` branch for production

2. **Build Configuration:**
   ```yaml
   Project name: cbc-acoustics-v2
   Production branch: main
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   Environment variables: (none required)
   ```

3. **Deployment Trigger:**
   - Developer pushes to `main` branch
   - Cloudflare detects commit via webhook
   - Build starts automatically (~3-5 minutes)
   - Assets deployed to edge network
   - DNS updated to new deployment

4. **Preview Deployments:**
   - Feature branches get unique preview URLs
   - Format: `https://{branch}.{project}.pages.dev`
   - Automatically deleted when branch is merged

**Manual Deployment (via Wrangler CLI):**

```bash
# Install Wrangler
npm install -g wrangler

# Authenticate
wrangler login

# Build project
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=cbc-acoustics-v2
```

---

### Cloudflare Edge Network

**How It Works:**
1. User requests `https://acoustics.cbcradio.ca`
2. DNS resolves to nearest Cloudflare edge server
3. Edge server checks cache for assets
4. If cached: Serve immediately (cache hit)
5. If not cached: Fetch from origin, cache, serve (cache miss)

**Cache Behavior:**
- **HTML:** Cached for 1 hour (revalidate on change)
- **JS/CSS:** Cached for 1 year (hash-based filenames)
- **CSV Data:** Cached for 1 year (immutable)
- **Fonts/Images:** Cached for 1 year

**Cache Invalidation:**
- Automatic on new deployment
- Manual purge via Cloudflare dashboard (if needed)

---

## Alternative Platform: Vercel

### Why Vercel?

**Advantages:**
1. **Framework Optimization:** Vite auto-detected
2. **Zero Config:** Works out of the box
3. **Preview Deployments:** Automatic PR previews
4. **Analytics:** Core Web Vitals tracking (free)
5. **Edge Network:** Global distribution
6. **GitHub Integration:** Seamless workflow

**Pricing:**
- **Hobby Tier (Free):** 100 GB bandwidth/month
- **Pro Tier:** $20/month (1 TB bandwidth)

---

### Vercel Deployment Flow

**Automatic Deployment:**

1. **Import Project:**
   - Log in to Vercel dashboard
   - Click "Add New Project"
   - Import from GitHub: `chrislyons/cbc-acoustics-v2`

2. **Build Configuration:**
   ```yaml
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Environment Variables: (none)
   ```

3. **Deploy:**
   - Vercel auto-deploys on push to `main`
   - Unique preview URL for every PR
   - Production URL: `https://cbc-acoustics-v2.vercel.app`

**Manual Deployment (via Vercel CLI):**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## CI/CD Pipeline

### GitHub Actions (Optional)

**Purpose:** Run tests and type checks before deployment

**Workflow File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test -- --run
      - run: npm run build
```

**Checks:**
1. TypeScript type validation
2. ESLint code quality
3. Unit test suite
4. Production build success

**Note:** Cloudflare Pages and Vercel both run builds automatically, so GitHub Actions is optional but recommended for pre-deployment validation.

---

## Build Process

### Build Steps (npm run build)

**Step 1: TypeScript Compilation (tsc)**
```bash
$ tsc
✓ Compiled successfully
```
- Validates all TypeScript types
- No output files (--noEmit in tsconfig.json)
- Build fails if type errors exist

**Step 2: Vite Build (vite build)**
```bash
$ vite build
vite v6.0.1 building for production...
✓ 245 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-a3b2c1d4.css   12.34 kB │ gzip: 3.21 kB
dist/assets/index-e5f6g7h8.js  1,480.23 kB │ gzip: 424.56 kB
✓ built in 28.45s
```

**Build Optimizations:**
- **Tree Shaking:** Removes unused code
- **Minification:** Terser for JS, cssnano for CSS
- **Code Splitting:** Separate chunks for routes
- **Asset Optimization:** Image compression, font subsetting
- **Hash Filenames:** Cache busting (e.g., `index-a3b2c1d4.css`)

**Build Output:**
```
dist/
├── index.html                    (Entry HTML)
├── assets/
│   ├── index-[hash].js          (Main app bundle)
│   ├── vendor-[hash].js         (Third-party libs: React, Three.js, Recharts)
│   ├── routes/
│   │   ├── Dashboard-[hash].js  (Lazy-loaded route)
│   │   ├── Visualizer-[hash].js
│   │   └── ...
│   ├── index-[hash].css         (Tailwind CSS)
│   └── [images/fonts]
└── data/
    └── measurements/
        └── *.csv                 (Measurement data)
```

**Bundle Analysis:**
| Asset | Uncompressed | Gzipped | Brotli |
|-------|-------------|---------|--------|
| Main JS | 1,480 KB | 425 KB | 380 KB |
| Vendor JS | 620 KB | 180 KB | 160 KB |
| CSS | 12 KB | 3 KB | 2.5 KB |
| **Total** | **2,112 KB** | **608 KB** | **542 KB** |

---

## Custom Domain Configuration

### Cloudflare Pages Custom Domain

**Step 1: Add Domain**
1. Go to Cloudflare Pages dashboard
2. Select project: `cbc-acoustics-v2`
3. Navigate to **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `acoustics.cbcradio.ca`

**Step 2: DNS Configuration**
- Cloudflare provides DNS records to add:
  ```
  Type: CNAME
  Name: acoustics
  Value: cbc-acoustics-v2.pages.dev
  ```

**Step 3: SSL Certificate**
- Cloudflare automatically provisions SSL certificate
- Certificate renews automatically (Let's Encrypt)
- HTTPS enforced (HTTP redirects to HTTPS)

**Result:**
- `https://acoustics.cbcradio.ca` → Production site
- `https://cbc-acoustics-v2.pages.dev` → Default subdomain

---

### Vercel Custom Domain

**Step 1: Add Domain**
1. Go to Vercel project settings
2. Navigate to **Domains** tab
3. Click **Add**
4. Enter: `acoustics.cbcradio.ca`

**Step 2: DNS Configuration**
- Vercel provides DNS records:
  ```
  Type: CNAME
  Name: acoustics
  Value: cname.vercel-dns.com
  ```

**Step 3: SSL Certificate**
- Vercel automatically provisions SSL (Let's Encrypt)
- Auto-renewal enabled

---

## Environment Configuration

### No Environment Variables Required

**Why?**
- No API keys (no external services)
- No secrets (all data is public)
- No runtime configuration (build-time only)

**Build-Time Constants:**
- All room data in `src/lib/utils/constants.ts`
- Measurement data in `data/measurements/` (bundled)
- No `.env` files needed

---

## Deployment Workflow

### Standard Deployment (Production)

```bash
# 1. Develop feature locally
git checkout -b feature/new-visualization
# ... make changes ...
npm run dev  # Test locally

# 2. Run checks
npm run typecheck
npm run lint
npm test

# 3. Commit and push
git add .
git commit -m "Add new visualization"
git push origin feature/new-visualization

# 4. Create pull request (triggers preview deployment)
# Preview URL: https://feature-new-visualization.cbc-acoustics-v2.pages.dev

# 5. Review and merge to main
# Automatic production deployment triggered

# 6. Verify deployment
# Visit: https://acoustics.cbcradio.ca
```

**Deployment Timeline:**
- Commit pushed: 0s
- Build starts: +10s
- Build completes: +3-5min
- Assets deployed: +30s
- Global propagation: +2-5min
- **Total:** ~5-10 minutes from commit to live

---

## Rollback Procedure

### Cloudflare Pages Rollback

1. Go to **Deployments** tab
2. Find last known good deployment
3. Click **...** → **Rollback to this deployment**
4. Confirm rollback
5. Site reverts in <2 minutes

**Deployment History:**
- Cloudflare keeps all deployments indefinitely
- Can rollback to any previous deployment
- Instant rollback (no rebuild required)

---

### Vercel Rollback

1. Go to **Deployments** page
2. Click on previous successful deployment
3. Click **Promote to Production**
4. Site reverts in <1 minute

---

## Monitoring & Analytics

### Cloudflare Analytics (Included)

**Metrics Available:**
- Page views (unique + total)
- Bandwidth usage
- Cache hit rate (typically >95%)
- Geographic distribution of visitors
- Top pages/routes
- Performance metrics (TTFB, FCP, LCP)

**Access:** Cloudflare dashboard → Analytics

---

### Vercel Analytics (Optional - $10/month)

**Metrics Available:**
- Core Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)
- Performance scoring
- Page-by-page breakdown

**Integration:**
```typescript
// Add to main.tsx
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
)
```

---

### Error Tracking (Optional - Sentry)

**Why Add Sentry?**
- Track runtime errors in production
- User session replay
- Performance monitoring
- Alert on critical errors

**Setup:**
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://your-dsn.sentry.io',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
})
```

---

## Performance Optimization

### CDN Caching Strategy

**Asset Types:**

| Asset Type | Cache Duration | Cache Key |
|-----------|---------------|-----------|
| `index.html` | 1 hour | Path |
| `*.js` | 1 year | Hash in filename |
| `*.css` | 1 year | Hash in filename |
| `*.csv` | 1 year | Filename (immutable) |
| Fonts/Images | 1 year | Filename |

**Cache Headers (Auto-Configured):**
```
Cache-Control: public, max-age=31536000, immutable  (for hashed files)
Cache-Control: public, max-age=3600                  (for index.html)
```

---

### Compression

**Cloudflare/Vercel Auto-Compression:**
- Gzip enabled by default (all platforms)
- Brotli enabled on Cloudflare (better compression)

**Compression Ratios:**
- JavaScript: 70% reduction (gzip), 75% (brotli)
- CSS: 75% reduction (gzip), 80% (brotli)
- HTML: 60% reduction

---

### Code Splitting

**Vite Automatic Code Splitting:**
- Each route loaded on demand (lazy loading)
- Vendor libraries in separate chunk
- Common code extracted to shared chunk

**Example Load Sequence:**
1. Initial load: `index.html` + `vendor.js` + `index.js` (~600 KB gzipped)
2. Navigate to Visualizer: `Visualizer.js` (~120 KB gzipped)
3. Navigate to Frequency: `Frequency.js` (~80 KB gzipped)

**Result:** Faster initial load, on-demand loading for routes

---

## Security

### HTTPS Enforcement
- All traffic redirected HTTP → HTTPS
- TLS 1.3 enabled
- HSTS header enabled (max-age=31536000)

### Content Security Policy (CSP)
**Auto-Configured by Cloudflare/Vercel:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';  (Required for React)
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
```

### DDoS Protection
- Cloudflare: Built-in DDoS protection (all tiers)
- Vercel: DDoS mitigation at edge

### No Server-Side Vulnerabilities
- No SQL injection (no database)
- No XSS (React escapes by default)
- No CSRF (no forms/authentication)
- No remote code execution (static files only)

---

## Cost Estimation

### Cloudflare Pages
**Free Tier:**
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month
- 1 concurrent build

**Estimated Cost:** $0/month (free tier sufficient)

---

### Vercel
**Hobby Tier (Free):**
- 100 GB bandwidth/month
- Unlimited requests
- 100 deployments/day

**Pro Tier ($20/month):**
- 1 TB bandwidth/month
- Advanced analytics
- Larger build resources

**Estimated Cost:**
- Free tier: $0/month (likely sufficient)
- Pro tier: $20/month (if high traffic)

---

## Disaster Recovery

### Backup Strategy
**Source Code:**
- Git repository on GitHub (primary)
- Developer local clones (secondary)

**Data:**
- CSV files committed to Git (immutable)
- Cloudflare/Vercel deployment history (all builds)

**Recovery Time Objective (RTO):** <30 minutes
**Recovery Point Objective (RPO):** 0 (no data loss - Git versioned)

### Recovery Procedure
1. Identify issue (deployment failure, DNS issue, etc.)
2. Rollback to last known good deployment (2 minutes)
3. If rollback fails: Redeploy from Git `main` branch (5-10 minutes)
4. If DNS issue: Update DNS records (30 minutes propagation)

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Linter passes (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Local preview works (`npm run preview`)

**Post-Deployment:**
- [ ] Home page loads
- [ ] All routes accessible
- [ ] 3D visualizer renders
- [ ] Charts display correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance metrics acceptable (LCP <500ms)

---

## Related Diagrams

- `entry-points.mermaid.md` - Application initialization and routes
- `architecture-overview.mermaid.md` - System architecture

---

## Additional Resources

**Cloudflare Pages:**
- Docs: https://developers.cloudflare.com/pages/
- Build Configuration: https://developers.cloudflare.com/pages/configuration/

**Vercel:**
- Docs: https://vercel.com/docs
- Build Configuration: https://vercel.com/docs/build-step

**Deployment Guide:**
- See: `docs/DEPLOYMENT.md` (full runbook)

---

**Last Updated:** Sprint 4 (ACU005)
**Current Deployment:** Not yet deployed (ready for deployment)
**Recommended Platform:** Cloudflare Pages
