import { CHAIN_TIMEOUT_TICKS, MAX_RANK } from './constants'
import type { ScoringState, StageResult } from './types'

function clampRank(value: number): number {
  return Math.max(0, Math.min(MAX_RANK, Math.round(value)))
}

function resolveComboMultiplier(comboCount: number): number {
  return Math.min(8, 1 + Math.max(0, comboCount - 1) * 0.18)
}

export function createScoringState(initialRank = 250): ScoringState {
  return {
    comboCount: 0,
    comboMultiplier: 1,
    chainTicks: 0,
    maxCombo: 0,
    grazeMeter: 0,
    grazeStreak: 0,
    rank: clampRank(initialRank),
  }
}

export function stepScoring(state: ScoringState): void {
  if (state.chainTicks > 0) {
    state.chainTicks -= 1
  } else if (state.comboCount > 0) {
    state.comboCount -= 1
    state.comboMultiplier = resolveComboMultiplier(state.comboCount)
    state.chainTicks = 12
  }
  state.grazeMeter = Math.max(0, state.grazeMeter - 0.25)
}

export function registerGraze(state: ScoringState, count = 1): number {
  const amount = Math.max(0, Math.floor(count))
  if (amount === 0) return 0
  state.grazeStreak += amount
  state.grazeMeter = Math.min(100, state.grazeMeter + amount * 6)
  state.rank = clampRank(state.rank + amount * 2)
  return amount * (100 + Math.min(400, state.grazeStreak * 5))
}

export function registerKill(state: ScoringState, baseValue: number): number {
  state.comboCount += 1
  state.maxCombo = Math.max(state.maxCombo, state.comboCount)
  state.comboMultiplier = resolveComboMultiplier(state.comboCount)
  state.chainTicks = CHAIN_TIMEOUT_TICKS
  state.rank = clampRank(state.rank + 3)
  const grazeMultiplier = 1 + state.grazeMeter / 100
  const rankFactor = 1 + state.rank / 4000
  return Math.floor(Math.max(0, baseValue) * state.comboMultiplier * grazeMultiplier * rankFactor)
}

export function breakChain(state: ScoringState, rankPenalty = 0): void {
  state.comboCount = 0
  state.comboMultiplier = 1
  state.chainTicks = 0
  state.grazeStreak = 0
  state.grazeMeter = 0
  state.rank = clampRank(state.rank - Math.max(0, rankPenalty))
}

export function addSurvivalRank(state: ScoringState, amount = 1): void {
  state.rank = clampRank(state.rank + amount)
}

export function buildStageResult(input: Readonly<{
  stageId: string
  score: number
  enemiesSpawned: number
  enemiesDestroyed: number
  maxCombo: number
  graze: number
  livesLost: number
  bombsUsed: number
  bossPhaseClearTicks: readonly number[]
}>): StageResult {
  const destructionRatio = input.enemiesSpawned <= 0 ? 1 : input.enemiesDestroyed / input.enemiesSpawned
  const rating =
    destructionRatio * 40 +
    Math.min(25, input.maxCombo * 1.25) +
    Math.min(20, input.graze / 5) +
    Math.max(0, 10 - input.livesLost * 4) +
    Math.max(0, 5 - input.bombsUsed * 2)
  const grade: StageResult['grade'] =
    rating >= 90 ? 'S' : rating >= 75 ? 'A' : rating >= 60 ? 'B' : rating >= 45 ? 'C' : 'D'
  return {
    stageId: input.stageId,
    score: input.score,
    destructionRatio,
    maxCombo: input.maxCombo,
    graze: input.graze,
    livesLost: input.livesLost,
    bombsUsed: input.bombsUsed,
    bossPhaseClearTicks: [...input.bossPhaseClearTicks],
    grade,
  }
}
