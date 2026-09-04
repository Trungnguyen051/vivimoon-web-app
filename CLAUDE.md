@AGENTS.md

## Agent skills

### Issue tracker

Issues live as GitHub issues (`Trungnguyen051/vivimoon-web-app`), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.

### Feature workflow

Default pipeline for any new feature, idea, or plan — run in this order, don't skip ahead:

1. **`/grill-with-docs`** — interview to sharpen the idea before anything is built; writes ADRs/glossary entries as it goes.
2. **`/to-spec`** — synthesize the discussion into a spec (Problem/Solution/User Stories/Implementation Decisions/Testing Decisions), published as a GitHub issue labeled `ready-for-agent`.
3. **`/to-tickets`** — break the spec into tracer-bullet tickets (vertical slices, each with its blocking edges), published as GitHub issues in dependency order — see the M4 issues (#12/#14/#15/#16) for the shape.
4. **`/implement`** — implement one ticket: TDD at the agreed seams, typecheck + tests regularly, then it runs `/code-review` itself and commits. Re-run `/code-review` standalone for a second pass if wanted.

Work already spec'd and ticketed (an open `ready-for-agent` issue) starts at step 4. Trivial fixes and small continuations of in-flight work don't need the full pipeline — use judgment.

These four are forked locally under `.claude/skills/` (each `SKILL.md` notes it's a fork) because the upstream `mattpocock-skills` plugin versions ship with `disable-model-invocation: true`, which hides them from auto-invocation entirely — the local copies drop that flag so this pipeline can trigger on its own instead of requiring an explicit `/name` every time. The plugin originals remain reachable at `/mattpocock-skills:<name>` and are the source of truth — if `grill-with-docs`, `to-spec`, `to-tickets`, or `implement` change upstream, re-sync the local copy by hand.
