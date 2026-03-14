import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import InfoPanel from './InfoPanel'
import useExplorerStore from '../stores/useExplorerStore'

// ── Framer Motion stub ────────────────────────────────────────────────────────
// AnimatePresence's exit animation would keep the panel in the DOM after
// selectLayer(null) in jsdom. Replace both with instant-render pass-throughs.
vi.mock('framer-motion', async () => {
  const React = await import('react')
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: {
      aside: React.forwardRef<
        HTMLElement,
        React.HTMLAttributes<HTMLElement> & Record<string, unknown>
      >(function MotionAside(
        { drag: _d, dragConstraints: _dc, dragElastic: _de, onDragEnd: _ode,
          initial: _i, animate: _a, exit: _e, variants: _v, transition: _t,
          children, ...props },
        ref
      ) {
        return React.createElement('aside', { ...props, ref }, children as React.ReactNode)
      }),
    },
  }
})

// ── Store reset helper ────────────────────────────────────────────────────────
function resetStore() {
  useExplorerStore.setState({
    selectedLayer: null,
    hoveredLayer: null,
    activeFacet: 'experience',
    isGuideOpen: false,
    hasSeenGuide: true,
  })
}

describe('InfoPanel — interaction flow', () => {
  beforeEach(() => {
    resetStore()
  })

  // ── Panel visibility ─────────────────────────────────────────────────────────

  it('panel is absent when no layer is selected', () => {
    render(<InfoPanel />)
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('panel renders when a layer is selected', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  // ── Panel content ─────────────────────────────────────────────────────────────

  it('panel shows the selected layer name', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    expect(screen.getByText('3rd Dimension: Contraction & Fear')).toBeInTheDocument()
  })

  it('panel shows the layer subtitle', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    expect(
      screen.getByText('The densest veil — survival, separation, reactivity')
    ).toBeInTheDocument()
  })

  it('panel shows facet title for the active experience facet', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    expect(screen.getByText('What You Experience Here')).toBeInTheDocument()
  })

  it('panel shows the first paragraph of experience facet content', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    // The experience facet starts with this phrase
    expect(
      screen.getByText(/the grip of fear/i)
    ).toBeInTheDocument()
  })

  it('panel shows level pills for the selected layer', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    expect(screen.getByText('Shame')).toBeInTheDocument()
    expect(screen.getByText('Fear')).toBeInTheDocument()
    expect(screen.getByText('Anger')).toBeInTheDocument()
  })

  it('panel shows the correct layer for an inner layer (layer 4)', () => {
    act(() => { useExplorerStore.getState().selectLayer(4) })
    render(<InfoPanel />)
    expect(screen.getByText('5th Dimension: Unity & Bliss')).toBeInTheDocument()
  })

  // ── Facet tab switching ───────────────────────────────────────────────────────

  it('switching facet tab updates the displayed facet title', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)

    // Click "The Veil" tab
    fireEvent.click(screen.getByRole('tab', { name: 'The Veil' }))

    expect(screen.getByText('What Keeps This Layer Opaque')).toBeInTheDocument()
  })

  it('switching to Dissolving tab shows dissolving content', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    fireEvent.click(screen.getByRole('tab', { name: 'Dissolving' }))
    expect(screen.getByText('How This Layer Dissolves')).toBeInTheDocument()
  })

  it('switching to Signs tab shows signs content', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)
    fireEvent.click(screen.getByRole('tab', { name: 'Signs' }))
    expect(screen.getByText('Signs of Thinning')).toBeInTheDocument()
  })

  // ── Close / Restore ───────────────────────────────────────────────────────────

  it('X button calls selectLayer(null) — panel closes', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)

    fireEvent.click(screen.getByRole('button', { name: /close panel/i }))

    expect(useExplorerStore.getState().selectedLayer).toBeNull()
  })

  it('Escape key calls selectLayer(null) — panel closes', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    render(<InfoPanel />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(useExplorerStore.getState().selectedLayer).toBeNull()
  })

  it('panel is absent from the DOM after close', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    const { rerender } = render(<InfoPanel />)
    expect(screen.getByRole('complementary')).toBeInTheDocument()

    // Close via store (as if X was clicked)
    act(() => { useExplorerStore.getState().selectLayer(null) })
    rerender(<InfoPanel />)

    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('panel shows new layer after selecting a different one', () => {
    act(() => { useExplorerStore.getState().selectLayer(7) })
    const { rerender } = render(<InfoPanel />)
    expect(screen.getByText('3rd Dimension: Contraction & Fear')).toBeInTheDocument()

    act(() => { useExplorerStore.getState().selectLayer(5) })
    rerender(<InfoPanel />)

    expect(screen.getByText('New Humanity Consciousness: Meaning & Wisdom')).toBeInTheDocument()
  })
})
