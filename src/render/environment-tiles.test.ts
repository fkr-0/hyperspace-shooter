import { describe, expect, it } from 'vitest'
import type { StageTheme } from '../game/stage'
import {
  ENVIRONMENT_TILE_BASENAME_BY_THEME,
  environmentTileModuleKey,
  resolveEnvironmentTileUrl,
} from './environment-tiles'

const THEMES: readonly StageTheme[] = [
  'neon-drift',
  'orbital-furnace',
  'chrome-meridian',
  'verdant-hive',
  'hyperglass-corridor',
]

describe('campaign environment tile mapping', () => {
  it('maps all five authored themes to distinct runtime tile assets', () => {
    expect(Object.keys(ENVIRONMENT_TILE_BASENAME_BY_THEME)).toEqual(THEMES)
    expect(new Set(Object.values(ENVIRONMENT_TILE_BASENAME_BY_THEME)).size).toBe(5)
    expect(ENVIRONMENT_TILE_BASENAME_BY_THEME).toEqual({
      'neon-drift': 'neon_drift_expanse.png',
      'orbital-furnace': 'orbital_furnace.png',
      'chrome-meridian': 'chrome_meridian.png',
      'verdant-hive': 'verdant_hive.png',
      'hyperglass-corridor': 'hyperglass_corridor.png',
    })
  })

  it.each(THEMES)('resolves %s through the Vite asset module table', (theme) => {
    const key = environmentTileModuleKey(theme)
    const fakeUrl = `/assets/${ENVIRONMENT_TILE_BASENAME_BY_THEME[theme]}`
    expect(resolveEnvironmentTileUrl(theme, { [key]: fakeUrl })).toBe(fakeUrl)
  })

  it('falls back safely for unknown themes or missing emitted assets', () => {
    expect(resolveEnvironmentTileUrl('unknown-theme', {})).toBeNull()
    expect(resolveEnvironmentTileUrl('neon-drift', {})).toBeNull()
  })
})
