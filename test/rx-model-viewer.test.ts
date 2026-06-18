import { beforeEach, describe, expect, it, vi } from 'vitest'

// Stub the heavy engines so the element logic can be tested without WebGL or
// network — these resolve to the same module ids index.ts imports dynamically.
const mountThree = vi.fn(async () => () => {})
const mountModelViewer = vi.fn(async () => () => {})
vi.mock('../src/engines/three', () => ({ mountThree }))
vi.mock('../src/engines/model-viewer', () => ({ mountModelViewer }))

const { RxModelViewer, TAG_NAME, register, readConfig } = await import('../src/index')

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

beforeEach(() => {
  mountThree.mockClear()
  mountModelViewer.mockClear()
})

describe('registration', () => {
  it('registers the custom element and is idempotent', () => {
    register()
    register()
    expect(customElements.get(TAG_NAME)).toBe(RxModelViewer)
  })
})

describe('readConfig', () => {
  it('defaults to the sovereign three engine and reads attributes', () => {
    const el = document.createElement('div')
    el.setAttribute('src', 'm.glb')
    expect(readConfig(el)).toMatchObject({ src: 'm.glb', engine: 'three', ar: false })

    el.setAttribute('engine', 'model-viewer')
    el.setAttribute('ar', '')
    el.setAttribute('ios-src', 'part.usdz')
    expect(readConfig(el)).toMatchObject({ engine: 'model-viewer', ar: true, iosSrc: 'part.usdz' })

    el.setAttribute('engine', 'bogus')
    expect(readConfig(el).engine).toBe('three')
  })
})

describe('rendering', () => {
  it('mounts the three engine by default when src is set', async () => {
    const el = document.createElement(TAG_NAME)
    el.setAttribute('src', 'model.glb')
    document.body.appendChild(el)
    await tick()

    expect(mountThree).toHaveBeenCalledOnce()
    expect(mountModelViewer).not.toHaveBeenCalled()
    el.remove()
  })

  it('mounts the model-viewer engine when selected', async () => {
    const el = document.createElement(TAG_NAME)
    el.setAttribute('src', 'model.glb')
    el.setAttribute('engine', 'model-viewer')
    document.body.appendChild(el)
    await tick()

    expect(mountModelViewer).toHaveBeenCalledOnce()
    el.remove()
  })

  it('does not mount anything without a src', async () => {
    const el = document.createElement(TAG_NAME)
    document.body.appendChild(el)
    await tick()

    expect(mountThree).not.toHaveBeenCalled()
    expect(mountModelViewer).not.toHaveBeenCalled()
    el.remove()
  })
})
