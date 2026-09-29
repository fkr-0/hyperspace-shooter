import { describe, expect, it } from 'vitest'
import { CAMPAIGN_STAGES, nextStage, stageForRequestedNumber, stageNumberFor } from './campaign'
import { validateStageDefinition } from './stage'

describe('Hyperblast five-stage campaign progression', () => {
  it('keeps one ordered registry of the five reusable StageDefinitions', () => {
    expect(CAMPAIGN_STAGES.map((stage) => stage.id)).toEqual([
      'stage-1-neon-drift-expanse',
      'stage-2-orbital-furnace',
      'stage-3-chrome-meridian',
      'stage-4-verdant-hive',
      'stage-5-hyperglass-corridor',
    ])
    expect(CAMPAIGN_STAGES.every((stage) => validateStageDefinition(stage).length === 0)).toBe(true)
  })

  it('resolves stage selection and next-stage progression without a second stage scheduler', () => {
    expect(stageForRequestedNumber(null).id).toBe(CAMPAIGN_STAGES[0]?.id)
    expect(stageForRequestedNumber('4').id).toBe('stage-4-verdant-hive')
    expect(stageForRequestedNumber('99').id).toBe('stage-5-hyperglass-corridor')
    expect(stageForRequestedNumber('wat').id).toBe('stage-1-neon-drift-expanse')
    const stage4 = CAMPAIGN_STAGES[3]
    const stage5 = CAMPAIGN_STAGES[4]
    expect(stage4).toBeDefined()
    expect(stage5).toBeDefined()
    if (!stage4 || !stage5) throw new Error('campaign registry is missing terminal stages')
    expect(stageNumberFor(stage4)).toBe(4)
    expect(nextStage(stage4)?.id).toBe('stage-5-hyperglass-corridor')
    expect(nextStage(stage5)).toBeNull()
  })
})
