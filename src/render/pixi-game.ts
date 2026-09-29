import {
  createArcadeCameraTransform,
  createArcadePixiSpriteBank,
  createPixiFramePool,
  type ArcadePixiSpriteBank,
  type ArcadePixiRuntime,
} from '@arcade/runtime/pixi'
import * as PIXI from 'pixi.js'
import { ENEMY_SOFT_CAP, PICKUP_SOFT_CAP, PLAYFIELD } from '../game/constants'
import type { HyperblastSimulation } from '../game/simulation'
import type { EnemyState, PickupState, Projectile } from '../game/types'
import {
  enemySpriteClip,
  PRODUCTION_SHIP_SHEET_ID,
  PRODUCTION_SPRITE_MANIFEST,
} from './assets'
import {
  ENEMY_SHIP_ROTATION,
  pickupVfxAnimation,
  PLAYER_SHIP_ROTATION,
  PRODUCTION_VFX_MANIFEST,
  PRODUCTION_VFX_SHEET_ID,
  projectileVfxAnimation,
} from './vfx-assets'

const BACKGROUND_LAYERS = Object.freeze([
  { name: 'far', factor: 0.15, count: 42, size: 1, alpha: 0.38 },
  { name: 'mid', factor: 0.45, count: 28, size: 2, alpha: 0.58 },
  { name: 'near', factor: 0.85, count: 14, size: 3, alpha: 0.78 },
])

const PARALLAX_SCROLL_SPEED = 108

type StarLayer = {
  speed: number
  sprites: PIXI.Sprite[]
  baseY: number[]
}

function deterministicStarX(index: number, layerIndex: number): number {
  return 8 + ((index * 97 + layerIndex * 53) % (PLAYFIELD.width - 16))
}

function deterministicStarY(index: number, layerIndex: number): number {
  return (index * 157 + layerIndex * 83) % PLAYFIELD.height
}

function themeStarTint(theme: HyperblastSimulation['stageDefinition']['theme'], layerIndex: number): number {
  if (theme === 'orbital-furnace') return layerIndex === 1 ? 0xffb347 : 0xff6b35
  if (theme === 'chrome-meridian') return layerIndex === 1 ? 0xff2bd6 : 0x00e5ff
  if (theme === 'verdant-hive') return layerIndex === 1 ? 0x62ff8b : 0x8a4dff
  if (theme === 'hyperglass-corridor') return layerIndex === 1 ? 0xeaf8ff : 0x00e5ff
  return layerIndex === 1 ? 0x8a4dff : 0x00e5ff
}

function createStarLayers(
  container: PIXI.Container,
  theme: HyperblastSimulation['stageDefinition']['theme'],
): StarLayer[] {
  return BACKGROUND_LAYERS.map((definition, layerIndex) => {
    const layerContainer = new PIXI.Container()
    layerContainer.label = `stars-${definition.name}`
    container.addChild(layerContainer)
    const sprites: PIXI.Sprite[] = []
    const baseY: number[] = []
    for (let index = 0; index < definition.count; index += 1) {
      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
      sprite.tint = themeStarTint(theme, layerIndex)
      sprite.alpha = definition.alpha
      sprite.width = definition.size
      sprite.height = definition.size
      sprite.x = deterministicStarX(index, layerIndex)
      const y = deterministicStarY(index, layerIndex)
      sprite.y = y
      sprites.push(sprite)
      baseY.push(y)
      layerContainer.addChild(sprite)
    }
    return { speed: PARALLAX_SCROLL_SPEED * definition.factor, sprites, baseY }
  })
}

function updateStarLayers(layers: readonly StarLayer[], simulationTick: number, alpha: number): void {
  const seconds = (simulationTick + alpha) / 60
  for (const layer of layers) {
    const offset = seconds * layer.speed
    for (let index = 0; index < layer.sprites.length; index += 1) {
      layer.sprites[index].y = (layer.baseY[index] + offset) % PLAYFIELD.height
    }
  }
}

function activateBulletSprite(
  sprite: PIXI.Sprite,
  projectile: Projectile,
  alpha: number,
  spriteBank: ArcadePixiSpriteBank,
): void {
  const animation = projectileVfxAnimation(projectile.kind)
  spriteBank.applyFrame(
    sprite,
    PRODUCTION_VFX_SHEET_ID,
    animation,
    Math.floor(projectile.ageTicks / (projectile.kind === 'enemy' ? 4 : 3)) % 4,
  )
  sprite.x = projectile.previousX + (projectile.x - projectile.previousX) * alpha
  sprite.y = projectile.previousY + (projectile.y - projectile.previousY) * alpha
  sprite.tint = projectile.kind === 'enemy' ? 0xff5eea : 0x9fffff
  sprite.alpha = 0.96
  if (projectile.kind === 'enemy') {
    const size = Math.max(9, projectile.radius * 3)
    sprite.width = size
    sprite.height = size
    sprite.rotation = projectile.ageTicks * 0.11
  } else {
    sprite.width = Math.max(6, projectile.radius * 2.2)
    sprite.height = Math.max(12, projectile.radius * 4.5)
    sprite.rotation = Math.atan2(projectile.vy, projectile.vx) + Math.PI / 2
  }
}

