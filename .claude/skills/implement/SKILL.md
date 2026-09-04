---
name: implement
description: Implement a piece of work based on a spec or set of tickets. Use whenever asked to implement, build, or work on a ticket/issue in this repo — runs TDD at the agreed seams, then /code-review, then commits.
# Local fork of mattpocock-skills:implement (plugin ships with
# disable-model-invocation: true, which hides it from auto-invocation).
# This copy omits that flag so it's part of this repo's default feature
# workflow (see CLAUDE.md). Re-sync manually if the upstream skill changes —
# check ~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/*/skills/engineering/implement/SKILL.md.
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.
