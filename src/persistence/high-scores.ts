import {
  createBrowserStorageAdapter,
  createMemoryStorageAdapter,
  createVersionedStore,
  type ArcadeStorageAdapter,
} from '@arcade/runtime/storage'
import type { StageResult } from '../game/types'

export const HIGH_SCORE_STORE_VERSION = 2
export const HIGH_SCORE_STORAGE_PREFIX = 'hyperblast-shooter'
export const HIGH_SCORE_STORAGE_KEY = 'high-scores'
export const MAX_STORED_RUNS = 20

export type StoredRunResult = Readonly<{
  stageId: string
  score: number
  destructionRatio: number
  maxCombo: number
  graze: number
  livesLost: number
  bombsUsed: number
  bossPhaseClearTicks: readonly number[]
  grade: StageResult['grade']
}>

export type HighScoreData = Readonly<{
  schema: 'hyperblast-high-scores-v2'
  stageBests: Readonly<Record<string, StoredRunResult>>
  recentRuns: readonly StoredRunResult[]
  clearedStages: readonly string[]
}>

type MutableHighScoreData = {
  schema: 'hyperblast-high-scores-v2'
  stageBests: Record<string, StoredRunResult>
  recentRuns: StoredRunResult[]
  clearedStages: string[]
}

function defaults(): MutableHighScoreData {
  return {
    schema: 'hyperblast-high-scores-v2',
    stageBests: {},
    recentRuns: [],
    clearedStages: [],
  }
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isGrade(value: unknown): value is StageResult['grade'] {
  return value === 'D' || value === 'C' || value === 'B' || value === 'A' || value === 'S'
}

function isStoredRunResult(value: unknown): value is StoredRunResult {
  if (!value || typeof value !== 'object') return false
  const run = value as Partial<StoredRunResult>
  return (
    typeof run.stageId === 'string' &&
    run.stageId.length > 0 &&
    finiteNonNegative(run.score) &&
    finiteNonNegative(run.destructionRatio) &&
    run.destructionRatio <= 1 &&
    finiteNonNegative(run.maxCombo) &&
    finiteNonNegative(run.graze) &&
    finiteNonNegative(run.livesLost) &&
    finiteNonNegative(run.bombsUsed) &&
    Array.isArray(run.bossPhaseClearTicks) &&
    run.bossPhaseClearTicks.every(finiteNonNegative) &&
    isGrade(run.grade)
  )
}

function isHighScoreData(value: unknown): value is HighScoreData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<HighScoreData>
  if (data.schema !== 'hyperblast-high-scores-v2') return false
  if (!data.stageBests || typeof data.stageBests !== 'object' || Array.isArray(data.stageBests)) return false
  if (!Array.isArray(data.recentRuns) || !Array.isArray(data.clearedStages)) return false
  if (!Object.values(data.stageBests).every(isStoredRunResult)) return false
  if (!data.recentRuns.every(isStoredRunResult)) return false
  if (!data.clearedStages.every((stageId) => typeof stageId === 'string' && stageId.length > 0)) return false
  return true
}

function toStoredRun(result: StageResult): StoredRunResult {
  return Object.freeze({
    stageId: result.stageId,
    score: result.score,
    destructionRatio: result.destructionRatio,
    maxCombo: result.maxCombo,
    graze: result.graze,
    livesLost: result.livesLost,
    bombsUsed: result.bombsUsed,
    bossPhaseClearTicks: Object.freeze([...result.bossPhaseClearTicks]),
    grade: result.grade,
  })
}

function legacyRun(stageId: string, value: unknown): StoredRunResult | null {
  if (isStoredRunResult(value)) return value
  if (finiteNonNegative(value)) {
    return Object.freeze({
      stageId,
      score: value,
      destructionRatio: 0,
      maxCombo: 0,
      graze: 0,
      livesLost: 0,
      bombsUsed: 0,
      bossPhaseClearTicks: Object.freeze([]),
      grade: 'D' as const,
    })
  }
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<StoredRunResult>
  const score = finiteNonNegative(candidate.score) ? candidate.score : 0
  return Object.freeze({
    stageId,
    score,
    destructionRatio: finiteNonNegative(candidate.destructionRatio)
      ? Math.min(1, candidate.destructionRatio)
      : 0,
    maxCombo: finiteNonNegative(candidate.maxCombo) ? candidate.maxCombo : 0,
    graze: finiteNonNegative(candidate.graze) ? candidate.graze : 0,
    livesLost: finiteNonNegative(candidate.livesLost) ? candidate.livesLost : 0,
    bombsUsed: finiteNonNegative(candidate.bombsUsed) ? candidate.bombsUsed : 0,
    bossPhaseClearTicks: Array.isArray(candidate.bossPhaseClearTicks)
      ? Object.freeze(candidate.bossPhaseClearTicks.filter(finiteNonNegative))
      : Object.freeze([]),
    grade: isGrade(candidate.grade) ? candidate.grade : 'D',
  })
}

