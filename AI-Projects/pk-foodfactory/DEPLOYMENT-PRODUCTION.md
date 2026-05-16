# Production deployment — API URL (mixed content fix)

The frontend is served over **HTTPS** (CloudFront). The API base URL is baked into the bundle at build time via `VITE_API_URL`.

## Required GitHub secret

Repository: `prakash060/Practice` → **Settings** → **Secrets and variables** → **Actions**

| Secret | Value |
|--------|--------|
| `VITE_API_URL` | `https://d3cvs28uau3ofy.cloudfront.net/api` |

**Do not** use the Elastic Beanstalk `http://...elasticbeanstalk.com/api` URL. Browsers block HTTP API calls from HTTPS pages (mixed content).

Also ensure these secrets exist for the frontend workflow:

| Secret | Value |
|--------|--------|
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | Distribution ID from **AWS Console → CloudFront → Distributions → General** (starts with `E`, e.g. `E2ABCDEFGHIJK`). **Not** the `d1a7288bn24qfa` URL prefix. |

If `AWS_CLOUDFRONT_DISTRIBUTION_ID` is missing, the workflow still deploys to S3 but skips invalidation (warning only). After adding the secret, re-run the workflow or invalidate manually in the CloudFront console.

## Redeploy after updating the secret

1. Update `VITE_API_URL` in GitHub Actions secrets.
2. Run **Actions** → **Frontend CI/CD** → **Run workflow**, or push a commit under `AI-Projects/pk-foodfactory/`.
3. The workflow builds with HTTPS API URL, syncs to S3, and invalidates CloudFront (`/*`).

## Verify

1. Open `https://d1a7288bn24qfa.cloudfront.net/login` (hard refresh or incognito).
2. DevTools → Network → **Fetch/XHR**.
3. Requests should target `https://d3cvs28uau3ofy.cloudfront.net/api/...`, not `http://...elasticbeanstalk.com`.

## SPA routing — reload on `/login` (Access Denied fix)

React Router paths like `/login` are **not** files in S3. A **reload** asks CloudFront for object key `login`, which returns **403 Access Denied** XML unless CloudFront is configured to serve `index.html` for missing routes.

**S3 `ErrorDocument` does not fix this** when the site is served via CloudFront + S3 REST origin (only the S3 website endpoint uses it).

### Option A — automatic (recommended)

Ensure `AWS_CLOUDFRONT_DISTRIBUTION_ID` is set in GitHub Actions secrets. Each frontend deploy runs [`scripts/configure_cloudfront_spa.py`](scripts/configure_cloudfront_spa.py), which sets:

| HTTP error | Response path | HTTP response |
|------------|---------------|---------------|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

Wait until the distribution status is **Deployed**, then invalidate cache (workflow does `/*` when the secret is set).

### Option B — AWS Console (one-time)

CloudFront → your **frontend** distribution (`d1a7288bn24qfa.cloudfront.net`) → **Edit** → **Error pages** → create two custom error responses as in the table above → save → invalidate `/*`.

### Option C — run script locally

```bash
export CF_DIST_ID=E1234567890ABC   # from CloudFront console, not d1a7288bn24qfa
aws configure   # credentials with cloudfront:UpdateDistribution
python AI-Projects/pk-foodfactory/scripts/configure_cloudfront_spa.py
aws cloudfront create-invalidation --distribution-id "$CF_DIST_ID" --paths "/*"
```

### Verify SPA reload

- `https://d1a7288bn24qfa.cloudfront.net/login` — open, then **reload** → login page (not XML)
- `https://d1a7288bn24qfa.cloudfront.net/checkout` — direct open + reload
- `https://d1a7288bn24qfa.cloudfront.net/` — home still loads

## Set secret via GitHub CLI (optional)

```bash
gh secret set VITE_API_URL --repo prakash060/Practice --body "https://d3cvs28uau3ofy.cloudfront.net/api"
```
