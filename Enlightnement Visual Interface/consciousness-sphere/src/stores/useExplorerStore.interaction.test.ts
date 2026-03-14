import { describe, it, expect, beforeEach } from 'vitest'
import useExplorerStore from './useExplorerStore'

/**
 * Tests the state transitions for the full interaction flow:
 *   hover → click → (dissolve is visual, driven by selectedLayer state) → panel → close → restore
 *
 * The 3D animation side (GSAP/Three.js) is not testable in jsdom.
 * These tests verify the store state machine that drives all those visual effects.
 */
describe('interaction flow: hover → click → panel → close → restore', () => {
  beforeEach(() => {
    // Reset transient state between tests (store is a singleton)
    useExplorerStore.setState({
      selectedLayer: null,
      hoveredLayer: null,
      activeFacet: 'experience',
      isGuideOpen: false,
      hasSeenGuide: true,
    })
  })

  // ── HOVER ────────────────────────────────────────────────────────────────────

  it('hover sets hoveredLayer to the layer id', () => {
    useExplorerStore.getState().setHoveredLayer(7)
    expect(useExplorerStore.getState().hoveredLayer).toBe(7)
  })

  it('pointer leave clears hoveredLayer to null', () => {
    useExplorerStore.getState().setHoveredLayer(7)
    useExplorerStore.getState().setHoveredLayer(null)
    expect(useExplorerStore.getState().hoveredLayer).toBeNull()
  })

  it('hovering a different layer updates hoveredLayer', () => {
    useExplorerStore.getState().setHoveredLayer(7)
    useExplorerStore.getState().setHoveredLayer(4)
    expect(useExplorerStore.getState().hoveredLayer).toBe(4)
  })

  // ── CLICK / SELECT ───────────────────────────────────────────────────────────

  it('click sets selectedLayer to the clicked layer id', () => {
    useExplorerStore.getState().selectLayer(7)
    expect(useExplorerStore.getState().selectedLayer).toBe(7)
  })

  it('click resets activeFacet to experience regardless of previous facet', () => {
    useExplorerStore.getState().setActiveFacet('veil')
    useExplorerStore.getState().selectLayer(5)
    expect(useExplorerStore.getState().activeFacet).toBe('experience')
  })

  it('clicking an inner layer while one is already selected updates selectedLayer', () => {
    useExplorerStore.getState().selectLayer(7)
    useExplorerStore.getState().selectLayer(3)
    expect(useExplorerStore.getState().selectedLayer).toBe(3)
  })

  // ── PANEL OPEN / FACET NAVIGATION ────────────────────────────────────────────

  it('setActiveFacet switches between facets while layer is selected', () => {
    useExplorerStore.getState().selectLayer(6)
    useExplorerStore.getState().setActiveFacet('veil')
    expect(useExplorerStore.getState().activeFacet).toBe('veil')
    useExplorerStore.getState().setActiveFacet('dissolving')
    expect(useExplorerStore.getState().activeFacet).toBe('dissolving')
  })

  // ── CLOSE / RESTORE ───────────────────────────────────────────────────────────

  it('close (selectLayer null) clears selectedLayer', () => {
    useExplorerStore.getState().selectLayer(5)
    useExplorerStore.getState().selectLayer(null)
    expect(useExplorerStore.getState().selectedLayer).toBeNull()
  })

  it('after close, selecting a new layer works correctly', () => {
    useExplorerStore.getState().selectLayer(7)
    useExplorerStore.getState().selectLayer(null)
    useExplorerStore.getState().selectLayer(2)
    expect(useExplorerStore.getState().selectedLayer).toBe(2)
  })

  it('full flow: hover → click → change facet → close returns to clean state', () => {
    const store = useExplorerStore.getState()

    // hover
    store.setHoveredLayer(6)
    expect(useExplorerStore.getState().hoveredLayer).toBe(6)

    // click
    store.selectLayer(6)
    expect(useExplorerStore.getState().selectedLayer).toBe(6)
    expect(useExplorerStore.getState().activeFacet).toBe('experience')

    // switch facet
    store.setActiveFacet('signs')
    expect(useExplorerStore.getState().activeFacet).toBe('signs')

    // close — clear pointer and selection
    store.setHoveredLayer(null)
    store.selectLayer(null)
    expect(useExplorerStore.getState().hoveredLayer).toBeNull()
    expect(useExplorerStore.getState().selectedLayer).toBeNull()
  })
})
