# Installation
_Last updated: 2026-08-07 | Source: README.md_

## Summary
Plugins install through the Claude Code marketplace — a bare clone or symlink under `~/.claude/plugins` is NOT discovered. Requires Claude Code ≥ v2.1.97, `python3`, `node` ≥ 18.

## Key Points
- **Option A (recommended)**: clone, then `bash scripts/install.sh` — registers repo as local marketplace, installs plugin, copies statusline script (backs up modified copies). Snapshot: re-run after pulling updates.
- **Option B (no clone)**: `claude plugin marketplace add kyuna0312/context_forge` then `claude plugin install context-forge@context-forge`.
- **Option C (dev)**: `claude --plugin-dir /path/to/context_forge`.
- **Statusline**: copy `scripts/statusline-command.sh` to `~/.claude/`, add `statusLine` block (`type: command`, `refreshInterval: 30`) to settings.json, restart. Truncated model name in output = outdated installed copy → re-run install.sh.
- **Codex / Gemini CLI**: `npx skills@latest add kyuna0312/context_forge` (skills.sh; pick skills + agents; skip the Claude-Code-only ones). 
- **Uninstall**: `bash scripts/uninstall.sh` (removes plugin, marketplace registration, unmodified statusline copy).

## Related
- [[architecture]]
