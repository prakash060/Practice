#!/usr/bin/env python3
"""
Configure the API CloudFront distribution for browser CORS and auth headers.

- Adds a response headers policy with CORS (including error responses at the edge).
- Removes SPA-style custom error pages (403/404 -> index.html) if present on the API distro.
- Uses CachingDisabled so stale responses without CORS are not served.
- Forwards viewer Authorization / X-Auth-Token to Elastic Beanstalk.

Requires: AWS CLI credentials with cloudfront:* on the API distribution.

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

POLICY_NAME = "svifoods-api-cors"
MANAGED_CACHE_DISABLED = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
MANAGED_ORIGIN_ALL_VIEWER = "216adef6-5c7f-47e4-b989-5492eafa07d3"

DEFAULT_ALLOWED_ORIGINS = [
    "https://d1a7288bn24qfa.cloudfront.net",
    "https://www.svifoods.com",
    "https://svifoods.com",
    "http://localhost:5173",
    "http://localhost:3000",
]

SPA_ERROR_CODES = {403, 404}


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


def parse_allowed_origins() -> list[str]:
    extra = (os.environ.get("CORS_ORIGINS") or "").split(",")
    extra = [value.strip() for value in extra if value.strip()]
    return list(dict.fromkeys([*DEFAULT_ALLOWED_ORIGINS, *extra]))


def find_response_headers_policy_id(name: str) -> str | None:
    marker = None
    while True:
        args = ["list-response-headers-policies", "--type", "custom"]
        if marker:
            args.extend(["--marker", marker])
        data = run_aws(args)
        listed = data.get("ResponseHeadersPolicyList", {})
        for item in listed.get("Items", []) or []:
            policy = item.get("ResponseHeadersPolicy", {})
            if policy.get("ResponseHeadersPolicyConfig", {}).get("Name") == name:
                return policy["Id"]
        marker = listed.get("NextMarker")
        if not marker:
            break
    return None


def build_cors_policy_config(origins: list[str]) -> dict:
    return {
        "Name": POLICY_NAME,
        "Comment": "CORS for SVI Foods API (frontend CloudFront + custom domain)",
        "CorsConfig": {
            "AccessControlAllowOrigins": {
                "Quantity": len(origins),
                "Items": origins,
            },
            "AccessControlAllowHeaders": {
                "Quantity": 1,
                "Items": ["*"],
            },
            "AccessControlAllowMethods": {
                "Quantity": 7,
                "Items": ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            },
            "AccessControlAllowCredentials": False,
            "AccessControlExposeHeaders": {
                "Quantity": 4,
                "Items": [
                    "RateLimit-Limit",
                    "RateLimit-Remaining",
                    "RateLimit-Reset",
                    "RateLimit-Policy",
                ],
            },
            "AccessControlMaxAgeSec": 86400,
            "OriginOverride": True,
        },
    }


def ensure_response_headers_policy(origins: list[str]) -> str:
    existing_id = find_response_headers_policy_id(POLICY_NAME)
    config = build_cors_policy_config(origins)

    if existing_id:
        data = run_aws(
            ["get-response-headers-policy", "--id", existing_id]
        )
        etag = data["ETag"]
        body = data["ResponseHeadersPolicy"]["ResponseHeadersPolicyConfig"]
        body["CorsConfig"] = config["CorsConfig"]
        body["Comment"] = config["Comment"]
        run_aws(
            [
                "update-response-headers-policy",
                "--id",
                existing_id,
                "--if-match",
                etag,
                "--response-headers-policy-config",
                json.dumps(body),
            ]
        )
        print(f"Updated response headers policy {existing_id} ({POLICY_NAME}).")
        return existing_id

    created = run_aws(
        [
            "create-response-headers-policy",
            "--response-headers-policy-config",
            json.dumps(config),
        ]
    )
    policy_id = created["ResponseHeadersPolicy"]["Id"]
    print(f"Created response headers policy {policy_id} ({POLICY_NAME}).")
    return policy_id


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


def main() -> None:
    parser = argparse.ArgumentParser(description="Configure API CloudFront CORS")
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

    origins = parse_allowed_origins()
    policy_id = ensure_response_headers_policy(origins)

    data = run_aws(["get-distribution-config", "--id", dist_id])
    etag = data["ETag"]
    config = data["DistributionConfig"]

    custom_errors, stripped = strip_spa_error_pages(config.get("CustomErrorResponses"))
    if stripped:
        config["CustomErrorResponses"] = custom_errors
        print(
            f"Removed SPA error responses (403/404 -> /index.html) from API distribution {dist_id}."
        )

    behavior = config["DefaultCacheBehavior"]
    changed = stripped
    if behavior.get("ResponseHeadersPolicyId") != policy_id:
        behavior["ResponseHeadersPolicyId"] = policy_id
        changed = True
    if behavior.get("CachePolicyId") != MANAGED_CACHE_DISABLED:
        behavior["CachePolicyId"] = MANAGED_CACHE_DISABLED
        behavior.pop("ForwardedValues", None)
        behavior.pop("MinTTL", None)
        behavior.pop("MaxTTL", None)
        behavior.pop("DefaultTTL", None)
        changed = True
    if behavior.get("OriginRequestPolicyId") != MANAGED_ORIGIN_ALL_VIEWER:
        behavior["OriginRequestPolicyId"] = MANAGED_ORIGIN_ALL_VIEWER
        behavior.pop("ForwardedValues", None)
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

    if not changed:
        print(f"CloudFront API distribution {dist_id}: CORS policy already applied.")
    else:
        config_path = Path(os.environ.get("TMPDIR", os.environ.get("TEMP", "/tmp")))
        config_file = config_path / "cf-api-dist-config.json"
        config_file.write_text(json.dumps(config), encoding="utf-8")
        print(f"Updating API CloudFront distribution {dist_id}...")
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
        print("Update submitted. Wait until status is Deployed.")

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


if __name__ == "__main__":
    main()
