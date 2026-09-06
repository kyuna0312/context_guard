# Contributing

Small repo, strict rules. Read [CLAUDE.md](CLAUDE.md) first — it is the rulebook for humans too.

## Setup

```bash
git clone https://github.com/kyuna0312/context_forge.git && cd context_forge
claude --plugin-dir "$PWD"      # load in place; no install needed while developing
node --test                     # the whole suite, zero dependencies (node ≥ 18)
```

Needs `python3` (hook + status line), `node` ≥ 18 (tests only), and the `claude` CLI for `claude plugin validate . --strict`.

## Flow: branch → PR → main

`main` is protected: no direct pushes, every change lands through a pull request with CI green on Ubuntu **and** macOS (bash 3.2, BSD coreutils — the primary user platform).

```bash
git checkout -b my-change
# …edit…
node --test && claude plugin validate . --strict
git commit                      # message: what + why, present tense
gh pr create --fill
```

Squash or merge, your call; keep history linear.

## Adding a skill

1. `skills/<bucket>/<name>/SKILL.md` — `name:` equals the directory name; `description:` ≤ 30 words with triggers **and** an anti-trigger ("Not for…").
2. Register it in three places or the tests fail: `plugin.json` `skills`, the bucket `README.md`, the top-level README table.
3. Harness-neutral prose: "the agent instruction file (`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`)". Claude-Code-only? Start the description with `Claude Code only`.
4. Writes user config? Add `disable-model-invocation: true` and drop the trigger list — it must never fire on a phrase match.
5. Big reference material goes in `references/` (loads on demand), never in the body.

## Rules that CI enforces

- Every JSON parses; every `.sh` passes `bash -n` and shellcheck.
- `hooks.json` uses only real events and `$CLAUDE_PLUGIN_ROOT` paths that exist.
- `CLAUDE.md` stays under 600 words — the hook's own warning threshold.
- Session-start hook prints nothing to stdout unless a file is over threshold.
- Status line colour thresholds (50/75/90 %, 390/780/1300 tokens) match the README.

## Rules that CI can't enforce

- Only documented `settings.json` keys. Verify against the official docs before writing one down.
- Token numbers are estimates (words × 1.3). Say so; never present them as measured.
- Every command written into docs must exist and pass. No `npm test`, no `pytest`.
- A deliberate corner-cut gets a `ponytail:` comment naming the ceiling and the upgrade path.

## Releasing

Bump `version` in both `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, add a `CHANGELOG.md` entry, tag `vX.Y.Z`. Installed users only see an update when the version changes.

The GitHub wiki is generated from the README: `bash scripts/sync-wiki.sh`. Edit the README, never the wiki.
