# Production deployment — API URL (mixed content fix)

The frontend is served over **HTTPS** (CloudFront). The API base URL is baked into the bundle at build time via `VITE_API_URL`.

## Required GitHub secret

Repository: `prakash060/Practice` → **Settings** → **Secrets and variables** → **Actions**

| Secret | Value |
|--------|--------|
| `VITE_API_URL` | `https://d3cvs28uau3ofy.cloudfront.net/api` |

**Do not** use the Elastic Beanstalk `http://...elasticbeanstalk.com/api` URL. Browsers block HTTP API calls from HTTPS pages (mixed content).

Also ensure these secrets exist for the frontend workflow:

- `AWS_CLOUDFRONT_DISTRIBUTION_ID` — frontend distribution (e.g. `d1a7288bn24qfa` or the distribution ID from AWS console)

## Redeploy after updating the secret

1. Update `VITE_API_URL` in GitHub Actions secrets.
2. Run **Actions** → **Frontend CI/CD** → **Run workflow**, or push a commit under `AI-Projects/pk-foodfactory/`.
3. The workflow builds with HTTPS API URL, syncs to S3, and invalidates CloudFront (`/*`).

## Verify

1. Open `https://d1a7288bn24qfa.cloudfront.net/login` (hard refresh or incognito).
2. DevTools → Network → **Fetch/XHR**.
3. Requests should target `https://d3cvs28uau3ofy.cloudfront.net/api/...`, not `http://...elasticbeanstalk.com`.

## Set secret via GitHub CLI (optional)

```bash
gh secret set VITE_API_URL --repo prakash060/Practice --body "https://d3cvs28uau3ofy.cloudfront.net/api"
```
