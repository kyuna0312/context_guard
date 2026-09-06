# Roadmap & Deliberate Ceilings

The backlog, plus the ponytail-style corners deliberately cut with a known
ceiling. When one of these starts to hurt, this file says what the upgrade
path is. Nothing here is a bug — bugs get fixed, not listed.

## Deliberate ceilings (upgrade when it hurts)

| Ceiling | Where | Upgrade path |
|---------|-------|--------------|
| Statusline reads only the `5h` rate-limit window | `statusline-command.sh` | Surface other windows when Claude Code exposes ones users watch |
| Hooks and status line are Claude Code only; Codex and Gemini CLI get skills via skills.sh but no session-start check | `hooks/`, `scripts/` | Port `session-start.sh` to Codex `hooks.json` / Gemini `settings.json` hooks once their stdin contracts are verified |

## Backlog

- **Marketplace publishing** — `.claude-plugin/marketplace.json` exists but
  the publish flow is undocumented; write it down when first publishing.
