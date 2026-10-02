# Live globe demo

The website embeds `demo.html`, which fits the live renderer's 1920×1080
desktop viewport proportionally into the available frame. Keep this wrapper
when rebuilding. Remove the `player-brand` anchor from generated overwatch HTML
to retain the portfolio's neutral branding. Provider credits remain visible.

`public/training/live-globe/overwatch.html` ships the real Cesium cinematic map
prototype from the preserved Project Ares worktree at
`C:/Users/Remi Couture/.codex/worktrees/ftue-backup-review/prototypes/ares-cinematic-map`.
The main Project Ares checkout retains only part of this standalone prototype.

Build from that source directory:

```powershell
npm run build -- --base /training/live-globe/ --outDir 'C:/Users/Remi Couture/Projects/strategicsloth-hub/website/public/training/live-globe'
```

The installed vite-plugin-cesium copies its runtime under an extra
`training/live-globe/cesium` directory inside the output. Move that runtime to
the output's `cesium` directory to match the generated URLs. Preserve the source
`THIRD_PARTY_NOTICES.md` alongside the output. Remove the development-only
`/ftue-export.js` script tag from the generated overwatch HTML.

This is the actual animated frontend prototype, with WebGL globe rendering,
camera flights, module selection, sensor effects, and briefing UI. Its campaign
uses fixture data; it does not connect to production accounts or launch real
training attempts. Live Events and SOC Control retain the original prototype's
links to the development player at localhost:3100. Imagery and optional terrain
come from external providers; their credits remain visible.
