# Neon Breach mockups

Original presentation artwork created with the built-in image tool. Prompt manifest: `../../docs/neon-mockup-prompts.json`.

From `website/`, rebuild optimized images with:

```sh
node scripts/import-neon-mockups.mjs docs/neon-mockup-prompts.json
```

The importer preserves existing PNG originals and creates full-size WebP previews plus 360px thumbnails. See `../../docs/NEON-BREACH-COVERAGE.md` for screen coverage and the production handoff.
