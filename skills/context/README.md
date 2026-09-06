# Context

Skills that shrink what the agent loads or emits each session. Portable unless marked; the instruction file is `CLAUDE.md` on Claude Code, `AGENTS.md` on Codex, `GEMINI.md` on Gemini CLI.

- **[optimize-claudemd](./optimize-claudemd/SKILL.md)**: Rewrites a bloated CLAUDE.md under 300 words without dropping constraints.
- **[check-claudemd-size](./check-claudemd-size/SKILL.md)**: Reports CLAUDE.md word/token count with colour-coded thresholds.
- **[estimate-tokens](./estimate-tokens/SKILL.md)**: Per-source token breakdown of the current setup before anything is loaded.
- **[low-token-mode](./low-token-mode/SKILL.md)**: Terse response discipline for the rest of the session.
- **[reset-context](./reset-context/SKILL.md)**: Safe reset when the window is near full; emits a paste-back summary first.
- **[auto-compact](./auto-compact/SKILL.md)** (Claude Code only): Tunes `autoCompactEnabled` / `autoCompactWindow` so sessions compact instead of stopping.
- **[manage-skills](./manage-skills/SKILL.md)** (Claude Code only): Audits loaded skill descriptions (the only part that costs tokens every session) and disables unused ones.
- **[token-statusline](./token-statusline/SKILL.md)** (Claude Code only): Installs the live context bar in the Claude Code status line.
