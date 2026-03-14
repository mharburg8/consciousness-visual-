import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TextModeAccordion from './TextModeAccordion'
import { layers } from '../data/layers'

// Layer headers are hidden inside panels — this helper returns only the
// top-level layer toggle buttons (id starts with "layer-header-").
function getLayerHeaders() {
  return screen
    .getAllByRole('button')
    .filter((b) => b.id.startsWith('layer-header-'))
}

describe('TextModeAccordion — content accessible without WebGL', () => {
  beforeEach(() => {
    // Component is stateless w.r.t. external store; localStorage not used.
  })

  // ── Layer list ───────────────────────────────────────────────────────────────

  it('renders all 7 layer names', () => {
    render(<TextModeAccordion />)
    for (const layer of layers) {
      expect(screen.getByText(layer.name)).toBeInTheDocument()
    }
  })

  it('renders 7 layer header buttons', () => {
    render(<TextModeAccordion />)
    expect(getLayerHeaders()).toHaveLength(7)
  })

  it('shows the FEAR ↔ LOVE threshold badge', () => {
    render(<TextModeAccordion />)
    expect(
      screen.getByLabelText(/FEAR.*LOVE threshold/i)
    ).toBeInTheDocument()
  })

  it('all layer headers start collapsed (aria-expanded=false)', () => {
    render(<TextModeAccordion />)
    for (const btn of getLayerHeaders()) {
      expect(btn).toHaveAttribute('aria-expanded', 'false')
    }
  })

  // ── Layer expansion ──────────────────────────────────────────────────────────

  it('clicking layer 7 header expands it (aria-expanded=true)', () => {
    render(<TextModeAccordion />)
    const btn = screen.getByRole('button', { name: /3rd Dimension/i })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('expanding layer 7 reveals its levels', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /3rd Dimension/i }))
    for (const level of layers.find((l) => l.id === 7)!.levels) {
      expect(screen.getByText(level)).toBeInTheDocument()
    }
  })

  it('expanding layer 7 shows all 4 facet toggle buttons', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /3rd Dimension/i }))
    expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'The Veil' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dissolving' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Signs' })).toBeInTheDocument()
  })

  it('opening a second layer closes the first', () => {
    render(<TextModeAccordion />)
    const layer7Btn = screen.getByRole('button', { name: /3rd Dimension/i })
    const layer6Btn = screen.getByRole('button', { name: /4th Dimension/i })
    fireEvent.click(layer7Btn)
    expect(layer7Btn).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(layer6Btn)
    expect(layer7Btn).toHaveAttribute('aria-expanded', 'false')
    expect(layer6Btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking an open layer header collapses it', () => {
    render(<TextModeAccordion />)
    const btn = screen.getByRole('button', { name: /3rd Dimension/i })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  // ── Facet content ────────────────────────────────────────────────────────────

  it('clicking the Experience facet reveals its content', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /3rd Dimension/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Experience' }))
    expect(screen.getByText(/the grip of fear/i)).toBeInTheDocument()
  })

  it('clicking The Veil facet reveals veil content', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /3rd Dimension/i }))
    fireEvent.click(screen.getByRole('button', { name: 'The Veil' }))
    // Check for content unique to layer 7's veil facet
    expect(screen.getByText(/the belief — felt more than thought/i)).toBeInTheDocument()
  })

  it('clicking Dissolving facet reveals dissolving content', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /3rd Dimension/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Dissolving' }))
    // Check for content unique to layer 7's dissolving facet
    expect(screen.getByText(/The emotions held here are physical/i)).toBeInTheDocument()
  })

  it('clicking Signs facet reveals signs content', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /3rd Dimension/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Signs' }))
    // Check for content unique to layer 7's signs facet
    expect(screen.getByText(/You notice the fear is still there/i)).toBeInTheDocument()
  })

  it('all 4 facets can be opened independently for an inner layer', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /I AM Presence/i }))
    // Experience: unique to layer 3
    fireEvent.click(screen.getByRole('button', { name: 'Experience' }))
    expect(screen.getByText(/"I AM" — not "I am happy"/i)).toBeInTheDocument()
    // The Veil: unique to layer 3
    fireEvent.click(screen.getByRole('button', { name: 'The Veil' }))
    expect(screen.getByText(/the veil is nothing but the faintest sense/i)).toBeInTheDocument()
  })

  // ── All layers fully accessible ──────────────────────────────────────────────

  it('every layer can be expanded to reveal its levels', () => {
    render(<TextModeAccordion />)
    for (const layer of layers) {
      const btn = screen.getByRole('button', { name: new RegExp(layer.name) })
      fireEvent.click(btn)
      // Spot-check the first level in each layer
      expect(screen.getByText(layer.levels[0])).toBeInTheDocument()
      // Collapse before next iteration (only one layer open at a time)
      fireEvent.click(btn)
    }
  })

  it('every layer exposes all 4 facet buttons when opened', () => {
    render(<TextModeAccordion />)
    for (const layer of layers) {
      const btn = screen.getByRole('button', { name: new RegExp(layer.name) })
      fireEvent.click(btn)
      expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'The Veil' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Dissolving' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Signs' })).toBeInTheDocument()
      fireEvent.click(btn)
    }
  })

  // ── ARIA / accessibility attributes ─────────────────────────────────────────

  it('layer header has aria-controls pointing to its panel', () => {
    render(<TextModeAccordion />)
    const btn = screen.getByRole('button', { name: /3rd Dimension/i })
    expect(btn).toHaveAttribute('aria-controls', 'layer-panel-7')
  })

  it('layer header id matches the aria-controls of its parent', () => {
    render(<TextModeAccordion />)
    const btn = screen.getByRole('button', { name: /3rd Dimension/i })
    expect(btn).toHaveAttribute('id', 'layer-header-7')
  })

  it('layer panel has role=region and aria-labelledby matching its header', () => {
    render(<TextModeAccordion />)
    // Panel is not hidden — it's just hidden attribute; RTL still finds regions
    // when querying by role with hidden:true option
    const panel = document.getElementById('layer-panel-7')
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('aria-labelledby', 'layer-header-7')
  })

  it('facet section has role=region with correct aria-labelledby', () => {
    render(<TextModeAccordion />)
    fireEvent.click(screen.getByRole('button', { name: /3rd Dimension/i }))
    const facetPanel = document.getElementById('facet-panel-7-experience')
    expect(facetPanel).toHaveAttribute('role', 'region')
    expect(facetPanel).toHaveAttribute('aria-labelledby', 'facet-header-7-experience')
  })

  // ── Keyboard navigation ──────────────────────────────────────────────────────

  it('ArrowDown moves focus from first to second layer header', () => {
    render(<TextModeAccordion />)
    const headers = getLayerHeaders()
    headers[0].focus()
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(headers[1])
  })

  it('ArrowUp moves focus from second to first layer header', () => {
    render(<TextModeAccordion />)
    const headers = getLayerHeaders()
    headers[1].focus()
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowUp' })
    expect(document.activeElement).toBe(headers[0])
  })

  it('ArrowDown does not move past the last layer header', () => {
    render(<TextModeAccordion />)
    const headers = getLayerHeaders()
    const last = headers[headers.length - 1]
    last.focus()
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowDown' })
    // Focus stays on the last header (no next element)
    expect(document.activeElement).toBe(last)
  })

  it('ArrowUp does not move before the first layer header', () => {
    render(<TextModeAccordion />)
    const headers = getLayerHeaders()
    headers[0].focus()
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowUp' })
    expect(document.activeElement).toBe(headers[0])
  })
})
