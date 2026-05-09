# GitHub Actions location

This repository’s **Git root is the parent folder** (`Practice/`), not `AI-Projects/`.

GitHub only loads workflows from:

`<repo-root>/.github/workflows/`

So the real workflow files live at:

`Practice/.github/workflows/`

Edits to YAML under `AI-Projects/.github/workflows/` are **not** picked up by GitHub Actions.
