# AGENTS.md — Codex / ChatGPT

The rules for this repo live in [CLAUDE.md](CLAUDE.md). Read it first; everything there applies here. This file only lists what differs when the harness is Codex instead of Claude Code.

- **What you can run**: the skills under `skills/` (`$optimize-claudemd`, `$estimate-tokens`, `$low-token-mode`, `$reset-context`, `$task-brain-lite`, `$llm-wiki`). Skills whose description starts with `Claude Code only` act on Claude Code's `settings.json`, hooks or status line — read them for context, never execute them here.
- **What you cannot run**: `hooks/`, `scripts/statusline-command.sh`, `agents/hook-error-fixer.md`. They are Claude Code plugin components; do not port, wire or simulate them.
- **Instruction file**: for Codex it is this file. The `optimize-claudemd` / `estimate-tokens` skills treat `AGENTS.md` like `CLAUDE.md`; the 600-word ceiling applies to both.
- **Verify**: `node --test` and `bash -n <script>` work anywhere. `claude plugin validate . --strict` needs the `claude` CLI — skip it when the CLI is absent and say so.
- **Context commands**: `/compact` to summarize, `/new` or `/clear` to start over (Claude Code's `/clear` maps to these).
- **Workflow**: `main` is PR-only; see [CONTRIBUTING.md](CONTRIBUTING.md).
