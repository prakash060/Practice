#!/usr/bin/env python3
"""
Configure the API CloudFront distribution for browser CORS (Free pricing plan compatible).

CloudFront Free distributions allow managed cache + origin request policies, but NOT
custom response headers policies. CORS headers are produced by the Express API on
Elastic Beanstalk, and this script ensures CloudFront:

- Forwards viewer headers (Origin, Authorization, X-Auth-Token, etc.) to the origin
  using the managed "AllViewerExceptHostHeader" origin request policy.
- Disables caching (managed "CachingDisabled" policy) so CloudFront never serves a
  stale response that was missing the right Access-Control-Allow-Origin header.
- Removes any leftover custom response headers policy (Free plan rejects these).
- Removes SPA-style custom error pages (403/404 -> /index.html) on the API distro
  so error responses still go through the Express CORS middleware.
- Allows OPTIONS / GET / POST / PUT / PATCH / DELETE so preflights reach the origin.

Requires: AWS CLI credentials with cloudfront:UpdateDistribution on the API distribution.

Usage:
  export API_CF_DIST_ID=E1234567890ABC
  python scripts/configure_cloudfront_api_cors.py
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

SPA_ERROR_CODES = {403, 404}

# AWS-managed policy IDs (Free pricing plan compatible — only custom Response Headers Policies are blocked).
# Names below are the documented AWS managed-policy names.
MANAGED_CACHE_DISABLED = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"          # CachingDisabled
MANAGED_ORIGIN_REQ_ALL_VIEWER_NO_HOST = "b689b0a8-53d0-40ab-baf2-68738e2966ac"  # AllViewerExceptHostHeader

NEEDED_METHODS = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]


def run_aws(args: list[str]) -> dict:
    proc = subprocess.run(
        ["aws", "cloudfront", *args],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr or proc.stdout, file=sys.stderr)
        sys.exit(proc.returncode)
    if not proc.stdout.strip():
        return {}
    return json.loads(proc.stdout)


def strip_spa_error_pages(custom_errors: dict | None) -> tuple[dict, bool]:
    """Drop 403/404 -> /index.html on the API distribution (those break JSON API error responses)."""
    if not custom_errors or not custom_errors.get("Items"):
        return custom_errors or {"Quantity": 0}, False

    kept = [
        item
        for item in custom_errors["Items"]
        if int(item["ErrorCode"]) not in SPA_ERROR_CODES
        or item.get("ResponsePagePath") != "/index.html"
    ]
    if len(kept) == len(custom_errors["Items"]):
        return custom_errors, False
    return {"Quantity": len(kept), "Items": kept}, True


def use_managed_policies(behavior: dict) -> bool:
    """Switch the default cache behavior to managed policies (Free-plan compatible)."""
    changed = False

    # Managed cache + origin request policies are incompatible with legacy ForwardedValues
    # and explicit MinTTL/MaxTTL/DefaultTTL — they must be removed.
    for key in ("ForwardedValues", "MinTTL", "DefaultTTL", "MaxTTL"):
        if behavior.pop(key, None) is not None:
            changed = True

    if behavior.get("CachePolicyId") != MANAGED_CACHE_DISABLED:
        behavior["CachePolicyId"] = MANAGED_CACHE_DISABLED
        changed = True

    if behavior.get("OriginRequestPolicyId") != MANAGED_ORIGIN_REQ_ALL_VIEWER_NO_HOST:
        behavior["OriginRequestPolicyId"] = MANAGED_ORIGIN_REQ_ALL_VIEWER_NO_HOST
        changed = True

    # Free plan rejects custom Response Headers Policies. CORS headers come from Express.
    if behavior.pop("ResponseHeadersPolicyId", None) is not None:
        changed = True

    # Free plan also rejects custom Realtime log configs (just in case).
    if behavior.pop("RealtimeLogConfigArn", None) is not None:
        changed = True

    allowed_methods = behavior.get("AllowedMethods", {})
    current_methods = set(allowed_methods.get("Items") or [])
    if set(NEEDED_METHODS) != current_methods:
        behavior["AllowedMethods"] = {
            "Quantity": len(NEEDED_METHODS),
            "Items": NEEDED_METHODS,
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"],
            },
        }
        changed = True

    if not behavior.get("Compress", False):
        behavior["Compress"] = True
        changed = True

    return changed


def detach_custom_response_headers_policy(config: dict) -> bool:
    """Defensive: remove any leftover ResponseHeadersPolicyId on cached behaviors too."""
    changed = False
    cached_behaviors = config.get("CacheBehaviors", {}).get("Items") or []
    for cb in cached_behaviors:
        if cb.pop("ResponseHeadersPolicyId", None) is not None:
            changed = True
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Configure API CloudFront for CORS (Free pricing plan compatible)"
    )
    parser.add_argument(
        "--distribution-id",
        default=os.environ.get("API_CF_DIST_ID")
        or os.environ.get("AWS_API_CLOUDFRONT_DISTRIBUTION_ID"),
        help="API CloudFront distribution ID (starts with E)",
    )
    parser.add_argument(
        "--skip-invalidation",
        action="store_true",
        help="Do not create a cache invalidation after update",
    )
    args = parser.parse_args()

    dist_id = (args.distribution_id or "").strip()
    if not dist_id:
        print(
            "error: set API_CF_DIST_ID or AWS_API_CLOUDFRONT_DISTRIBUTION_ID",
            file=sys.stderr,
        )
        sys.exit(1)
    if not dist_id.upper().startswith("E"):
        print(
            f"error: distribution ID should start with E (got {dist_id!r}). "
            "Use the ID from CloudFront console, not the *.cloudfront.net hostname.",
            file=sys.stderr,
        )
        sys.exit(1)

    data = run_aws(["get-distribution-config", "--id", dist_id])
    etag = data["ETag"]
    config = data["DistributionConfig"]

    changed = False

    custom_errors, stripped = strip_spa_error_pages(config.get("CustomErrorResponses"))
    if stripped:
        config["CustomErrorResponses"] = custom_errors
        changed = True
        print(
            f"Will remove SPA error responses (403/404 -> /index.html) from API distribution {dist_id}."
        )

    behavior = config["DefaultCacheBehavior"]
    if use_managed_policies(behavior):
        changed = True

    if detach_custom_response_headers_policy(config):
        changed = True
        print(
            "Removed custom ResponseHeadersPolicyId from cached behaviors (Free plan blocks them)."
        )

    if not changed:
        print(
            f"CloudFront API distribution {dist_id}: already configured for origin CORS (Free plan)."
        )
    else:
        config_path = Path(os.environ.get("TMPDIR", os.environ.get("TEMP", "/tmp")))
        config_file = config_path / "cf-api-dist-config.json"
        config_file.write_text(json.dumps(config), encoding="utf-8")
        print(f"Updating API CloudFront distribution {dist_id} (Free plan / origin CORS)...")
        proc = subprocess.run(
            [
                "aws",
                "cloudfront",
                "update-distribution",
                "--id",
                dist_id,
                "--if-match",
                etag,
                "--distribution-config",
                f"file://{config_file.as_posix()}",
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            print(proc.stderr or proc.stdout, file=sys.stderr)
            sys.exit(proc.returncode)
        print("Update submitted. Wait until distribution status is Deployed.")

    if not args.skip_invalidation:
        run_aws(
            [
                "create-invalidation",
                "--distribution-id",
                dist_id,
                "--paths",
                "/*",
            ]
        )
        print(f"Invalidation created for {dist_id} (/*).")

    print(
        "CORS response headers are produced by the Express API (server.js) on Elastic Beanstalk, "
        "not at the CloudFront edge."
    )


if __name__ == "__main__":
    main()