function migrateLegacyData(value: unknown): MutableHighScoreData {
  if (isHighScoreData(value)) {
    return {
      schema: value.schema,
      stageBests: { ...value.stageBests },
      recentRuns: [...value.recentRuns],
      clearedStages: [...value.clearedStages],
    }
  }

  const result = defaults()
  if (!value || typeof value !== 'object') return result
  const legacy = value as {
    stageBests?: Record<string, unknown>
    results?: unknown[]
    recentRuns?: unknown[]
    clearedStages?: unknown[]
  }
  for (const [stageId, candidate] of Object.entries(legacy.stageBests ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    const run = legacyRun(stageId, candidate)
    if (run) result.stageBests[stageId] = run
  }
  for (const candidate of [...(legacy.recentRuns ?? []), ...(legacy.results ?? [])]) {
    if (!candidate || typeof candidate !== 'object') continue
    const stageId = (candidate as { stageId?: unknown }).stageId
    if (typeof stageId !== 'string' || stageId.length === 0) continue
    const run = legacyRun(stageId, candidate)
    if (run) result.recentRuns.push(run)
  }
  const explicitClears = (legacy.clearedStages ?? []).filter(
    (stageId): stageId is string => typeof stageId === 'string' && stageId.length > 0,
  )
  result.clearedStages = [...new Set([...explicitClears, ...Object.keys(result.stageBests)])].sort()
  result.recentRuns = result.recentRuns.slice(0, MAX_STORED_RUNS)
  return result
}

function cloneData(data: HighScoreData): MutableHighScoreData {
  return {
    schema: data.schema,
    stageBests: { ...data.stageBests },
    recentRuns: [...data.recentRuns],
    clearedStages: [...data.clearedStages],
  }
}

function prefersCandidate(candidate: StoredRunResult, current: StoredRunResult | undefined): boolean {
  if (!current) return true
  if (candidate.score !== current.score) return candidate.score > current.score
  if (candidate.grade !== current.grade) return 'DCBAS'.indexOf(candidate.grade) > 'DCBAS'.indexOf(current.grade)
  if (candidate.livesLost !== current.livesLost) return candidate.livesLost < current.livesLost
  return candidate.bombsUsed < current.bombsUsed
}

export function createHighScoreService(options?: {
  adapter?: ArcadeStorageAdapter
  now?: () => number
  maxRuns?: number
}) {
  const maxRuns = Math.max(1, Math.floor(options?.maxRuns ?? MAX_STORED_RUNS))
  const fallbackAdapter = createMemoryStorageAdapter()
  let corruptionCount = 0
  let usingFallback = false

  const createStore = (adapter: ArcadeStorageAdapter) =>
    createVersionedStore<HighScoreData>({
      adapter,
      key: HIGH_SCORE_STORAGE_KEY,
      version: HIGH_SCORE_STORE_VERSION,
      defaults,
      now: options?.now,
      validate: isHighScoreData,
      migrations: {
        2: (data) => migrateLegacyData(data),
      },
      preEnvelopeMigration: (data) => ({
        version: 1,
        data,
      }),
      onCorruption: () => {
        corruptionCount += 1
      },
    })

  const primary = createStore(options?.adapter ?? fallbackAdapter)
  const fallback = options?.adapter ? createStore(fallbackAdapter) : primary

  function load() {
    if (usingFallback) return fallback.load()
    try {
      return primary.load()
    } catch {
      usingFallback = true
      return fallback.load()
    }
  }

  function save(data: HighScoreData): void {
    if (!usingFallback) {
      try {
        primary.save(data)
        return
      } catch {
        usingFallback = true
      }
    }
    fallback.save(data)
  }

  return {
    load: () => load(),
    recordResult(result: StageResult): Readonly<{ data: HighScoreData; isNewBest: boolean }> {
      const previous = load().data
      const data = cloneData(previous)
      const run = toStoredRun(result)
      const currentBest = data.stageBests[result.stageId]
      const isNewBest = prefersCandidate(run, currentBest)
      if (isNewBest) data.stageBests[result.stageId] = run
      data.recentRuns = [run, ...data.recentRuns].slice(0, maxRuns)
      data.clearedStages = [...new Set([...data.clearedStages, result.stageId])].sort()
      save(data)
      return Object.freeze({ data: load().data, isNewBest })
    },
    clear(): void {
      try {
        primary.clear()
      } catch {
        usingFallback = true
      }
      fallback.clear()
    },
    diagnostics: () => Object.freeze({ usingFallback, corruptionCount, version: HIGH_SCORE_STORE_VERSION }),
  }
}

export function createBrowserHighScoreService(storage?: Storage) {
  try {
    return createHighScoreService({
      adapter: createBrowserStorageAdapter({ storage, prefix: HIGH_SCORE_STORAGE_PREFIX }),
    })
  } catch {
    return createHighScoreService()
  }
}
