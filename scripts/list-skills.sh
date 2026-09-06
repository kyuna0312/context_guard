#!/usr/bin/env bash
# Print every skill as <bucket>/<name>, the paths plugin.json's `skills` array must list.
set -euo pipefail
cd "$(dirname "$0")/.."
find skills -name SKILL.md | sed 's|^skills/||;s|/SKILL.md$||' | sort
