// Repo validation suite — zero dependencies, run with: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

function frontmatter(file) {
  const m = fs.readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, `${path.relative(root, file)}: missing YAML frontmatter`);
  return m[1];
}

test("every JSON file parses", () => {
  for (const f of walk(root, ".json")) {
    assert.doesNotThrow(
      () => JSON.parse(fs.readFileSync(f, "utf8")),
      `${path.relative(root, f)} is not valid JSON`
    );
  }
});

test("hooks.json: valid events, existing scripts, $CLAUDE_PLUGIN_ROOT paths", () => {
  const VALID = new Set([
    "PreToolUse", "PostToolUse", "SessionStart", "Stop", "SubagentStop",
    "SessionEnd", "UserPromptSubmit", "PreCompact", "Notification",
  ]);
  const cfg = JSON.parse(fs.readFileSync(path.join(root, "hooks/hooks.json"), "utf8"));
  for (const [event, blocks] of Object.entries(cfg.hooks)) {
    assert.ok(VALID.has(event), `unknown hook event: ${event}`);
    for (const block of blocks) {
      for (const h of block.hooks) {
        assert.match(h.command, /\$CLAUDE_PLUGIN_ROOT/, `${event}: hardcoded path in "${h.command}"`);
        const script = h.command.match(/\$CLAUDE_PLUGIN_ROOT\/([^"']+)/)?.[1];
        assert.ok(script && fs.existsSync(path.join(root, script)), `${event}: missing script ${script}`);
      }
    }
  }
});

// skills/<bucket>/<name>/SKILL.md — returns [{bucket, name, dir}]
function skills() {
  return walk(path.join(root, "skills"), "SKILL.md").map((f) => {
    const dir = path.dirname(f);
    return { dir, name: path.basename(dir), bucket: path.basename(path.dirname(dir)) };
  });
}

test("every skill has SKILL.md with name and description", () => {
  for (const { dir, bucket, name } of skills()) {
    const fm = frontmatter(path.join(dir, "SKILL.md"));
    assert.match(fm, /^name:\s*\S/m, `skills/${bucket}/${name}: frontmatter missing name`);
    assert.match(fm, /^description:\s*\S/m, `skills/${bucket}/${name}: frontmatter missing description`);
  }
});

test("every skill is registered: plugin.json skills, bucket README, top-level README", () => {
  const plugin = JSON.parse(fs.readFileSync(path.join(root, ".claude-plugin/plugin.json"), "utf8"));
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const all = skills();
  assert.equal(plugin.skills.length, all.length, "plugin.json skills count ≠ SKILL.md count");
  for (const { dir, bucket, name } of all) {
    const rel = `skills/${bucket}/${name}`;
    assert.ok(plugin.skills.includes(`./${rel}`), `plugin.json skills missing ./${rel}`);
    const bucketReadme = fs.readFileSync(path.join(root, "skills", bucket, "README.md"), "utf8");
    assert.ok(bucketReadme.includes(`./${name}/SKILL.md`), `skills/${bucket}/README.md does not link ${name}`);
    assert.ok(readme.includes(`${rel}/SKILL.md`), `README.md does not link ${rel}/SKILL.md`);
  }
});

test("SKILL.md repo-path references resolve to real files", () => {
  for (const { dir, bucket, name } of skills()) {
    const src = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8");
    for (const [, ref] of src.matchAll(/`((?:references|scripts|hooks|agents|tests|skills)\/[\w./-]+\.\w+)`/g)) {
      assert.ok(
        fs.existsSync(path.join(dir, ref)) || fs.existsSync(path.join(root, ref)),
        `skills/${bucket}/${name}/SKILL.md: broken reference ${ref}`
      );
    }
  }
});

test("every agent declares name, description, tools", () => {
  for (const f of walk(path.join(root, "agents"), ".md")) {
    const fm = frontmatter(f);
    for (const key of ["name", "description", "tools"]) {
      assert.match(fm, new RegExp(`^${key}:`, "m"), `${path.relative(root, f)}: missing ${key}`);
    }
  }
});

test("shell scripts pass bash -n", () => {
  for (const f of walk(root, ".sh")) {
    const r = spawnSync("bash", ["-n", f], { encoding: "utf8" });
    assert.equal(r.status, 0, `bash -n ${path.relative(root, f)}: ${r.stderr}`);
  }
});

// stdout is injected into Claude's context: it must be empty when every file
// is under threshold, and a well-formed LTX document when one is over.
test("session-start hook: silent under threshold, LTX rows over it", () => {
  const run = (projectDir) => spawnSync("bash", [path.join(root, "hooks/scripts/session-start.sh")], {
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: root, HOME: projectDir, CLAUDE_PROJECT_DIR: projectDir },
    encoding: "utf8",
  });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cf-"));
  fs.writeFileSync(path.join(tmp, "CLAUDE.md"), "small file\n");
  let r = run(tmp);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, "", `under threshold must print nothing, got: ${r.stdout}`);

  fs.writeFileSync(path.join(tmp, "CLAUDE.md"), "word ".repeat(1200));
  r = run(tmp);
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split("\n");
  assert.equal(lines[0], "@v1:file|words|tokens|level");
  assert.match(lines[1], /\|1200\|1560\|critical$/, lines[1]);
  assert.match(r.stderr, /CRITICAL/);
});

test("statusline renders sample input (multi-word model name)", () => {
  const input = JSON.stringify({
    context_window: { used_percentage: 72 },
    workspace: { current_dir: root },
    model: { display_name: "Fable 5" },
  });
  const r = spawnSync("bash", [path.join(root, "scripts/statusline-command.sh")], {
    input,
    encoding: "utf8",
  });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Fable 5/, `space in model name must not shift fields: ${r.stdout}`);
  assert.match(r.stdout, /72%/, `expected context percentage in: ${r.stdout}`);
});

test("CLAUDE.md stays under its 12,000-character budget", () => {
  const size = fs.statSync(path.join(root, "CLAUDE.md")).size;
  assert.ok(size <= 12000, `CLAUDE.md is ${size} chars (budget 12000)`);
});
