/**
 * `@revenexx/storage-model-viewer`
 *
 * A framework-agnostic `<rx-model-viewer>` custom element for revenexx storage
 * 3D assets. Point `src` at the asset's `model_url` (a .glb).
 *
 * Two engines, selected via the `engine` attribute:
 *  - `three` (default): self-hosted three.js — 100% local, nothing leaves the page.
 *  - `model-viewer`: Google's `<model-viewer>` (bundled locally) for AR (`ar`).
 *
 * The engine code is loaded on demand, so a page that only ever uses three.js
 * never downloads model-viewer (and vice versa).
 *
 * @example
 * <rx-model-viewer src="https://storage.revenexx.com/acme/flange.step?d=model"
 *                  poster="https://storage.revenexx.com/acme/flange.step?d=preview"></rx-model-viewer>
 */
import { readConfig, type ViewerConfig, type ViewerEngine } from './config'

export { readConfig } from './config'
export type { ViewerConfig, ViewerEngine }

export const TAG_NAME = 'rx-model-viewer'

/** An engine mounts into the shadow root and returns an optional cleanup fn. */
export type EngineMount = (
  root: ShadowRoot,
  config: ViewerConfig,
) => void | (() => void) | Promise<void | (() => void)>

export class RxModelViewer extends HTMLElement {
  static readonly observedAttributes = [
    'src', 'poster', 'engine', 'ar', 'ios-src', 'background', 'auto-rotate', 'camera-orbit',
  ]

  #root: ShadowRoot
  #cleanup: (() => void) | undefined
  /** Guards against overlapping async renders (attribute churn / fast engine swaps). */
  #token = 0

  constructor() {
    super()
    this.#root = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = ':host{display:block;position:relative;width:100%;height:100%;contain:content}'
    this.#root.appendChild(style)
  }

  connectedCallback(): void {
    void this.#render()
  }

  disconnectedCallback(): void {
    this.#teardown()
  }

  attributeChangedCallback(): void {
    if (this.isConnected) void this.#render()
  }

  get config(): ViewerConfig {
    return readConfig(this)
  }

  async #render(): Promise<void> {
    this.#teardown()
    const config = this.config
    if (!config.src) return

    const token = this.#token
    const { mount } = await this.#engine(config.engine)
    // A newer render (or disconnect) may have superseded this one while the
    // engine chunk loaded.
    if (token !== this.#token || !this.isConnected) return

    const cleanup = await mount(this.#root, config)
    if (token !== this.#token) {
      cleanup?.()
      return
    }
    this.#cleanup = typeof cleanup === 'function' ? cleanup : undefined
  }

  async #engine(engine: ViewerEngine): Promise<{ mount: EngineMount }> {
    if (engine === 'model-viewer') {
      const mod = await import('./engines/model-viewer')
      return { mount: mod.mountModelViewer }
    }
    const mod = await import('./engines/three')
    return { mount: mod.mountThree }
  }

  #teardown(): void {
    this.#token++
    try {
      this.#cleanup?.()
    } finally {
      this.#cleanup = undefined
      // Keep the injected <style>, drop everything the engine added.
      for (const node of Array.from(this.#root.childNodes)) {
        if (!(node instanceof HTMLStyleElement)) node.remove()
      }
    }
  }
}

/** Register the custom element (idempotent; a no-op outside a DOM environment). */
export function register(tagName: string = TAG_NAME): void {
  if (typeof customElements === 'undefined') return
  if (!customElements.get(tagName)) customElements.define(tagName, RxModelViewer)
}

register()
