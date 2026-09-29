import { describe, expect, it } from 'vitest'
import { validateArcadeSpriteManifest } from '@arcade/runtime/sprites'
import {
  ENEMY_SHIP_ROTATION,
  pickupVfxAnimation,
  PLAYER_SHIP_ROTATION,
  PRODUCTION_VFX_MANIFEST,
  PRODUCTION_VFX_REFERENCE_ATLAS_SHA256,
  PRODUCTION_VFX_SOURCE_SHA256,
  projectileVfxAnimation,
} from './vfx-assets'

describe('production VFX assets', () => {
  it('validates the runtime sprite manifest and preserves derivation provenance', () => {
    expect(validateArcadeSpriteManifest(PRODUCTION_VFX_MANIFEST)).toBe(true)
    const source = PRODUCTION_VFX_MANIFEST.sheets?.[0]?.source
    expect(source?.sourceSha256).toBe(PRODUCTION_VFX_SOURCE_SHA256)
    expect(source?.referenceAtlasSha256).toBe(PRODUCTION_VFX_REFERENCE_ATLAS_SHA256)
  })

  it('maps every projectile and pickup to authored VFX frames', () => {
    expect(projectileVfxAnimation('player')).toBe('player-bolt')
    expect(projectileVfxAnimation('enemy')).toBe('enemy-burst')
    for (const kind of ['power', 'bomb', 'score'] as const) {
      expect(pickupVfxAnimation(kind)).toBe('pickup-ring')
    }
  })

  it('reconciles the source atlas nose-right basis with vertical shooter facing', () => {
    expect(PLAYER_SHIP_ROTATION).toBeCloseTo(-Math.PI / 2)
    expect(ENEMY_SHIP_ROTATION).toBeCloseTo(Math.PI / 2)
  })
})
