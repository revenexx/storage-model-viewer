<div align="center">

# @revenexx/storage-model-viewer

**A framework-agnostic 3D/AR viewer for revenexx Storage assets.**
Point the `<rx-model-viewer>` web component at an asset's `model_url` (a `.glb`) and get an interactive, rotatable 3D viewer — in Vue, React, Nuxt or plain HTML. Optional, config-selectable AR (Android Scene Viewer + iOS Quick Look).

[![npm version](https://img.shields.io/npm/v/@revenexx/storage-model-viewer?color=2B90B6)](https://www.npmjs.com/package/@revenexx/storage-model-viewer)
[![npm downloads](https://img.shields.io/npm/dm/@revenexx/storage-model-viewer?color=2B90B6)](https://www.npmjs.com/package/@revenexx/storage-model-viewer)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

---

## Why

- 🧩 **One element, any framework.** `<rx-model-viewer>` is a standard custom element — drop it into Vue, React, Nuxt, Svelte or a plain `<script>` tag. No framework wrapper required.
- 🔒 **Sovereign by default.** The default engine is self-hosted **three.js** — the model renders 100% in the browser, nothing is sent to a third party.
- 📱 **AR when you want it.** Flip `engine="model-viewer"` to add an AR button: Android **Scene Viewer** (from the `.glb`) and iOS **Quick Look** (from a USDZ via `ios-src`). Opt-in, because AR hands the model to the OS.
- 🪶 **Lazy & light.** The engines are code-split — a page that only uses three.js never downloads model-viewer, and vice versa.
- 🗄️ **Storage-native.** Designed to consume the revenexx Storage delivery URLs straight from the asset API: `model_url` → `src`, `preview_url` → `poster`, `usdz_url` → `ios-src`.
- 🎛️ **Configured by attributes.** `src`, `poster`, `engine`, `ar`, `ios-src`, `auto-rotate`, `background`, `camera-orbit` — set them as HTML attributes and change them at runtime.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Framework usage](#framework-usage) · [Nuxt / Vue](#nuxt--vue) · [React](#react) · [Plain HTML](#plain-html)
- [Attributes](#attributes)
- [Engines](#engines) · [three.js (default)](#threejs-default) · [model-viewer (AR)](#model-viewer-ar)
- [Using it with revenexx Storage](#using-it-with-revenexx-storage)
- [Sizing](#sizing-important)
- [Programmatic API](#programmatic-api)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Recipes](./docs/recipes.md)

## Installation

```bash
pnpm add @revenexx/storage-model-viewer    # or npm i / yarn add
```

Published to the public npm registry. (It is also mirrored to GitHub Packages for
internal `@revenexx`-scoped consumers.)

## Quick start

Importing the package once registers the `<rx-model-viewer>` element:

```ts
import '@revenexx/storage-model-viewer'
```

```html
<div style="height: 70vh">
  <rx-model-viewer
    src="https://storage.revenexx.com/acme/flange.step?d=model"
    poster="https://storage.revenexx.com/acme/flange.step?d=preview"
    auto-rotate
  ></rx-model-viewer>
</div>
```

> The element fills its parent (`display:block; width:100%; height:100%`). Give the
> parent a **definite height** — see [Sizing](#sizing-important).

## Framework usage

### Nuxt / Vue

Register the element in a **client** plugin and tell the Vue compiler it's a custom element.

```ts
// app/plugins/model-viewer.client.ts
export default defineNuxtPlugin(async () => {
  await import('@revenexx/storage-model-viewer')
})
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  vue: { compilerOptions: { isCustomElement: tag => tag === 'rx-model-viewer' } },
})
```

```vue
<template>
  <div class="h-[70vh]">
    <rx-model-viewer :src="modelUrl" :poster="posterUrl" auto-rotate />
  </div>
</template>
```

> Plain Vue (no Nuxt): set `app.config.compilerOptions.isCustomElement = t => t === 'rx-model-viewer'`.

### React

```tsx
import '@revenexx/storage-model-viewer'

export function Viewer({ src, poster }: { src: string, poster?: string }) {
  return (
    <div style={{ height: '70vh' }}>
      {/* @ts-expect-error custom element */}
      <rx-model-viewer src={src} poster={poster} auto-rotate />
    </div>
  )
}
```

### Plain HTML

```html
<script type="module" src="https://unpkg.com/@revenexx/storage-model-viewer"></script>
<div style="height:70vh">
  <rx-model-viewer src="…?d=model" poster="…?d=preview" auto-rotate></rx-model-viewer>
</div>
```

## Attributes

| Attribute      | Type    | Default  | Description |
| -------------- | ------- | -------- | ----------- |
| `src`          | string  | —        | URL of the `.glb` mesh (the asset's `model_url`). **Required.** |
| `poster`       | string  | —        | Image shown before/while the model loads (the asset's `preview_url`). |
| `engine`       | string  | `three`  | `three` (sovereign, default) or `model-viewer` (AR). |
| `ar`           | boolean | `false`  | Enable the AR button. Only honoured by the `model-viewer` engine. |
| `ios-src`      | string  | —        | USDZ URL for iOS Quick Look (the asset's `usdz_url`). iOS AR needs this; Android uses the `.glb`. |
| `auto-rotate`  | boolean | `false`  | Slowly rotate the model. |
| `background`   | string  | —        | CSS colour for the canvas. Transparent when unset. |
| `camera-orbit` | string  | —        | Initial camera orbit, `model-viewer` syntax (e.g. `"45deg 65deg auto"`). |

Attributes are reactive — change them at runtime and the viewer re-renders.

## Engines

The engine code is dynamically imported, so only the one you use is downloaded.

### three.js (default)

`engine="three"` (or omit `engine`). Self-hosted three.js with neutral image-based
lighting (RoomEnvironment) + ACES tone mapping, orbit controls and automatic framing.
**Fully local** — no third-party requests, no AR hand-off. This is what the storefront
and Cockpit use.

### model-viewer (AR)

`engine="model-viewer"` loads Google's `<model-viewer>` (bundled, self-hosted). Adds an
AR button when `ar` is set:

- **Android** → Scene Viewer, using the `.glb` from `src`.
- **iOS** → Quick Look, using the USDZ from `ios-src` (required for iOS AR).

Launching AR hands the model URL to the OS AR subsystem, which is why it is opt-in.

> **Nuxt + AR:** the AR engine's nested dynamic `import('@google/model-viewer')` is not
> followed into the client bundle by Vite's scanner. When you use `engine="model-viewer"`,
> also `import '@google/model-viewer'` at the top of your client plugin and add it to
> `build.transpile`. See [Recipes → AR in Nuxt](./docs/recipes.md#ar-in-nuxt). The default
> three.js engine has no such requirement.

## Using it with revenexx Storage

A 3D asset from the Storage API exposes ready-to-use delivery URLs. Wire them straight in:

```ts
// asset = GET /v1/assets/{id}
{
  src:     asset.model_url,   // .glb  (…?d=model)
  poster:  asset.preview_url, // .png  (…?d=preview, imgproxy-resizable)
  iosSrc:  asset.usdz_url,    // .usdz (…?d=usdz, for iOS AR)
}
```

These are produced by the `storage-3d-renderer` service and served with CORS, so the
viewer can fetch them cross-origin. See the storage repo's
[3D rendering backend](https://github.com/revenexx/storage/blob/main/docs/3d-rendering.md).

## Sizing (important)

The viewer (and the underlying WebGL canvas) needs a **definite height**. A height of
`100%` only resolves against a parent that has a concrete height — inside a flex/grid
item the canvas can collapse to `0` and you'll see nothing (or just the background).

```html
<!-- ✅ definite height -->
<div style="height: 70vh"><rx-model-viewer src="…" /></div>
<div class="aspect-square"><rx-model-viewer src="…" /></div>

<!-- ⚠️ flex item with no concrete height → canvas may be 0 -->
<div style="flex: 1"><rx-model-viewer src="…" /></div>
```

## Programmatic API

```ts
import { register, RxModelViewer, TAG_NAME, readConfig } from '@revenexx/storage-model-viewer'

register()                 // define <rx-model-viewer> (called automatically on import)
register('my-viewer')      // …or under a custom tag name
TAG_NAME                   // 'rx-model-viewer'
readConfig(element)        // → { src, poster, engine, ar, iosSrc, background, autoRotate, cameraOrbit }
```

## How it works

`<rx-model-viewer>` is a custom element with an open shadow root. On connect (or when an
observed attribute changes) it reads its config and dynamically imports the selected
engine, which mounts into the shadow root and returns a cleanup function. A render token
guards against overlapping async renders; `disconnectedCallback` tears the engine down.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| **Nothing renders, just the background** | Container has no definite height → canvas is `0×0`. Give the parent a concrete height (see [Sizing](#sizing-important)). |
| **AR/model loads but model is blank** | A custom `camera-orbit` with `auto` radius can mis-frame small (metre-scale) models. Drop `camera-orbit` to let it auto-frame. |
| **AR engine shows an empty box (Nuxt)** | `@google/model-viewer` wasn't bundled. Top-level `import '@google/model-viewer'` in a client plugin + add to `build.transpile`. |
| **No iOS AR button** | Set `ios-src` to the asset's `usdz_url`; iOS Quick Look needs a USDZ (Android only needs the `.glb`). |
| **`Failed to fetch` loading the model** | The `.glb` host must send CORS headers for cross-origin `fetch`. Storage delivery does (`Access-Control-Allow-Origin: *`). |
| **Vue warns "failed to resolve component rx-model-viewer"** | Set `isCustomElement` (see [Nuxt / Vue](#nuxt--vue)). |

## License

MIT
