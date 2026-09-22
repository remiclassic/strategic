# Orbital Command artwork

Original presentation PNGs are preserved here. The numbered originals correspond to the gallery order in src/data/orbital-gallery.ts.

The built-in imagegen tool produced the artwork. Exact prompts and source paths are recorded in docs/orbital-mockup-prompts.json. The cover was used as the visual reference for subsequent screens.

Public WebP files and small thumbnails are in public/images/game-ui/orbital-command. Recreate these derivatives from website/ with:

    node scripts/import-orbital-mockups.mjs docs/orbital-mockup-prompts.json

These are flattened presentation concepts, not editable UI components or engine integrations. See docs/ORBITAL-COMMAND-COVERAGE.md for scope and production handoff.