type BulletSpritePayload = { projectile: Projectile; alpha: number }

function createBulletFramePool(
  container: PIXI.Container,
  spriteBank: ArcadePixiSpriteBank,
  options: Readonly<{ initialCapacity: number; maxCapacity: number }>,
) {
  return createPixiFramePool<PIXI.Sprite, BulletSpritePayload>({
    container,
    initialCapacity: options.initialCapacity,
    maxCapacity: options.maxCapacity,
    createSprite: () => spriteBank.createSprite(PRODUCTION_VFX_SHEET_ID, 'player-bolt', 0),
    activate: (sprite, payload) =>
      activateBulletSprite(sprite, payload.projectile, payload.alpha, spriteBank),
  })
}

type EnemySpritePayload = { enemy: EnemyState }

function createEnemyFramePool(container: PIXI.Container, spriteBank: ArcadePixiSpriteBank) {
  return createPixiFramePool<PIXI.Sprite, EnemySpritePayload>({
    container,
    initialCapacity: 16,
    maxCapacity: ENEMY_SOFT_CAP,
    createSprite: () => spriteBank.createSprite(PRODUCTION_SHIP_SHEET_ID, 'drifter', 0),
    activate: (sprite, { enemy }) => {
      const clip = enemySpriteClip(enemy.kind)
      spriteBank.applyFrame(sprite, clip.sheetId, clip.animation, Math.floor(enemy.ageTicks / 6) % 4)
      sprite.x = enemy.x
      sprite.y = enemy.y
      sprite.width = enemy.width
      sprite.height = enemy.height
      sprite.tint = 0xffffff
      sprite.rotation = ENEMY_SHIP_ROTATION
      const phaseAlpha = enemy.boss?.transitionTicks ? 0.34 : 1
      const shieldAlpha = enemy.shieldHp > 0 ? 1 : 0.86
      sprite.alpha = phaseAlpha * shieldAlpha * (0.68 + 0.32 * Math.max(0, enemy.hp) / Math.max(1, enemy.maxHp))
      const pulse = enemy.boss?.transitionTicks ? 1 + Math.sin(enemy.boss.transitionTicks * 0.45) * 0.08 : 1
      sprite.scale.x *= pulse
      sprite.scale.y *= pulse
    },
  })
}

type PickupSpritePayload = { pickup: PickupState; tick: number }

function createPickupFramePool(container: PIXI.Container, spriteBank: ArcadePixiSpriteBank) {
  return createPixiFramePool<PIXI.Sprite, PickupSpritePayload>({
    container,
    initialCapacity: 8,
    maxCapacity: PICKUP_SOFT_CAP,
    createSprite: () => spriteBank.createSprite(PRODUCTION_VFX_SHEET_ID, 'pickup-ring', 0),
    activate: (sprite, { pickup, tick }) => {
      spriteBank.applyFrame(
        sprite,
        PRODUCTION_VFX_SHEET_ID,
        pickupVfxAnimation(pickup.kind),
        Math.floor(tick / 6) % 4,
      )
      sprite.x = pickup.x
      sprite.y = pickup.y
      const size = pickup.kind === 'bomb' ? 18 : pickup.kind === 'power' ? 16 : 14
      sprite.width = size
      sprite.height = size
      sprite.tint = pickup.kind === 'bomb' ? 0xeaf8ff : pickup.kind === 'score' ? 0x00e5ff : 0x62ff8b
      sprite.rotation = tick * 0.025
      sprite.alpha = 0.94
    },
  })
}

type GameplayRenderState = {
  world: PIXI.Container
  player: PIXI.Sprite
  hitbox: PIXI.Graphics
  enemies: ReturnType<typeof createEnemyFramePool>
  pickups: ReturnType<typeof createPickupFramePool>
  playerBullets: ReturnType<typeof createBulletFramePool>
  enemyBullets: ReturnType<typeof createBulletFramePool>
}

