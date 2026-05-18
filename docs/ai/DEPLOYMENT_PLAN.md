# Deployment Plan — weekly-meal-planner

_Last updated: 2026-05-18_

## Infrastructure

| Layer | Provider | Config |
|-------|----------|--------|
| Static hosting | Vercel | `vercel.json` |
| Serverless functions | Vercel (Node.js) | `api/*.js` |
| Database + Auth | Supabase | ENV vars |
| Payments | Stripe | ENV vars |
| AI | OpenAI | ENV vars |
| DNS | Custom (CNAME) | `CNAME` file |
| Source control | GitHub | BucosAlexandru/weekly-meal-planner |

## vercel.json (current)

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1.js" },
    { "source": "/(.*)", "destination": "/public/$1" }
  ],
  "builds": [
    { "src": "public/**/*", "use": "@vercel/static" },
    { "src": "api/**/*.js", "use": "@vercel/node" }
  ]
}
```

## Required Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables.
**Never commit to git.**

| Variable | Environment | Description |
|----------|-------------|-------------|
| SUPABASE_URL | All | Supabase project URL |
| SUPABASE_ANON_KEY | All | Public anon key (safe for client) |
| SUPABASE_SERVICE_ROLE_KEY | Production only | Admin key — never expose to client |
| STRIPE_SECRET_KEY | All | `sk_test_...` for preview, `sk_live_...` for prod |
| STRIPE_WEBHOOK_SECRET | All | From Stripe Dashboard → Webhooks |
| STRIPE_PRICE_ID | All | Premium plan price ID |
| OPENAI_API_KEY | All | OpenAI API key |

## Build Process

```bash
# Full build (JS + CSS + content generation)
npm run build

# Content only (after recipe changes)
npm run content

# JS only
npm run build:js

# CSS only
npm run build:css
```

### What `npm run build` produces
1. `public/js/app.min.js` — minified app bundle
2. `public/js/checkout.min.js` — minified checkout
3. `public/js/portal.min.js` — minified portal
4. `public/css/style.min.css` — minified CSS
5. 2562 HTML pages across 14 language folders
6. `sitemap.xml` with 2605 URLs

## Deploy Workflow (current — manual)

```bash
# 1. Make changes
# 2. Verify build
npm run build
# 3. Check page count
# 4. Check curly quotes
python3 -c "c=open('public/js/recipes.js').read(); print(c.count('‘'), c.count('’'))"
# 5. Commit
git add .
git commit -m "descriptive message"
# 6. Push to main
git push origin main
# 7. Vercel auto-deploys from main
```

## Proposed GitHub Actions

### `.github/workflows/build-check.yml`
```yaml
name: Build Check
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Verify page count
        run: |
          COUNT=$(find public -name "*.html" | wc -l)
          echo "HTML pages: $COUNT"
          if [ "$COUNT" -lt 2560 ]; then
            echo "ERROR: Expected ~2562 pages, got $COUNT"
            exit 1
          fi
      - name: Check for curly quotes
        run: |
          python3 -c "
          c = open('public/js/recipes.js').read()
          lsq = c.count('‘')
          rsq = c.count('’')
          if lsq + rsq > 0:
            print(f'ERROR: {lsq + rsq} curly quotes found in recipes.js')
            exit(1)
          print('OK: No curly quotes')
          "
```

### `.github/workflows/link-check.yml`
```yaml
name: Link Check
on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday 8am
  workflow_dispatch:
jobs:
  links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check internal links
        run: |
          # Check all internal href links resolve to existing files
          echo "Link check placeholder — implement with lychee or custom script"
```

## Vercel Deployment Settings

- **Framework:** Other (static + serverless)
- **Build command:** (none — files are pre-built and committed)
- **Output directory:** `public`
- **Install command:** `npm ci`
- **Node.js version:** 20.x

## Rollback Procedure

If a deployment breaks the site:
```bash
# Find last good commit
git log --oneline -10

# Revert to it
git revert HEAD

# Or hard reset (destructive — use only if necessary)
git reset --hard {good-commit-sha}
git push --force origin main
```

## Monitoring

- [ ] Set up Vercel deployment notifications (email/Slack)
- [ ] Add UptimeRobot or Better Uptime for `/en/` and `/en/recipes/`
- [ ] Monitor Stripe webhook delivery in Stripe Dashboard
- [ ] Check Supabase logs for auth errors weekly
