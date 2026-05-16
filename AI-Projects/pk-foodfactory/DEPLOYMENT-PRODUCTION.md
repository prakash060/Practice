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

## Custom domain — `www.svifoods.com` (instead of cloudfront.net)

CloudFront always provides a default hostname (`d1a7288bn24qfa.cloudfront.net`). Your browser shows that URL until you attach a **custom domain** and point **DNS** at the distribution. No React code changes are required.

**Current frontend CloudFront hostname:** `d1a7288bn24qfa.cloudfront.net`

| URL after setup | Role |
|-----------------|------|
| `https://www.svifoods.com` | Primary site (recommended) |
| `https://svifoods.com` | Apex — redirect to `www` at your registrar (easiest with external DNS) |
| `https://d1a7288bn24qfa.cloudfront.net` | Still works (AWS default) |

DNS is managed at your **domain registrar** (not Route 53). Follow the checklist below in order.

### Checklist

- [ ] **Step 1 — ACM certificate (us-east-1 only)**
- [ ] **Step 2 — CloudFront alternate domain names**
- [ ] **Step 3 — Registrar DNS (`www` CNAME + apex redirect)**
- [ ] **Step 4 — Verify HTTPS and SPA reload**

---

### Step 1 — ACM certificate (must be `us-east-1`)

CloudFront only uses certificates from **ACM in N. Virginia (`us-east-1`)**, even if the app runs in `ap-south-1`.

1. AWS Console → **Certificate Manager** → region **US East (N. Virginia)**.
2. **Request certificate** → **Public**.
3. Add domain names:
   - `svifoods.com`
   - `www.svifoods.com`
4. Validation method: **DNS validation**.
5. Copy the **CNAME** records ACM shows and add them in your **registrar’s DNS** panel for `svifoods.com`.
6. Wait until certificate status is **Issued**.

---

### Step 2 — Attach domain to frontend CloudFront

Distribution: the one whose domain is `d1a7288bn24qfa.cloudfront.net` (Distribution ID starts with `E` — same value as `AWS_CLOUDFRONT_DISTRIBUTION_ID`).

1. **CloudFront** → **Distributions** → select that distribution → **Edit**.
2. **Alternate domain name (CNAME)** — add:
   - `www.svifoods.com`
   - `svifoods.com` (optional until apex DNS/redirect is ready; you can add only `www` first)
3. **Custom SSL certificate** — select the ACM certificate from Step 1.
4. Save and wait until status is **Deployed**.

SPA error pages (403/404 → `/index.html`) stay on this distribution; no extra change for custom domain.

---

### Step 3 — DNS at your registrar

In your registrar’s DNS settings for `svifoods.com`:

#### `www` (required)

| Type | Host / Name | Value | TTL |
|------|-------------|-------|-----|
| **CNAME** | `www` | `d1a7288bn24qfa.cloudfront.net` | 300–3600 |

#### Apex `svifoods.com` (choose one)

Many registrars cannot CNAME the bare `@` record to CloudFront.

**Option A (recommended):** Registrar **URL forwarding / redirect**

- `http://svifoods.com` and `https://svifoods.com` → `https://www.svifoods.com`

**Option B:** Move DNS to Route 53 (change nameservers only) and use an **ALIAS A** record for `@` to the CloudFront distribution.

**Option C:** DNS provider with apex **ANAME/ALIAS** (e.g. Cloudflare) → `d1a7288bn24qfa.cloudfront.net`.

Propagation: usually minutes to 1 hour; up to 48 hours.

---

### Step 4 — Verify custom domain

- [ ] `nslookup www.svifoods.com` resolves (CloudFront edge IPs or CNAME to `*.cloudfront.net`)
- [ ] `https://www.svifoods.com` loads with a valid padlock
- [ ] `https://www.svifoods.com/login` — open and **reload** (login page, not XML)
- [ ] `https://d1a7288bn24qfa.cloudfront.net/login` still works (optional)

---

### Optional — branded API (`api.svifoods.com`)

The site can use `www.svifoods.com` while the API keeps using `https://d3cvs28uau3ofy.cloudfront.net/api` (current `VITE_API_URL`). No change required for launch.

To brand the API later:

1. ACM cert + alternate name on the **API** CloudFront distribution for `api.svifoods.com`.
2. Registrar CNAME: `api` → `d3cvs28uau3ofy.cloudfront.net`.
3. Update GitHub secret `VITE_API_URL` to `https://api.svifoods.com/api` and redeploy the frontend.

---

### Custom domain — common mistakes

| Mistake | Result |
|---------|--------|
| ACM cert only in `ap-south-1` | CloudFront cannot select it — use **us-east-1** |
| CNAME `www` points to S3 bucket URL | Wrong origin / broken site |
| ACM validation CNAMEs not added at registrar | Certificate stays **Pending validation** |
| `www` in DNS but not in CloudFront alternate names | TLS or access errors |

---

## Set secret via GitHub CLI (optional)

```bash
gh secret set VITE_API_URL --repo prakash060/Practice --body "https://d3cvs28uau3ofy.cloudfront.net/api"
```
