(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=a(r);fetch(r.href,n)}})();function Oe(){return new Cesium.OpenStreetMapImageryProvider({url:"https://tile.openstreetmap.org/",credit:"© OpenStreetMap contributors"})}function Ie(){return Cesium.ArcGisMapServerImageryProvider.fromUrl("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",{credit:"Powered by Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",enablePickFeatures:!1})}function De(e,t="standard"){if(t==="network"){e.saturation=.28,e.brightness=.42,e.contrast=1.35,e.gamma=.92,e.hue=-.12;return}e.saturation=.52,e.brightness=.88,e.contrast=1.08,e.gamma=1.1,e.hue=-.05}async function Re(){try{return{provider:await Cesium.CesiumTerrainProvider.fromUrl("https://terrain.reearth.land/cesium-mesh/ellipsoid")}}catch(e){return console.warn("[Ares map] Re:Earth terrain unavailable, using ellipsoid terrain:",e),{provider:new Cesium.EllipsoidTerrainProvider}}}async function jt(e,t,{capture:a=!1}={}){const i=Ie().catch(g=>(console.warn("[Ares map] Esri imagery unavailable, using OSM",g),Oe())),r=Re(),n=Math.min(window.devicePixelRatio||1,1.5),o=new Cesium.Viewer(e,{timeline:!1,animation:!1,baseLayerPicker:!1,geocoder:!1,homeButton:!1,sceneModePicker:!1,navigationHelpButton:!1,fullscreenButton:!1,vrButton:!1,selectionIndicator:!1,infoBox:!1,baseLayer:!1,creditContainer:t,msaaSamples:4,contextOptions:{webgl:{preserveDrawingBuffer:a}},terrainProvider:new Cesium.EllipsoidTerrainProvider});o.targetFrameRate=60,o.scene.globe.show=!1,o.scene.skyAtmosphere.show=!0,o.scene.skyAtmosphere.atmosphereLightIntensity=6.5,o.scene.skyAtmosphere.saturationShift=-.32,o.scene.skyAtmosphere.brightnessShift=-.2,o.scene.backgroundColor=Cesium.Color.fromCssColorString("#04070b"),o.scene.globe.baseColor=Cesium.Color.fromCssColorString("#05080c"),o.scene.globe.enableLighting=!1,o.scene.globe.dynamicAtmosphereLighting=!1,o.scene.globe.dynamicAtmosphereLightingFromSun=!1,o.scene.globe.lightingFadeOutDistance=8e4,o.scene.globe.lightingFadeInDistance=28e4,o.scene.globe.atmosphereLightIntensity=4.5,o.scene.globe.atmosphereSaturationShift=-.28,o.scene.globe.atmosphereBrightnessShift=-.18,o.scene.sun&&(o.scene.sun.show=!1),o.scene.sunBloom=!1,o.scene.fog.enabled=!0,o.scene.fog.density=8e-5,o.resolutionScale=n,o.scene.globe.maximumScreenSpaceError=1.25,o.scene.postProcessStages.fxaa&&(o.scene.postProcessStages.fxaa.enabled=!1),o.scene.globe.tileCacheSize=5e3,o.scene.globe.preloadAncestors=!0,o.scene.globe.preloadSiblings=!0,window.addEventListener("resize",()=>o.resize());const c=await i;o.imageryLayers.removeAll();const m=o.imageryLayers.addImageryProvider(c);De(m),o.aresImageryLayer=m,o.scene.globe.show=!0;const u=await r;return o.terrainProvider=u.provider,o.scene.globe.depthTestAgainstTerrain=!0,o.camera.setView({destination:Cesium.Cartesian3.fromDegrees(-86,50,98e5),orientation:{heading:0,pitch:-Cesium.Math.PI_OVER_TWO+.12,roll:0}}),o}const Fe={name:"noir",uniforms:{contrastAmt:{default:1.2,min:0,max:2,label:"Contrast"},grainAmt:{default:.5,min:0,max:1,label:"Grain"},vignetteAmt:{default:.5,min:0,max:1,label:"Vignette"}},fragmentShader:`
    uniform sampler2D colorTexture;
    uniform vec2 colorTextureDimensions;
    uniform float intensity;
    uniform float contrastAmt;
    uniform float grainAmt;
    uniform float vignetteAmt;
    in vec2 v_textureCoordinates;

    void main() {
      vec2 uv = v_textureCoordinates;
      vec4 color = texture(colorTexture, uv);

      // Desaturate
      float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 gray = vec3(luma);
      vec3 desaturated = mix(color.rgb, gray, intensity);

      // High contrast with S-curve (driven by contrastAmt uniform)
      float contrast = 1.0 + contrastAmt * intensity;
      vec3 contrasted = (desaturated - 0.5) * contrast + 0.5;
      contrasted = clamp(contrasted, 0.0, 1.0);

      // Film grain (driven by grainAmt uniform)
      float grain = fract(sin(dot(uv * colorTextureDimensions, vec2(12.9898, 78.233))) * 43758.5453);
      grain = (grain - 0.5) * 0.08 * grainAmt * intensity;
      contrasted += grain;

      // Vignette (driven by vignetteAmt uniform)
      vec2 vigUV = uv * (1.0 - uv);
      float vig = vigUV.x * vigUV.y * 16.0;
      vig = pow(vig, 0.3 + 0.4 * vignetteAmt * intensity);

      // Slight sepia tint for warmth
      vec3 sepia = vec3(
        dot(contrasted, vec3(0.393, 0.769, 0.189)),
        dot(contrasted, vec3(0.349, 0.686, 0.168)),
        dot(contrasted, vec3(0.272, 0.534, 0.131))
      );
      vec3 tinted = mix(contrasted, sepia, 0.15 * intensity);

      vec3 result = tinted * vig;
      out_FragColor = vec4(mix(color.rgb, result, intensity), color.a);
    }
  `},_e={name:"retro",uniforms:{pixelation:{default:5,min:1,max:10,label:"Pixelation"},distortion:{default:0,min:0,max:1,label:"Distortion"},instability:{default:.4,min:0,max:1,label:"Instability"}},fragmentShader:`
    uniform sampler2D colorTexture;
    uniform vec2 colorTextureDimensions;
    uniform float intensity;
    uniform float pixelation;
    uniform float distortion;
    uniform float instability;
    uniform float time;
    in vec2 v_textureCoordinates;

    // ── Hash for noise/randomness ─────────────────────────
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    // 8x8 Bayer dithering matrix (normalized 0-1)
    float bayer8(vec2 pos) {
      ivec2 p = ivec2(mod(pos, 8.0));
      int index = p.x + p.y * 8;
      int bayer[64] = int[64](
         0, 32,  8, 40,  2, 34, 10, 42,
        48, 16, 56, 24, 50, 18, 58, 26,
        12, 44,  4, 36, 14, 46,  6, 38,
        60, 28, 52, 20, 62, 30, 54, 22,
         3, 35, 11, 43,  1, 33,  9, 41,
        51, 19, 59, 27, 49, 17, 57, 25,
        15, 47,  7, 39, 13, 45,  5, 37,
        63, 31, 55, 23, 61, 29, 53, 21
      );
      return float(bayer[index]) / 64.0;
    }

    // CRT barrel distortion
    vec2 barrelDistort(vec2 uv, float strength) {
      vec2 centered = uv * 2.0 - 1.0;
      float r2 = dot(centered, centered);
      float distort = 1.0 + r2 * strength * 0.4;
      centered *= distort;
      return centered * 0.5 + 0.5;
    }

    void main() {
      vec2 uv = v_textureCoordinates;
      vec2 dims = colorTextureDimensions;
      vec2 texel = 1.0 / dims;

      // ── Barrel distortion (CRT monitor bulge) ───────────
      float dist = distortion * intensity;
      vec2 distUV = barrelDistort(uv, dist);

      // Black outside the distorted area
      if (distUV.x < 0.0 || distUV.x > 1.0 || distUV.y < 0.0 || distUV.y > 1.0) {
        out_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // ── Horizontal jitter (random scanline displacement) ──
      float lineY = floor(distUV.y * dims.y);
      float jitterSeed = hash(vec2(lineY, floor(time * 8.0)));
      // Only jitter a few lines at a time (sparse)
      float jitterActive = step(0.97 - instability * 0.04, jitterSeed);
      float jitterAmount = (hash(vec2(lineY * 7.0, floor(time * 12.0))) - 0.5) *
                           0.008 * instability * jitterActive * intensity;
      vec2 jitteredUV = distUV + vec2(jitterAmount, 0.0);

      // ── Chromatic aberration — slight RGB channel offset ──
      vec2 centered = jitteredUV - 0.5;
      float caStrength = length(centered) * 0.008 * intensity;
      float r = texture(colorTexture, jitteredUV + centered * caStrength).r;
      float g = texture(colorTexture, jitteredUV).g;
      float b = texture(colorTexture, jitteredUV - centered * caStrength).b;
      vec4 color = vec4(r, g, b, 1.0);

      // ── Pixelation: snap UV to grid ─────────────────────
      float pixSize = mix(1.0, pixelation, intensity);
      vec2 pixelUV = floor(jitteredUV * dims / pixSize) * pixSize / dims;
      vec4 pixelColor = texture(colorTexture, mix(jitteredUV, pixelUV, intensity));

      // Blend chromatic aberration with pixelated sample
      color = mix(color, pixelColor, 0.7 * intensity);

      // ── Bayer dithering before posterization ────────────
      vec2 ditherCoord = jitteredUV * dims / pixSize;
      float dither = bayer8(ditherCoord) - 0.5;
      float ditherAmount = 0.12 * intensity;
      vec3 dithered = color.rgb + dither * ditherAmount;

      // ── Posterize: reduce color levels ──────────────────
      float levels = mix(256.0, 10.0, intensity);
      vec3 posterized = floor(dithered * levels + 0.5) / levels;

      // ── Slight saturation boost ─────────────────────────
      float gray = dot(posterized, vec3(0.299, 0.587, 0.114));
      vec3 saturated = mix(vec3(gray), posterized, 1.0 + 0.3 * intensity);

      // ── RGB shadow mask subpixel pattern ────────────────
      // Each pixel shows faint R/G/B vertical stripes
      float subpixelX = mod(distUV.x * dims.x, 3.0);
      vec3 subpixelMask = vec3(
        smoothstep(0.0, 0.8, 1.0 - abs(subpixelX - 0.5)),   // R stripe
        smoothstep(0.0, 0.8, 1.0 - abs(subpixelX - 1.5)),   // G stripe
        smoothstep(0.0, 0.8, 1.0 - abs(subpixelX - 2.5))    // B stripe
      );
      // Only apply at higher pixelation (visible "pixels")
      float subpixelStrength = smoothstep(2.0, 6.0, pixSize) * 0.3 * intensity;
      vec3 withSubpixels = mix(saturated, saturated * (subpixelMask * 0.7 + 0.3), subpixelStrength);

      // ── Block edge darkening ────────────────────────────
      vec2 pixelCenter = fract(distUV * dims / pixSize);
      float blockEdge = smoothstep(0.0, 0.08, min(min(pixelCenter.x, 1.0 - pixelCenter.x),
                                                    min(pixelCenter.y, 1.0 - pixelCenter.y)));
      float edgeFactor = mix(1.0, blockEdge * 0.15 + 0.85, intensity);

      vec3 result = withSubpixels * edgeFactor;

      // ── Horizontal scanlines — rolling CRT refresh ──────
      float scanY = distUV.y * dims.y;
      float scanline = sin(scanY * 1.0 + time * 2.5) * 0.5 + 0.5;
      scanline = pow(scanline, 1.5);
      float scanFade = 0.35 * intensity;
      result *= mix(1.0, scanline * scanFade + (1.0 - scanFade), intensity);

      // ── Phosphor persistence / ghosting ─────────────────
      // Approximate by blurring in a direction (simulates previous frame lingering)
      vec3 ghost = texture(colorTexture, jitteredUV - vec2(texel.x * 2.0, 0.0)).rgb;
      float ghostGray = dot(ghost, vec3(0.299, 0.587, 0.114));
      // Blend a dim ghost of the offset sample
      result = mix(result, result + vec3(ghostGray) * 0.08, instability * intensity);

      // ── Flicker (overall brightness fluctuation ~50-60Hz) ──
      float flicker = sin(time * 188.5) * 0.5 + 0.5; // ~60Hz equivalent
      flicker = 1.0 - flicker * 0.03 * instability * intensity; // very subtle
      result *= flicker;

      // ── Glitch lines (rare horizontal bright bars) ──────
      float glitchSeed = hash(vec2(floor(time * 2.0), 0.0));
      float glitchLine = step(0.92 - instability * 0.08, glitchSeed);
      if (glitchLine > 0.0) {
        float glitchY = hash(vec2(floor(time * 2.0), 1.0));
        float glitchHit = smoothstep(0.0, 0.003, abs(distUV.y - glitchY));
        glitchHit = 1.0 - glitchHit;
        result += glitchHit * 0.3 * instability * intensity;
      }

      // ── Warm phosphor tint (P1 green-amber) ─────────────
      vec3 warmTint = result * vec3(1.02, 1.0, 0.94);
      result = mix(result, warmTint, 0.4 * intensity);

      // ── Edge vignette (darker corners — CRT curvature) ──
      vec2 vigUV = distUV * (1.0 - distUV);
      float vig = vigUV.x * vigUV.y * 20.0;
      vig = clamp(pow(vig, 0.25 + 0.15 * intensity), 0.0, 1.0);
      result *= mix(1.0, vig, 0.6 * intensity);

      out_FragColor = vec4(mix(texture(colorTexture, uv).rgb, result, intensity), 1.0);
    }
  `},Ue={name:"surveillance",uniforms:{gain:{default:.55,min:0,max:1,label:"Gain"},bloom:{default:.3,min:0,max:1,label:"Bloom"},scanlineStr:{default:1,min:0,max:1,label:"Scanlines"},pixelation:{default:2.5,min:1,max:6,label:"Pixelation"}},fragmentShader:`
    uniform sampler2D colorTexture;
    uniform vec2 colorTextureDimensions;
    uniform float intensity;
    uniform float time;
    uniform float gain;
    uniform float bloom;
    uniform float scanlineStr;
    uniform float pixelation;
    in vec2 v_textureCoordinates;

    // ── Noise functions ───────────────────────────────────
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    float valueNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // ── Barrel distortion (NVG lens) ──────────────────────
    vec2 barrelDistort(vec2 uv, float strength) {
      vec2 c = uv * 2.0 - 1.0;
      float r2 = dot(c, c);
      float distort = 1.0 + r2 * strength * 0.5 + r2 * r2 * strength * 0.15;
      c *= distort;
      return c * 0.5 + 0.5;
    }

    // ── Honeycomb pattern (fiber optic plate texture) ─────
    float honeycomb(vec2 uv) {
      vec2 dims = colorTextureDimensions;
      float scale = min(dims.x, dims.y) * 0.008;
      vec2 p = uv * dims * scale;
      // Hex grid
      vec2 r = vec2(1.0, 1.732);
      vec2 h = r * 0.5;
      vec2 a = mod(p, r) - h;
      vec2 b = mod(p - h, r) - h;
      vec2 gv = dot(a, a) < dot(b, b) ? a : b;
      float d = max(abs(gv.x), abs(gv.y * 0.577 + abs(gv.x) * 0.5));
      return smoothstep(0.4, 0.45, d);
    }

    // ── 7-segment digit renderer ──────────────────────────
    float segment(vec2 p, int seg) {
      float s = 0.0;
      if (seg == 0) s = step(0.2, p.x) * step(p.x, 0.8) * step(0.85, p.y) * step(p.y, 1.0);
      if (seg == 1) s = step(0.7, p.x) * step(p.x, 0.9) * step(0.5, p.y) * step(p.y, 0.95);
      if (seg == 2) s = step(0.7, p.x) * step(p.x, 0.9) * step(0.05, p.y) * step(p.y, 0.5);
      if (seg == 3) s = step(0.2, p.x) * step(p.x, 0.8) * step(0.0, p.y) * step(p.y, 0.15);
      if (seg == 4) s = step(0.1, p.x) * step(p.x, 0.3) * step(0.05, p.y) * step(p.y, 0.5);
      if (seg == 5) s = step(0.1, p.x) * step(p.x, 0.3) * step(0.5, p.y) * step(p.y, 0.95);
      if (seg == 6) s = step(0.2, p.x) * step(p.x, 0.8) * step(0.42, p.y) * step(p.y, 0.58);
      return s;
    }

    float digit(vec2 p, int d) {
      int masks[10] = int[10](0x7E, 0x30, 0x6D, 0x79, 0x33, 0x5B, 0x5F, 0x70, 0x7F, 0x7B);
      int m = masks[d];
      float s = 0.0;
      for (int i = 0; i < 7; i++) {
        if ((m >> (6 - i) & 1) == 1) s += segment(p, i);
      }
      return clamp(s, 0.0, 1.0);
    }

    // Render HH:MM:SS timestamp
    float renderTimestamp(vec2 uv) {
      vec2 tsOrigin = vec2(0.02, 0.03);
      vec2 tsSize = vec2(0.22, 0.035);
      vec2 p = (uv - tsOrigin) / tsSize;
      if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 0.0;

      int totalSec = int(mod(time, 86400.0));
      int hours = totalSec / 3600;
      int minutes = (totalSec % 3600) / 60;
      int seconds = totalSec % 60;

      float charWidth = 1.0 / 8.5;
      int charIdx = int(p.x / charWidth);
      float localX = mod(p.x, charWidth) / charWidth;
      vec2 localP = vec2(localX, p.y);

      int dv = -1;
      if (charIdx == 0) dv = hours / 10;
      else if (charIdx == 1) dv = hours % 10;
      else if (charIdx == 2) return (step(0.3, localP.x) * step(localP.x, 0.7)) *
                                    (step(0.2, localP.y) * step(localP.y, 0.4) + step(0.6, localP.y) * step(localP.y, 0.8));
      else if (charIdx == 3) dv = minutes / 10;
      else if (charIdx == 4) dv = minutes % 10;
      else if (charIdx == 5) return (step(0.3, localP.x) * step(localP.x, 0.7)) *
                                    (step(0.2, localP.y) * step(localP.y, 0.4) + step(0.6, localP.y) * step(localP.y, 0.8));
      else if (charIdx == 6) dv = seconds / 10;
      else if (charIdx == 7) dv = seconds % 10;

      if (dv < 0 || dv > 9) return 0.0;
      return digit(localP, dv);
    }

    // ── Crosshair (thin, subtle NVG reticle) ──────────────
    float crosshair(vec2 uv) {
      vec2 c = uv - 0.5;
      float h = smoothstep(0.001, 0.0004, abs(c.y)) *
                step(0.01, abs(c.x)) * step(abs(c.x), 0.025);
      float v = smoothstep(0.001, 0.0004, abs(c.x)) *
                step(0.01, abs(c.y)) * step(abs(c.y), 0.025);
      return clamp(h + v, 0.0, 1.0);
    }

    void main() {
      vec2 uv = v_textureCoordinates;
      vec2 dims = colorTextureDimensions;
      vec2 texel = 1.0 / dims;

      // ── Barrel distortion (NVG lens distortion) ─────────
      float dist = 0.5 * intensity;
      vec2 distUV = barrelDistort(uv, dist);

      // ── Circular vignette mask (NVG tube field of view) ──
      vec2 centered = uv * 2.0 - 1.0;
      float aspect = dims.x / dims.y;
      centered.x *= aspect;
      float radius = length(centered);
      float tubeMask = pow(1.0 - smoothstep(0.6, 1.05, radius), 0.7);
      // Tube brightness falloff (center brightest)
      float tubeShading = 1.0 - radius * radius * 0.3;
      tubeShading = max(tubeShading, 0.0);

      // If outside tube, render black
      if (tubeMask < 0.001) {
        out_FragColor = vec4(vec3(0.0), 1.0);
        return;
      }

      // Black outside distorted area
      if (distUV.x < 0.0 || distUV.x > 1.0 || distUV.y < 0.0 || distUV.y > 1.0) {
        out_FragColor = vec4(vec3(0.0), 1.0);
        return;
      }

      // ── Intensifier tube resolution pixelation ────────────
      float pixSize = mix(1.0, pixelation, intensity);
      vec2 snappedUV = floor(distUV * dims / pixSize) * pixSize / dims;
      distUV = mix(distUV, snappedUV, intensity);

      vec4 original = texture(colorTexture, distUV);

      // ── Luminance ───────────────────────────────────────
      float luma = dot(original.rgb, vec3(0.299, 0.587, 0.114));

      // ── Auto-gain response ──────────────────────────────
      // Higher gain = more amplification, more noise, more bloom
      float gainLevel = mix(0.8, 2.5, gain);
      float amplified = clamp(luma * gainLevel, 0.0, 1.0);

      // Slight contrast curve for gain response
      amplified = pow(amplified, mix(1.2, 0.7, gain));

      // ── Intensifier tube bloom (THE key NVG visual) ─────
      // Bloom around bright sources — wider kernel for realistic halos
      float bloomAccum = 0.0;
      float bloomW = 0.0;
      for (int y = -5; y <= 5; y++) {
        for (int x = -5; x <= 5; x++) {
          vec2 offset = vec2(float(x), float(y)) * texel * 4.0;
          float sLuma = dot(texture(colorTexture, distUV + offset).rgb, vec3(0.299, 0.587, 0.114));
          float bright = smoothstep(0.4, 0.9, sLuma * gainLevel);
          float w = exp(-float(x * x + y * y) / 18.0);
          bloomAccum += bright * w;
          bloomW += w;
        }
      }
      bloomAccum /= bloomW;

      // Edge glow / corona on bright objects
      float corona = bloomAccum * bloom * 1.5;

      // ── P43 phosphor green (530nm) ──────────────────────
      vec3 phosphor = vec3(0.16, 1.0, 0.22);
      vec3 nvgColor = phosphor * (amplified + corona);

      // ── Scintillation (image intensifier sparkle noise) ──
      // Base tube grain (slow, coherent)
      vec2 grainCoord = uv * 120.0 + vec2(time * 0.5, time * 0.3);
      float tubeGrain = valueNoise(grainCoord);
      tubeGrain = (tubeGrain - 0.5) * mix(0.06, 0.2, gain) * intensity;
      nvgColor += phosphor * tubeGrain;

      // More noise in dark areas (real gain response)
      float darkNoise = (1.0 - amplified) * hash(uv * dims + vec2(time * 200.0, time * 300.0));
      nvgColor += phosphor * darkNoise * 0.08 * gain * intensity;

      // ── Honeycomb fiber optic plate ─────────────────────
      float hc = honeycomb(distUV);
      nvgColor *= 1.0 - hc * 0.04 * intensity; // very subtle

      // ── Scanlines (subtle, from the display) ────────────
      float scanline = sin(distUV.y * dims.y * 1.2 + time * 2.0) * 0.5 + 0.5;
      scanline = pow(scanline, 2.5);
      nvgColor *= 1.0 - scanline * scanlineStr * 0.15 * intensity;

      // ── Tube shading (brightness falloff from center) ───
      nvgColor *= tubeShading;

      // ── Circular vignette (dark edges, NVG tube shape) ──
      nvgColor *= tubeMask;

      // ── HUD Overlay ─────────────────────────────────────

      // Top-left: "NVG" / "I²" label marker
      vec2 labelArea = (uv - vec2(0.03, 0.92)) / vec2(0.06, 0.03);
      if (labelArea.x >= 0.0 && labelArea.x <= 1.0 && labelArea.y >= 0.0 && labelArea.y <= 1.0) {
        float lbl = step(0.1, labelArea.x) * step(labelArea.x, 0.9) *
                    step(0.2, labelArea.y) * step(labelArea.y, 0.8);
        nvgColor += phosphor * lbl * 0.3 * intensity;
      }

      // Gain indicator below label: "AUTO" marker
      vec2 gainArea = (uv - vec2(0.03, 0.88)) / vec2(0.05, 0.025);
      if (gainArea.x >= 0.0 && gainArea.x <= 1.0 && gainArea.y >= 0.0 && gainArea.y <= 1.0) {
        float gLbl = step(0.1, gainArea.x) * step(gainArea.x, 0.9) *
                     step(0.2, gainArea.y) * step(gainArea.y, 0.8);
        nvgColor += phosphor * gLbl * 0.2 * intensity;
      }

      // Center crosshair (thin, subtle)
      float ch = crosshair(uv);
      nvgColor += phosphor * ch * 0.4 * intensity;

      // Bottom-left: Timestamp (7-segment)
      float ts = renderTimestamp(uv);
      nvgColor += phosphor * ts * 0.6 * intensity;

      // REC indicator — top-right (blinking)
      vec2 recPos = uv - vec2(0.95, 0.94);
      float recDot = smoothstep(0.008, 0.004, length(recPos));
      float blink = step(0.5, fract(time * 0.8));
      // REC dot in slightly warmer green
      nvgColor += vec3(0.3, 1.0, 0.2) * recDot * blink * intensity;

      // ── Final composite ─────────────────────────────────
      nvgColor = clamp(nvgColor, 0.0, 1.0);

      // Keep NVG output fully tube-masked at full intensity to avoid color bleed at the lens edge.
      vec3 finalColor = mix(original.rgb, nvgColor * tubeMask, intensity);

      out_FragColor = vec4(finalColor, 1.0);
    }
  `},Ve={name:"thermal",uniforms:{sensitivity:{default:.75,min:0,max:1,label:"Sensitivity"},bloom:{default:.65,min:0,max:1,label:"Bloom"},mode:{default:0,min:0,max:1,label:"WHOT/BHOT"},pixelation:{default:1.5,min:1,max:6,label:"Pixelation"},palette:{default:0,min:0,max:1,label:"Ironbow"}},fragmentShader:`
    uniform sampler2D colorTexture;
    uniform vec2 colorTextureDimensions;
    uniform float intensity;
    uniform float time;
    uniform float sensitivity;
    uniform float bloom;
    uniform float mode;
    uniform float pixelation;
    uniform float palette;
    in vec2 v_textureCoordinates;

    // ── Ironbow "Predator" thermal palette ────────────────
    // Maps a 0-1 temperature to the classic FLIR ironbow ramp:
    // black -> deep purple -> magenta -> red -> orange -> yellow -> white.
    vec3 ironbow(float t) {
      t = clamp(t, 0.0, 1.0);
      const vec3 c0 = vec3(0.0, 0.0, 0.0);     // cold
      const vec3 c1 = vec3(0.13, 0.0, 0.30);   // deep purple
      const vec3 c2 = vec3(0.49, 0.0, 0.45);   // magenta
      const vec3 c3 = vec3(0.86, 0.10, 0.18);  // red
      const vec3 c4 = vec3(1.0, 0.55, 0.0);    // orange
      const vec3 c5 = vec3(1.0, 0.91, 0.32);   // yellow
      const vec3 c6 = vec3(1.0, 1.0, 1.0);     // hot (white)
      float s = t * 6.0;
      if (s < 1.0) return mix(c0, c1, s);
      if (s < 2.0) return mix(c1, c2, s - 1.0);
      if (s < 3.0) return mix(c2, c3, s - 2.0);
      if (s < 4.0) return mix(c3, c4, s - 3.0);
      if (s < 5.0) return mix(c4, c5, s - 4.0);
      return mix(c5, c6, s - 5.0);
    }

    // ── Value noise (coherent, smooth, drifting) ──────────
    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    float valueNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f); // smoothstep interpolation
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Fractal Brownian motion for layered coherent noise
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      for (int i = 0; i < 4; i++) {
        v += a * valueNoise(p);
        p = p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    // ── 7-segment digit renderer ──────────────────────────
    float segment(vec2 p, int seg) {
      float s = 0.0;
      if (seg == 0) s = step(0.2, p.x) * step(p.x, 0.8) * step(0.85, p.y) * step(p.y, 1.0);
      if (seg == 1) s = step(0.7, p.x) * step(p.x, 0.9) * step(0.5, p.y) * step(p.y, 0.95);
      if (seg == 2) s = step(0.7, p.x) * step(p.x, 0.9) * step(0.05, p.y) * step(p.y, 0.5);
      if (seg == 3) s = step(0.2, p.x) * step(p.x, 0.8) * step(0.0, p.y) * step(p.y, 0.15);
      if (seg == 4) s = step(0.1, p.x) * step(p.x, 0.3) * step(0.05, p.y) * step(p.y, 0.5);
      if (seg == 5) s = step(0.1, p.x) * step(p.x, 0.3) * step(0.5, p.y) * step(p.y, 0.95);
      if (seg == 6) s = step(0.2, p.x) * step(p.x, 0.8) * step(0.42, p.y) * step(p.y, 0.58);
      return s;
    }

    float digit(vec2 p, int d) {
      int masks[10] = int[10](0x7E, 0x30, 0x6D, 0x79, 0x33, 0x5B, 0x5F, 0x70, 0x7F, 0x7B);
      int m = masks[d];
      float s = 0.0;
      for (int i = 0; i < 7; i++) {
        if ((m >> (6 - i) & 1) == 1) s += segment(p, i);
      }
      return clamp(s, 0.0, 1.0);
    }

    // Render a character (digit, '.', or '°') at position
    float renderChar(vec2 p, int ch) {
      if (ch == 10) { // '.' decimal point
        return smoothstep(0.15, 0.0, length(p - vec2(0.5, 0.08)));
      }
      if (ch == 11) { // '°' degree symbol
        float ring = abs(length(p - vec2(0.5, 0.82)) - 0.08);
        return smoothstep(0.04, 0.02, ring);
      }
      if (ch >= 0 && ch <= 9) return digit(p, ch);
      return 0.0;
    }

    // ── Crosshair ─────────────────────────────────────────
    float crosshair(vec2 uv) {
      vec2 c = uv - 0.5;
      float h = smoothstep(0.0015, 0.0005, abs(c.y)) *
                step(0.015, abs(c.x)) * step(abs(c.x), 0.04);
      float v = smoothstep(0.0015, 0.0005, abs(c.x)) *
                step(0.015, abs(c.y)) * step(abs(c.y), 0.04);
      return clamp(h + v, 0.0, 1.0);
    }

    // ── Scale bar (right edge) ────────────────────────────
    float scaleBar(vec2 uv) {
      // Vertical bar on right edge
      float barX = step(0.94, uv.x) * step(uv.x, 0.955);
      float barY = step(0.15, uv.y) * step(uv.y, 0.85);
      return barX * barY;
    }

    void main() {
      vec2 uv = v_textureCoordinates;
      vec2 dims = colorTextureDimensions;
      vec2 texel = 1.0 / dims;
      vec2 hudUV = uv; // preserve original UV for HUD overlay

      // ── Circular vignette mask (FLIR optics field of view) ──
      vec2 centered = uv * 2.0 - 1.0;
      float aspect = dims.x / dims.y;
      centered.x *= aspect;
      float radius = length(centered);
      float lensMask = pow(1.0 - smoothstep(0.6, 1.05, radius), 0.7);
      // Tube brightness falloff (center brightest)
      float lensShading = 1.0 - radius * radius * 0.25;
      lensShading = max(lensShading, 0.0);

      // If outside lens, render black
      if (lensMask < 0.001) {
        out_FragColor = vec4(vec3(0.0), 1.0);
        return;
      }

      // ── Sensor resolution pixelation (authentic FLIR resolution limits) ──
      float pixSize = mix(1.0, pixelation, intensity);
      vec2 snappedUV = floor(uv * dims / pixSize) * pixSize / dims;
      uv = mix(uv, snappedUV, intensity);

      // ── Soft IR blur (thermal cameras have lower resolution / diffraction) ──
      vec3 blurred = vec3(0.0);
      float totalWeight = 0.0;
      for (int y = -2; y <= 2; y++) {
        for (int x = -2; x <= 2; x++) {
          float w = exp(-0.5 * float(x * x + y * y) / 2.0);
          blurred += texture(colorTexture, uv + vec2(float(x), float(y)) * texel * 1.5).rgb * w;
          totalWeight += w;
        }
      }
      blurred /= totalWeight;
      vec4 original = texture(colorTexture, uv);

      // Mix between sharp and blurred based on intensity
      vec3 src = mix(original.rgb, blurred, 0.6 * intensity);

      // ── Luminance → temperature mapping ─────────────────
      float luma = dot(src, vec3(0.299, 0.587, 0.114));

      // Sensitivity remaps the luminance range
      float sens = mix(0.25, 1.0, sensitivity);
      float temp = clamp((luma - (0.5 - sens * 0.5)) / sens, 0.0, 1.0);

      // ── Temperature banding (contour lines) ─────────────
      float bands = 12.0;
      float bandLine = abs(fract(temp * bands) - 0.5);
      float contour = smoothstep(0.04, 0.06, bandLine);
      temp *= mix(1.0, contour * 0.85 + 0.15, 0.3 * intensity);

      // ── White-Hot / Black-Hot mode ──────────────────────
      float isBlackHot = step(0.5, mode);
      float thermal = mix(temp, 1.0 - temp, isBlackHot);

      // Monochrome FLIR (white/black-hot) vs Ironbow "Predator" color ramp.
      // Ironbow maps TRUE temperature (cold->dark, hot->white) so the colors
      // read correctly regardless of the WHOT/BHOT toggle.
      vec3 mono = vec3(thermal);
      vec3 iron = ironbow(temp);
      vec3 thermalColor = mix(mono, iron, palette);

      // ── Hot-spot bloom/bleed ────────────────────────────
      // Sample a wider area for bloom on bright spots
      float bloomSample = 0.0;
      float bloomWeight = 0.0;
      for (int y = -4; y <= 4; y++) {
        for (int x = -4; x <= 4; x++) {
          vec2 offset = vec2(float(x), float(y)) * texel * 3.0;
          float sLuma = dot(texture(colorTexture, uv + offset).rgb, vec3(0.299, 0.587, 0.114));
          float sMapped = clamp((sLuma - (0.5 - sens * 0.5)) / sens, 0.0, 1.0);
          float sFinal = mix(sMapped, 1.0 - sMapped, isBlackHot);
          float w = exp(-0.5 * float(x * x + y * y) / 8.0);
          // Only bloom the "hot" pixels (bright in WHOT, dark values in BHOT...
          // but since we already inverted, just bloom high values)
          float hotness = smoothstep(0.6, 1.0, sFinal);
          bloomSample += hotness * w;
          bloomWeight += w;
        }
      }
      bloomSample /= bloomWeight;
      thermalColor += bloomSample * bloom * 0.8;

      // ── Coherent temporal noise (slowly drifting, cloud-like) ──
      vec2 noiseCoord = uv * 80.0 + vec2(time * 0.3, time * 0.2);
      float noise = fbm(noiseCoord);
      noise = (noise - 0.5) * 0.08 * intensity;
      thermalColor += noise;

      // ── Subtle motion blur feel (slight blur) ───────────
      // Already handled by the initial IR blur above

      // ── HUD Overlay ─────────────────────────────────────
      float hud = 0.0;

      // Top-left: "FLIR" label + mode indicator
      // Rendered as simple box presence markers (not full text rendering)
      // We'll use a simplified approach: render mode text near top-left
      vec2 labelArea = (hudUV - vec2(0.02, 0.92)) / vec2(0.08, 0.04);
      if (labelArea.x >= 0.0 && labelArea.x <= 1.0 && labelArea.y >= 0.0 && labelArea.y <= 1.0) {
        // Simple horizontal bar as "FLIR" label marker
        hud += step(0.1, labelArea.x) * step(labelArea.x, 0.9) *
               step(0.3, labelArea.y) * step(labelArea.y, 0.7) * 0.6;
      }

      // Mode indicator below label
      vec2 modeArea = (hudUV - vec2(0.02, 0.88)) / vec2(0.06, 0.03);
      if (modeArea.x >= 0.0 && modeArea.x <= 1.0 && modeArea.y >= 0.0 && modeArea.y <= 1.0) {
        hud += step(0.1, modeArea.x) * step(modeArea.x, 0.9) *
               step(0.2, modeArea.y) * step(modeArea.y, 0.8) * 0.4;
      }

      // Center crosshair
      hud += crosshair(hudUV) * 0.7;

      // Top-right: simulated temperature readout (derived from center luminance)
      float centerLuma = dot(texture(colorTexture, vec2(0.5)).rgb, vec3(0.299, 0.587, 0.114));
      float tempC = 20.0 + centerLuma * 30.0; // 20°C to 50°C range
      int tempInt = int(tempC);
      int tempDec = int(fract(tempC) * 10.0);

      // Temperature digits at top-right
      float tempHud = 0.0;
      vec2 tempOrigin = vec2(0.88, 0.92);
      vec2 charSize = vec2(0.018, 0.035);
      float spacing = 0.02;

      // Tens digit
      vec2 d1p = (hudUV - tempOrigin) / charSize;
      if (d1p.x >= 0.0 && d1p.x <= 1.0 && d1p.y >= 0.0 && d1p.y <= 1.0) {
        tempHud += renderChar(d1p, tempInt / 10);
      }
      // Ones digit
      vec2 d2p = (hudUV - (tempOrigin + vec2(spacing, 0.0))) / charSize;
      if (d2p.x >= 0.0 && d2p.x <= 1.0 && d2p.y >= 0.0 && d2p.y <= 1.0) {
        tempHud += renderChar(d2p, tempInt % 10);
      }
      // Decimal point
      vec2 dpp = (hudUV - (tempOrigin + vec2(spacing * 2.0, 0.0))) / charSize;
      if (dpp.x >= 0.0 && dpp.x <= 1.0 && dpp.y >= 0.0 && dpp.y <= 1.0) {
        tempHud += renderChar(dpp, 10); // '.'
      }
      // Decimal digit
      vec2 d3p = (hudUV - (tempOrigin + vec2(spacing * 2.6, 0.0))) / charSize;
      if (d3p.x >= 0.0 && d3p.x <= 1.0 && d3p.y >= 0.0 && d3p.y <= 1.0) {
        tempHud += renderChar(d3p, tempDec);
      }
      // Degree symbol
      vec2 dgp = (hudUV - (tempOrigin + vec2(spacing * 3.5, 0.0))) / charSize;
      if (dgp.x >= 0.0 && dgp.x <= 1.0 && dgp.y >= 0.0 && dgp.y <= 1.0) {
        tempHud += renderChar(dgp, 11); // '°'
      }
      hud += tempHud * 0.8;

      // Bottom-right: frame counter
      int frame = int(mod(time * 30.0, 10000.0));
      float framHud = 0.0;
      vec2 fOrigin = vec2(0.88, 0.04);
      for (int i = 0; i < 4; i++) {
        int dv = (frame / int(pow(10.0, float(3 - i)))) % 10;
        vec2 fp = (hudUV - (fOrigin + vec2(float(i) * spacing, 0.0))) / charSize;
        if (fp.x >= 0.0 && fp.x <= 1.0 && fp.y >= 0.0 && fp.y <= 1.0) {
          framHud += renderChar(fp, dv);
        }
      }
      hud += framHud * 0.5;

      // Scale bar (right edge gradient)
      float bar = scaleBar(hudUV);
      if (bar > 0.0) {
        float barGrad = (hudUV.y - 0.15) / 0.7; // 0 at bottom, 1 at top
        float barVal = mix(barGrad, 1.0 - barGrad, isBlackHot);
        thermalColor = mix(thermalColor, vec3(barVal), bar * 0.9);
      }

      // Composite HUD (rendered in white, slightly transparent)
      float hudBright = mix(1.0, 0.0, isBlackHot); // HUD is white in WHOT, dark in BHOT inverted
      // Actually, HUD should always be visible — use contrast
      thermalColor += hud * 0.6 * intensity;

      // ── Lens shading + vignette ───────────────────
      thermalColor *= lensShading;
      thermalColor *= lensMask;

      // Clamp final
      thermalColor = clamp(thermalColor, 0.0, 1.0);

      // Blend with original based on intensity, then fade to black at lens edges
      vec3 finalColor = mix(original.rgb, thermalColor, intensity);
      finalColor *= mix(1.0, lensMask, intensity);

      out_FragColor = vec4(finalColor, 1.0);
    }
  `},Be={fragmentShader:`
    uniform sampler2D colorTexture;
    uniform vec2 colorTextureDimensions;
    uniform float intensity;
    uniform float time;
    in vec2 v_textureCoordinates;

    float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    void main() {
      vec2 uv = v_textureCoordinates;
      vec2 texel = 1.0 / max(colorTextureDimensions, vec2(1.0));
      vec3 src = texture(colorTexture, uv).rgb;
      float center = luma(src);

      float gx = 0.0;
      float gy = 0.0;
      gx += luma(texture(colorTexture, uv + vec2(-texel.x, -texel.y)).rgb) * -1.0;
      gx += luma(texture(colorTexture, uv + vec2( texel.x, -texel.y)).rgb) *  1.0;
      gx += luma(texture(colorTexture, uv + vec2(-texel.x,  0.0)).rgb) * -2.0;
      gx += luma(texture(colorTexture, uv + vec2( texel.x,  0.0)).rgb) *  2.0;
      gx += luma(texture(colorTexture, uv + vec2(-texel.x,  texel.y)).rgb) * -1.0;
      gx += luma(texture(colorTexture, uv + vec2( texel.x,  texel.y)).rgb) *  1.0;
      gy += luma(texture(colorTexture, uv + vec2(-texel.x, -texel.y)).rgb) * -1.0;
      gy += luma(texture(colorTexture, uv + vec2( 0.0, -texel.y)).rgb) * -2.0;
      gy += luma(texture(colorTexture, uv + vec2( texel.x, -texel.y)).rgb) * -1.0;
      gy += luma(texture(colorTexture, uv + vec2(-texel.x,  texel.y)).rgb) *  1.0;
      gy += luma(texture(colorTexture, uv + vec2( 0.0,  texel.y)).rgb) *  2.0;
      gy += luma(texture(colorTexture, uv + vec2( texel.x,  texel.y)).rgb) *  1.0;
      float edge = clamp(length(vec2(gx, gy)) * 1.35, 0.0, 1.0);
      edge = pow(smoothstep(0.08, 0.42, edge), 0.72);

      float land = smoothstep(0.11, 0.28, center) * (1.0 - smoothstep(0.58, 0.78, center));
      float ocean = 1.0 - smoothstep(0.07, 0.2, center);
      float coast = edge * mix(0.35, 1.0, ocean);

      vec2 cell = floor(uv * colorTextureDimensions * 0.42);
      float n = hash(cell);
      float coastal = smoothstep(0.12, 0.7, coast);
      float city = step(mix(0.993, 0.9, coastal), n) * land;
      float hub = step(0.991, n) * land;
      float alert = step(0.9974, hash(cell + 19.0)) * land;
      float scan = 0.64 + 0.36 * sin(uv.y * colorTextureDimensions.y * 2.2);
      float raster = mix(0.78, 1.0, step(0.5, fract(uv.y * colorTextureDimensions.y * 0.55)));
      float grain = hash(uv * colorTextureDimensions) * 0.03;

      vec3 oceanCol = vec3(0.0, 0.008, 0.028);
      vec3 ground = vec3(0.0, 0.01, 0.024);
      vec3 cyan = vec3(0.28, 0.78, 1.0);
      vec3 light = vec3(0.52, 0.88, 1.0);
      vec3 core = vec3(0.82, 0.96, 1.0);
      vec3 red = vec3(0.95, 0.18, 0.22);

      vec3 night = mix(oceanCol, ground, land * 0.28);
      night += cyan * coast * 2.05;
      night += cyan * edge * ocean * 0.55;
      night += light * city * (0.55 + 0.45 * n);
      night += core * hub * 2.4;
      night += red * alert * 2.2;
      night = night * scan * raster + grain;

      float globe = smoothstep(0.018, 0.07, center + edge * 0.35);
      vec3 result = mix(src, night, intensity * globe);
      out_FragColor = vec4(result, 1.0);
    }
  `},He=`
  uniform sampler2D colorTexture;
  uniform vec2 colorTextureDimensions;
  uniform float amount;
  in vec2 v_textureCoordinates;

  void main() {
    vec2 uv = v_textureCoordinates;
    vec2 texel = 1.0 / colorTextureDimensions;
    vec4 center = texture(colorTexture, uv);
    vec4 blur = (
      texture(colorTexture, uv + vec2(-texel.x, -texel.y)) +
      texture(colorTexture, uv + vec2( 0.0,     -texel.y)) +
      texture(colorTexture, uv + vec2( texel.x, -texel.y)) +
      texture(colorTexture, uv + vec2(-texel.x,  0.0))     +
      center +
      texture(colorTexture, uv + vec2( texel.x,  0.0))     +
      texture(colorTexture, uv + vec2(-texel.x,  texel.y)) +
      texture(colorTexture, uv + vec2( 0.0,      texel.y)) +
      texture(colorTexture, uv + vec2( texel.x,  texel.y))
    ) / 9.0;
    vec4 sharpened = center + (center - blur) * amount;
    out_FragColor = vec4(clamp(sharpened.rgb, 0.0, 1.0), center.a);
  }
`,Pe=`
uniform sampler2D colorTexture;
uniform vec2 colorTextureDimensions;
uniform sampler2D maskRegional;
uniform sampler2D maskObjective;
uniform sampler2D maskScan;
uniform sampler2D maskTransition;
uniform sampler2D texFine;
uniform sampler2D texHeavy;
uniform sampler2D texPrint;
uniform sampler2D texExposure;
uniform sampler2D texSignal;
uniform sampler2D texEdge;
uniform float intensity;
uniform float desaturate;
uniform float splitTone;
uniform float terrainContrast;
uniform float grainAmt;
uniform float scanAmt;
uniform float chromaPx;
uniform float tearAmt;
uniform float vignetteAmt;
uniform float posterize;
uniform float bloomAmt;
uniform float crush;
uniform float split;
uniform float time;
uniform float targetU;
uniform float targetV;
uniform float plateMisalign;
uniform float regionalOpacity;
uniform float objectiveOpacity;
uniform float scanOpacity;
uniform float overlayStrength;
uniform float fineAmt;
uniform float heavyAmt;
uniform float printAmt;
uniform float exposureAmt;
uniform float edgeAmt;
uniform float driftAmt;
uniform float signalAmt;
uniform float signalCell;
uniform float reducedFx;
uniform float plateDebug;
uniform float transitionAmt;
uniform float layoutCompact;
uniform float u_cameraAltitudeKm;
in vec2 v_textureCoordinates;

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

// Matches altitudeWeights() in JS — keep both copies in lockstep.
float hermite(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float altGrade(float km) {
  float k = max(km, 0.0);
  if (k >= 6000.0) return mix(0.40, 0.36, hermite(6000.0, 18000.0, k));
  if (k >= 2000.0) return mix(0.46, 0.40, hermite(2000.0, 6000.0, k));
  if (k >= 750.0) return mix(0.52, 0.46, hermite(750.0, 2000.0, k));
  if (k >= 250.0) return mix(0.58, 0.52, hermite(250.0, 750.0, k));
  return mix(0.62, 0.58, hermite(15.0, 250.0, k));
}

float maskAt(sampler2D tex, vec2 local) {
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) return 0.0;
  return texture(tex, vec2(local.x, 1.0 - local.y)).r;
}

float maskStroke(sampler2D tex, vec2 local) {
  float m = maskAt(tex, local);
  float e = abs(m - maskAt(tex, local + vec2(0.006, 0.0)))
    + abs(m - maskAt(tex, local + vec2(-0.006, 0.0)))
    + abs(m - maskAt(tex, local + vec2(0.0, 0.007)))
    + abs(m - maskAt(tex, local + vec2(0.0, -0.007)));
  return smoothstep(0.16, 0.72, e);
}

float plateShadow(sampler2D tex, vec2 local) {
  float here = maskAt(tex, local);
  float behind = maskAt(tex, local - vec2(0.0032, 0.0044));
  return behind * (1.0 - here);
}

vec2 innerDisk(vec2 uv, vec2 drift, float zoom) {
  return clamp((uv - 0.5) * zoom + 0.5 + drift, 0.18, 0.82);
}

vec3 softLight(vec3 base, vec3 blend) {
  vec3 low = 2.0 * base * blend;
  vec3 high = vec3(1.0) - 2.0 * (vec3(1.0) - base) * (vec3(1.0) - blend);
  return mix(low, high, step(0.5, blend));
}

vec3 screenBlend(vec3 base, vec3 blend) {
  return vec3(1.0) - (vec3(1.0) - base) * (vec3(1.0) - blend);
}

vec3 gradeBase(vec3 sampled) {
  float L = luma(sampled);
  vec3 graded = mix(sampled, vec3(L), desaturate);
  vec3 shadow = vec3(0.05, 0.09, 0.12);
  vec3 mid = vec3(0.22, 0.36, 0.38);
  vec3 bone = vec3(0.74, 0.73, 0.68);
  vec3 olive = vec3(0.32, 0.36, 0.24);
  vec3 tone = mix(shadow, mid, smoothstep(0.12, 0.55, L));
  tone = mix(tone, bone, smoothstep(0.58, 0.92, L));
  tone = mix(tone, olive, 0.08 * (1.0 - abs(L - 0.38) * 2.4));
  graded = mix(graded, tone, splitTone);
  graded = (graded - 0.5) * (1.0 + terrainContrast) + 0.5;
  graded = pow(max(graded, 0.0), vec3(1.0 + crush * 0.22));
  return clamp(graded, 0.0, 1.0);
}

vec3 gradeRegional(vec3 sampled) {
  float L = luma(sampled);
  vec3 cool = vec3(L * 0.58 + 0.08, L * 0.76 + 0.1, L * 0.88 + 0.12);
  return clamp((cool - 0.5) * 1.02 + 0.46, 0.0, 1.0);
}

vec3 gradeObjective(vec3 sampled) {
  vec3 sharp = (sampled - 0.5) * 1.28 + 0.52;
  float L = luma(sharp);
  vec3 warm = mix(vec3(L), sharp, 0.64);
  warm = mix(warm, warm * vec3(1.1, 1.0, 0.82), 0.2);
  return clamp(warm, 0.0, 1.0);
}

vec3 gradeScan(vec3 sampled) {
  float L = luma(sampled);
  vec3 topo = mix(vec3(L), vec3(0.18, 0.36, 0.28), 0.55);
  topo = (topo - 0.5) * 1.65 + 0.5;
  float band = abs(fract(L * 14.0) - 0.5);
  topo += (1.0 - smoothstep(0.0, 0.08, band)) * 0.07 * vec3(0.45, 0.7, 0.62);
  return clamp(topo, 0.0, 1.0);
}

// Full-framebuffer remap. Detection uses ref luma/chroma; never a tile UV box.
vec3 treatSurface(vec3 c, vec3 ref) {
  float L = luma(ref);
  float spaceW = 1.0 - smoothstep(0.012, 0.078, L);
  float edge = fwidth(L);

  float greenDom = c.g - max(c.r, c.b);
  float veg = smoothstep(0.018, 0.11, greenDom)
    * (1.0 - smoothstep(0.82, 0.96, L))
    * (1.0 - spaceW);
  vec3 vegMuted = mix(vec3(0.16, 0.18, 0.17), vec3(0.30, 0.32, 0.22), smoothstep(0.18, 0.52, L));
  vec3 vegDesat = mix(c, vec3(luma(c)), 0.56);
  c = mix(c, mix(vegDesat, vegMuted, 0.42), veg);

  float cyanBias = ref.b - ref.r * 0.70;
  float limb = smoothstep(0.50, 0.78, L)
    * smoothstep(0.035, 0.15, cyanBias)
    * smoothstep(0.03, 0.14, edge);
  vec3 rim = mix(vec3(L), vec3(0.70, 0.82, 0.88), 0.35) * 0.68;
  c = mix(c, rim, limb * 0.26);

  float blueDom = c.b - max(c.r, c.g * 0.88);
  float coast = smoothstep(0.05, 0.16, edge);
  float water = smoothstep(0.035, 0.14, blueDom)
    * smoothstep(0.16, 0.36, L)
    * (1.0 - smoothstep(0.58, 0.80, L))
    * (1.0 - limb)
    * (1.0 - coast)
    * (1.0 - spaceW);
  vec3 petroleum = vec3(0.05, 0.08, 0.11);
  c = mix(c, mix(petroleum, c * vec3(0.42, 0.58, 0.66), 0.38), water * 0.62);

  float ice = smoothstep(0.78, 0.96, L) * (1.0 - water) * (1.0 - limb);
  c = mix(c, c * vec3(0.78, 0.82, 0.84), ice * 0.5);
  c = mix(c, mix(c, vec3(L), 0.12), spaceW);
  return clamp(c, 0.0, 1.0);
}

float plateEdge(vec2 local, vec2 atlasOrigin, vec2 atlasSize) {
  float rim = 1.0 - smoothstep(0.0, 0.14, min(min(local.x, 1.0 - local.x), min(local.y, 1.0 - local.y)));
  vec2 uv = atlasOrigin + local * atlasSize;
  return texture(texEdge, clamp(uv, atlasOrigin, atlasOrigin + atlasSize)).r * rim;
}

float boxBorder(vec2 local) {
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) return 0.0;
  float e = min(min(local.x, 1.0 - local.x), min(local.y, 1.0 - local.y));
  return 1.0 - smoothstep(0.0, 0.012, e);
}

void main() {
  vec2 uv = v_textureCoordinates;
  vec2 texel = 1.0 / colorTextureDimensions;
  vec4 src = texture(colorTexture, uv);

  if (split > 0.001 && uv.x < split) {
    out_FragColor = src;
    return;
  }

  float tearLine = fract(time * 0.17);
  float tear = (1.0 - smoothstep(0.0, 0.012, abs(uv.y - tearLine))) * tearAmt;
  vec2 displaced = uv + vec2(tear * 0.012, 0.0);
  vec2 chroma = vec2(chromaPx, 0.0) * texel;
  vec3 sampled = vec3(
    texture(colorTexture, displaced - chroma).r,
    texture(colorTexture, displaced).g,
    texture(colorTexture, displaced + chroma).b
  );

  float km = u_cameraAltitudeKm;
  float srcL = luma(src.rgb);
  float waterish = smoothstep(0.02, 0.12, src.b - src.r);
  float spaceW = hermite(2500.0, 7000.0, km)
    * (1.0 - smoothstep(0.008, 0.045, srcL))
    * (1.0 - waterish);
  float texAlive = 1.0 - spaceW;
  float grade = altGrade(km);
  float regionalGate = 1.0 - hermite(15.0, 22.0, km);
  float objectiveGate = 1.0 - hermite(15.0, 22.0, km);
  float scanGate = 1.0 - hermite(15.0, 22.0, km);
  float printScale = 1.0 - hermite(15.0, 22.0, km);
  float fineScale = 1.0 - hermite(15.0, 22.0, km);
  float mixAmt = clamp(grade * (intensity / 0.56) * overlayStrength, 0.0, 1.0);
  vec3 treated = treatSurface(sampled, src.rgb);
  float focus = 1.0 - smoothstep(0.12, 0.55, length((uv - vec2(targetU, targetV)) * vec2(1.15, 1.05)));
  float localFocus = 1.0 - hermite(600.0, 4200.0, km);
  vec3 inked = mix(treated, gradeBase(treated), 0.42 + mixAmt * 0.58);
  vec3 scene = mix(src.rgb, inked, clamp(0.62 + mixAmt * 0.38, 0.0, 1.0));
  scene = mix(scene, (scene - 0.5) * 0.82 + 0.46, (1.0 - focus) * 0.22 * texAlive * localFocus);
  scene *= mix(1.0, mix(0.82, 1.0, 0.34 + 0.66 * focus), texAlive * localFocus);

  vec2 drift = vec2(time * 0.0022, -time * 0.0014) * driftAmt;
  if (reducedFx < 0.5) {
    vec3 printC = texture(texPrint, innerDisk(uv, drift * 0.22, 0.48)).rgb;
    scene = mix(scene, softLight(scene, printC), printAmt * 0.32 * printScale * texAlive);

    vec2 cloudUv = innerDisk(uv, drift * 0.4, 0.42);
    float cloud = luma(texture(texExposure, cloudUv).rgb);
    scene *= mix(1.0, 0.76 + cloud * 0.38, exposureAmt * printScale * texAlive);

    vec3 fine = texture(texFine, innerDisk(uv, drift, 0.46)).rgb;
    scene = mix(scene, screenBlend(scene, fine), fineAmt * fineScale * texAlive);

    if (heavyAmt > 0.01) {
      vec3 heavy = texture(texHeavy, innerDisk(uv, drift * 0.3, 0.5)).rgb;
      scene = mix(scene, screenBlend(scene, heavy), heavyAmt * texAlive);
    }
  }

  vec2 tu = vec2(clamp(targetU, 0.2, 0.78), clamp(targetV, 0.22, 0.78));
  float shift = plateMisalign * 0.05;
  float compact = clamp(layoutCompact, 0.0, 1.0);
  vec2 para = vec2(targetU - 0.5, targetV - 0.5);

  vec2 r0 = mix(vec2(0.028 + shift, 0.44), vec2(0.02 + shift, 0.48), compact);
  vec2 r1 = mix(vec2(0.222 + shift, 0.596), vec2(0.17 + shift, 0.60), compact);
  vec2 rLocal = (uv - r0) / max(r1 - r0, vec2(0.001));
  float rMask = maskAt(maskRegional, rLocal);
  float rAmt = regionalOpacity * regionalGate;
  if (rMask > 0.02 && rAmt > 0.01) {
    vec2 rSrc = tu + (rLocal - 0.5) * 0.56 + para * 0.018 + texel * vec2(2.0, -1.0);
    vec3 plate = gradeRegional(texture(colorTexture, clamp(rSrc, 0.0, 1.0)).rgb);
    plate = mix(plate, softLight(plate, texture(texPrint, innerDisk(rSrc, drift * 0.3, 0.5)).rgb), 0.11);
    float cloud = luma(texture(texExposure, innerDisk(rSrc, drift * 0.5, 0.44)).rgb);
    plate *= mix(1.0, 0.86 + cloud * 0.2, exposureAmt * 0.85);
    if (edgeAmt > 0.02 && reducedFx < 0.5) {
      plate = mix(plate, plate * 0.42, plateEdge(rLocal, vec2(0.02, 0.70), vec2(0.42, 0.10)) * edgeAmt * 0.72);
    }
    float fadeDark = mix(0.42, 1.0, smoothstep(0.1, 0.4, luma(plate)));
    float plateLive = smoothstep(0.05, 0.14, luma(plate));
    float rCover = rMask * rAmt * fadeDark * plateLive;
    scene *= 1.0 - plateShadow(maskRegional, rLocal) * 0.16 * regionalGate;
    float rStroke = maskStroke(maskRegional, rLocal) * regionalGate;
    scene = mix(scene, vec3(0.04, 0.07, 0.09), rStroke * 0.45);
    scene = mix(scene, plate, rCover);
    scene = mix(scene, plate * vec3(0.62, 0.88, 0.94), rStroke * 0.22);
  }

  float travel = plateMisalign > 0.05 ? mix(0.22, 0.38, plateMisalign) : 0.25;
  vec2 s0 = vec2(0.05, travel);
  vec2 s1 = vec2(0.37, travel + mix(0.08, 0.07, compact));
  vec2 sLocal = (uv - s0) / max(s1 - s0, vec2(0.001));
  float sMask = maskAt(maskScan, sLocal);
  float sAmt = scanOpacity * scanGate;
  if (sMask > 0.02 && sAmt > 0.01) {
    vec2 sSrc = tu + (sLocal - 0.5) * vec2(0.48, 0.12) + para * 0.01;
    vec3 plate = gradeScan(texture(colorTexture, clamp(sSrc, 0.0, 1.0)).rgb);
    if (edgeAmt > 0.02 && reducedFx < 0.5) {
      plate = mix(plate, plate * 0.5, plateEdge(sLocal, vec2(0.04, 0.56), vec2(0.38, 0.07)) * edgeAmt * 0.55);
    }
    float sStroke = maskStroke(maskScan, sLocal) * scanGate;
    scene = mix(scene, vec3(0.05, 0.08, 0.07), sStroke * 0.4);
    scene = mix(scene, plate, sMask * sAmt);
  }

  vec2 o0 = mix(vec2(0.42 - shift * 0.22, 0.38), vec2(0.36 - shift * 0.16, 0.39), compact);
  vec2 o1 = mix(vec2(0.658 - shift * 0.22, 0.622), vec2(0.60 - shift * 0.16, 0.61), compact);
  vec2 oLocal = (uv - o0) / max(o1 - o0, vec2(0.001));

  if (transitionAmt > 0.02) {
    vec2 tOff = vec2(0.04, 0.05) * max(plateMisalign, 0.08);
    vec2 t0 = o0 + tOff;
    vec2 t1 = o1 + tOff * vec2(1.12, 0.9);
    vec2 tLocal = (uv - t0) / max(t1 - t0, vec2(0.001));
    float tMask = maskAt(maskTransition, tLocal);
    if (tMask > 0.02) {
      vec2 tSrc = tu + (tLocal - 0.5) * 0.17 + tOff * 0.35;
      vec3 plate = gradeObjective(texture(colorTexture, clamp(tSrc, 0.0, 1.0)).rgb);
      plate = mix(plate, gradeRegional(plate), 0.28);
      scene = mix(scene, plate, tMask * transitionAmt);
    }
  }

  float oMask = maskAt(maskObjective, oLocal);
  float dissolve = mix(0.72, 1.0, smoothstep(0.0, 0.2, oLocal.x * 0.7 + oLocal.y * 0.3));
  oMask *= dissolve;
  float gap = 1.0 - smoothstep(0.0, 0.01, abs(oLocal.y - 0.41));
  oMask *= 1.0 - gap * 0.9 * step(0.18, oLocal.x) * step(oLocal.x, 0.8);
  float broken = step(0.78, oLocal.x) * step(0.0, 0.18 - oLocal.y);
  oMask *= 1.0 - broken * 0.88;
  float oAmt = objectiveOpacity * objectiveGate;
  if (oMask > 0.02 && oAmt > 0.01) {
    vec2 oSrc = tu + (oLocal - 0.5) * 0.22 + para * 0.008 + texel * vec2(1.0, -1.0);
    vec3 n1 = texture(colorTexture, clamp(oSrc + texel * 1.1, 0.0, 1.0)).rgb;
    vec3 n2 = texture(colorTexture, clamp(oSrc - texel * 1.1, 0.0, 1.0)).rgb;
    vec3 tight = texture(colorTexture, clamp(oSrc, 0.0, 1.0)).rgb * 1.16 - (n1 + n2) * 0.08;
    vec3 plate = gradeObjective(tight);
    plate = mix(plate, softLight(plate, texture(texPrint, innerDisk(oSrc, drift * 0.18, 0.46)).rgb), 0.16);
    if (edgeAmt > 0.02 && reducedFx < 0.5) {
      float corner = texture(texEdge, vec2(0.06 + oLocal.x * 0.18, 0.34 + (1.0 - oLocal.y) * 0.16)).r;
      plate = mix(plate, plate * 0.38, corner * edgeAmt * step(0.6, oLocal.x));
    }
    scene *= 1.0 - plateShadow(maskObjective, oLocal) * 0.2 * objectiveGate;
    float oStroke = maskStroke(maskObjective, oLocal) * objectiveGate;
    scene = mix(scene, vec3(0.03, 0.04, 0.05), oStroke * 0.55);
    float plateLive = smoothstep(0.05, 0.14, luma(plate));
    scene = mix(scene, plate, oMask * oAmt * plateLive);
    scene = mix(scene, plate * vec3(1.06, 0.94, 0.74), oStroke * 0.28);
  }

  if (signalAmt > 0.02 && reducedFx < 0.5) {
    float col = mod(signalCell, 4.0);
    float row = floor(signalCell / 4.0);
    vec2 cellUv = (vec2(fract(uv.x), fract(uv.y * 2.4)) + vec2(col, 3.0 - row)) * 0.25;
    float loss = texture(texSignal, cellUv).r;
    scene *= 1.0 - loss * signalAmt * 0.55;
  }

  if (plateDebug > 0.5) {
    scene = mix(scene, vec3(0.15, 0.85, 0.95), boxBorder(rLocal) * 0.95);
    scene = mix(scene, vec3(0.95, 0.72, 0.28), boxBorder(oLocal) * 0.95);
    scene = mix(scene, vec3(0.72, 0.42, 0.92), boxBorder(sLocal) * 0.95);
  }

  float limbEdge = smoothstep(0.02, 0.08, srcL)
    * (1.0 - smoothstep(0.16, 0.34, srcL))
    * smoothstep(0.012, 0.08, fwidth(srcL));
  scene = mix(scene, vec3(0.48, 0.66, 0.74), limbEdge * hermite(1800.0, 9000.0, u_cameraAltitudeKm) * 0.32);

  scene += (fract(sin(dot(uv * colorTextureDimensions, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * grainAmt;
  scene *= 1.0 - scanAmt * (0.5 + 0.5 * sin(uv.y * colorTextureDimensions.y * 3.14159));
  float vig = smoothstep(0.22, 1.08, length((uv - vec2(0.5, 0.46)) * vec2(1.08, 1.18)));
  scene *= 1.0 - vig * vignetteAmt;

  out_FragColor = vec4(clamp(scene, 0.0, 1.0), src.a);
}
`;function ge(e){const t=document.createElement("canvas");t.width=1,t.height=1;const a=t.getContext("2d");return a.fillStyle=e,a.fillRect(0,0,1,1),t}const M=ge("#000"),se=ge("#888"),ve={maskRegional:M,maskObjective:M,maskScan:M,maskTransition:M,texFine:M,texHeavy:M,texPrint:se,texExposure:se,texSignal:M,texEdge:M};function Ge(e){return Math.min(1,Math.max(0,e))}function S(e,t,a){const i=Ge((a-e)/(t-e));return i*i*(3-2*i)}function F(e,t,a){return e+(t-e)*a}function Nt(e){const t=Math.max(0,+e||0);let a;return t>=6e3?a=F(.4,.36,S(6e3,18e3,t)):t>=2e3?a=F(.46,.4,S(2e3,6e3,t)):t>=750?a=F(.52,.46,S(750,2e3,t)):t>=250?a=F(.58,.52,S(250,750,t)):a=F(.62,.58,S(15,250,t)),{grade:a,regionalGate:1-S(15,22,t),objectiveGate:1-S(15,22,t),scanGate:1-S(15,22,t),printScale:1-S(15,22,t),fineScale:1-S(15,22,t)}}const je={u_cameraAltitudeKm:15,intensity:.56,desaturate:.68,splitTone:.56,terrainContrast:.24,grainAmt:.014,scanAmt:.008,chromaPx:.22,tearAmt:.03,vignetteAmt:.5,posterize:.24,bloomAmt:0,crush:.16,split:0,targetU:.5,targetV:.48,plateMisalign:0,regionalOpacity:.38,objectiveOpacity:.8,scanOpacity:.22,overlayStrength:1,fineAmt:.042,heavyAmt:0,printAmt:.16,exposureAmt:.11,edgeAmt:.27,driftAmt:1,signalAmt:0,signalCell:0,reducedFx:0,plateDebug:0,transitionAmt:0,layoutCompact:0},zt={objective:{y0:.38,x1:.658,y1:.622}},Wt={intensity:.56,tearAmt:.36,chromaPx:.7},Ne={noir:Fe,retro:_e,surveillance:Ue,thermal:Ve},le=new Set(Object.keys(ve));class qt{constructor(t){this.viewer=t,this.stages={},this.active="noir",this.sharpenStage=null,this.packBound=!1;for(const[i,r]of Object.entries(Ne)){const n={intensity:0};r.fragmentShader.includes("uniform float time")&&(n.time=0);for(const[c,m]of Object.entries(r.uniforms||{}))n[c]=m.default;const o=new Cesium.PostProcessStage({name:`ares_${i}`,fragmentShader:r.fragmentShader,uniforms:n});o.enabled=!1,t.scene.postProcessStages.add(o),this.stages[i]=o}this.sharpenStage=new Cesium.PostProcessStage({name:"ares_sharpen",fragmentShader:He,uniforms:{amount:.42}}),this.sharpenStage.enabled=!0,t.scene.postProcessStages.add(this.sharpenStage),this.textures={...ve};const a={...je,time:0};for(const i of le)a[i]=()=>this.textures[i];this.reconStage=new Cesium.PostProcessStage({name:"ares_reconstruction",fragmentShader:Pe,uniforms:a}),this.reconStage.enabled=!1,t.scene.postProcessStages.add(this.reconStage),this.networkStage=new Cesium.PostProcessStage({name:"ares_network",fragmentShader:Be.fragmentShader,uniforms:{intensity:0,time:0}}),this.networkStage.enabled=!1,t.scene.postProcessStages.add(this.networkStage),this.globeTheme="standard",this.setStyle("noir",.55)}bindTextures(t){Object.assign(this.textures,t);for(const[a,i]of Object.entries(t))this.reconStage.uniforms[a]!==void 0&&(this.reconStage.uniforms[a]=i)}setStyle(t,a=.7){if(this.active=t,this.globeTheme==="network"){this.viewer.scene.requestRender();return}for(const[i,r]of Object.entries(this.stages)){const n=i===t;r.enabled=n,n&&(r.uniforms.intensity=a)}this.viewer.scene.requestRender()}setSharpen(t){this.sharpenStage.uniforms.amount=t,this.sharpenStage.enabled=t>.02}setReconstruction(t,a={}){if(this.globeTheme==="network"){this.reconStage.enabled=!1,this.applyRecon(a);return}if(this.reconStage.enabled=t,t)for(const i of Object.values(this.stages))i.enabled=!1;this.applyRecon(a)}applyRecon(t){for(const[a,i]of Object.entries(t))le.has(a)||this.reconStage.uniforms[a]!==void 0&&(this.reconStage.uniforms[a]=i)}setGlobeTheme(t,a=1){this.globeTheme=t==="network"?"network":"standard";const i=this.globeTheme==="network"&&a>.01;if(this.networkStage.enabled=i,this.networkStage.uniforms.intensity=i?a:0,i){for(const r of Object.values(this.stages))r.enabled=!1;this.reconStage.enabled=!1}this.viewer.scene.requestRender()}tick(t){const a=t*.001;for(const i of Object.values(this.stages))i.enabled&&i.uniforms.time!==void 0&&(i.uniforms.time=a);this.reconStage.enabled&&(this.reconStage.uniforms.time=a),this.networkStage.enabled&&(this.networkStage.uniforms.time=a)}}const b={lon:-76.2884,lat:36.8496},ze=[{id:1,title:"Network Defense 101",minutes:45,status:"available",lon:-76.2884,lat:36.8496,place:"Norfolk",difficulty:"Beginner",objective:"Investigate a simulated breach and configure firewall rules."},{id:2,title:"Traffic Baseline",minutes:40,status:"available",lon:139.638,lat:35.4437,place:"Yokohama",difficulty:"Beginner",objective:"Establish a clean traffic baseline on a Pacific port exchange."},{id:3,title:"Perimeter Mapping",minutes:40,status:"available",lon:-105.2835,lat:40.0164,place:"Boulder",difficulty:"Beginner",objective:"Map the Circadence office perimeter at 1900 9th Street and mark every external entry."},{id:4,title:"Packet Analysis",minutes:45,status:"locked",lon:-.1278,lat:51.5074,place:"London"},{id:5,title:"Endpoint Inspection",minutes:40,status:"locked",lon:21.0122,lat:52.2297,place:"Warsaw"},{id:6,title:"Intrusion Trace",minutes:45,status:"locked",lon:55.2708,lat:25.2048,place:"Dubai"},{id:7,title:"Evidence Collection",minutes:40,status:"locked",lon:72.8777,lat:19.076,place:"Mumbai"},{id:8,title:"Timeline Reconstruction",minutes:40,status:"locked",lon:103.8198,lat:1.3521,place:"Singapore"},{id:9,title:"Lateral Movement",minutes:45,status:"locked",lon:151.2093,lat:-33.8688,place:"Sydney"},{id:10,title:"Command Channel",minutes:40,status:"locked",lon:174.7633,lat:-36.8485,place:"Auckland"},{id:11,title:"Host Isolation",minutes:40,status:"locked",lon:-157.8583,lat:21.3069,place:"Honolulu"},{id:12,title:"Persistence Hunt",minutes:45,status:"locked",lon:-99.1332,lat:19.4326,place:"Mexico City"},{id:13,title:"Containment Drill",minutes:40,status:"locked",lon:-47.8825,lat:-15.7942,place:"Brasilia"},{id:14,title:"Perimeter Hardening",minutes:40,status:"locked",lon:3.3792,lat:6.5244,place:"Lagos"},{id:15,title:"Response Exercise",minutes:50,status:"locked",lon:-9.1393,lat:38.7223,place:"Lisbon"}],Yt=[{id:"WP-01",lon:b.lon,lat:b.lat,primary:!0},{id:"WP-12",lon:b.lon+.11,lat:b.lat-.02,primary:!1}];function Kt(e){const t=ze.filter(i=>Number.isFinite(i.lon)&&Number.isFinite(i.lat));if(!e)return t[0];const a=t.findIndex(i=>i.id===e);return a<0?t[0]:t[a+1]??t[a]}const Xt={level:"Level 2 — Initiate",path:"Long Campaign"},We=3200,L={t:1,mix:.56,misalign:0,ring:0,regional:.12,objective:.1,scan:.22,heavy:0,panel:1,tear:0,event:-1,transition:0,edge:.18,exposure:.08,intel:1,resolve:1};function O(e,t,a=.82,i=.08){return Math.floor(e*t)%5===3?i:a}function $t({reduced:e,onStep:t,onDone:a,holdSec:i=0}){if(e)return t(L),a(),()=>{};const r=performance.now();let n=0,o=!1;const c=m=>{if(o)return;const u=m-r,g=Math.min(1,u/We),l=u/1e3,s={t:g,mix:.56,misalign:0,ring:1,regional:0,objective:0,scan:0,heavy:0,panel:0,intel:0,resolve:0,tear:0,event:-1,transition:0,edge:.14,exposure:.11};if(l<.2)s.mix=.42,s.exposure=.03,s.edge=.1;else if(l<.44)s.mix=.58,s.regional=O(l,16,.42,.05),s.misalign=1,s.exposure=.1;else if(l<.78)s.mix=.64,s.regional=O(l,16,.4,.06),s.scan=O(l,14,.62,.08),s.misalign=1,l>=.56&&(s.tear=1,s.event=3);else if(l<1.12)s.mix=.68,s.regional=.4,s.scan=.3,s.misalign=1,s.transition=O(l,18,.86,.1),s.objective=O(l,20,.4,.04),l>=.92&&(s.tear=.9,s.event=11);else if(l<1.32)s.mix=.9,s.regional=.36,s.scan=.26,s.objective=.48,s.misalign=1,s.transition=.78,s.heavy=.13,s.exposure=.28,s.tear=.55,s.edge=.22;else if(l<1.52)s.mix=.72,s.regional=.38,s.scan=.24,s.objective=O(l,18,.7,.12),s.misalign=Math.max(0,1-(l-1.32)*3.4),s.transition=Math.max(0,.62-(l-1.32)*3.1),s.edge=.3,s.exposure=.14;else if(l<1.62)s.mix=.62,s.regional=.38,s.scan=.24,s.objective=.8,s.misalign=0,s.transition=0,s.edge=.27,s.exposure=.11,s.ring=1;else if(l<2.28){const v=Math.min(1,(l-1.62)/.55);s.mix=.6,s.regional=.38-.26*v,s.scan=.24,s.objective=.8-.7*v,s.edge=.27-.09*v,s.exposure=.11,s.transition=v<.7?O(l,16,.55,.08):0,s.tear=v<.55?.35:.08,s.ring=Math.max(0,1-(l-1.72)/.2),s.resolve=1,s.intel=1}else l<2.72?(s.mix=.56,s.regional=L.regional,s.scan=L.scan,s.objective=L.objective,s.edge=L.edge,s.exposure=L.exposure,s.ring=0,s.resolve=1,s.intel=1,s.panel=Math.min(1,(l-2.28)/.28)):Object.assign(s,L,{t:g,ring:0,panel:1});t(s),!(i>0&&l>=i)&&(g<1?n=requestAnimationFrame(c):a())};return n=requestAnimationFrame(c),()=>{o=!0,cancelAnimationFrame(n),t(L),a()}}function qe(e,t=2200){return new Promise(a=>{const i=e.scene.globe,r=performance.now();let n=0,o=0,c=-1,m=!1;const u=()=>{m||(m=!0,window.clearTimeout(s),i.tileLoadProgressEvent.removeEventListener(g),e.scene.postRender.removeEventListener(l),a())},g=v=>{c=v},l=()=>{if(n+=1,n<3)return;o=c===0||c<0&&i.tilesLoaded?o+1:0,(o>=2||performance.now()-r>=t)&&u()},s=window.setTimeout(u,t+80);i.tileLoadProgressEvent.addEventListener(g),e.scene.postRender.addEventListener(l),e.scene.requestRender()})}const Ye=7600,J=48,U=-24,Z=Cesium.Math.toRadians(60),ee=Cesium.Math.toRadians(44),ce=1,Ke=1.85;let I=b.lon,D=b.lat,k=0,E=!1;const Xe=2.45,$e=1.55,Qe=2.65;function Je(e,t){I=e,D=t}function Qt(){return E}function Jt(){return{lon:I,lat:D}}function he(e,t){const a=e.lat*Math.PI/180,i=t.lat*Math.PI/180,r=i-a,n=(t.lon-e.lon)*Math.PI/180,o=Math.sin(r/2)**2+Math.cos(a)*Math.cos(i)*Math.sin(n/2)**2;return 2*Math.asin(Math.min(1,Math.sqrt(o)))*180/Math.PI}function Ze(e,t,a){const i=Math.min(1,Math.max(0,(a-e)/(t-e)));return i*i*(3-2*i)}function Zt(e){const t=1-Ze(18,420,e);return ce+(Ke-ce)*t}function ea(e,{reducedMotion:t=!1,onPhase:a}={}){return t?(a==null||a("identify"),a==null||a("tactical"),ye(e,{reducedMotion:!0}).then(()=>a==null?void 0:a("locked"))):(a==null||a("identify"),Ce(e,{duration:Xe,onMid:()=>a==null?void 0:a("descend"),onNear:()=>a==null?void 0:a("tactical")}).then(()=>a==null?void 0:a("locked")))}function te(e){e.camera.frustum.fov!==void 0&&(e.camera.frustum.fov=Z)}function et(e,t=I,a=D){const i=Cesium.Cartographic.fromDegrees(t,a),r=e.scene.globe.getHeight(i);return Number.isFinite(r)?r:0}function ae(e,t=I,a=D){const i=e.scene.verticalExaggeration||1;return Math.max(Ye,et(e,t,a)*i+4200)}const q=80;function xe(e,t=U,a=q){const i=Math.sin(Math.abs(Cesium.Math.toRadians(t)));return i<.08?e:(e-a)/i}function X(){return Cesium.Cartesian3.fromDegrees(I,D,q)}function tt(e,t,a){const i=Cesium.Math.clamp(t,-Cesium.Math.PI_OVER_TWO,Cesium.Math.PI_OVER_TWO),r=Cesium.Math.zeroToTwoPi(e)-Cesium.Math.PI_OVER_TWO,n=Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Y,-i),o=Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z,-r),c=Cesium.Quaternion.multiply(o,n,new Cesium.Quaternion),m=Cesium.Matrix3.fromQuaternion(c),u=Cesium.Matrix3.multiplyByVector(m,Cesium.Cartesian3.UNIT_X,new Cesium.Cartesian3);return Cesium.Cartesian3.negate(u,u),Cesium.Cartesian3.multiplyByScalar(u,a,u)}function at(e,t){const a=Cesium.Transforms.eastNorthUpToFixedFrame(t),i=Cesium.Matrix4.inverseTransformation(a,new Cesium.Matrix4);return Cesium.Matrix4.multiplyByPoint(i,e,new Cesium.Cartesian3)}function it(e,t,a,i=new Cesium.Cartesian3){return Cesium.Cartesian3.lerp(e,t,a,i)}function me(e,t,a){const i=Cesium.Cartesian3.lerp(e,t,a,new Cesium.Cartesian3),r=Cesium.Cartesian3.magnitude(i);return r<1e-8?Cesium.Cartesian3.clone(t,i):Cesium.Cartesian3.divideByScalar(i,r,i)}function be(e,t=Cesium.Math.toRadians(J)){return{target:X(),heading:t,pitch:Cesium.Math.toRadians(U),range:xe(ae(e),U,q)}}function ue(e,t=Cesium.Math.toRadians(J)){const a=be(e,t);e.camera.lookAt(a.target,new Cesium.HeadingPitchRange(a.heading,a.pitch,a.range)),e.camera.frustum.fov!==void 0&&(e.camera.frustum.fov=ee)}function ta(e){ke(),E=!1,e.camera.cancelFlight(),e.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)}function ye(e,{duration:t=2.6,reducedMotion:a=!1}={}){const i=Cesium.Math.toRadians(J);if(a||t<.08)return ue(e,i),Promise.resolve();const r=e.camera,n=be(e,i),o=Cesium.Transforms.eastNorthUpToFixedFrame(n.target),c=at(r.positionWC,n.target),m=tt(n.heading,n.pitch,n.range),u=Cesium.Cartesian3.clone(r.directionWC),g=Cesium.Cartesian3.clone(r.upWC),l=Cesium.Matrix4.multiplyByPoint(o,m,new Cesium.Cartesian3),s=Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(n.target,l,new Cesium.Cartesian3),new Cesium.Cartesian3),v=Cesium.Cartesian3.normalize(Cesium.Matrix4.multiplyByPointAsVector(Cesium.Transforms.eastNorthUpToFixedFrame(l),Cesium.Cartesian3.UNIT_Z,new Cesium.Cartesian3),new Cesium.Cartesian3),y=r.frustum.fov??Z,T=t*1e3,f=performance.now(),p=k+=1;E=!0,r.cancelFlight();const d=()=>{p===k&&(E=!1)};return new Promise(x=>{const h=A=>{if(p!==k){d(),x();return}const C=Math.min(1,(A-f)/T),w=C*C*(3-2*C);r.setView({destination:Cesium.Matrix4.multiplyByPoint(o,it(c,m,w),new Cesium.Cartesian3),orientation:{direction:me(u,s,w),up:me(g,v,w)}}),r.frustum.fov!==void 0&&(r.frustum.fov=y+(ee-y)*w),C<1?window.requestAnimationFrame(h):(ue(e,i),d(),x())};window.requestAnimationFrame(h)})}function aa(e,t,{reducedMotion:a=!1,onPhase:i}={}){const r={lon:I,lat:D};if(te(e),Je(t.lon,t.lat),a)return i==null||i("tactical"),ye(e,{reducedMotion:!0}).then(()=>i==null?void 0:i("locked"));const n=he(r,t),o=Math.min(Qe,Math.max($e,n/48)),c=Math.min(58e5,Math.max(28e4,n*38e3));return i==null||i("identify"),Ce(e,{duration:o,peakExtra:c,onMid:()=>i==null?void 0:i("descend"),onNear:()=>i==null?void 0:i("tactical")}).then(()=>i==null?void 0:i("locked"))}function Ce(e,{duration:t,peakExtra:a=0,onMid:i,onNear:r}={}){const n=e.camera;n.cancelFlight();const o=k+=1;E=!0;const c=Cesium.Cartographic.fromCartesian(n.positionWC),m=n.heading,u=n.pitch,g=n.roll??0,l=c.longitude,s=c.latitude,v=Cesium.Math.toRadians(I),y=Cesium.Math.toRadians(D),T=Cesium.Math.negativePiToPi(v-l),f=y-s,p=Math.max(c.height,400),d=ae(e),x=Math.log(p),h=Math.log(Math.max(d,400));let A=!1,C=!1;const w=performance.now(),Y=Math.max(.08,t)*1e3,oe=()=>{o===k&&(E=!1)},ne=(B,H,K)=>{n.setView({destination:Cesium.Cartesian3.fromRadians(B,H,K),orientation:{heading:m,pitch:u,roll:g}})};return new Promise(B=>{const H=K=>{if(o!==k){oe(),B();return}const R=Math.min(1,(K-w)/Y),P=R*R*(3-2*R);!A&&R>=.28&&(A=!0,i==null||i()),!C&&R>=.72&&(C=!0,r==null||r());const Ee=Math.exp(x+(h-x)*P)+Math.sin(Math.PI*P)*a;ne(l+T*P,s+f*P,Ee),R<1?window.requestAnimationFrame(H):(ne(v,y,d),oe(),B())};window.requestAnimationFrame(H)})}const V={height:98e5,pitch:Cesium.Math.toDegrees(-Cesium.Math.PI_OVER_TWO+.12)};function ie(e=b.lon,t=b.lat){const a=Cesium.Cartesian3.fromDegrees(e,t,0),i=Cesium.Transforms.eastNorthUpToFixedFrame(a),r=Cesium.Math.toRadians(V.pitch),n=V.height,o=r+Cesium.Math.PI_OVER_TWO,c=new Cesium.Cartesian3(0,-n*Math.sin(o),n*Math.cos(o));return Cesium.Matrix4.multiplyByPoint(i,c,new Cesium.Cartesian3)}function Se(e,t=b.lon,a=b.lat){$(e,ie(t,a))}function ke(){k+=1}function rt(e,t,a){const i=Cesium.Cartesian3.normalize(e,new Cesium.Cartesian3),r=Cesium.Cartesian3.normalize(t,new Cesium.Cartesian3),n=Cesium.Math.clamp(Cesium.Cartesian3.dot(i,r),-1,1),o=Math.acos(n),c=Cesium.Cartesian3.magnitude(e)*(1-a)+Cesium.Cartesian3.magnitude(t)*a;if(o<1e-5)return Cesium.Cartesian3.multiplyByScalar(i,c,new Cesium.Cartesian3);const m=Math.sin(o),u=new Cesium.Cartesian3(i.x*Math.sin((1-a)*o)/m+r.x*Math.sin(a*o)/m,i.y*Math.sin((1-a)*o)/m+r.y*Math.sin(a*o)/m,i.z*Math.sin((1-a)*o)/m+r.z*Math.sin(a*o)/m);return Cesium.Cartesian3.normalize(u,u),Cesium.Cartesian3.multiplyByScalar(u,c,u)}function $(e,t){e.camera.setView({destination:t,orientation:{heading:0,pitch:Cesium.Math.toRadians(V.pitch),roll:0}}),e.scene.requestRender()}function Ae(e){const t=e.camera.positionCartographic;return!t||t.height<25e4}function _(e,t,{duration:a=1.4,reducedMotion:i=!1}={}){const r=k+=1;E=!0,e.camera.cancelFlight(),te(e);const n=()=>{r===k&&(E=!1)};if(Ae(e)||i||a<.08)return $(e,t),n(),Promise.resolve();const o=Cesium.Cartesian3.clone(e.camera.positionWC),c=performance.now();return new Promise(m=>{const u=g=>{if(r!==k){n(),m();return}const l=Math.min(1,(g-c)/(a*1e3)),s=l*l*(3-2*l);$(e,rt(o,t,s)),l<1?window.requestAnimationFrame(u):(n(),m())};window.requestAnimationFrame(u)})}function ia(e,t,a,{reducedMotion:i=!1}={}){if(!Number.isFinite(t)||!Number.isFinite(a))return;const r=ie(t,a),n=e.camera.positionCartographic;if(n&&!Ae(e)){const o={lon:Cesium.Math.toDegrees(n.longitude),lat:Cesium.Math.toDegrees(n.latitude)},c=he(o,{lon:t,lat:a});if(c<3.5&&Math.abs(n.height-V.height)<25e5)return;const m=Math.min(2,Math.max(.8,c/52));return _(e,r,{duration:m,reducedMotion:i})}return _(e,r,{duration:0,reducedMotion:!0})}function ra(e,{lon:t=b.lon,lat:a=b.lat,reducedMotion:i=!1}={}){te(e);const r=ie(t,a);if(i)return ke(),Se(e,t,a),Promise.resolve();const n=e.camera.positionCartographic;if(n&&n.height<4e6){const o=Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(n.longitude),Cesium.Math.toDegrees(n.latitude),V.height);return _(e,o,{duration:1.35}).then(()=>_(e,r,{duration:1.7}))}return _(e,r,{duration:2.4})}async function oa(e,{reducedMotion:t=!1,onStatus:a}={}){Se(e),a==null||a({km:9800,phase:"orbit"}),await qe(e,t?700:1600)}const ot=Cesium.Math.toRadians(3),nt=1480;function na(e,t){const a=Cesium.Math.toRadians(U),i=xe(ae(e),U,q),r=e.camera.pitch,n=Math.max(Cesium.Cartesian3.distance(e.camera.positionWC,X()),i*.45),o=e.camera.frustum.fov??Z,c=e.camera.heading;let m=!0;const u=performance.now(),g=()=>{if(!m||document.hidden)return;const l=performance.now(),s=Math.min(1,(l-u)/nt),v=s*s*(3-2*s);e.camera.lookAt(X(),new Cesium.HeadingPitchRange(c+ot*((l-u)/1e3),r+(a-r)*v,n+(i-n)*v)),e.camera.frustum.fov!==void 0&&(e.camera.frustum.fov=o+(ee-o)*v)};return e.scene.postUpdate.addEventListener(g),()=>{m=!1,e.scene.postUpdate.removeEventListener(g),e.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)}}const st=3.2,lt=1.25,G=.035,ct=[10,12,13,14,15,16],mt=48;let z=!1;function sa(){return z}function la(e,t){z=!!t;const a=e.scene.globe;a.maximumScreenSpaceError=z?st:lt,a.depthTestAgainstTerrain=!z}function ut(e){const t=e.aresImageryLayer??e.imageryLayers.get(0);return t==null?void 0:t.imageryProvider}function Te(e,t){const a=mt*Math.PI/180,i=G*Math.sin(a)/Math.max(.2,Math.cos(t*Math.PI/180)),r=G*Math.cos(a),n=[];for(let o=-2;o<=2;o+=1)for(let c=-2;c<=2;c+=1)n.push({lon:e+c*G+i*.35,lat:t+o*G+r*.35});return n}function ft(e,t,a,i){try{return e.requestImage(t,a,i)}catch{return}}function fe(e,t,a){const i=ut(e);if(!(i!=null&&i.tilingScheme)||typeof i.requestImage!="function")return[];const r=[];for(const n of Te(t,a)){const o=Cesium.Cartographic.fromDegrees(n.lon,n.lat);for(const c of ct)try{const m=i.tilingScheme.positionToTileXY(o,c);if(!m)continue;const u=ft(i,m.x,m.y,c);Cesium.defined(u)&&typeof u.then=="function"&&r.push(Promise.resolve(u).catch(()=>{}))}catch{}}return r}async function dt(e,t,a){let i=fe(e,t,a);i.length||(await new Promise(r=>window.setTimeout(r,240)),i=fe(e,t,a)),i.length&&await Promise.all(i)}async function pt(e,t,a){if(!Number.isFinite(t)||!Number.isFinite(a))return;const i=Te(t,a).map(r=>Cesium.Cartographic.fromDegrees(r.lon,r.lat));try{Promise.resolve(Cesium.sampleTerrainMostDetailed(e.terrainProvider,i)).catch(()=>{})}catch{}await dt(e,t,a)}async function ca(e,t){await Promise.all(t.map(a=>pt(e,a.lon,a.lat)))}const gt="/training/live-globe/assets/plate-mask-01-jZhyWrIi.png",vt="/training/live-globe/assets/plate-mask-02-JlwFXeaL.png",ht="/training/live-globe/assets/plate-mask-03-C2Ma-hyv.png",xt="/training/live-globe/assets/plate-mask-04-CfBGTpLp.png",bt="/training/live-globe/assets/plate-mask-05-CvdRQbmP.png",yt="/training/live-globe/assets/plate-mask-06-CdgeYCgG.png",Ct="/training/live-globe/assets/sensor-surface-fine-BzRCSJKN.png",St="/training/live-globe/assets/sensor-surface-heavy-CmU30Kdu.png",kt="/training/live-globe/assets/signal-loss-atlas-CZHVmuqs.png",At="/training/live-globe/assets/edge-damage-atlas-Ceg3IiSV.png",Tt="/training/live-globe/assets/exposure-cloud-_mx8Zbb5.png",wt="/training/live-globe/assets/terrain-print-texture-UmWtB06c.png",W={"plate-mask-01.png":gt,"plate-mask-02.png":vt,"plate-mask-03.png":ht,"plate-mask-04.png":xt,"plate-mask-05.png":bt,"plate-mask-06.png":yt,"sensor-surface-fine.png":Ct,"sensor-surface-heavy.png":St,"signal-loss-atlas.png":kt,"edge-damage-atlas.png":At,"exposure-cloud.png":Tt,"terrain-print-texture.png":wt},de=Object.keys(W),Mt=["plate-mask-01.png","plate-mask-02.png","plate-mask-03.png","plate-mask-04.png","plate-mask-05.png","plate-mask-06.png"];function Lt(e,t){return new Promise((a,i)=>{const r=new Image;r.decoding="async",r.onload=()=>a(r),r.onerror=()=>i(new Error(`Failed to load ${t}`)),r.src=e})}function we(e,t,a){return .299*e+.587*t+.114*a}function re(e,t){const a=Math.min(1,t/Math.max(e.naturalWidth,e.naturalHeight));return{width:Math.max(2,Math.round(e.naturalWidth*a)),height:Math.max(2,Math.round(e.naturalHeight*a))}}function Me(e){const t=document.createElement("canvas"),a=re(e,512);t.width=a.width,t.height=a.height;const i=t.getContext("2d",{willReadFrequently:!0});i.drawImage(e,0,0,t.width,t.height);const r=i.getImageData(0,0,t.width,t.height),{data:n}=r;for(let o=0;o<n.length;o+=4){const m=n[o+3]<10?0:we(n[o],n[o+1],n[o+2]);n[o]=m,n[o+1]=m,n[o+2]=m,n[o+3]=255}return i.putImageData(r,0,0),t}function Et(e,t=10){const a=e.getContext("2d",{willReadFrequently:!0}),{width:i,height:r}=e,n=a.getImageData(0,0,i,r),{data:o}=n;let c=i,m=r,u=0,g=0;for(let p=0;p<r;p+=1)for(let d=0;d<i;d+=1)o[(p*i+d)*4]<=t||(d<c&&(c=d),p<m&&(m=p),d>u&&(u=d),p>g&&(g=p));if(u<=c||g<=m)return e;const l=3,s=Math.max(0,c-l),v=Math.max(0,m-l),y=Math.min(i,u+l+1)-s,T=Math.min(r,g+l+1)-v,f=document.createElement("canvas");return f.width=y,f.height=T,f.getContext("2d").drawImage(e,s,v,y,T,0,0,y,T),f}function Ot(e){return Et(Me(e))}function It(e){const t=document.createElement("canvas"),a=re(e,512);t.width=a.width,t.height=a.height;const i=t.getContext("2d",{willReadFrequently:!0});i.drawImage(e,0,0,t.width,t.height);const r=i.getImageData(0,0,t.width,t.height),{data:n}=r;for(let o=0;o<n.length;o+=4){const c=n[o+3],m=we(n[o],n[o+1],n[o+2]),u=c,g=255-m,l=c>12&&m<200?Math.max(u,g*(c/255)):u;n[o]=l,n[o+1]=l,n[o+2]=l,n[o+3]=255}return i.putImageData(r,0,0),t}function Dt(e){return Me(e)}function j(e,t){const a=document.createElement("canvas"),i=re(e,t);return a.width=i.width,a.height=i.height,a.getContext("2d").drawImage(e,0,0,a.width,a.height),a}function Rt(){return Math.floor(Date.now()/6e4)%2}function Ft(e=Rt()){return{regional:"plate-mask-01.png",objective:"plate-mask-04.png",scan:"plate-mask-03.png",transition:"plate-mask-05.png"}}async function ma(){const e={},t={};await Promise.all(de.map(async a=>{e[a]=await Lt(W[a],a)}));for(const a of Mt)t[a]=Ot(e[a]),await new Promise(i=>requestAnimationFrame(i));return{images:e,masks:t,processed:{fine:j(e["sensor-surface-fine.png"],768),heavy:j(e["sensor-surface-heavy.png"],768),print:j(e["terrain-print-texture.png"],768),exposure:j(e["exposure-cloud.png"],512),signal:It(e["signal-loss-atlas.png"]),edge:Dt(e["edge-damage-atlas.png"])},tested:de.slice(),assignment:Ft()}}function ua(e,t,a=t.assignment){t.assignment=a,e.bindTextures({maskRegional:t.masks[a.regional],maskObjective:t.masks[a.objective],maskScan:t.masks[a.scan],maskTransition:t.masks[a.transition],texFine:t.processed.fine,texHeavy:t.processed.heavy,texPrint:t.processed.print,texExposure:t.processed.exposure,texSignal:t.processed.signal,texEdge:t.processed.edge})}const _t="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export",Ut=[.0064,.01,.018,.032],Vt=[.0036,.0056,.008,.012,.018];function Bt(e,t,a){const i=a/2;return`${e-i},${t-i},${e+i},${t+i}`}function Ht(e,t,a,i){return`${_t}?bbox=${Bt(e,t,a)}&bboxSR=4326&imageSR=3857&size=${i}&format=jpg&f=image`}function Pt(e){return new Promise(t=>{const a=new Image;a.decoding="async",a.onload=()=>t(a.naturalWidth>8?e:null),a.onerror=()=>t(null),a.src=e})}async function pe(e,t,a,i){for(const r of a){const n=await Pt(Ht(e,t,r,i));if(n)return n}return null}function N(e){return e.complete&&e.naturalWidth>8?Promise.resolve(!0):new Promise(t=>{const a=n=>{e.removeEventListener("load",i),e.removeEventListener("error",r),t(n)},i=()=>a(e.naturalWidth>8),r=()=>a(!1);e.addEventListener("load",i),e.addEventListener("error",r)})}function fa(e){const t=document.getElementById("intelFacility"),a=document.getElementById("intelObjective"),i=document.querySelector(".intel-plate.is-facility"),r=document.querySelector(".intel-plate.is-objective"),n=document.getElementById("siteIntel"),o=document.getElementById("intelTag"),c=document.getElementById("intelPlace"),m=new Map,u=[],g=(f,p)=>{const d=window.setTimeout(f,p);return u.push(d),d},l=()=>{for(;u.length;)window.clearTimeout(u.pop())};i==null||i.style.setProperty("--intel-mask",`url("${W["plate-mask-01.png"]}")`),r==null||r.style.setProperty("--intel-mask",`url("${W["plate-mask-04.png"]}")`);const s=async f=>{const p=await pe(f.lon,f.lat,Ut,"960,600");let d=await pe(f.lon,f.lat,Vt,"800,500");return d||(d=p),!p&&!d?null:{facility:p||d,objective:d||p}},v=f=>{if(!f||!Number.isFinite(f.lon)||!Number.isFinite(f.lat))return null;const p=m.get(f.id);if(p)return p;const d={pair:null,ready:s(f).then(x=>(d.pair=x,x))};return m.set(f.id,d),d},y=()=>{t&&(t.removeAttribute("src"),t.alt=""),a&&(a.removeAttribute("src"),a.alt="")};return{preload:v,preloadAll(f){for(const p of f)v(p)},async show(f){const p=v(f);if(!p)return!1;const d=p.pair??await p.ready;if(!d)return!1;o&&(o.textContent=`INT ${f.code||String(f.id).padStart(2,"0")}`),c&&(c.textContent=String(f.place||f.title||"").toUpperCase());const x=Number.isFinite(f.lat)?f.lat.toFixed(3):"—",h=Number.isFinite(f.lon)?f.lon.toFixed(3):"—",A=document.getElementById("intelReadoutWide"),C=document.getElementById("intelReadoutTight");A&&(A.textContent=`LOCK  ${x}  ${h}  ·  WIDE`),C&&(C.textContent=`LOCK  ${x}  ${h}  ·  TIGHT`),t.src=d.facility,t.alt=`${f.place||f.title} facility`,a.src=d.objective,a.alt=`${f.place||f.title} objective`;const[w,Y]=await Promise.all([N(t),N(a)]);return!w&&d.objective&&(t.src=d.objective,await N(t)),!Y&&d.facility&&(a.src=d.facility,await N(a)),t.naturalWidth>8&&a.naturalWidth>8},reveal(){if(!n)return;const f=!!(t&&t.naturalWidth>8),p=!!(a&&a.naturalWidth>8);if(!f&&!p)return;n.hidden=!1,n.setAttribute("aria-hidden","false");const d=h=>h==null?void 0:h.classList.remove("is-live","is-clear","is-open","is-empty");d(i),d(r),i==null||i.classList.toggle("is-empty",!f),r==null||r.classList.toggle("is-empty",!p),e.dataset.intel="true",l();const x=(h,A)=>{g(()=>{h==null||h.classList.add("is-clear"),g(()=>h==null?void 0:h.classList.add("is-open"),760)},A)};if(document.documentElement.classList.contains("reduce-motion")){f&&(i==null||i.classList.add("is-clear","is-open")),p&&(r==null||r.classList.add("is-clear","is-open"));return}f&&x(i,520),p&&x(r,800)},hide:()=>{l(),e.dataset.intel="false",i==null||i.classList.remove("is-live","is-clear","is-open"),r==null||r.classList.remove("is-live","is-clear","is-open"),n&&(n.setAttribute("aria-hidden","true"),n.hidden=!0),y()}}}const Gt=["standard","network"],Le="ares-cinematic-globe-theme";function Q(e){return Gt.includes(e)}function da(){try{const a=window.localStorage.getItem(Le);if(Q(a))return a}catch{}const t=new URLSearchParams(window.location.search).get("theme");return Q(t)?t:"standard"}function pa(e){if(Q(e))try{window.localStorage.setItem(Le,e)}catch{}}function ga(e){return e==="network"?"standard":"network"}export{qt as A,Qt as B,ca as C,qe as D,ye as E,V as F,ze as M,Xt as O,zt as P,je as R,L as S,b as T,Yt as W,fa as a,Se as b,jt as c,Nt as d,oa as e,sa as f,ea as g,De as h,Wt as i,$t as j,ta as k,ma as l,Zt as m,Kt as n,ia as o,ra as p,pt as q,da as r,la as s,ua as t,Jt as u,na as v,pa as w,ga as x,Je as y,aa as z};
