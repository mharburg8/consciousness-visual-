import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import FacetTabs from './FacetTabs'
import useExplorerStore from '../stores/useExplorerStore'

function resetStore() {
  useExplorerStore.setState({
    selectedLayer: 7,
    hoveredLayer: null,
    activeFacet: 'experience',
    isGuideOpen: false,
    hasSeenGuide: true,
  })
}

describe('FacetTabs — keyboard navigation (Arrow keys)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('ArrowRight on Experience tab moves to The Veil tab', () => {
    render(<FacetTabs />)
    const experienceTab = screen.getByRole('tab', { name: 'Experience' })
    fireEvent.keyDown(experienceTab, { key: 'ArrowRight' })
    expect(useExplorerStore.getState().activeFacet).toBe('veil')
  })

  it('ArrowRight on The Veil tab moves to Dissolving tab', () => {
    act(() => { useExplorerStore.getState().setActiveFacet('veil') })
    render(<FacetTabs />)
    const veilTab = screen.getByRole('tab', { name: 'The Veil' })
    fireEvent.keyDown(veilTab, { key: 'ArrowRight' })
    expect(useExplorerStore.getState().activeFacet).toBe('dissolving')
  })

  it('ArrowRight on Dissolving tab moves to Signs tab', () => {
    act(() => { useExplorerStore.getState().setActiveFacet('dissolving') })
    render(<FacetTabs />)
    const dissolvingTab = screen.getByRole('tab', { name: 'Dissolving' })
    fireEvent.keyDown(dissolvingTab, { key: 'ArrowRight' })
    expect(useExplorerStore.getState().activeFacet).toBe('signs')
  })

  it('ArrowRight on Signs tab wraps around to Experience tab', () => {
    act(() => { useExplorerStore.getState().setActiveFacet('signs') })
    render(<FacetTabs />)
    const signsTab = screen.getByRole('tab', { name: 'Signs' })
    fireEvent.keyDown(signsTab, { key: 'ArrowRight' })
    expect(useExplorerStore.getState().activeFacet).toBe('experience')
  })

  it('ArrowLeft on Experience tab wraps around to Signs tab', () => {
    render(<FacetTabs />)
    const experienceTab = screen.getByRole('tab', { name: 'Experience' })
    fireEvent.keyDown(experienceTab, { key: 'ArrowLeft' })
    expect(useExplorerStore.getState().activeFacet).toBe('signs')
  })

  it('ArrowLeft on The Veil tab moves to Experience tab', () => {
    act(() => { useExplorerStore.getState().setActiveFacet('veil') })
    render(<FacetTabs />)
    const veilTab = screen.getByRole('tab', { name: 'The Veil' })
    fireEvent.keyDown(veilTab, { key: 'ArrowLeft' })
    expect(useExplorerStore.getState().activeFacet).toBe('experience')
  })

  it('ArrowLeft on Signs tab moves to Dissolving tab', () => {
    act(() => { useExplorerStore.getState().setActiveFacet('signs') })
    render(<FacetTabs />)
    const signsTab = screen.getByRole('tab', { name: 'Signs' })
    fireEvent.keyDown(signsTab, { key: 'ArrowLeft' })
    expect(useExplorerStore.getState().activeFacet).toBe('dissolving')
  })

  it('active tab has tabIndex=0, inactive tabs have tabIndex=-1', () => {
    render(<FacetTabs />)
    const experienceTab = screen.getByRole('tab', { name: 'Experience' })
    const veilTab = screen.getByRole('tab', { name: 'The Veil' })
    expect(experienceTab).toHaveAttribute('tabindex', '0')
    expect(veilTab).toHaveAttribute('tabindex', '-1')
  })

  it('after ArrowRight, newly active tab receives tabIndex=0', () => {
    render(<FacetTabs />)
    const experienceTab = screen.getByRole('tab', { name: 'Experience' })
    fireEvent.keyDown(experienceTab, { key: 'ArrowRight' })
    // Re-query after state update
    const veilTab = screen.getByRole('tab', { name: 'The Veil' })
    expect(veilTab).toHaveAttribute('tabindex', '0')
  })

  it('non-arrow keys on tab do not change active facet', () => {
    render(<FacetTabs />)
    const experienceTab = screen.getByRole('tab', { name: 'Experience' })
    fireEvent.keyDown(experienceTab, { key: 'Enter' })
    fireEvent.keyDown(experienceTab, { key: ' ' })
    expect(useExplorerStore.getState().activeFacet).toBe('experience')
  })
})
