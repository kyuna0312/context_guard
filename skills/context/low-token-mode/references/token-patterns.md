# Low-Token Response Patterns

## Response Length Targets

| Task type | Target tokens |
|-----------|--------------|
| Simple answer | 20-50 |
| Code fix | 30-80 (code) + 10-20 (explanation) |
| File edit | diff only |
| List/options | 5-10 items, no elaboration |
| Confirmation | 1-5 tokens |

## Diff-Style Edits

Instead of rewriting entire files, show only changes:

```
# src/app.py:45-48
- def process(data):
-     result = []
-     for item in data:
-         result.append(transform(item))
-     return result
+ def process(data):
+     return [transform(item) for item in data]
```

Apply with Edit tool targeting exact lines.

## Compact Explanation Patterns

### Before (verbose)
```
I've analyzed the code and found that the issue is occurring because the 
function is creating a new array on every iteration instead of using a 
more efficient approach. I've refactored it to use a list comprehension 
which is both more Pythonic and more efficient.
```
Tokens: ~60

### After (compact)
```
Loop creates new array each iter. List comprehension fix:
```
Tokens: ~12

## Code Comment Rules in Low-Token Mode

Only add comments when:
- Logic is non-obvious
- Business rule not in code
- Performance decision

Skip comments for:
- Self-explanatory code
- Standard patterns
- Repeated explanations

## Response Templates

### Fix applied
```
Fixed. [1-line what changed]
```

### Question answered
```
[Direct answer]. [One sentence elaboration if needed.]
```

### Multiple options
```
Options:
1. [name]: [5 words]
2. [name]: [5 words]
3. [name]: [5 words]
```

### Error diagnosed
```
Cause: [X]
Fix: [Y]
```

## What to Cut

| Verbose phrase | Compact replacement |
|----------------|---------------------|
| "I've analyzed your code and found..." | *(just state the finding)* |
| "Here's how you can fix this:" | *(just show the fix)* |
| "This is a common pattern in..." | *(omit entirely)* |
| "Let me know if you have questions" | *(omit entirely)* |
| "I hope this helps!" | *(omit entirely)* |
| "As you can see in the code..." | *(omit entirely)* |

## When to Exit Low-Token Mode

- Error explanation needed for debugging
- Security warning (always full)
- Irreversible action (always full)
- User explicitly asks for detail

Use: "Full mode for this:" then return to low-token.
