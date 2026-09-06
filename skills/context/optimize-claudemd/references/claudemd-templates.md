# Claude.md Templates by Project Type

## Minimal (< 100 words)

For solo projects with one dev:

```markdown
# [Project Name]
Stack: [e.g., Next.js 14, PostgreSQL, TypeScript strict]

## Rules
- [Style rule 1]
- [Style rule 2]
- [Key constraint]
```

---

## Standard (100-200 words)

For small teams:

```markdown
# [Project Name]
Stack: [tech stack]
Repo: [path or description]

## Code Style
- [language version/mode]
- [formatter/linter]
- [naming convention]

## Structure
- `src/`: [purpose]
- `lib/`: [purpose]
- `tests/`: [purpose]

## Constraints
- [Hard constraint 1]
- [Hard constraint 2]
- [Deployment constraint]

## Git
- Branch: [convention]
- Commits: [format, e.g., conventional commits]
```

---

## Backend API (200-300 words)

```markdown
# [API Name]
Stack: [e.g., FastAPI, PostgreSQL, Redis, Python 3.12]

## Code Style
- Type hints required on all functions
- Pydantic models for request/response
- Async handlers only
- No print() — use logger

## Structure
- `app/routers/`: route handlers
- `app/models/`: SQLAlchemy models
- `app/schemas/`: Pydantic schemas
- `app/services/`: business logic

## Constraints
- No raw SQL — use SQLAlchemy ORM
- All endpoints require auth except /health
- Response format: `{"data": ..., "error": null}`
- Max response time: 200ms for read, 500ms for write

## Testing
- pytest only
- Coverage > 80% required
- Mock external services
```

---

## Frontend (React/Next.js)

```markdown
# [App Name]
Stack: Next.js 14, TypeScript strict, Tailwind, shadcn/ui

## Code Style
- Functional components only
- Named exports (not default)
- No inline styles — Tailwind classes only
- `use client` only when needed

## Structure
- `app/`: Next.js App Router pages
- `components/ui/`: shadcn components (don't edit)
- `components/`: custom components
- `lib/`: utilities and helpers

## Constraints
- No useState for server-fetchable data — use SWR/React Query
- Images via next/image only
- No console.log in production code
```

---

## Compression Tips

### Before (bloated)
```
You are helping me with my web application. I want you to write clean code. 
Please always use TypeScript. Make sure to handle errors. Don't forget to 
write tests when appropriate. The project uses Next.js and we deploy to Vercel.
Please follow the existing code style and patterns.
```
Words: 52, Tokens: ~68

### After (compressed)
```
Stack: Next.js, TypeScript strict, Vercel
Rules: Handle errors, write tests, follow existing patterns.
```
Words: 14, Tokens: ~18

**Reduction: 73%**
