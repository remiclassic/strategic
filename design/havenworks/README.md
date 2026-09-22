# Havenworks mockups

Original presentation artwork created with the built-in image tool. Prompt manifest: `../../docs/haven-mockup-prompts.json`.

From `website/`, rebuild optimized images with:

```sh
node scripts/import-haven-mockups.mjs docs/haven-mockup-prompts.json
```

The importer preserves PNG originals and creates full-size WebP previews and 360px thumbnails. See `../../docs/HAVENWORKS-COVERAGE.md` for coverage and production handoff notes.
