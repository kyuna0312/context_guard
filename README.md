# context_forge

[![test](https://github.com/kyuna0312/context_forge/actions/workflows/test.yml/badge.svg)](https://github.com/kyuna0312/context_forge/actions/workflows/test.yml)

A Claude Code plugin for token-waste reduction: 14 skills, a diagnostic agent, a session-start hook, and a live status line showing context usage.

Built as a Claude Code plugin; the portable skills also run on **Codex** and **Gemini CLI** (see [Other agents](#other-agents-codex-gemini-cli)).

**Docs:** domain glossary → [CONTEXT.md](CONTEXT.md) · decisions → [.agents/adr/](.agents/adr/) · changes → [CHANGELOG.md](CHANGELOG.md) · backlog & deliberate ceilings → [docs/ROADMAP.md](docs/ROADMAP.md) · agent rules → [CLAUDE.md](CLAUDE.md) · distilled reference (flows, install, LTX) → [wiki/](wiki/index.md)

---

## Skills

Grouped into buckets under `skills/`; each bucket has a `README.md` listing its skills. Invoke as `/context-forge:<skill>` (Claude Code), `$<skill>` (Codex), or just describe what you want. Skills marked **CC** act on Claude Code's `settings.json`, hooks or status line and are Claude Code only; everything else is portable.

**[context](skills/context/README.md)** — shrink what the agent loads or emits

| Skill | What it does |
|-------|-------------|
| [`optimize-claudemd`](skills/context/optimize-claudemd/SKILL.md) | Rewrites a bloated CLAUDE.md under 300 words without dropping constraints |
| [`check-claudemd-size`](skills/context/check-claudemd-size/SKILL.md) | Reports CLAUDE.md word/token count with color-coded warnings |
| [`estimate-tokens`](skills/context/estimate-tokens/SKILL.md) | Estimates tokens in any file before loading it |
| [`low-token-mode`](skills/context/low-token-mode/SKILL.md) | Terse response discipline for the rest of the session |
| [`reset-context`](skills/context/reset-context/SKILL.md) | Safely resets context window when near full — prevents hard stops |
| [`auto-compact`](skills/context/auto-compact/SKILL.md) **CC** | Tunes `autoCompactEnabled` / `autoCompactWindow` — auto-compacts instead of stopping |
| [`manage-skills`](skills/context/manage-skills/SKILL.md) **CC** | Audits loaded skills, disables unused ones — reduces session overhead |
| [`token-statusline`](skills/context/token-statusline/SKILL.md) **CC** | Adds live context bar to Claude Code status line |

**[config](skills/config/README.md)** — settings.json and hooks, documented keys only (**CC**, all four)

| Skill | What it does |
|-------|-------------|
| [`tune-settings`](skills/config/tune-settings/SKILL.md) | Diffs and applies token-saving settings (`autoMemoryEnabled`, `disableBundledSkills`, `disabledMcpjsonServers`) |
| [`settings-diff`](skills/config/settings-diff/SKILL.md) | Shows before/after diff before writing any settings change |
| [`project-isolation`](skills/config/project-isolation/SKILL.md) | Scopes skills and hooks to current project only |
| [`debug-hooks`](skills/config/debug-hooks/SKILL.md) | Diagnoses broken hook configurations with detailed validation output |

**[productivity](skills/productivity/README.md)** — workflow

| Skill | What it does |
|-------|-------------|
| [`task-brain-lite`](skills/productivity/task-brain-lite/SKILL.md) | Decomposes complex tasks into prioritized, dependency-aware subtasks |
| [`llm-wiki`](skills/productivity/llm-wiki/SKILL.md) | Builds a persistent wiki the agent reads instead of re-ingesting raw docs each session |

**Agent:** `hook-error-fixer` — diagnoses and auto-fixes broken hook configurations.

**Hook:** Session-start script that warns when CLAUDE.md exceeds size thresholds and validates settings.json.

**Status line** (powerline segments, tmux "Night City" palette):
```
 context_forge   main  Fable 5  ctx ███████░░░ 72%  md ~952t 
```

---

## Other agents (Codex, Gemini CLI)

The `SKILL.md` format is shared by Claude Code, Codex and Gemini CLI. Install the skills you want with [skills.sh](https://skills.sh) (it lists them and asks which agents to install to):

```bash
npx skills@latest add kyuna0312/context_forge            # interactive: pick skills + agents
npx skills@latest add kyuna0312/context_forge -a codex -s task-brain-lite -s llm-wiki -y
```

Skip the **CC** skills there; they only make sense inside Claude Code.

| Component | Claude Code | Codex | Gemini CLI |
|-----------|-------------|-------|------------|
| 7 portable skills (context, productivity) | plugin | skills.sh | skills.sh |
| 7 **CC** skills (settings, hooks, status line) | plugin | — | — |
| Session-start hook, status line, `hook-error-fixer` agent | plugin | — | — |

---

## Requirements

- Claude Code v2.1.97 or later (for `refreshInterval` support)
- `python3` — used by the token status line script and hook validation
- `node` ≥ 18 — only for running the test suite

---

## Installation

Plugins install through the Claude Code marketplace — a bare clone or
symlink under `~/.claude/plugins` is **not** discovered.

### Option A — Install script (recommended)

```bash
git clone https://github.com/kyuna0312/context_forge.git ~/context_forge
bash ~/context_forge/scripts/install.sh
```

Registers the repo as a local plugin marketplace, installs the plugin,
copies the status line script to `~/.claude/` (backing up a modified copy
first), and warns if `python3` is missing. The install is a
snapshot — re-run the script after pulling repo updates.

### Option B — Straight from GitHub (no clone)

```bash
claude plugin marketplace add kyuna0312/context_forge
claude plugin install context-forge@context-forge
```

### Option C — Load in place (development)

```bash
claude --plugin-dir /path/to/context_forge
```

### Uninstall

```bash
bash scripts/uninstall.sh
```

Uninstalls the plugin, removes the marketplace registration, and deletes the
installed statusline script (only if unmodified).

---

## Tests

Zero-dependency validation suite using Node's built-in test runner:

```bash
node --test
```

Validates every JSON file, hook config and event names, skill/agent frontmatter, shell syntax, skill registration, and file paths referenced in SKILL.md, then runs the hook + statusline against sample input. Runs in CI on every push (`.github/workflows/test.yml`).

---

## Token Status Line Setup

The status line shows live context window usage at the bottom of the terminal.

**Step 1 — Copy script to permanent location:**

```bash
cp <repo>/scripts/statusline-command.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh
```

**Step 2 — Add to `~/.claude/settings.json`:**

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/statusline-command.sh",
    "refreshInterval": 30
  }
}
```

**Step 3 — Restart Claude Code.**

**Test before wiring up:**

```bash
echo '{"context_window":{"used_percentage":72},"workspace":{"current_dir":"'"$PWD"'"},"model":{"display_name":"Fable 5"}}' \
  | bash ~/.claude/statusline-command.sh
```

Expected output ends with `Fable 5  ctx ███████░░░ 72%  md ~Nt` — the model name must render whole; a truncated name means the installed copy is outdated (re-run `install.sh`).

**Color thresholds:**

| Context % | Color                       |
|-----------|-----------------------------|
| 0–49%     | Green (`#49d575`)           |
| 50–74%    | Yellow (`#f2c74b`)          |
| 75–89%    | Purple (`#be59d6`)          |
| 90–100%   | Red                         |

The `` separators need a Nerd Font, the same one tmux powerline themes use.

---

## Session-Start Hook

Runs automatically when Claude Code starts. Warns if CLAUDE.md exceeds size thresholds.

To customize thresholds, edit `hooks/scripts/session-start.sh`:

```bash
readonly WARN_WORDS=600    # yellow warning
readonly CRIT_WORDS=1000   # red critical
```

---

## LTX Output Format

Skills and hooks emit structured data in **LTX (Low Token eXchange Format)** — a schema-based, pipe-delimited format that minimizes token overhead compared to JSON.

### Format

```
@v1:field1|field2|field3
value|value|value
value|value|value
```

- Header line: `@v1:<schema>` — defines field names
- Data rows: pipe-delimited values, one per line

### Example — session-start hook output

Hook stdout is injected into Claude's context, so the hook prints **nothing** while every file is under threshold. Over threshold:

**stdout (LTX, one row per offending file):**
```
@v1:file|words|tokens|level
~/.claude/CLAUDE.md|850|1105|warn
```

**stderr (human-readable):**
```
⚠ TOKEN SAVER [WARNING]: ~/.claude/CLAUDE.md is 850 words (~1105 tokens). Consider /context-forge:optimize-claudemd.
```

### Skill Schemas

| Skill | LTX Schema |
|-------|------------|
| `estimate-tokens` | `@v1:source\|words\|tokens\|status` |
| `check-claudemd-size` | `@v1:file\|words\|tokens\|level` |
| `debug-hooks` | `@v1:hook\|status\|error\|fix` |
| `tune-settings` | `@v1:setting\|current\|recommended\|action` |

Each skill's `SKILL.md` contains a `## LTX Schema` section with field definitions and examples.

---

## Project Structure

```
context_forge/
├── .agents/adr/                 # Design decisions (ADRs)
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest — `skills` lists the shipped set explicitly
│   └── marketplace.json         # Makes the repo its own single-plugin marketplace
├── .github/workflows/test.yml   # CI: node --test on every push/PR
├── CONTEXT.md                   # Domain glossary — the words this repo uses
├── CHANGELOG.md
├── agents/
│   └── hook-error-fixer.md      # Auto-diagnoses broken hooks
├── docs/
│   └── ROADMAP.md               # Backlog + deliberate ceilings with upgrade paths
├── hooks/
│   ├── hooks.json               # SessionStart hook config
│   └── scripts/session-start.sh # CLAUDE.md size warning on startup
├── scripts/
│   ├── install.sh               # Registers local marketplace + installs plugin
│   ├── uninstall.sh             # Uninstalls plugin, marketplace + statusline copy
│   ├── list-skills.sh           # Prints <bucket>/<skill> for every SKILL.md
│   └── statusline-command.sh    # Status line renderer (copy to ~/.claude/)
├── skills/                      # One bucket per folder, README.md in each
│   ├── context/                 # 8 skills — instruction-file size, token estimates, compaction, status line
│   ├── config/                  # 4 skills — settings.json, hooks (debug-hooks ships validate-hooks.sh)
│   └── productivity/            # 2 skills — task-brain-lite, llm-wiki
├── tests/
│   └── repo.test.mjs            # Zero-dep validation suite (node --test)
└── wiki/                        # Distilled knowledge base (llm-wiki skill) — read before raw docs
```

---

## License

MIT
