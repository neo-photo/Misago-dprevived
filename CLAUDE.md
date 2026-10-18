# CLAUDE.md

Project notes for Claude Code sessions in this repository.

## Branch

Work here targets the **`dpdevel39`** branch (Misago 0.39.6) unless the user explicitly names another branch. This is the code the dprevived beta server runs.

`main` is upstream Misago 0.40-dev and is **not** what the beta runs. The two differ substantially — old vs. new ACL system, `read_at`/`posted_on` vs. `read_time`/`posted_at`, REST-API posting endpoints vs. server-rendered views — so analysis done against the wrong branch is wasted.

At the start of a session that involves reading or changing code, check:

```bash
git branch --show-current
```

**If the branch is not `dpdevel39` and the user did not ask for another one: say so, and ask how to proceed. Do not switch branches automatically.** The user may have checked out something else deliberately. A one-line heads-up is enough — then continue with whatever they confirm.

State which branch is being analysed in the answer, so a mismatch is visible early rather than after the work is done.

## Repository access: Arvo can push, agents do not

The remote is `https://github.com/neo-photo/Misago-dprevived.git`, owned by the main dev.
Arvo has **write access** (confirmed 2026-09-26, authenticated through Sourcetree with
Google OAuth). This replaces the earlier read-only assumption.

That does not make pushing an agent's call:

- **Never `git push` and never open pull requests** unless Arvo asks in this conversation.
  Arvo pushes deliberately, by hand, and prefers to keep changes that are not
  dprevived-specific off the shared branches entirely.
- `git fetch` / `git pull` are fine. Local edits and local commits are fine.
- **`dpdevel39` is kept as a clean mirror of `origin`** — put local commits on `dpwin39`
  instead, so `git pull` always fast-forwards and `git diff dpdevel39` shows exactly what
  is ours.

Changes intended for the main dev still go over as something they can apply themselves: a
`git format-patch` series, a diff, or a local commit to cherry-pick. Ask which form is
wanted rather than assuming — having write access does not mean bypassing review.

Upstream Misago bugs found here (as opposed to fork code) are worth sending to the Misago
maintainer too; they are usually the same patch.
