/**
 * Tests for useReducedMotion hook.
 *
 * Verifies that the hook:
 * - returns false when prefers-reduced-motion is not set
 * - returns true when prefers-reduced-motion: reduce is active
 * - reacts to runtime media query changes
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

// Stored event listeners so we can fire fake "change" events in tests
type MQChangeHandler = (e: Partial<MediaQueryListEvent>) => void
let changeHandlers: MQChangeHandler[] = []

function mockMatchMedia(matches: boolean) {
  changeHandlers = []
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_event: string, handler: MQChangeHandler) => {
      changeHandlers.push(handler)
    },
    removeEventListener: (_event: string, handler: MQChangeHandler) => {
      changeHandlers = changeHandlers.filter((h) => h !== handler)
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  // Restore default stub from test-setup.ts
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
})

describe('useReducedMotion', () => {
  it('returns false when prefers-reduced-motion is not active', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when prefers-reduced-motion: reduce is active', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates to true when OS setting changes to reduce at runtime', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    act(() => {
      changeHandlers.forEach((h) => h({ matches: true } as MediaQueryListEvent))
    })

    expect(result.current).toBe(true)
  })

  it('updates back to false when OS setting changes back at runtime', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)

    act(() => {
      changeHandlers.forEach((h) => h({ matches: false } as MediaQueryListEvent))
    })

    expect(result.current).toBe(false)
  })

  it('removes the event listener on unmount', () => {
    mockMatchMedia(false)
    const removeEventListener = vi.fn()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: (_e: string, h: MQChangeHandler) => {
        changeHandlers.push(h)
      },
      removeEventListener,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })

    const { unmount } = renderHook(() => useReducedMotion())
    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
