import { describe, expect, it } from 'vitest'
import { MAX_RANK } from './constants'
import {
  breakChain,
  buildStageResult,
  createScoringState,
  registerGraze,
  registerKill,
  stepScoring,
} from './scoring'

describe('Stage 1 scoring and rank', () => {
  it('keeps combo and rank bounded while rewarding deterministic graze and kills', () => {
    const state = createScoringState(250)
    const grazePoints = registerGraze(state, 8)
    const firstKill = registerKill(state, 200)
    const secondKill = registerKill(state, 200)

    expect(grazePoints).toBeGreaterThan(0)
    expect(secondKill).toBeGreaterThan(firstKill)
    expect(state.comboCount).toBe(2)
    expect(state.maxCombo).toBe(2)

    registerGraze(state, 10_000)
    expect(state.rank).toBe(MAX_RANK)
    breakChain(state, 10_000)
    expect(state.rank).toBe(0)
    expect(state.comboMultiplier).toBe(1)
  })

  it('decays an expired chain without underflow and produces a bounded result grade', () => {
    const state = createScoringState()
    registerKill(state, 100)
    for (let tick = 0; tick < 180; tick += 1) stepScoring(state)
    expect(state.comboCount).toBeGreaterThanOrEqual(0)
    expect(state.comboMultiplier).toBeGreaterThanOrEqual(1)

    const result = buildStageResult({
      stageId: 'stage-1-neon-drift-expanse',
      score: 50_000,
      enemiesSpawned: 20,
      enemiesDestroyed: 20,
      maxCombo: 20,
      graze: 100,
      livesLost: 0,
      bombsUsed: 0,
      bossPhaseClearTicks: [300, 360, 420],
    })
    expect(result.destructionRatio).toBe(1)
    expect(['D', 'C', 'B', 'A', 'S']).toContain(result.grade)
    expect(result.grade).toBe('S')
  })
})
