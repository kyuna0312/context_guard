# Roadmap & Deliberate Ceilings

The backlog, plus the ponytail-style corners deliberately cut with a known
ceiling. When one of these starts to hurt, this file says what the upgrade
path is. Nothing here is a bug — bugs get fixed, not listed.

## Deliberate ceilings

Live in the code as `ponytail:` comments (`grep -rn "ponytail:" scripts hooks skills`), each naming the ceiling and the upgrade path. Not duplicated here so they can't drift.

Cross-harness gap: hooks and status line are Claude Code only; Codex / Gemini CLI get the skills via skills.sh but no session-start check. Port `session-start.sh` once their hook stdin contracts are verified.

## Backlog

- **Marketplace publishing** — `.claude-plugin/marketplace.json` exists but
  the publish flow is undocumented; write it down when first publishing.
