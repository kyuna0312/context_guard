# Hook Error Catalog

## Error: `node:internal/modules/cjs/loader`

**Full error pattern:**
```
SessionStart: startup hook error
node:internal/modules/cjs/loader:936
  throw err;
Error: Cannot find module '/path/to/module'
```

**Root cause**: Node.js hook script has a `require()` call for a module that doesn't exist at the specified path.

**Fix steps:**
1. Find the hook script path in settings.json
2. Read the script
3. Find `require('...')` calls
4. Check each required module exists: `ls node_modules/[module]` or `which [module]`
5. Either install missing module or fix the require path

**Common sub-causes:**
- npm package not installed → `npm install [package]`
- Wrong relative path in require → fix to absolute or correct relative
- Module moved/deleted → update path or remove hook

---

## Error: `ENOENT: no such file or directory`

**Root cause**: Hook command references a file that doesn't exist.

**Fix steps:**
1. Extract file path from error message
2. Check if file was deleted or moved
3. If recoverable: recreate file at original path
4. If not recoverable: remove hook entry from settings.json

---

## Error: `Permission denied`

**Root cause**: Hook script is not executable.

**Fix:**
```bash
chmod +x /path/to/hook-script.sh
```

---

## Error: `command not found`

**Root cause**: Hook uses a tool not installed on system.

**Fix steps:**
1. Identify the missing command from error
2. Install it:
   - Node.js: `sudo pacman -S nodejs` / `brew install node`
   - Python: `sudo pacman -S python` / `brew install python`
   - jq: `sudo pacman -S jq` / `brew install jq`
3. Verify: `which [command]`

---

## Silent Hook Failure (hook does nothing)

**Root causes:**
1. Wrong event name (case-sensitive)
2. Bad JSON schema
3. Matcher doesn't match tool names
4. Script exits 0 without output

**Diagnose:**
```bash
claude --debug 2>&1 | grep -i hook
```

**Valid event names (exact case):**
- `PreToolUse`
- `PostToolUse`
- `SessionStart`
- `SessionEnd`
- `Stop`
- `SubagentStop`
- `UserPromptSubmit`
- `PreCompact`
- `Notification`

**Valid schema check:**
```bash
cat ~/.claude/settings.json | python3 -m json.tool > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

---

## Error: `SyntaxError` in hook script

**Root cause**: Syntax error in hook script file.

**Fix:**
```bash
# Shell scripts
bash -n /path/to/script.sh

# Node.js
node --check /path/to/script.js

# Python
python3 -m py_compile /path/to/script.py
```

---

## Hook Timeout Error

**Root cause**: Hook exceeds configured timeout.

**Fix options:**
1. Increase timeout in hooks.json: `"timeout": 60`
2. Optimize hook script to run faster
3. Move heavy logic to async/background process

---

## JSON Parse Error in settings.json

**Symptom**: All hooks fail to load.

**Diagnose:**
```bash
python3 -c "import json; json.load(open('$HOME/.claude/settings.json'))"
```

**Fix**: Use a JSON validator to find the syntax error. Common causes:
- Trailing comma after last array/object item
- Missing closing bracket or brace
- Unescaped quotes in string values
