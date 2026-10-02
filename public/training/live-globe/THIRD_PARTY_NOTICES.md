# Third-party notices

The authors of this prototype did **not** create God's Eye View. This prototype adapts a
minimum subset of God's Eye View source under MIT, then replaces product
identity, information architecture, and live-intelligence features with a
cyber range campaign interface.

## God's Eye View (source code)

- Project: [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view)
- Copyright (c) 2026 Bilawal Sidhu
- License: MIT (source code only)

The MIT license covers God's Eye View **source code**. It does **not** cover
bundled datasets, map-provider tiles, 3D models, or third-party assets.

The full MIT text is copied at `src/adapted/LICENSE.gods-eye-view`.

### Adapted source files

These files contain adapted God's Eye View source. Each file keeps a copyright
and permission notice pointing here:

| Prototype file | Source |
| --- | --- |
| `src/adapted/imagery.js` | `src/maps/imagery.js` (Esri / OSM constructors only) |
| `src/adapted/terrain.js` | `src/maps/terrain.js` (keyless Re:Earth / ellipsoid path only) |
| `src/adapted/detection-draw.js` | `src/data/detectionDraw.js` (brackets + acquire fade) |
| `src/adapted/icon-orientation.js` | `src/data/iconOrientation.js` |
| `src/adapted/aircraft-icons.js` | `src/data/aircraftIcons.js` |
| `src/adapted/sharpen.js` | `src/ui/visualPresets.js` (`SHARPEN_SHADER`) |
| `src/adapted/styles/noir.js` | `src/styles/noir.js` |
| `src/adapted/styles/retro.js` | `src/styles/retro.js` |
| `src/adapted/styles/surveillance.js` | `src/styles/surveillance.js` |
| `src/adapted/styles/thermal.js` | `src/styles/thermal.js` |

Patterned after God's Eye View, but written as original code for this
prototype (not a copy):

- `src/viewer.js` — Cesium Viewer chrome / atmosphere values from `src/app/viewer.js`
- `src/effects.js` — post-process stage ownership from `src/ui/visualEffects.js`
- `src/hud.js` — telemetry cadence and banner structure from `src/hud.js`

### Deliberately not copied

- `src/data/local_data/` (including TeleGeography submarine cables)
- `public/models/` and other third-party 3D models
- Live aircraft, ships, earthquakes, CCTV, radio, fires, military-installation,
  public-camera, news, and voice-control modules
- Cesium Ion / Google Photorealistic 3D wiring
- God's Eye View branding, datasets, and provider-key setup

## Runtime providers (not MIT, not redistributed)

Tiles and terrain are fetched at runtime under each provider's terms. This
prototype does not bundle or commit provider data.

- **Esri World Imagery** — ArcGIS Online MapServer. Attribution is shown in
  the credit strip. Terms: Esri / ArcGIS Online.
- **OpenStreetMap** — fallback raster tiles. © OpenStreetMap contributors.
- **Re:Earth Cesium terrain** — keyless mesh at
  `https://terrain.reearth.land/cesium-mesh/ellipsoid`. Falls back to a
  Cesium ellipsoid terrain provider if unavailable.
- **CesiumJS** — Apache-2.0. Used via the `cesium` npm package.
- **OpenSky Network** — live aircraft states, fetched at runtime when the
  operator enables Live flights. Terms: https://opensky-network.org
- **CelesTrak** — NORAD GP element sets, fetched at runtime when Satellites
  is enabled. Terms: https://celestrak.org
- **Where The ISS At** — ISS fallback position if CelesTrak is unreachable.

No API keys are required or committed. Google Photorealistic 3D and Cesium Ion
are not used.

## Original prototype files

Campaign copy, HUD chrome, mission card, trajectory, cinematic descent,
synthetic network reconstruction, and this prototype's Vite shell are
original work for this prototype and are not God's Eye View.
