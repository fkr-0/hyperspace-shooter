import { describe, expect, it } from 'vitest'
import { renderProceduralTrack } from './game-audio'

describe('Hyperblast procedural production audio', () => {
  it('renders deterministic bounded stereo loops for every campaign stage theme', () => {
    for (const theme of [
      'neon-drift',
      'orbital-furnace',
      'chrome-meridian',
      'verdant-hive',
      'hyperglass-corridor',
    ] as const) {
      const first = renderProceduralTrack(8_000, theme, 'stage', 0.25)
      const second = renderProceduralTrack(8_000, theme, 'stage', 0.25)
      expect(first[0]).toEqual(second[0])
      expect(first[1]).toEqual(second[1])
      expect(first[0]).toHaveLength(2_000)
      expect(Math.max(...first[0])).toBeLessThanOrEqual(1)
      expect(Math.min(...first[0])).toBeGreaterThanOrEqual(-1)
    }
  })

  it('uses a distinct boss stem without changing the deterministic audio contract', () => {
    const stage = renderProceduralTrack(8_000, 'orbital-furnace', 'stage', 0.1)
    const boss = renderProceduralTrack(8_000, 'orbital-furnace', 'boss', 0.1)
    expect(stage[0]).not.toEqual(boss[0])
    expect(boss[0]).toHaveLength(stage[0].length)
  })

  it('gives Verdant Hive and Hyperglass Corridor distinct deterministic palettes', () => {
    const hive = renderProceduralTrack(8_000, 'verdant-hive', 'stage', 0.2)
    const glass = renderProceduralTrack(8_000, 'hyperglass-corridor', 'stage', 0.2)
    expect(hive[0]).not.toEqual(glass[0])
    expect(hive[1]).not.toEqual(glass[1])
  })
})
