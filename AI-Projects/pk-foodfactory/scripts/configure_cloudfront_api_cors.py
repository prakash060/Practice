#!/usr/bin/env python3
"""
Configure the API CloudFront distribution for browser CORS (Free pricing plan compatible).

CloudFront Free distributions cannot use custom response headers policies. CORS is
handled by the Node/Express API; this script only:

- Removes SPA-style custom error pages (403/404 -> index.html) on the API distro.
- Forwards Origin / preflight / auth headers to Elastic Beanstalk (legacy ForwardedValues).
- Sets TTL 0 so CloudFront does not serve stale responses missing CORS headers.
- Ensures OPTIONS is allowed.

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

# Forwarded to origin so Express can reflect Access-Control-Allow-Origin correctly.
FORWARD_HEADERS = [
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Authorization",
    "X-Auth-Token",
    "Content-Type",
]


def run_aws(args: list[str], *, allow_empty: bool = False) -> dict:
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
        if allow_empty:
            return {}
        return {}
    return json.loads(proc.stdout)


def strip_spa_error_pages(custom_errors: dict | None) -> tuple[dict, bool]:
    if not custom_errors or not custom_errors.get("Items"):
        return {"Quantity": 0}, False

    kept = [
        item
        for item in custom_errors["Items"]
        if int(item["ErrorCode"]) not in SPA_ERROR_CODES
        or item.get("ResponsePagePath") != "/index.html"
    ]
    changed = len(kept) != len(custom_errors["Items"])
    return {"Quantity": len(kept), "Items": kept}, changed


def legacy_forwarded_values() -> dict:
    return {
        "QueryString": True,
        "Cookies": {"Forward": "none"},
        "Headers": {
            "Quantity": len(FORWARD_HEADERS),
            "Items": FORWARD_HEADERS,
        },
    }


def apply_free_tier_cache_behavior(behavior: dict) -> bool:
    """Use legacy cache settings (compatible with CloudFront Free). Returns True if changed."""
    changed = False

    for key in (
        "CachePolicyId",
        "OriginRequestPolicyId",
        "ResponseHeadersPolicyId",
        "RealtimeLogConfigArn",
    ):
        if behavior.pop(key, None):
            changed = True

    wanted_forwarded = legacy_forwarded_values()
    if behavior.get("ForwardedValues") != wanted_forwarded:
        behavior["ForwardedValues"] = wanted_forwarded
        changed = True

    for ttl_key, ttl_value in (("MinTTL", 0), ("DefaultTTL", 0), ("MaxTTL", 0)):
        if behavior.get(ttl_key) != ttl_value:
            behavior[ttl_key] = ttl_value
            changed = True

    if not behavior.get("Compress", False):
        behavior["Compress"] = True
        changed = True

    allowed_methods = behavior.get("AllowedMethods", {})
    methods = set(allowed_methods.get("Items") or [])
    needed = {"GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
    if not needed.issubset(methods):
        behavior["AllowedMethods"] = {
            "Quantity": len(needed),
            "Items": sorted(needed),
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"],
            },
        }
        changed = True

    return changed


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Configure API CloudFront for CORS (Free plan compatible)"
    )
    parser.add_argument(
        "--distribution-id",
        default=os.environ.get("API_CF_DIST_ID")
        or os.environ.get("AWS_API_CLOUDFRONT_DISTRIBUTION_ID"),
        help="API CloudFront distribution ID (E...)",
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
            f"error: distribution ID should start with E (got {dist_id!r})",
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
    if apply_free_tier_cache_behavior(behavior):
        changed = True

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
        "CORS response headers are set by the Express API on Elastic Beanstalk, not at the CloudFront edge."
    )


if __name__ == "__main__":
    main()
