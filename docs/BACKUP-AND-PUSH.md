# Original website backup

Before committing the studio/learning rebuild on September 21, 2026, the original remote main commit was preserved:

- Original commit: `6d1c2e1ecb995825c89f50d55146587a8ad9e537`
- Remote: `https://github.com/remiclassic/strategic.git`
- Annotated backup tag: `backup/strategic-sloth-before-rebuild-2026-09-21` (pushed to origin)
- Local full-history Git bundle: `../backups/strategic-sloth-before-rebuild-2026-09-21.bundle` (verified with `git bundle verify`)
- Updated website branch: `codex/studio-learning-rebuild`

To inspect the original without changing the current working tree:

```sh
git worktree add ../strategic-original backup/strategic-sloth-before-rebuild-2026-09-21
```

The configured GitHub Pages workflow deploys on pushes to `main`. Pushing this rebuild branch does not merge it into main or invoke that production workflow.

Pre-push validation: production build (66 pages), tracking verification, migration verification (40 original articles and 24 original checkout URLs), 12 unit tests and 17 browser tests passed. Live checkout availability was also verified for all 24 original URLs without submitting payment.
