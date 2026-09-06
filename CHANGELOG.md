# context-forge

## 0.3.1

- `settings-diff` and `auto-compact` folded into `tune-settings`; `check-claudemd-size` folded into `estimate-tokens` (14 → 11 skills, references kept).
- Config-writing skills (`tune-settings`, `project-isolation`, `token-statusline`) are user-invoked (`disable-model-invocation: true`).
- CI runs on macOS too, plus shellcheck; behaviour tests for statusline colour thresholds and `validate-hooks.sh`.
- `wiki/` removed: README is the single source (flows, thresholds, smoke one-liners folded in) and now leads with the status line and hook. Deliberate corner-cuts are `ponytail:` comments in the scripts; ROADMAP points at them instead of duplicating.
- One documented install route (`claude plugin marketplace add` + `install`); `install.sh` no longer hides marketplace/install failures.


## 0.3.0

- **Breaking**: the forge half (Postgres-backed `forge-db` MCP server, `scaffold`/`changelog`/`sync-template`/`forge-changelog`, the `record-change` hook, `mcp/`) is removed. The plugin is token-saver only.
- **Breaking**: plugin renamed `context_forge` → `context-forge` (kebab-case, required by the Claude.ai marketplace sync). Skills are now `/context-forge:<skill>`. `install.sh` removes the old registration.
- **Runs on Codex and Gemini CLI**: portable skills use harness-neutral wording (`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`); the 7 Claude-Code-only skills say so in their description. README documents `npx skills add`.
- Session-start hook prints nothing to stdout unless a file is over threshold (stdout is injected into context); skill descriptions cut from ~1,000 to ~440 tokens per session; unverified savings percentages removed; plugin-path and `claude plugin uninstall` references corrected.
- Skills grouped into buckets: `skills/context`, `skills/config`, `skills/productivity`, each with a `README.md`; `plugin.json` lists the shipped set explicitly.
- Added `CONTEXT.md` (domain glossary), `.agents/adr/` (design decisions), `scripts/list-skills.sh`.
- Ponytail audit: `docs/USAGE.md` and `docs/ARCHITECTURE.md` folded into `wiki/`; task-brain-lite drops its jsonl memory; skill `version:` frontmatter removed.

## 0.2.1

- Wiki seeded, CLAUDE.md compressed 43%, stale skill references fixed.
