---
name: estimate-tokens
description: Per-source token estimate: instruction files (CLAUDE.md / AGENTS.md / GEMINI.md) with size thresholds, skill descriptions, memory. Use for "how big is my claude.md", "what's eating my context".
---

# Estimate Tokens

Audit and report approximate token usage across all context sources: claude.md, skills, memory files, plugins, and conversation history.

## Token Estimation Formula

```
1 word ≈ 1.3 tokens
1 line of code ≈ 10-15 tokens
1KB of text ≈ 200-300 tokens
```

## Audit Procedure

### Step 1: Scan instruction files

Claude Code reads `CLAUDE.md`, Codex reads `AGENTS.md`, Gemini CLI reads `GEMINI.md`; count whichever exist.

```bash
wc -w ~/.claude/CLAUDE.md ./CLAUDE.md ./AGENTS.md ./GEMINI.md 2>/dev/null
```

Report: `<file>: ~[words] words ≈ [words * 1.3] tokens  [STATUS]`

| Words | Status | Action |
|-------|--------|--------|
| < 300 | Optimal | none |
| 300–600 | Acceptable | monitor |
| 600–1,000 | Bloated | run `optimize-claudemd` |
| > 1,000 | Critical | optimize now |

The SessionStart hook applies the same thresholds automatically and warns on stderr; don't repeat its report right after session start.

### Step 2: Scan Installed Skills

Use the audit script in `skills/context/manage-skills/references/skill-audit.md`; it
reads `~/.claude/plugins/installed_plugins.json` so cached old versions are
not double-counted. On Codex / Gemini CLI: `find ~/.agents/skills .agents/skills -name SKILL.md`.

Skill bodies lazy-load — only frontmatter descriptions are a constant cost
(~50–150 tokens each, every session). Report *description count × ~100* as
the constant estimate; body word counts × 1.3 are the per-invocation cost.

### Step 3: Scan Memory Files

Auto memory lives per project under `~/.claude/projects/<project-slug>/memory/`:

```bash
wc -w ~/.claude/projects/*/memory/*.md 2>/dev/null | tail -1
```

### Step 4: Count Active Plugins

```bash
python3 -c 'import json,os;print(len(json.load(open(os.path.expanduser("~/.claude/plugins/installed_plugins.json")))["plugins"]))'
```

(`ls ~/.claude/plugins/` counts cache dirs and JSON files, not plugins.)

### Step 5: Generate Report

Output formatted breakdown:

```
TOKEN USAGE AUDIT
=================
claude.md (global):    ~[N] tokens
claude.md (project):   ~[N] tokens
Skill descriptions:    ~[N] tokens  ([X] skills, constant)
Memory files:          ~[N] tokens
─────────────────────────────────
TOTAL CONSTANT COST:   ~[N] tokens per response

Top token consumers:
1. [skill-name]: ~[N] tokens
2. [skill-name]: ~[N] tokens
3. [memory-file]: ~[N] tokens

Recommendation: [action to reduce]
```

## Optimization Priorities

Based on audit results, recommend in order:

1. **claude.md > 500 words** → Run optimize-claudemd skill (usually the biggest constant cost)
2. **Memory files > 1,000 words** → Archive old entries
3. **10+ installed plugins** → `claude plugin uninstall <name>` project-irrelevant ones (each skill's description is constant overhead)
4. **Frequently-invoked skill with 3,000+ word body** → Move detail to `references/` files

## LTX Schema

Emit structured output as LTX rows when reporting per-source token estimates.

```
@v1:source|words|tokens|status
```

| Field | Description |
|-------|-------------|
| `source` | File or category (e.g. `~/.claude/CLAUDE.md`, `skills`) |
| `words` | Raw word count |
| `tokens` | Estimated tokens (`words * 1.3`, rounded) |
| `status` | `ok`, `warn` (approaching limit), `critical` (over limit) |

Example:
```
@v1:source|words|tokens|status
~/.claude/CLAUDE.md|850|1105|critical
./CLAUDE.md|320|416|ok
skills|2400|3120|warn
```

## Additional Resources

- **`references/token-benchmarks.md`** — Token cost benchmarks for common setups
- **`references/size-thresholds.md`** — instruction-file thresholds and what bloats them
