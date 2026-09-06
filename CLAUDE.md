# CLAUDE.md — context-forge Rules

Claude Code plugin for token-waste reduction: 11 skills, the `hook-error-fixer` agent, a session-start hook, a status line. Skills also run on Codex / Gemini CLI (skills.sh); hook, status line, agent are Claude Code only.

Stack: Bash + Markdown, zero runtime deps. Tests: `node --test` (node ≥18, tests only); `python3` for hook + statusline. Install: `bash scripts/install.sh` — marketplace registration; a symlink under `~/.claude/plugins` is NOT discovered. Dev: `claude --plugin-dir <repo>`. README is the single source (site + GitHub wiki derive from it); vocabulary `CONTEXT.md`; decisions `.agents/adr/`; workflow `CONTRIBUTING.md`, `main` is PR-only.

## A. Architecture

Entry points: `.claude-plugin/plugin.json` (`skills` array = shipped set) · `hooks/hooks.json` (SessionStart → `session-start.sh`) · `skills/<bucket>/<name>/SKILL.md` (buckets `context`, `config`, `productivity`) · `agents/hook-error-fixer.md` · `scripts/statusline-command.sh`.

- **LTX**: `@v1:field|field` header + pipe rows → stdout; human text → stderr. Emitters `ltx_header`/`ltx_row`/`ltx_human` live in `session-start.sh` — copy, don't abstract. Only skills that emit LTX carry a `## LTX Schema` section.
- Scripts use `$CLAUDE_PLUGIN_ROOT` for plugin files, never hardcoded paths; never in user-facing examples (it only resolves inside plugin hooks; show `~/.claude/hooks/`).
- **session-start.sh**: hook stdout is injected into context, so it stays EMPTY unless a CLAUDE.md is over `WARN_WORDS=600` / `CRIT_WORDS=1000`; then `@v1:file|words|tokens|level` rows. `-ef` guard against CLAUDE.md/claude.md double-count. settings.json check: stderr only, skipped without python3.
- **statusline-command.sh**: stdin JSON → powerline segments in the tmux "Night City" palette; fields `\x1f`-separated (names contain spaces). Colour thresholds in README. Needs Claude Code ≥ 2.1.97 and a Nerd Font.

## B. Anti-Hallucination (CRITICAL)

1. Only documented settings keys. `autoLoadSkills`, `autoLoadMemory`, `compactOnContextFull`, `verboseOutput`, `plugins.autoEnable` do NOT exist. Real: `autoMemoryEnabled`, `autoCompactEnabled`/`autoCompactWindow`, `disableBundledSkills`, `disabledMcpjsonServers`, `statusLine`. Verify anything else against official docs first.
2. Skill bodies lazy-load; only descriptions cost tokens every session. Keep each description ≤ 30 words.
3. Every command in docs must exist and pass. No `npm test`, `pytest`, lint — the only test entry point is `node --test`.
4. Token numbers are estimates (words × 1.3); label them so, never "measured".

## C. Extending

- **Skill**: `skills/<bucket>/<name>/SKILL.md`; `name` = directory name; description carries triggers AND anti-triggers ("Not for…"). NOT auto-discovered: add to `plugin.json` `skills`, the bucket `README.md`, and the top README table (tests check all three). Harness-neutral prose: "the agent instruction file (`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`)"; Claude-Code-only descriptions start with `Claude Code only`. Config-writing skills are user-invoked: `disable-model-invocation: true`, no trigger list.
- **Agent**: `agents/<name>.md` — `name`, `model: inherit`, `color`, `tools`, `description`, then `## When to use`.
- **Hook**: `hooks/hooks.json`; valid events only (`PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, `SubagentStop`, `SessionEnd`, `UserPromptSubmit`, `PreCompact`, `Notification`); always set `timeout`; degrade to no-op, never block tools.

## D. Operating Mode

Ponytail is injected by its own plugin; applies in full. Additions:

- Bug fix = root cause: grep every caller; one guard in the shared function beats a patch per caller.
- Platform-native first: bash builtins over subprocesses, Node built-ins over packages. Corner-cuts get a `ponytail:` comment naming ceiling + upgrade path.
- Never lazy about: understanding the problem, trust-boundary validation, security, anything explicitly requested.
- Non-trivial logic leaves ONE check in `tests/repo.test.mjs`.
- Strict for `hooks/` and `scripts/`; no new languages without explicit ask.

**Verify**: `node --test` · `claude plugin validate . --strict` · `python3 -m json.tool <f>` · `bash -n`. Smoke one-liners: README → Tests.

**Forced**: `node --test` green before EVERY commit — it covers JSON, hooks, frontmatter, syntax, hook runtime, skill registration, SKILL.md refs; don't redo that audit by hand. A file write ≠ correct code: verify before saying "done". This file stays under 600 words (`wc -w CLAUDE.md`) — the hook's own warning threshold; move detail to README or skill `references/`.
