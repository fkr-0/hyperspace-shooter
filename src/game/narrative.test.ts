import { describe, expect, it } from 'vitest'
import { CAMPAIGN_STAGES } from './campaign'
import { narrativeBeatFor, stageNarrativeFor, UNIVERSE_INTRO } from './narrative'

describe('Hyperblast narrative presentation', () => {
  it('gives every campaign stage a universe-facing mission and launch exchange', () => {
    expect(UNIVERSE_INTRO.length).toBeGreaterThan(80)
    for (const stage of CAMPAIGN_STAGES) {
      const story = stageNarrativeFor(stage.id)
      expect(story.sector.length).toBeGreaterThan(10)
      expect(story.premise.length).toBeGreaterThan(40)
      expect(story.objective.length).toBeGreaterThan(30)
      expect(story.launch.lines).toHaveLength(2)
      expect(story.clear.length).toBeGreaterThan(40)
    }
  })

  it('opens with dialogue and follows the first enemy wave with live contact', () => {
    const stageId = CAMPAIGN_STAGES[0]?.id ?? ''
    expect(narrativeBeatFor(stageId, 0, 'combat')?.id).toContain('launch')
    expect(narrativeBeatFor(stageId, 60, 'combat')?.id).toContain('launch')
    expect(narrativeBeatFor(stageId, 120, 'combat')?.id).toContain('contact')
  })

  it('uses encounter-specific dialogue without leaking into title/result overlays', () => {
    const stageId = CAMPAIGN_STAGES[3]?.id ?? ''
    expect(narrativeBeatFor(stageId, 600, 'midboss')?.id).toContain('midboss')
    expect(narrativeBeatFor(stageId, 1200, 'boss')?.id).toContain('boss')
    expect(narrativeBeatFor(stageId, 0, 'title')).toBeNull()
    expect(narrativeBeatFor(stageId, 1200, 'result')).toBeNull()
    expect(narrativeBeatFor(stageId, 1200, 'gameover')).toBeNull()
  })
})
