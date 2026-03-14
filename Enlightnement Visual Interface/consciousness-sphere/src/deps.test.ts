import { describe, it, expect } from 'vitest'

describe('runtime dependencies are installed', () => {
  it('imports three', async () => {
    const THREE = await import('three')
    expect(THREE.Scene).toBeDefined()
    expect(THREE.MeshPhysicalMaterial).toBeDefined()
  })

  it('imports @react-three/fiber', async () => {
    const fiber = await import('@react-three/fiber')
    expect(fiber.Canvas).toBeDefined()
  })

  it('imports @react-three/drei', async () => {
    const drei = await import('@react-three/drei')
    expect(drei.OrbitControls).toBeDefined()
  })

  it('imports @react-three/postprocessing', async () => {
    const pp = await import('@react-three/postprocessing')
    expect(pp.EffectComposer).toBeDefined()
  })

  it('imports zustand', async () => {
    const { create } = await import('zustand')
    expect(create).toBeDefined()
  })

  it('imports framer-motion', async () => {
    const fm = await import('framer-motion')
    expect(fm.motion).toBeDefined()
  })

  it('imports gsap', async () => {
    const { gsap } = await import('gsap')
    expect(gsap).toBeDefined()
    expect(gsap.to).toBeDefined()
  })
})
