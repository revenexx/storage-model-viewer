# Recipes

Practical patterns for `@revenexx/storage-model-viewer`. See the [README](../README.md)
for the full attribute and engine reference.

## A product gallery slide (Nuxt, three.js)

Toggle the main gallery area between still images and the interactive model. Used by the
Cover storefront's `ProductDetailImageGallery`.

```vue
<script setup lang="ts">
const props = defineProps<{ images: string[], modelUrl?: string, modelPoster?: string }>()
const mode = ref<'image' | 'model'>('image')
const selected = ref(0)
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- aspect-square gives the viewer a definite height -->
    <div class="aspect-square rounded-2xl overflow-hidden flex items-center justify-center">
      <rx-model-viewer
        v-if="mode === 'model' && modelUrl"
        :src="modelUrl"
        :poster="modelPoster"
        auto-rotate
        class="w-full h-full"
      />
      <img v-else :src="images[selected]" class="max-w-full max-h-full object-contain">
    </div>

    <div class="grid grid-cols-6 gap-2">
      <button v-for="(img, i) in images" :key="img" @click="mode = 'image'; selected = i">
        <img :src="img">
      </button>
      <button v-if="modelUrl" @click="mode = 'model'">3D</button>
    </div>
  </div>
</template>
```

## A double-click viewer (Cockpit, three.js)

Open the model from a media grid. The dialog body provides a definite height.

```vue
<rx-model-viewer
  v-if="asset.kind === 'model3d' && asset.model_url"
  :src="asset.model_url"
  :poster="asset.preview_url || undefined"
  auto-rotate
  class="block h-full w-full"
/>
```

## AR in Nuxt

The AR engine (`engine="model-viewer"`) needs `@google/model-viewer` in the client bundle.
Vite's scanner does **not** follow the package's nested dynamic import, so force it:

```ts
// app/plugins/model-viewer.client.ts
import '@google/model-viewer'                  // <-- forces it into the bundle + registers it
export default defineNuxtPlugin(async () => {
  await import('@revenexx/storage-model-viewer')
})
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  build: { transpile: ['@google/model-viewer'] },
  vue: { compilerOptions: { isCustomElement: t => t === 'rx-model-viewer' || t === 'model-viewer' } },
})
```

```vue
<rx-model-viewer
  engine="model-viewer"
  ar
  :src="asset.model_url"
  :ios-src="asset.usdz_url"
  :poster="asset.preview_url"
  auto-rotate
/>
```

- **Android** uses the `.glb` (`src`); make sure it is metre-scaled so AR places it at real size.
- **iOS** uses the USDZ (`ios-src`); without it, no iOS AR button.
- Add `@google/model-viewer` as a direct dependency of the consuming app.

## Background & framing

```html
<!-- transparent canvas (blends with the surrounding box) -->
<rx-model-viewer src="…" />

<!-- solid background -->
<rx-model-viewer src="…" background="#eef5ff" />
```

The three.js engine frames the whole model automatically; don't pass `camera-orbit` unless
you need a specific start angle (a custom orbit with `auto` radius can mis-frame small,
metre-scale parts).

## Plain HTML / any framework

```html
<script type="module" src="https://unpkg.com/@revenexx/storage-model-viewer"></script>
<div style="height: 480px">
  <rx-model-viewer src="…?d=model" poster="…?d=preview" auto-rotate></rx-model-viewer>
</div>
```

## Troubleshooting

See the [README troubleshooting table](../README.md#troubleshooting). The most common issue
is a **collapsed canvas** from a container without a definite height.
