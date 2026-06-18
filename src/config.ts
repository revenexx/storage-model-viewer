export type ViewerEngine = 'three' | 'model-viewer'

export interface ViewerConfig {
  /** URL of the .glb mesh to render (the asset's model_url). */
  src: string
  /** Optional preview image shown before/while the model loads (preview_url). */
  poster: string | null
  /** Render engine. Default 'three' (fully local). 'model-viewer' enables AR. */
  engine: ViewerEngine
  /** Enable AR (only honoured by the 'model-viewer' engine). */
  ar: boolean
  /** USDZ URL for iOS AR Quick Look (model-viewer ios-src). The asset's usdz_url. */
  iosSrc: string | null
  /** CSS background color; when unset the canvas is transparent. */
  background: string | null
  /** Auto-rotate the model. */
  autoRotate: boolean
  /** Initial camera orbit (model-viewer syntax, e.g. "45deg 55deg auto"). */
  cameraOrbit: string | null
}

/**
 * Read a {@link ViewerConfig} from an element's attributes. Unknown engine
 * values fall back to the sovereign default ('three').
 */
export function readConfig(el: Element): ViewerConfig {
  return {
    src: el.getAttribute('src') ?? '',
    poster: el.getAttribute('poster'),
    engine: el.getAttribute('engine') === 'model-viewer' ? 'model-viewer' : 'three',
    ar: el.hasAttribute('ar'),
    iosSrc: el.getAttribute('ios-src'),
    background: el.getAttribute('background'),
    autoRotate: el.hasAttribute('auto-rotate'),
    cameraOrbit: el.getAttribute('camera-orbit'),
  }
}
