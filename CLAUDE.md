# CLAUDE.md — context-forge Rules

context_forge is a Claude Code plugin for token-waste reduction: 14 skills, the `hook-error-fixer` agent, a session-start hook, and a status line script. Skills also run on Codex and Gemini CLI via skills.sh; the hook, status line and agent are Claude Code only.

Stack: Bash + Markdown. Tests: zero-dep `node --test` suite in `tests/`. No build system, no runtime dependencies. Install: `bash scripts/install.sh` — marketplace registration; a bare symlink under `~/.claude/plugins` is NOT discovered. Dev: `claude --plugin-dir <repo>`. Needs `python3` (hook + statusline), `node` ≥18 (tests only). Wiki: read `wiki/` before raw docs. Vocabulary: `CONTEXT.md`. Decisions: `.agents/adr/`.

## A. Architecture

Entry points: `.claude-plugin/plugin.json` (manifest; `skills` array lists the shipped set) · `hooks/hooks.json` (SessionStart → `session-start.sh`, with timeout) · `skills/<bucket>/<name>/SKILL.md` (buckets: `context`, `config`, `productivity`) · `agents/hook-error-fixer.md` · `scripts/statusline-command.sh`.

- **LTX format**: `@v1:field|field` header line + pipe-delimited rows. LTX → stdout, human warnings → stderr. The three emitters (`ltx_header`, `ltx_row`, `ltx_human`) live in `hooks/scripts/session-start.sh` — copy them into any new emitting script. A skill that emits LTX documents a `## LTX Schema` section; one that doesn't must not carry a dead schema section.
- Hook/skill scripts use `$CLAUDE_PLUGIN_ROOT` for plugin files, never hardcoded paths — but never show that variable in user-facing examples (it only resolves inside plugin hooks; use real paths like `~/.claude/hooks/`).
- **session-start.sh**: CLAUDE.md word check (`WARN_WORDS=600`, `CRIT_WORDS=1000`, `-ef` guard against double-count), settings.json validation (stderr warning only, skipped when python3 absent). stdout is injected into context, so it is EMPTY unless a file is over threshold; then `@v1:file|words|tokens|level` rows. Keep it that way.
- **statusline-command.sh**: stdin JSON → dir, branch, model, context bar, CLAUDE.md tokens (words × 1.3), rate-limit %. Fields `\x1f`-separated (names contain spaces). Powerline segments, tmux "Night City" palette: green → yellow (50%/390t) → purple (75%/780t) → red (90%/1300t); needs a Nerd Font. Needs Claude Code ≥ 2.1.97.

## B. Anti-Hallucination & Value Safety (CRITICAL)

1. Never write undocumented settings keys. `autoLoadSkills`, `autoLoadMemory`, `compactOnContextFull`, `verboseOutput`, `plugins.autoEnable` do NOT exist. Real keys in this repo's docs: `autoMemoryEnabled`, `autoCompactEnabled`/`autoCompactWindow`, `disableBundledSkills`, `disabledMcpjsonServers`, `statusLine`. Verify anything else against official docs first.
2. Skill bodies lazy-load — only frontmatter descriptions cost tokens every session. Don't write docs claiming otherwise.
3. Every command written into docs or this file must exist and pass first. No `npm test`, `pytest`, `npm run lint`, `black` — the only test entry point is `node --test`.
4. Token numbers in skills are estimates (words × 1.3); label them as such, never as measured.

## C. Extending

- **Skill**: `skills/<bucket>/<name>/SKILL.md`, frontmatter `name` (= directory name) / `description`; triggers AND anti-triggers ("Do NOT use for…") in the description; LTX emitters copied from `session-start.sh` if it emits. NOT auto-discovered: add it to `plugin.json` `skills`, the bucket `README.md`, and the top-level README table (the test suite checks all three). New bucket = new folder + `README.md`. **Harness-neutral prose**: say "the agent instruction file (`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`)"; start a Claude-Code-only description with `Claude Code only`.
- **Agent**: `agents/<name>.md`, frontmatter `name`, `model: inherit`, `color`, `tools: [...]`, `description`, then `## When to use` + instructions.
- **Hook**: block in `hooks/hooks.json`. Valid events only: `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`, `SubagentStop`, `SessionEnd`, `UserPromptSubmit`, `PreCompact`, `Notification`. Always set `timeout`; degrade to no-op, never block tools.

## D. Operating Mode

Ponytail (lazy-senior-dev ladder) is injected every session by its own plugin hook — it applies here in full. Repo-specific additions:

- Bug fix = root cause: grep every caller of the function you touch; one guard in the shared function beats a patch per caller.
- Platform-native first: bash builtins over subprocesses, Node built-ins over packages. Mark deliberate corner-cuts with a `ponytail:` comment naming ceiling + upgrade path.
- Never lazy about: understanding the problem, validation at trust boundaries, security, anything explicitly requested.
- Non-trivial logic leaves ONE runnable check in `tests/repo.test.mjs`; trivial one-liners need none.
- Strict for anything touching `hooks/` or `scripts/`; judgment for trivial fixes. No new languages without explicit ask — stack is Bash + Markdown (+ Node for tests).

**Verify**: `node --test` (repo root) · manifests: `claude plugin validate . --strict` · JSON: `python3 -m json.tool <f>` · syntax: `bash -n`. Hook/statusline smoke-test one-liners: `wiki/dev-reference.md`.

**Forced**: `node --test` green before EVERY commit — the suite covers JSON validity, hook config/events, frontmatter, script syntax, hook runtime, skill registration (plugin.json + bucket README + top README), and SKILL.md file refs; the broken-ref audit is automated, don't redo it by hand. A successful file write ≠ correct code — run the relevant verify command before saying "done". This file stays under 12,000 chars (`wc -c CLAUDE.md`); move detail to `wiki/` or skill `references/`, don't pad.
