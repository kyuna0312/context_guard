# Context

Skills that shrink what the agent loads or emits each session. Portable unless marked; the instruction file is `CLAUDE.md` on Claude Code, `AGENTS.md` on Codex, `GEMINI.md` on Gemini CLI.

- **[optimize-claudemd](./optimize-claudemd/SKILL.md)**: Rewrites a bloated instruction file under 300 words without dropping constraints.
- **[estimate-tokens](./estimate-tokens/SKILL.md)**: Per-source token breakdown with size thresholds for instruction files, skill descriptions, memory.
- **[low-token-mode](./low-token-mode/SKILL.md)**: Terse response discipline for the rest of the session.
- **[reset-context](./reset-context/SKILL.md)**: Safe reset when the window is near full; emits a paste-back summary first.
- **[manage-skills](./manage-skills/SKILL.md)** (Claude Code only): Audits installed skill descriptions (the only per-session cost) and removes unused plugins.
- **[token-statusline](./token-statusline/SKILL.md)** (Claude Code only, user-invoked): Installs the live context bar in the status line.