export async function installHyperblastPixiRenderer(
  runtime: ArcadePixiRuntime,
  simulation: HyperblastSimulation,
) {
  const spriteBank = createArcadePixiSpriteBank({
    PIXI,
    runtime,
    manifest: PRODUCTION_SPRITE_MANIFEST,
    aliasPrefix: 'hyperblast',
  })
  const vfxSpriteBank = createArcadePixiSpriteBank({
    PIXI,
    runtime,
    manifest: PRODUCTION_VFX_MANIFEST,
    aliasPrefix: 'hyperblast-vfx',
  })
  await Promise.all([spriteBank.load(), vfxSpriteBank.load()])

  const camera = createArcadeCameraTransform({
    viewportWidth: PLAYFIELD.width,
    viewportHeight: PLAYFIELD.height,
    anchorX: 0,
    anchorY: 0,
  })

  const backgroundPass = runtime.addPass<StarLayer[]>('hyperblast-background', {
    layer: 'background',
    create: (pass) => createStarLayers(pass.container, simulation.stageDefinition.theme),
    update: (frame, pass) => updateStarLayers(pass.state, simulation.state.tick, frame.alpha),
  })

  const gameplayPass = runtime.addPass<GameplayRenderState>('hyperblast-gameplay', {
    layer: 'gameplay',
    create: (pass) => {
      const world = new PIXI.Container()
      world.label = 'camera-world'
      pass.container.addChild(world)

      const enemyContainer = new PIXI.Container()
      enemyContainer.label = 'enemies'
      const pickupContainer = new PIXI.Container()
      pickupContainer.label = 'pickups'
      const playerBulletContainer = new PIXI.Container()
      playerBulletContainer.label = 'player-bullets'
      const enemyBulletContainer = new PIXI.Container()
      enemyBulletContainer.label = 'enemy-bullets'
      world.addChild(enemyContainer, pickupContainer, playerBulletContainer)

      const player = spriteBank.createSprite(PRODUCTION_SHIP_SHEET_ID, 'player-idle', 0)
      player.width = 34
      player.height = 30
      player.rotation = PLAYER_SHIP_ROTATION
      world.addChild(player)

      const hitbox = new PIXI.Graphics()
      hitbox.circle(0, 0, simulation.state.player.damageRadius).fill({ color: 0xeaf8ff })
      hitbox
        .circle(0, 0, simulation.state.player.damageRadius + 2)
        .stroke({ color: 0xff2bd6, width: 1 })
      world.addChild(hitbox, enemyBulletContainer)

      return {
        world,
        player,
        hitbox,
        enemies: createEnemyFramePool(enemyContainer, spriteBank),
        pickups: createPickupFramePool(pickupContainer, vfxSpriteBank),
        playerBullets: createBulletFramePool(playerBulletContainer, vfxSpriteBank, {
          initialCapacity: 64,
          maxCapacity: 512,
        }),
        enemyBullets: createBulletFramePool(enemyBulletContainer, vfxSpriteBank, {
          initialCapacity: 128,
          maxCapacity: 1536,
        }),
      }
    },
    update: (frame, pass) => {
      const state = simulation.state
      const alpha = frame.alpha
      const playerVisible = state.mode !== 'title' && state.mode !== 'result' && state.mode !== 'gameover'
      const playerAnimation = state.player.firing ? 'player-thrust' : 'player-idle'
      spriteBank.applyFrame(
        pass.state.player,
        PRODUCTION_SHIP_SHEET_ID,
        playerAnimation,
        Math.floor(state.tick / (state.player.firing ? 4 : 7)) % 4,
      )
      pass.state.player.width = 34
      pass.state.player.height = 30
      pass.state.player.rotation = PLAYER_SHIP_ROTATION
      pass.state.player.x = state.player.previousX + (state.player.x - state.player.previousX) * alpha
      pass.state.player.y = state.player.previousY + (state.player.y - state.player.previousY) * alpha
      pass.state.player.visible = playerVisible
      pass.state.player.alpha =
        state.player.invulnerableTicks > 0 && Math.floor(state.player.invulnerableTicks / 5) % 2 === 0 ? 0.3 : 1
      pass.state.hitbox.x = pass.state.player.x
      pass.state.hitbox.y = pass.state.player.y
      pass.state.hitbox.visible = playerVisible && state.player.focus

      pass.state.enemies.beginFrame()
      for (const enemy of state.enemies) pass.state.enemies.acquire({ enemy })
      pass.state.enemies.endFrame()

      pass.state.pickups.beginFrame()
      for (const pickup of state.pickups) pass.state.pickups.acquire({ pickup, tick: state.tick })
      pass.state.pickups.endFrame()

      pass.state.playerBullets.beginFrame()
      pass.state.enemyBullets.beginFrame()
      for (const projectile of simulation.projectiles.values()) {
        const pool = projectile.kind === 'player' ? pass.state.playerBullets : pass.state.enemyBullets
        pool.acquire({ projectile, alpha })
      }
      pass.state.playerBullets.endFrame()
      pass.state.enemyBullets.endFrame()

      camera.set({ shakeX: state.camera.shakeX, shakeY: state.camera.shakeY })
      camera.applyToContainer(pass.state.world)
    },
    destroy: (pass) => {
      pass.state.enemies.destroy()
      pass.state.pickups.destroy()
      pass.state.playerBullets.destroy()
      pass.state.enemyBullets.destroy()
    },
  })

  return {
    assetMode: 'production-sprite-atlas' as const,
    spriteSheetId: PRODUCTION_SHIP_SHEET_ID,
    vfxSheetId: PRODUCTION_VFX_SHEET_ID,
    destroy(): void {
      backgroundPass.remove()
      gameplayPass.remove()
      void Promise.all([spriteBank.destroy(), vfxSpriteBank.destroy()])
    },
  }
}
