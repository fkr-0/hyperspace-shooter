import type { StageDefinition } from './stage'
import { STAGE_1 } from './stage1'
import { STAGE_2 } from './stage2'
import { STAGE_3 } from './stage3'
import { STAGE_4 } from './stage4'
import { STAGE_5 } from './stage5'

export const CAMPAIGN_STAGES: readonly StageDefinition[] = Object.freeze([
  STAGE_1,
  STAGE_2,
  STAGE_3,
  STAGE_4,
  STAGE_5,
])

export const STAGE_BRIEFINGS: Readonly<Record<string, string>> = Object.freeze({
  [STAGE_1.id]:
    'Break the relay screen, survive Vector Warden, and keep the chain alive through narrow graze lanes.',
  [STAGE_2.id]:
    'Prioritize furnace turrets, break shield convoys, and breach Helix Foundry without surrendering the chain.',
  [STAGE_3.id]:
    'Route through rooftop traffic, outrun chasers, and collapse Municipal Ghost inside the chrome rain.',
  [STAGE_4.id]:
    'Read the accelerating hive blooms, dismantle formation shields, and recurse through the Queen without panic bombs.',
  [STAGE_5.id]:
    'Remix every learned route at bounded peak pressure, then break the six-phase Hyperblast Engine cleanly.',
})

export function stageNumberFor(definition: StageDefinition): number {
  const index = CAMPAIGN_STAGES.findIndex((stage) => stage.id === definition.id)
  return index < 0 ? 0 : index + 1
}

export function stageForRequestedNumber(value: string | null): StageDefinition {
  const parsed = Number(value ?? '1')
  const index = Number.isFinite(parsed)
    ? Math.max(0, Math.min(CAMPAIGN_STAGES.length - 1, Math.floor(parsed) - 1))
    : 0
  return CAMPAIGN_STAGES[index] ?? STAGE_1
}

export function nextStage(definition: StageDefinition): StageDefinition | null {
  const index = CAMPAIGN_STAGES.findIndex((stage) => stage.id === definition.id)
  if (index < 0 || index >= CAMPAIGN_STAGES.length - 1) return null
  return CAMPAIGN_STAGES[index + 1] ?? null
}
