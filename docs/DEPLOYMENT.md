# Deployment Runbook

## Overview

This document provides step-by-step instructions for deploying the CBC Acoustics Dashboard v2 to production.

**Recommended Platform:** Cloudflare Pages
**Alternative:** Vercel

---

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Cloudflare account (for Cloudflare Pages) OR Vercel account

---

## Option 1: Cloudflare Pages (Recommended)

### Automatic Deployment (GitHub Integration)

**Step 1: Connect Repository**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Authorize Cloudflare to access your GitHub account
6. Select repository: `chrislyons/cbc-acoustics-v2`

**Step 2: Configure Build Settings**

```
Project name: cbc-acoustics-v2
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: /
```

**Step 3: Environment Variables (if needed)**

None required for this project (all config is build-time).

**Step 4: Deploy**

1. Click **Save and Deploy**
2. First build will start automatically (~3-5 minutes)
3. Once complete, you'll receive a `*.pages.dev` URL

**Step 5: Custom Domain (Optional)**

1. Go to **Custom domains** tab
2. Add your custom domain (e.g., `acoustics.cbcradio.ca`)
3. Follow DNS configuration instructions
4. SSL certificate will be provisioned automatically

### Manual Deployment (Wrangler CLI)

**Step 1: Install Wrangler**

```bash
npm install -g wrangler
```

**Step 2: Authenticate**

```bash
wrangler login
```

**Step 3: Build Project**

```bash
cd /path/to/cbc-acoustics-v2
npm install
npm run build
```

**Step 4: Deploy**

```bash
npx wrangler pages deploy dist --project-name=cbc-acoustics-v2
```

**Step 5: Verify Deployment**

Visit the provided URL (e.g., `https://cbc-acoustics-v2.pages.dev`)

---

## Option 2: Vercel

### Automatic Deployment (GitHub Integration)

**Step 1: Import Project**

1. Log in to [Vercel Dashboard](https://vercel.com/)
2. Click **Add New Project**
3. Import from GitHub: `chrislyons/cbc-acoustics-v2`

**Step 2: Configure Build**

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Step 3: Deploy**

1. Click **Deploy**
2. First deployment will start automatically
3. Receive a `*.vercel.app` URL

**Step 4: Custom Domain (Optional)**

1. Go to **Settings → Domains**
2. Add your custom domain
3. Configure DNS records as instructed

### Manual Deployment (Vercel CLI)

**Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: Login**

```bash
vercel login
```

**Step 3: Deploy**

```bash
cd /path/to/cbc-acoustics-v2
vercel --prod
```

---

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All tests pass: `npm test`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Production build succeeds: `npm run build`
- [ ] Build output in `dist/` directory
- [ ] No console errors in dev mode
- [ ] All environment variables configured (if any)

---

## Post-Deployment Verification

After deployment, test the following:

### Functionality Tests

- [ ] Home page loads correctly
- [ ] All navigation links work (Dashboard, Visualizer, Frequency, Simulator, About)
- [ ] 3D visualizer renders (check WebGL support)
- [ ] Frequency charts display correctly
- [ ] Treatment simulator calculations work
- [ ] Export buttons (PNG, CSV) function properly
- [ ] Comparison mode toggles correctly

### Performance Tests

- [ ] Page load time <3 seconds
- [ ] 3D rendering at 60fps (desktop)
- [ ] Chart interactions <100ms response
- [ ] No console errors or warnings

### Cross-Browser Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Tests

- [ ] Responsive layout on mobile (320px+)
- [ ] Touch interactions work
- [ ] Charts readable on small screens

---

## Rollback Procedure

### Cloudflare Pages

1. Go to **Deployments** tab
2. Find last known good deployment
3. Click **Rollback to this deployment**

### Vercel

1. Go to **Deployments**
2. Click on previous successful deployment
3. Click **Promote to Production**

---

## Monitoring & Maintenance

### Performance Monitoring

**Cloudflare Analytics:**
- Available in Cloudflare dashboard
- Tracks page views, bandwidth, cache hit rate

**Vercel Analytics:**
- Available in Vercel dashboard
- Tracks Core Web Vitals, page views

### Error Tracking (Optional)

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay

### Update Procedure

1. Make changes in `main` branch
2. Push to GitHub
3. Automatic deployment triggered
4. Verify deployment in production
5. If issues, rollback using procedure above

---

## Troubleshooting

### Build Fails

**Error: `npm install` fails**
- Check Node version (must be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

**Error: TypeScript errors**
- Run `npm run typecheck` locally
- Fix errors before pushing

**Error: Build timeout**
- Check build logs for specific error
- Verify all dependencies in `package.json`

### Deployment Fails

**WebGL not working:**
- Verify browser supports WebGL 2.0
- Check Content Security Policy headers

**Charts not rendering:**
- Check browser console for errors
- Verify Recharts bundle included in build

### Performance Issues

**Slow page load:**
- Enable compression (automatic on CF Pages/Vercel)
- Check bundle size: should be ~1.48 MB (424 KB gzipped)

**3D rendering slow:**
- Reduce panel count in simulator
- Check GPU acceleration enabled in browser

---

## Security Considerations

- All assets served over HTTPS (automatic)
- No sensitive data in client-side code
- No API keys or secrets required
- CORS headers configured automatically

---

## Backup & Recovery

**Git is Source of Truth:**
- All code in GitHub repository
- Deployment history in Cloudflare/Vercel

**Data Backup:**
- Original CSV files in `data/measurements/`
- Committed to Git (immutable)

**Recovery:**
- Redeploy from GitHub `main` branch
- Or rollback to specific commit

---

## Support Contacts

**Platform Support:**
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Vercel: https://vercel.com/docs

**Project Maintainer:**
- Chris Lyons (CBC Acoustics Project)

---

**Last Updated:** 2025-11-07
**Version:** 1.0
