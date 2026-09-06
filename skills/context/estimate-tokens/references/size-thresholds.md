# CLAUDE.md Size Thresholds

## Size Categories

| Words | Tokens | Status | Action |
|-------|--------|--------|--------|
| < 300 | < 390 | Optimal | No action needed |
| 300–600 | 390–780 | Acceptable | Monitor growth |
| 600–1000 | 780–1300 | Bloated | Run optimize-claudemd |
| > 1000 | > 1300 | Critical | Optimize immediately |

## What Bloats CLAUDE.md

**Common culprits:**

1. **Long explanations** — Claude already knows patterns, just cite them
2. **Repeated rules** — duplicated across sections
3. **Outdated context** — rules for finished features
4. **Prose instead of bullets** — "Please remember to always use TypeScript" vs "TypeScript strict"
5. **Project history** — changelog-style content belongs in CHANGELOG.md
6. **Examples** — move to references/ or examples/ files
7. **Scaffolding text** — "This file contains rules for..."

## Token Cost Examples

### Bloated entry (32 tokens)
```
You are working on a Next.js application. Please always make sure to 
use TypeScript for all new files and follow the existing code style 
patterns that are already in the codebase.
```

### Compressed entry (8 tokens)
```
Stack: Next.js, TypeScript strict.
Follow existing patterns.
```

**Reduction: 75%**

## Compression Techniques

### 1. Noun phrases over sentences
- Before: "Make sure that all database queries use parameterized statements"
- After: "DB: parameterized queries only"

### 2. Bullet stacking
- Before: "Use 2-space indentation. Use single quotes for strings. Add semicolons."
- After: "Style: 2-space indent, single quotes, semicolons"

### 3. Remove Claude-knows content
- Remove: "Always handle errors gracefully"
- Remove: "Write clean, readable code"
- Remove: "Follow best practices"

### 4. Reference instead of inline
- Before: 50-line API schema in CLAUDE.md
- After: "API schema: see docs/api-schema.md"

## Session Start Warning Thresholds

The kyuna_token_saver SessionStart hook warns at:

```bash
WARN_WORDS=600    # Yellow warning
CRIT_WORDS=1000   # Red critical warning
```

Customize by editing `hooks/scripts/session-start.sh`.

## Multiple CLAUDE.md Locations

All locations load and contribute to context:

```
~/.claude/CLAUDE.md        # Global (always loaded)
~/.claude/claude.md        # Global alt (always loaded)
[project]/CLAUDE.md        # Project (loaded in project)
[project]/claude.md        # Project alt (loaded in project)
```

In project directories: global + project both load. Total budget applies to combined size.

Recommendation: Global < 150 words, Project < 200 words = combined < 350 words.
