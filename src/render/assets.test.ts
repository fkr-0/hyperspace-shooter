import { describe, expect, it } from 'vitest'
import { validateArcadeSpriteManifest } from '@arcade/runtime/sprites'
import {
  LATE_BOSS_SHEET_ID,
  LATE_BOSS_SOURCE_SHA256,
  PRODUCTION_SHIP_SHEET_ID,
  PRODUCTION_SHIP_SOURCE_SHA256,
  PRODUCTION_SPRITE_MANIFEST,
  enemySpriteAnimation,
  enemySpriteClip,
} from './assets'

const lateBossKinds = [
  'brood-lens',
  'queen-recursor',
  'echo-composite',
  'hyperblast-engine',
] as const

describe('production sprite assets', () => {
  it('keeps the reviewed legacy atlas provenance hash in the first runtime sheet', () => {
    const source = PRODUCTION_SPRITE_MANIFEST.sheets?.[0]?.source
    expect(source?.sourceSha256).toBe(PRODUCTION_SHIP_SOURCE_SHA256)
  })

  it('loads the dedicated late-boss atlas as a second valid sprite sheet', () => {
    expect(validateArcadeSpriteManifest(PRODUCTION_SPRITE_MANIFEST)).toBe(true)
    const lateBossSheet = PRODUCTION_SPRITE_MANIFEST.sheets?.find(
      (sheet) => sheet.id === LATE_BOSS_SHEET_ID,
    )
    expect(lateBossSheet?.grid).toEqual({ columns: 4, rows: 4 })
    expect(lateBossSheet?.frameSize).toEqual([48, 32])
    expect(lateBossSheet?.source?.sourceSha256).toBe(LATE_BOSS_SOURCE_SHA256)
  })

  it('maps every legacy enemy kind to the legacy production sheet', () => {
    for (const kind of [
      'drifter',
      'turret',
      'chaser',
      'shield',
      'relay-scorpion',
      'vector-warden',
      'dockmaster-array',
      'helix-foundry',
      'skyline-pursuer',
      'municipal-ghost',
    ] as const) {
      expect(enemySpriteClip(kind).sheetId).toBe(PRODUCTION_SHIP_SHEET_ID)
      expect(enemySpriteAnimation(kind)).toBeTruthy()
    }
  })

  it('maps each late boss to its own bespoke four-frame animation on the late-boss sheet', () => {
    for (const kind of lateBossKinds) {
      expect(enemySpriteClip(kind)).toEqual({ sheetId: LATE_BOSS_SHEET_ID, animation: kind })
      const animation = PRODUCTION_SPRITE_MANIFEST.sheets
        ?.find((sheet) => sheet.id === LATE_BOSS_SHEET_ID)
        ?.animations?.[kind]
      expect(animation?.frames).toBe(4)
      expect(animation?.loop).toBe(true)
    }
  })
})
