# Skill Audit Reference

## The Real Cost Model

Skill bodies **lazy-load**. What each installed skill costs:

| Component | When it loads | Typical size |
|-----------|---------------|--------------|
| Frontmatter `name` + `description` | Every session, always | ~50–150 tokens |
| SKILL.md body | Only when the skill is invoked | words × 1.3 tokens |
| `references/` files | Only when the invoked skill reads them | words × 1.3 tokens |

**Constant overhead = descriptions only.** A 5,000-word body you never
invoke costs nothing. There is no `autoLoadSkills` setting because there is
no bulk body loading to turn off.

## Audit Procedure

### Step 1–2: List installed skills and measure the constant cost (descriptions)
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
Sum the first column and multiply by 1.3 — that's the per-session overhead.

### Step 3: Measure per-invocation cost (bodies)
Only for skills you actually invoke: `wc -w <installPath>/skills/**/SKILL.md`.

### Step 4: Categorize by need

**Keep if:**
- Invoked at least occasionally
- Provides unique functionality

**Remove the plugin if:**
- None of its skills invoked in current work
- Duplicate of another skill
- Its descriptions alone cost more than the value it delivers

**Slim the body if:**
- Invoked often AND body > 3,000 words → move detail to `references/`
  files, which load only when read

## Skill Registry Locations

```
~/.claude/plugins/installed_plugins.json          # source of truth: name → installPath
~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/skills/   # plugin skills (one dir per cached version)
~/.claude/skills/                                 # personal skills
[project]/.claude/skills/                         # project-scoped skills
```

## Removing Skills — the Real Mechanisms

### Method 1: Remove the plugin
```
claude plugin uninstall <plugin-name>
```
Removes all its skills' descriptions from every future session.

### Method 2: Disable bundled skills
In `~/.claude/settings.json`:
```json
{
  "disableBundledSkills": true
}
```
Skips Claude Code's built-in skills (except `/doctor`) at startup.

### Method 3: Stop unwanted auto-invocation
If a skill fires when it shouldn't, tighten its `description` with
anti-triggers ("Do NOT use for …") — that's the loading contract, not a
settings key.

## Token Budget Example

**10 installed skills:**
```
Constant: 10 descriptions × ~100 tokens = ~1,000 tokens/session
Invoked this session: 2 skills × 1,500-word bodies × 1.3 = ~3,900 tokens
```

Removing 8 never-used skills saves ~800 tokens/session — real but modest.
Compare: trimming a 1,000-word CLAUDE.md to 300 words saves ~900
tokens/session on its own. Audit CLAUDE.md first.
