# @revenexx/storage-model-viewer

A framework-agnostic **`<rx-model-viewer>`** web component for revenexx storage 3D assets.
Point it at an asset's `model_url` (a `.glb`) and it renders an interactive 3D viewer —
in any framework (Vue, React, plain HTML), including the Cockpit and the Cover shop theme.

## Install

```bash
pnpm add @revenexx/storage-model-viewer
```

```ts
import '@revenexx/storage-model-viewer' // registers <rx-model-viewer>
```

## Usage

```html
<rx-model-viewer
  src="https://storage.revenexx.com/acme/flange.step?d=model"
  poster="https://storage.revenexx.com/acme/flange.step?d=preview"
  auto-rotate
></rx-model-viewer>
```

The element fills its parent (`display:block; width/height:100%`) — size it from the outside.

## Engines

Two engines, selected via the `engine` attribute — loaded on demand, so a page only
downloads the engine it uses:

| `engine` | Library | Notes |
| --- | --- | --- |
| `three` (default) | self-hosted three.js | 100% local — nothing leaves the page. |
| `model-viewer` | Google `<model-viewer>` (bundled) | Enables `ar`. Launching AR hands the model URL to the OS AR subsystem (Android Scene Viewer / iOS Quick Look), so it is opt-in. |

## Attributes

| Attribute | Description |
| --- | --- |
| `src` | URL of the `.glb` mesh (the asset's `model_url`). Required. |
| `poster` | Preview image shown before/while loading (`preview_url`). |
| `engine` | `three` (default) or `model-viewer`. |
| `ar` | Enable AR (model-viewer engine only). |
| `background` | CSS color; transparent when unset. |
| `auto-rotate` | Auto-rotate the model. |
| `camera-orbit` | Initial camera orbit (model-viewer syntax). |

## License

MIT
