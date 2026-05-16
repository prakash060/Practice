# Custom domain checklist — svifoods.com

Print or tick off as you complete each step. All AWS console work; DNS at your **registrar** (external, not Route 53).

**Target:** `https://www.svifoods.com` → same app as `https://d1a7288bn24qfa.cloudfront.net`

---

## Step 1 — ACM (us-east-1)

- [ ] Open **Certificate Manager** in **US East (N. Virginia)**
- [ ] Request **public** certificate for `svifoods.com` and `www.svifoods.com`
- [ ] Choose **DNS validation**
- [ ] Add ACM’s validation **CNAME** records at your registrar
- [ ] Certificate status = **Issued**

## Step 2 — CloudFront

- [ ] Open distribution for `d1a7288bn24qfa.cloudfront.net`
- [ ] Add alternate names: `www.svifoods.com` (and `svifoods.com` if using apex on CloudFront)
- [ ] Attach the **us-east-1** ACM certificate
- [ ] Wait until distribution = **Deployed**

## Step 3 — Registrar DNS

- [ ] **CNAME** `www` → `d1a7288bn24qfa.cloudfront.net`
- [ ] **Redirect** `svifoods.com` → `https://www.svifoods.com` (or apex ALIAS if using Route 53 / Cloudflare)

## Step 4 — Verify

- [ ] `https://www.svifoods.com` loads (valid HTTPS)
- [ ] `https://www.svifoods.com/login` reload works
- [ ] Login/API calls still go to API CloudFront (`d3cvs28uau3ofy.cloudfront.net/api`) unless you changed `VITE_API_URL`

Full details: [DEPLOYMENT-PRODUCTION.md](DEPLOYMENT-PRODUCTION.md#custom-domain--wwwsvifoodscom-instead-of-cloudfrontnet)
