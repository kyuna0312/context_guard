---
name: manage-skills
description: Claude Code only. Audit installed skill descriptions (the only per-session cost) and remove unused plugins. Use for "skills are wasting tokens", "which skills are active".
---

# Manage Skills

Audit and reduce skill token overhead.

## Token Cost of Skills — the Real Model

Skill bodies are **lazy-loaded**: only the frontmatter `name` + `description`
of every installed skill loads at session start; the SKILL.md body loads only
when the skill is actually invoked. So:

- Constant cost per installed skill: its description (~50–150 tokens)
- Plugin with 10 skills: ~500–1,500 tokens of descriptions, every session
- Body cost (can be thousands of tokens): paid only on invocation

The lever is therefore the *number of installed skills* (description
overhead) and *bloated descriptions* — not body size. A 5,000-word body you
never invoke costs you nothing.

## Audit Loaded Skills

Run the audit (also in `references/skill-audit.md`):

```bash
# Installed plugins + per-skill description word count (the constant, every-session cost).
# Source of truth is installed_plugins.json; plugin files live under
# ~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/ (every cached version, so never glob the cache directly).
python3 - <<'EOF'
import json, os, re, glob
d = json.load(open(os.path.expanduser("~/.claude/plugins/installed_plugins.json")))
roots = {name: i[0]["installPath"] for name, i in d["plugins"].items()}
roots["(personal)"] = os.path.expanduser("~/.claude/skills")
for name, root in roots.items():
    for f in glob.glob(root + "/**/SKILL.md", recursive=True):
        fm = open(f).read().split("---")[1]
        m = re.search(r"^description:\s*(.*?)(?=^\w[\w-]*:|\Z)", fm, re.S | re.M)
        print(f"{len(m.group(1).split()) if m else 0:4d}  {name}  {os.path.basename(os.path.dirname(f))}")
EOF
```

Then report:
1. Each plugin name
2. Number of skills per plugin
3. Estimated token cost per skill (check SKILL.md word count)

## Disable Unnecessary Skills

The real mechanisms (there is no `autoLoadSkills` setting — do not invent
one):

- **Remove a plugin**: `claude plugin uninstall <name>` — removes its skills' descriptions from every session
- **Bundled skills**: set `"disableBundledSkills": true` in `settings.json` to skip Claude Code's built-in skills at startup
- **Skill invoked when unwanted**: tighten its `description` (add "Do NOT use for…" anti-triggers) rather than trying to block loading

## Recommended Minimal Skill Set

Keep only plugins actively needed for current work. Remove:
- Design/SEO/marketing plugins during coding sessions
- Large documentation plugins when not writing docs
- Any plugin with 5+ skills where you only use 1–2

## Estimate Skill Token Cost

Constant cost = descriptions. Measure those, not bodies:

The audit script above prints description words per skill; multiply by 1.3.
Body word counts (paid only on invocation): `wc -w <installPath>/skills/**/SKILL.md`.

A body over 3,000 words is only a problem for skills you invoke often —
suggest moving detail into `references/` files, which load on demand.

## Additional Resources

- **`references/skill-audit.md`** — Full audit procedure and cost reduction strategies
