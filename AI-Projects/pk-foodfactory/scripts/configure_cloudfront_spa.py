#!/usr/bin/env python3
"""
Ensure CloudFront serves index.html for SPA deep links (e.g. /login on reload).

Sets custom error responses: 403 and 404 -> /index.html with HTTP 200.
Requires: AWS CLI, CF_DIST_ID env (or --distribution-id).

Usage:
  export CF_DIST_ID=E1234567890ABC
  python scripts/configure_cloudfront_spa.py

Or from repo root in CI (after configure-aws-credentials).
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

SPA_ERROR_RESPONSES = {
    403: {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0,
    },
    404: {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0,
    },
}


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


def merge_custom_errors(existing: dict | None) -> dict:
    items_by_code: dict[int, dict] = {}
    if existing and existing.get("Items"):
        for item in existing["Items"]:
            items_by_code[int(item["ErrorCode"])] = item

    for code, spec in SPA_ERROR_RESPONSES.items():
        items_by_code[code] = spec

    items = sorted(items_by_code.values(), key=lambda x: x["ErrorCode"])
    return {"Quantity": len(items), "Items": items}


def needs_update(existing: dict | None) -> bool:
    if not existing or not existing.get("Items"):
        return True
    by_code = {int(i["ErrorCode"]): i for i in existing["Items"]}
    for code, want in SPA_ERROR_RESPONSES.items():
        have = by_code.get(code)
        if not have:
            return True
        if (
            have.get("ResponsePagePath") != want["ResponsePagePath"]
            or str(have.get("ResponseCode")) != want["ResponseCode"]
        ):
            return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Configure CloudFront SPA error pages")
    parser.add_argument(
        "--distribution-id",
        default=os.environ.get("CF_DIST_ID") or os.environ.get("AWS_CLOUDFRONT_DISTRIBUTION_ID"),
        help="CloudFront distribution ID (E...)",
    )
    args = parser.parse_args()
    dist_id = (args.distribution_id or "").strip()
    if not dist_id:
        print("error: set CF_DIST_ID or pass --distribution-id", file=sys.stderr)
        sys.exit(1)
    if not dist_id.upper().startswith("E"):
        print(
            f"error: distribution ID should start with E (got {dist_id!r}). "
            "Use the ID from CloudFront console, not the *.cloudfront.net prefix.",
            file=sys.stderr,
        )
        sys.exit(1)

    data = run_aws(["get-distribution-config", "--id", dist_id])
    etag = data["ETag"]
    config = data["DistributionConfig"]
    current = config.get("CustomErrorResponses")

    if not needs_update(current):
        print(f"CloudFront {dist_id}: SPA error responses (403/404 -> /index.html) already configured.")
        return

    config["CustomErrorResponses"] = merge_custom_errors(current)
    config_path = Path(os.environ.get("TMPDIR", os.environ.get("TEMP", "/tmp"))) / "cf-dist-config.json"
    config_path.write_text(json.dumps(config), encoding="utf-8")
    config_file = config_path.as_uri()

    print(f"Updating CloudFront {dist_id} custom error responses (403/404 -> /index.html, HTTP 200)...")
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
            config_file,
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr or proc.stdout, file=sys.stderr)
        sys.exit(proc.returncode)
    print("Update submitted. Wait until distribution status is Deployed (few minutes), then invalidate cache.")


if __name__ == "__main__":
    main()
