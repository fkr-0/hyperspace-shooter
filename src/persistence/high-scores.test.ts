import { createMemoryStorageAdapter } from '@arcade/runtime/storage'
import { describe, expect, it } from 'vitest'
import type { StageResult } from '../game/types'
import {
  createHighScoreService,
  HIGH_SCORE_STORAGE_KEY,
  HIGH_SCORE_STORE_VERSION,
} from './high-scores'

function result(stageId: string, score: number, overrides: Partial<StageResult> = {}): StageResult {
  return {
    stageId,
    score,
    destructionRatio: 1,
    maxCombo: 14,
    graze: 28,
    livesLost: 1,
    bombsUsed: 1,
    bossPhaseClearTicks: [240, 300, 360],
    grade: 'A',
    ...overrides,
  }
}

describe('Hyperblast high-score persistence', () => {
  it('persists stage bests and bounded useful run results without touching simulation state', () => {
    const adapter = createMemoryStorageAdapter()
    const first = createHighScoreService({ adapter, now: () => 100, maxRuns: 2 })
    expect(first.load().source).toBe('default')

    expect(first.recordResult(result('stage-4-verdant-hive', 12_000)).isNewBest).toBe(true)
    expect(first.recordResult(result('stage-4-verdant-hive', 9_000)).isNewBest).toBe(false)
    first.recordResult(result('stage-5-hyperglass-corridor', 18_000, { grade: 'S' }))

    const second = createHighScoreService({ adapter, now: () => 200, maxRuns: 2 })
    const data = second.load().data
    expect(data.stageBests['stage-4-verdant-hive']?.score).toBe(12_000)
    expect(data.stageBests['stage-5-hyperglass-corridor']?.grade).toBe('S')
    expect(data.recentRuns).toHaveLength(2)
    expect(data.clearedStages).toEqual(['stage-4-verdant-hive', 'stage-5-hyperglass-corridor'])
  })

  it('migrates older plain local data and rewrites it as the current versioned envelope', () => {
    const adapter = createMemoryStorageAdapter({
      [HIGH_SCORE_STORAGE_KEY]: JSON.stringify({
        stageBests: { 'stage-4-verdant-hive': 4321 },
        results: [{ stageId: 'stage-5-hyperglass-corridor', score: 8765, grade: 'B' }],
      }),
    })
    const service = createHighScoreService({ adapter, now: () => 300 })
    const loaded = service.load()

    expect(loaded.migrated).toBe(true)
    expect(loaded.version).toBe(HIGH_SCORE_STORE_VERSION)
    expect(loaded.data.stageBests['stage-4-verdant-hive']?.score).toBe(4321)
    expect(loaded.data.recentRuns[0]?.score).toBe(8765)
    expect(JSON.parse(adapter.snapshot()[HIGH_SCORE_STORAGE_KEY] ?? '{}').version).toBe(HIGH_SCORE_STORE_VERSION)
  })

  it('falls back to memory when browser-like storage rejects access', () => {
    const restrictedAdapter = {
      getItem(): string | null {
        throw new DOMException('Storage access denied', 'SecurityError')
      },
      setItem(): void {
        throw new DOMException('Storage access denied', 'QuotaExceededError')
      },
      removeItem(): void {
        throw new DOMException('Storage access denied', 'SecurityError')
      },
    }
    const service = createHighScoreService({ adapter: restrictedAdapter })

    expect(service.load().data.stageBests).toEqual({})
    expect(service.diagnostics().usingFallback).toBe(true)
    expect(service.recordResult(result('stage-1-test', 3210)).data.stageBests['stage-1-test']?.score).toBe(3210)
  })

  it('fails soft on corrupt data and supports an explicit non-surprising clear path', () => {
    const adapter = createMemoryStorageAdapter({ [HIGH_SCORE_STORAGE_KEY]: '{ definitely-not-json' })
    const service = createHighScoreService({ adapter })
    const loaded = service.load()

    expect(loaded.source).toBe('default')
    expect(loaded.data.recentRuns).toEqual([])
    expect(service.diagnostics().corruptionCount).toBeGreaterThan(0)

    service.recordResult(result('stage-4-verdant-hive', 1111))
    expect(service.load().data.stageBests['stage-4-verdant-hive']?.score).toBe(1111)
    service.clear()
    expect(service.load().data.stageBests).toEqual({})
  })
})
