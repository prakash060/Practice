#!/usr/bin/env python3
"""
Configure API CloudFront to forward Authorization (and all viewer headers) to origin.

Without this, JWT Bearer tokens never reach Elastic Beanstalk and every API call returns 401.

Uses AWS managed policies:
  - Cache policy: CachingDisabled
  - Origin request policy: AllViewer

Usage:
  export AWS_API_CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
  python scripts/configure_cloudfront_api_auth.py
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

# AWS managed policy IDs (global, stable)
CACHE_POLICY_CACHING_DISABLED = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
ORIGIN_REQUEST_POLICY_ALL_VIEWER = "216adef6-5c7f-47e4-b989-5492eafa07d3"

LEGACY_FORWARDED_KEYS = (
    "ForwardedValues",
    "MinTTL",
    "MaxTTL",
    "DefaultTTL",
    "TrustedSigners",
    "TrustedKeyGroups",
)


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
    return json.loads(proc.stdout)


def apply_auth_policies(behavior: dict) -> bool:
    changed = False
    if behavior.get("CachePolicyId") != CACHE_POLICY_CACHING_DISABLED:
        behavior["CachePolicyId"] = CACHE_POLICY_CACHING_DISABLED
        changed = True
    if behavior.get("OriginRequestPolicyId") != ORIGIN_REQUEST_POLICY_ALL_VIEWER:
        behavior["OriginRequestPolicyId"] = ORIGIN_REQUEST_POLICY_ALL_VIEWER
        changed = True
    for key in LEGACY_FORWARDED_KEYS:
        if key in behavior:
            del behavior[key]
            changed = True
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Forward Authorization header on API CloudFront distribution"
    )
    parser.add_argument(
        "--distribution-id",
        default=os.environ.get("AWS_API_CLOUDFRONT_DISTRIBUTION_ID")
        or os.environ.get("CF_API_DIST_ID"),
        help="API CloudFront distribution ID (E...)",
    )
    args = parser.parse_args()
    dist_id = (args.distribution_id or "").strip()
    if not dist_id:
        print(
            "error: set AWS_API_CLOUDFRONT_DISTRIBUTION_ID or pass --distribution-id",
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

    changed = apply_auth_policies(config["DefaultCacheBehavior"])
    for behavior in config.get("CacheBehaviors", {}).get("Items", []) or []:
        if apply_auth_policies(behavior):
            changed = True

    if not changed:
        print(
            f"CloudFront {dist_id}: already forwards viewer headers (AllViewer) with caching disabled."
        )
        return

    config_path = Path(os.environ.get("TMPDIR", os.environ.get("TEMP", "/tmp"))) / "cf-api-auth-config.json"
    config_path.write_text(json.dumps(config), encoding="utf-8")

    print(
        f"Updating CloudFront {dist_id} to forward Authorization (OriginRequestPolicy: AllViewer)..."
    )
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
            config_path.as_uri(),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr or proc.stdout, file=sys.stderr)
        sys.exit(proc.returncode)
    print("Update submitted. Wait until status is Deployed, then invalidate /* and log in again.")


if __name__ == "__main__":
    main()
