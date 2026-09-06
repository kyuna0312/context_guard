#!/usr/bin/env bash
# Regenerate the GitHub wiki from README.md + CONTRIBUTING.md and push it.
# The wiki is a build output, not a second source: edit the README instead.
# Usage: bash scripts/sync-wiki.sh            (needs push access to the repo)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
WIKI_URL="https://github.com/kyuna0312/context_forge.wiki.git"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone -q "$WIKI_URL" "$WORK/wiki" 2>/dev/null || {
  echo "Cannot clone $WIKI_URL — create the first wiki page on GitHub once, then re-run." >&2
  exit 1
}
find "$WORK/wiki" -maxdepth 1 -name '*.md' -delete

python3 - "$REPO" "$WORK/wiki" <<'PY'
import re, sys, pathlib
repo, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
note = "> Generated from the repo's README by `scripts/sync-wiki.sh`. Edit the README, not this page.\n\n"
readme = (repo / "README.md").read_text()
intro, *sections = re.split(r"\n(?=## )", readme)
pages = []
for sec in sections:
    title, body = sec.split("\n", 1)
    title = title[3:].strip()
    slug = re.sub(r"[^A-Za-z0-9]+", "-", title).strip("-")
    body = body.replace("](skills/", "](https://github.com/kyuna0312/context_forge/blob/main/skills/")
    body = body.replace("](CONTEXT.md)", "](https://github.com/kyuna0312/context_forge/blob/main/CONTEXT.md)")
    (out / f"{slug}.md").write_text(note + f"# {title}\n{body}".rstrip() + "\n")
    pages.append((title, slug))
contrib = (repo / "CONTRIBUTING.md").read_text()
(out / "Contributing.md").write_text(note + contrib)
pages.append(("Contributing", "Contributing"))
home = intro.replace("# context_forge\n", "").strip()
(out / "Home.md").write_text(note + "# context_forge\n\n" + home + "\n\n## Pages\n" + "".join(f"- [[{t}|{s}]]\n" for t, s in pages))
(out / "_Sidebar.md").write_text("**context_forge**\n\n" + "".join(f"- [[{t}|{s}]]\n" for t, s in pages))
print(f"{len(pages) + 1} pages written")
PY

cd "$WORK/wiki"
git add -A
if git diff --cached --quiet; then echo "wiki already up to date"; exit 0; fi
git -c user.name="sync-wiki" -c user.email="sync-wiki@users.noreply.github.com" commit -q -m "sync from README $(git -C "$REPO" rev-parse --short HEAD)"
git push -q origin HEAD
echo "wiki pushed"
