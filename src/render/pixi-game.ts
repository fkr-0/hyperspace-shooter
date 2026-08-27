import {
  createArcadeCameraTransform,
  createPixiFramePool,
  type ArcadePixiRuntime,
} from '@arcade/runtime/pixi'
import * as PIXI from 'pixi.js'
import { PLAYFIELD } from '../game/constants'
import type { HyperblastSimulation } from '../game/simulation'
import type { Projectile } from '../game/types'

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

function createStarLayers(container: PIXI.Container): StarLayer[] {
  return BACKGROUND_LAYERS.map((definition, layerIndex) => {
    const layerContainer = new PIXI.Container()
    layerContainer.label = `stars-${definition.name}`
    container.addChild(layerContainer)
    const sprites: PIXI.Sprite[] = []
    const baseY: number[] = []
    for (let index = 0; index < definition.count; index += 1) {
      const sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
      sprite.tint = layerIndex === 1 ? 0x8a4dff : 0x00e5ff
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

function createBulletSprite(): PIXI.Sprite {
  const sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
  sprite.anchor.set(0.5)
  sprite.visible = false
  sprite.renderable = false
  return sprite
}

function activateBulletSprite(sprite: PIXI.Sprite, projectile: Projectile, alpha: number): void {
  sprite.x = projectile.previousX + (projectile.x - projectile.previousX) * alpha
  sprite.y = projectile.previousY + (projectile.y - projectile.previousY) * alpha
  sprite.width = projectile.radius * 2
  sprite.height = projectile.kind === 'enemy' ? projectile.radius * 2.7 : projectile.radius * 4
  sprite.tint = projectile.kind === 'enemy' ? 0xff2bd6 : 0x00e5ff
  sprite.rotation = projectile.kind === 'enemy' ? Math.PI / 4 : 0
}

type BulletSpritePayload = { projectile: Projectile; alpha: number }

function createBulletFramePool(
  container: PIXI.Container,
  options: Readonly<{ initialCapacity: number; maxCapacity: number }>,
) {
  return createPixiFramePool<PIXI.Sprite, BulletSpritePayload>({
    container,
    initialCapacity: options.initialCapacity,
    maxCapacity: options.maxCapacity,
    createSprite: createBulletSprite,
    activate: (sprite, payload) => activateBulletSprite(sprite, payload.projectile, payload.alpha),
  })
}

type GameplayRenderState = {
  world: PIXI.Container
  player: PIXI.Graphics
  hitbox: PIXI.Graphics
  target: PIXI.Sprite
  playerBullets: ReturnType<typeof createBulletFramePool>
  enemyBullets: ReturnType<typeof createBulletFramePool>
}

export function installHyperblastPixiRenderer(
  runtime: ArcadePixiRuntime,
  simulation: HyperblastSimulation,
) {
  const camera = createArcadeCameraTransform({
    viewportWidth: PLAYFIELD.width,
    viewportHeight: PLAYFIELD.height,
    anchorX: 0,
    anchorY: 0,
  })

  const backgroundPass = runtime.addPass<StarLayer[]>('hyperblast-background', {
    layer: 'background',
    create: (pass) => createStarLayers(pass.container),
    update: (frame, pass) => updateStarLayers(pass.state, simulation.state.tick, frame.alpha),
  })

  const gameplayPass = runtime.addPass<GameplayRenderState>('hyperblast-gameplay', {
    layer: 'gameplay',
    create: (pass) => {
      const world = new PIXI.Container()
      world.label = 'camera-world'
      pass.container.addChild(world)

      const target = new PIXI.Sprite(PIXI.Texture.WHITE)
      target.anchor.set(0.5)
      target.tint = 0xff3b58
      world.addChild(target)

      const player = new PIXI.Graphics()
      player.poly([-13, 13, 0, -17, 13, 13, 0, 8]).fill({ color: 0x00e5ff })
      world.addChild(player)

      const hitbox = new PIXI.Graphics()
      hitbox.circle(0, 0, simulation.state.player.damageRadius).fill({ color: 0xeaf8ff })
      hitbox.circle(0, 0, simulation.state.player.damageRadius + 2).stroke({ color: 0xff2bd6, width: 1 })
      world.addChild(hitbox)

      const playerBulletContainer = new PIXI.Container()
      const enemyBulletContainer = new PIXI.Container()
      world.addChild(playerBulletContainer, enemyBulletContainer)
      const playerBullets = createBulletFramePool(playerBulletContainer, {
        initialCapacity: 64,
        maxCapacity: 512,
      })
      const enemyBullets = createBulletFramePool(enemyBulletContainer, {
        initialCapacity: 128,
        maxCapacity: 1536,
      })
      return { world, player, hitbox, target, playerBullets, enemyBullets }
    },
    update: (frame, pass) => {
      const state = simulation.state
      const alpha = frame.alpha
      pass.state.player.x = state.player.previousX + (state.player.x - state.player.previousX) * alpha
      pass.state.player.y = state.player.previousY + (state.player.y - state.player.previousY) * alpha
      pass.state.hitbox.x = pass.state.player.x
      pass.state.hitbox.y = pass.state.player.y
      pass.state.hitbox.visible = state.player.focus

      pass.state.target.x = state.target.x
      pass.state.target.y = state.target.y
      pass.state.target.width = state.target.width
      pass.state.target.height = state.target.height
      pass.state.target.visible = state.target.active
      pass.state.target.alpha = 0.42 + 0.58 * (state.target.hp / state.target.maxHp)

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
      pass.state.playerBullets.destroy()
      pass.state.enemyBullets.destroy()
    },
  })

  return {
    destroy(): void {
      backgroundPass.remove()
      gameplayPass.remove()
    },
  }
}
