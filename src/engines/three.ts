import type * as THREE from 'three'
import type { ViewerConfig } from '../config'

/**
 * Sovereign three.js engine: loads the .glb and renders it locally in a
 * `<canvas>` with orbit controls. Nothing is fetched from third parties.
 * three.js is imported dynamically so it is only downloaded when this engine
 * is actually used.
 */
export async function mountThree(root: ShadowRoot, config: ViewerConfig): Promise<() => void> {
  const three = await import('three')
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

  const host = root.host as HTMLElement
  const width = host.clientWidth || 600
  const height = host.clientHeight || 400

  const renderer = new three.WebGLRenderer({ antialias: true, alpha: !config.background })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2))
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  root.appendChild(renderer.domElement)

  const scene = new three.Scene()
  if (config.background) scene.background = new three.Color(config.background)

  const camera = new three.PerspectiveCamera(45, width / height, 0.1, 100000)
  camera.position.set(1, 1, 1)

  scene.add(new three.AmbientLight(0xffffff, 0.9))
  const key = new three.DirectionalLight(0xffffff, 1.2)
  key.position.set(5, 10, 7.5)
  scene.add(key)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.autoRotate = config.autoRotate

  let disposed = false
  let raf = 0

  new GLTFLoader().load(config.src, (gltf) => {
    if (disposed) return
    scene.add(gltf.scene)
    frameObject(three, gltf.scene, camera, controls)
  })

  const onResize = (): void => {
    const w = host.clientWidth || width
    const h = host.clientHeight || height
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  globalThis.addEventListener?.('resize', onResize)

  const tick = (): void => {
    controls.update()
    renderer.render(scene, camera)
    raf = globalThis.requestAnimationFrame(tick)
  }
  raf = globalThis.requestAnimationFrame(tick)

  return () => {
    disposed = true
    globalThis.cancelAnimationFrame(raf)
    globalThis.removeEventListener?.('resize', onResize)
    controls.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}

/** Position the camera so the whole object is framed. */
function frameObject(
  three: typeof THREE,
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3, update: () => void },
): void {
  const box = new three.Box3().setFromObject(object)
  const size = box.getSize(new three.Vector3())
  const center = box.getCenter(new three.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const dist = maxDim * 2.2

  camera.position.set(center.x + dist, center.y + dist * 0.6, center.z + dist)
  camera.near = maxDim / 100
  camera.far = maxDim * 100
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  controls.update()
}
