import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import useExplorerStore from './stores/useExplorerStore'

// Scene contains the R3F Canvas which requires ResizeObserver and WebGL —
// neither are available in jsdom. Stub it out so App can render in unit tests.
vi.mock('./components/Scene', () => ({
  default: () => <div data-testid="scene-stub" />,
}))

// IntroOverlay checks localStorage for a "seen" flag; ensure a clean slate.
// Reset isTextMode so toggle tests don't bleed into each other.
beforeEach(() => {
  localStorage.clear()
  useExplorerStore.setState({ isTextMode: false, selectedLayer: null })
})

describe('App', () => {
  it('renders the 3D scene container when not in text mode', () => {
    render(<App />)
    expect(document.querySelector('[data-testid="scene-stub"]')).toBeInTheDocument()
  })

  it('renders the accessibility toggle button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /switch to text-only view/i })).toBeInTheDocument()
  })

  it('renders the help button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /open navigation guide/i })).toBeInTheDocument()
  })
})

describe('App — text-only mode toggle', () => {
  it('clicking the accessibility toggle enters text mode', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /switch to text-only view/i }))
    expect(useExplorerStore.getState().isTextMode).toBe(true)
  })

  it('in text mode the accordion is shown instead of the 3D scene', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /switch to text-only view/i }))
    // Accordion header should be present
    expect(screen.getByText('Map of Consciousness')).toBeInTheDocument()
    // Scene stub should not be present
    expect(document.querySelector('[data-testid="scene-stub"]')).toBeNull()
  })

  it('in text mode the toggle button label changes to "Switch to 3D view"', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /switch to text-only view/i }))
    expect(
      screen.getByRole('button', { name: /switch to 3d view/i })
    ).toBeInTheDocument()
  })

  it('toggling back to 3D mode restores the scene and hides the accordion', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /switch to text-only view/i })
    fireEvent.click(toggle) // enter text mode
    fireEvent.click(screen.getByRole('button', { name: /switch to 3d view/i })) // exit
    expect(document.querySelector('[data-testid="scene-stub"]')).toBeInTheDocument()
    expect(screen.queryByText('Map of Consciousness')).toBeNull()
  })

  it('text mode accordion shows all 7 layers', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /switch to text-only view/i }))
    // Spot-check outermost and innermost layers
    expect(screen.getByText('3rd Dimension: Contraction & Fear')).toBeInTheDocument()
    expect(
      screen.getByText('12th Dimension: Supra-Causal Truth & Full Consciousness')
    ).toBeInTheDocument()
  })
})
