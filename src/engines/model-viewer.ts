import type { ViewerConfig } from '../config'

/**
 * Google `<model-viewer>` engine — opt-in via `engine="model-viewer"`. Bundled
 * locally (no CDN); importing it registers the `<model-viewer>` element.
 *
 * Only this engine honours `ar`. Note that launching AR hands the model URL to
 * the OS AR subsystem (Android Scene Viewer / iOS Quick Look), so it is opt-in.
 */
export async function mountModelViewer(root: ShadowRoot, config: ViewerConfig): Promise<() => void> {
  await import('@google/model-viewer')

  const el = document.createElement('model-viewer')
  el.setAttribute('src', config.src)
  el.setAttribute('camera-controls', '')
  el.setAttribute('touch-action', 'pan-y')

  if (config.poster) el.setAttribute('poster', config.poster)
  if (config.autoRotate) el.setAttribute('auto-rotate', '')
  if (config.cameraOrbit) el.setAttribute('camera-orbit', config.cameraOrbit)
  if (config.ar) {
    el.setAttribute('ar', '')
    el.setAttribute('ar-modes', 'webxr scene-viewer quick-look')
  }

  el.style.width = '100%'
  el.style.height = '100%'
  if (config.background) el.style.backgroundColor = config.background

  root.appendChild(el)

  return () => el.remove()
}
