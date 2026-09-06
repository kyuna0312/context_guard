# GEMINI.md — Gemini CLI

The rules for this repo live in [CLAUDE.md](CLAUDE.md). Read it first; everything there applies here. This file only lists what differs when the harness is Gemini CLI instead of Claude Code.

- **What you can run**: the skills under `skills/` (activated by description match, or install them with `npx skills@latest add kyuna0312/context_forge -a gemini-cli`). Skills whose description starts with `Claude Code only` act on Claude Code's `settings.json`, hooks or status line — read them for context, never execute them here.
- **What you cannot run**: `hooks/`, `scripts/statusline-command.sh`, `agents/hook-error-fixer.md`. They are Claude Code plugin components; do not port, wire or simulate them.
- **Instruction file**: for Gemini CLI it is this file. The `optimize-claudemd` / `estimate-tokens` skills treat `GEMINI.md` like `CLAUDE.md`; the 600-word ceiling applies to both.
- **Verify**: `node --test` and `bash -n <script>` work anywhere. `claude plugin validate . --strict` needs the `claude` CLI — skip it when the CLI is absent and say so.
- **Context commands**: `/compress` to summarize, `/clear` to start over (Claude Code's `/compact` maps to `/compress`).
- **Workflow**: `main` is PR-only; see [CONTRIBUTING.md](CONTRIBUTING.md).
