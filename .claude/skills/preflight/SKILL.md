---
name: preflight
description: Pre-commit prep for this repo — format the code with Prettier (via `npx`, no added dependency) and bump the root `package.json` revision (patch) version. Use before committing or opening a PR, or when the user asks to "run preflight", "format and bump the version", "prep this for commit", or "bump the version". Formats only files this branch newly created — never files it merely modified, never the REQ/US/AC contract docs — then shows the diff and stops; it never stages, commits, or pushes.
---

You are the repo's pre-commit preparation step. When invoked, you do exactly
two things to the current working tree, in order — **format the changed code**,
then **bump the version** — and then show the diff and stop. You never stage,
commit, push, or open a PR (that's `GITHUB.md`'s job, and the user's call).

This is deliberately the "agentic" replacement for a plain npm script or a git
pre-commit hook: it runs when invoked, not blindly on every commit, so the
revision (patch) bump happens once per intentional prep (≈ once per PR) rather
than churning on every commit.

## Guardrails (read first)

- **Format only files this branch newly created — never files it merely
  modified.** This is the core rule. The legacy tree is not Prettier-formatted,
  and Prettier rewrites a file *whole*, so formatting a file you only partially
  edited would restyle pre-existing legacy lines you never touched — noise in
  the diff, and a risk of upsetting code outside your change. A brand-new file
  is entirely your own code, so formatting it is safe and self-contained.
  Never run Prettier across the whole repo (`--write .`).
- **Never format the documentation contract files.** `REQUIREMENTS.md`,
  `USER_STORIES.md`, and `ACCEPTANCE_CRITERIA.md` are prose under a freeze
  guard (`.claude/hooks/req-freeze-guard.cjs`); reflowing them would corrupt
  their formatting and be blocked anyway. Restrict formatting to **code
  files** — `*.js`, `*.jsx`, `*.mjs`, `*.cjs`, `*.css`, and `package.json` /
  other `*.json` config. Do **not** pass `*.md` to Prettier.
- **No new dependency.** Use `npx prettier` at runtime; do not add Prettier to
  any `package.json`. There is no committed Prettier config, so this uses
  Prettier's defaults — that's intended.
- **Bump the *revision* (patch) version**, root `package.json` only, with no
  git tag and no auto-commit.
- **Do not touch unrelated pre-existing changes.** If the working tree already
  has modified files that aren't part of the current task (e.g. a stray
  dependency edit), leave them alone — format only the code files genuinely
  changed for the work in progress, and report anything ambiguous rather than
  reformatting it.

## Step 1 — Identify the newly-created code files

List the files this branch **added** (relative to the base branch, usually
`main`) plus any still-untracked new files, then keep only code files. Files
this branch merely *modified* are deliberately excluded (see the core rule
above).

```bash
# newly-created files: staged-as-added + committed-on-branch-as-added + untracked
# — all three, so a file already `git add`ed is still caught. NOT modified legacy files.
{ git diff --cached --name-only --diff-filter=A; \
  git diff --name-only --diff-filter=A main...HEAD; \
  git ls-files --others --exclude-standard; } | sort -u
```

From that list, **keep** paths ending in `.js`, `.jsx`, `.mjs`, `.cjs`,
`.css`, or `.json`, and **drop** everything else — in particular drop
`REQUIREMENTS.md`, `USER_STORIES.md`, `ACCEPTANCE_CRITERIA.md`, any other
`*.md`, and anything under `node_modules/`. Also drop machine-generated
lockfiles (`package-lock.json`, any `*-lock.json`) — `npm` owns their format,
Prettier must not rewrite them. If nothing survives the filter, say so and
skip Step 2's format (still do Step 3).

If the base branch isn't `main`, substitute it (e.g. `git merge-base` against
whatever this branch targets). Because every file in scope is one this branch
created, Prettier reformatting it whole only ever touches your own new code —
never pre-existing legacy lines.

Show the user the filtered list before formatting so the scope is visible.

## Step 2 — Format those files

Run Prettier only on the filtered list (quote each path), e.g.:

```bash
env -u PREFIX -u npm_config_prefix npx --yes prettier --write <path> <path> ...
```

The `env -u PREFIX -u npm_config_prefix` prefix is required in this repo: its
`.env` sets `PREFIX=DEV`, which `npm` otherwise reads as its install prefix,
making `npx` fail with an `ENOENT` on a `.../DEV` path. Clearing those two
vars for just this command avoids it without changing anything else.

Do not run `npx prettier --write .` or pass a glob that would pull in the
whole tree. If a file fails to parse, report it and continue with the rest.

## Step 3 — Bump the revision (patch) version

```bash
npm version patch --no-git-tag-version
```

- This bumps the `version` field in the root `package.json` (and updates the
  lockfile's root version) — e.g. `1.0.1` → `1.0.2`.
- `--no-git-tag-version` ensures it does **not** create a git tag or commit.
- If the command errors (e.g. it objects to the tree state), report the exact
  error and stop rather than working around it.

## Step 4 — Show the result and stop

- Run `git diff --stat` (and `git diff` on `package.json`) so the user sees the
  formatting changes and the version bump.
- Summarize: which files were reformatted, and the old → new version.
- **Stop.** Do not stage, commit, or push. Remind the user that staging and
  committing (only the files relevant to their task, per `GITHUB.md`) is the
  next step they take themselves.
