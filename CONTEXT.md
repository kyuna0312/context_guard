# context_forge

A Claude Code plugin for token-waste reduction: skills, a session-start hook, a status line, and a hook-repair agent. Skills live in bucket folders under `skills/`.

## Language

**Instruction file**:
The per-project or global file the harness loads every session: `CLAUDE.md` (Claude Code), `AGENTS.md` (Codex), `GEMINI.md` (Gemini CLI). Its size is the constant token cost the plugin measures and trims.
_Avoid_: system prompt, config

**LTX**:
Low Token eXchange format: one `@v1:field|field` header then pipe-delimited rows on stdout; human prose on stderr. Emitted by the session-start hook and by skills that declare a `## LTX Schema` section.

**Bucket**:
A category folder under `skills/` (`context`, `config`, `productivity`). Every skill in a bucket is listed in the bucket `README.md`, the top-level `README.md`, and `plugin.json`'s `skills` array.

**Harness**:
The agent runtime a skill runs in: Claude Code (plugin, hooks, status line), Codex (`$skill`), Gemini CLI. A skill is **portable** (any harness) or **Claude Code only** (its description starts with those words).
_Avoid_: platform, IDE

## Relationships

- Every **Bucket** skill is either portable or Claude Code only; the hook, status line and agent are always Claude Code only
- The `config/` bucket is Claude Code only in full; `context/` and `productivity/` are portable except where marked

## Flagged ambiguities

- "changelog" previously meant a Postgres table in the removed forge half. Resolved: it now means only `CHANGELOG.md`.
