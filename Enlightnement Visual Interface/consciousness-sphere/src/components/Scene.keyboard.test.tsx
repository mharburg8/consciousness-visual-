/**
 * Keyboard navigation tests for KeyboardControls (Tab, Escape, R)
 *
 * KeyboardControls lives inside the R3F Canvas and uses useThree() to access
 * the camera. We mock @react-three/fiber so the component can render in jsdom
 * without WebGL, then fire window keyboard events and assert on store state
 * and camera calls.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useRef } from 'react'
import { KeyboardControls } from './Scene'
import useExplorerStore from '../stores/useExplorerStore'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

// ── Fake camera ───────────────────────────────────────────────────────────────
const mockCameraPosition = { set: vi.fn() }
const mockCamera = { position: mockCameraPosition, lookAt: vi.fn() }

// Mock @react-three/fiber so useThree() returns our fake camera in jsdom
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({ camera: mockCamera }),
  useFrame: () => {},
  Canvas: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ── Store reset ───────────────────────────────────────────────────────────────
function resetStore(selectedLayer: number | null = null) {
  useExplorerStore.setState({
    selectedLayer,
    hoveredLayer: null,
    activeFacet: 'experience',
    isGuideOpen: false,
    hasSeenGuide: true,
  })
}

// ── Wrapper that provides a controlsRef ──────────────────────────────────────
function KeyboardControlsWrapper({ controlsTarget }: { controlsTarget?: { set: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } }) {
  const controlsRef = useRef<OrbitControlsImpl | null>(
    controlsTarget ? (controlsTarget as unknown as OrbitControlsImpl) : null
  )
  return <KeyboardControls controlsRef={controlsRef} />
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('KeyboardControls — Tab key (layer cycling)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('Tab with no layer selected jumps to the first layer (id=7)', () => {
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'Tab' })
    // LAYER_IDS = [7,6,5,4,3,2,1]; currentIndex=-1 → nextIndex=0 → id=7
    expect(useExplorerStore.getState().selectedLayer).toBe(7)
  })

  it('Tab from layer 7 moves to layer 6', () => {
    resetStore(7)
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(useExplorerStore.getState().selectedLayer).toBe(6)
  })

  it('Tab from layer 6 moves to layer 5', () => {
    resetStore(6)
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(useExplorerStore.getState().selectedLayer).toBe(5)
  })

  it('Tab from the innermost layer (id=1) wraps back to layer 7', () => {
    resetStore(1)
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(useExplorerStore.getState().selectedLayer).toBe(7)
  })
})

describe('KeyboardControls — Escape key (close panel)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('Escape clears selectedLayer', () => {
    resetStore(5)
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useExplorerStore.getState().selectedLayer).toBeNull()
  })

  it('Escape when no layer selected leaves selectedLayer null', () => {
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useExplorerStore.getState().selectedLayer).toBeNull()
  })
})

describe('KeyboardControls — R key (camera reset)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  it('R key calls camera.position.set with default position', () => {
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'R' })
    expect(mockCameraPosition.set).toHaveBeenCalledWith(0, 2, 12)
  })

  it('lowercase r key also resets camera position', () => {
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'r' })
    expect(mockCameraPosition.set).toHaveBeenCalledWith(0, 2, 12)
  })

  it('R key calls camera.lookAt(0,0,0)', () => {
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'R' })
    expect(mockCamera.lookAt).toHaveBeenCalledWith(0, 0, 0)
  })

  it('R key calls controlsRef.target.set(0,0,0) and update() when ref is set', () => {
    const mockTarget = { set: vi.fn() }
    const mockControls = { target: mockTarget, update: vi.fn() }
    render(<KeyboardControlsWrapper controlsTarget={mockControls as unknown as { set: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> }} />)
    fireEvent.keyDown(window, { key: 'R' })
    expect(mockTarget.set).toHaveBeenCalledWith(0, 0, 0)
    expect(mockControls.update).toHaveBeenCalled()
  })

  it('non-matching keys do not trigger camera reset', () => {
    render(<KeyboardControlsWrapper />)
    fireEvent.keyDown(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(mockCameraPosition.set).not.toHaveBeenCalled()
  })
})

describe('KeyboardControls — input field guard', () => {
  beforeEach(() => {
    resetStore()
  })

  it('Tab key inside an input element does not cycle layers', () => {
    render(
      <div>
        <KeyboardControlsWrapper />
        <input data-testid="text-input" />
      </div>
    )
    const input = document.querySelector('input')!
    // Fire keydown with the input as target — handler should bail early
    fireEvent.keyDown(input, { key: 'Tab', target: input })
    expect(useExplorerStore.getState().selectedLayer).toBeNull()
  })
})
