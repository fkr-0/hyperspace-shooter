import { createAudioMixer } from '@arcade/runtime/audio'
import type { StageTheme } from '../game/stage'
import type { GameState } from '../game/types'

type Mixer = ReturnType<typeof createAudioMixer>
type Cue = 'start' | 'boss' | 'bomb' | 'hit' | 'kill' | 'clear'

const ROOT_HZ: Readonly<Record<StageTheme, number>> = Object.freeze({
  'neon-drift': 55,
  'orbital-furnace': 65.406,
  'chrome-meridian': 73.416,
  'verdant-hive': 61.735,
  'hyperglass-corridor': 82.407,
})

const CUE_HZ: Readonly<Record<Cue, number>> = Object.freeze({
  start: 440,
  boss: 110,
  bomb: 82.407,
  hit: 146.832,
  kill: 659.255,
  clear: 880,
})

function clampSample(value: number): number {
  return Math.max(-1, Math.min(1, value))
}

function deterministicNoise(index: number): number {
  const raw = Math.sin((index + 1) * 12.9898) * 43758.5453
  return (raw - Math.floor(raw)) * 2 - 1
}

function saw(time: number, frequency: number): number {
  return 2 * ((time * frequency) % 1) - 1
}

export function renderProceduralTrack(
  sampleRate: number,
  theme: StageTheme,
  intensity: 'stage' | 'boss' = 'stage',
  seconds = 4,
): readonly [Float32Array, Float32Array] {
  const length = Math.max(1, Math.floor(sampleRate * seconds))
  const left = new Float32Array(length)
  const right = new Float32Array(length)
  const root = ROOT_HZ[theme]
  const arpRatios = intensity === 'boss' ? [1, 1.5, 2, 1.25, 2.25, 1.5, 2, 3] : [1, 1.25, 1.5, 2]
  const stepRate =
    theme === 'verdant-hive'
      ? intensity === 'boss'
        ? 7
        : 5
      : theme === 'hyperglass-corridor'
        ? intensity === 'boss'
          ? 12
          : 10
        : intensity === 'boss'
          ? 8
          : 6

  for (let index = 0; index < length; index += 1) {
    const time = index / sampleRate
    const beat = time * 2
    const beatPhase = beat % 1
    const kick = Math.sin(2 * Math.PI * (48 + 38 * Math.exp(-beatPhase * 9)) * time) * Math.exp(-beatPhase * 11)
    const hatPhase = (time * 8) % 1
    const hat = deterministicNoise(index) * Math.exp(-hatPhase * 22)
    const step = Math.floor(time * stepRate)
    const arpFrequency = root * 4 * arpRatios[step % arpRatios.length]
    const arpGate = (time * stepRate) % 1 < 0.62 ? 1 : 0
    const arp = saw(time, arpFrequency) * arpGate
    const bassRatio = [1, 1, 1.5, 1.25][Math.floor(time * 2) % 4]
    const bass = saw(time, root * bassRatio) * 0.55 + Math.sin(2 * Math.PI * root * bassRatio * time) * 0.45
    const pulse = Math.sin(2 * Math.PI * root * 2 * time) > 0 ? 1 : -1
    const organicPad =
      theme === 'verdant-hive'
        ? (Math.sin(2 * Math.PI * root * 0.503 * time) + Math.sin(2 * Math.PI * root * 0.509 * time)) * 0.06
        : 0
    const hyperspaceBed =
      theme === 'hyperglass-corridor'
        ? deterministicNoise(Math.floor(index / 5)) * (0.028 + 0.02 * Math.abs(Math.sin(time * 3.1)))
        : 0
    const mix =
      bass * 0.2 +
      arp * (intensity === 'boss' ? 0.16 : 0.12) +
      kick * 0.24 +
      hat * 0.045 +
      pulse * 0.025 +
      organicPad +
      hyperspaceBed
    const pan = Math.sin(time * 0.7) * 0.12
    left[index] = clampSample(mix * (1 - pan))
    right[index] = clampSample(mix * (1 + pan))
  }
  return [left, right]
}

function createTrackBuffer(context: AudioContext, theme: StageTheme, intensity: 'stage' | 'boss'): AudioBuffer {
  const [left, right] = renderProceduralTrack(context.sampleRate, theme, intensity)
  const buffer = context.createBuffer(2, left.length, context.sampleRate)
  buffer.getChannelData(0).set(left)
  buffer.getChannelData(1).set(right)
  return buffer
}

function createCueBuffer(context: AudioContext, cue: Cue): AudioBuffer {
  const seconds = cue === 'clear' ? 0.65 : cue === 'bomb' ? 0.42 : 0.16
  const length = Math.max(1, Math.floor(context.sampleRate * seconds))
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  const base = CUE_HZ[cue]
  for (let index = 0; index < length; index += 1) {
    const time = index / context.sampleRate
    const progress = index / length
    const sweep = cue === 'clear' ? 1 + progress * 0.75 : cue === 'bomb' ? 1 - progress * 0.6 : 1
    const tone = Math.sin(2 * Math.PI * base * sweep * time)
    const overtone = Math.sin(2 * Math.PI * base * 2.01 * time) * 0.28
    const envelope = (1 - progress) ** (cue === 'boss' ? 1.2 : 2.2)
    data[index] = clampSample((tone + overtone) * envelope * 0.48)
  }
  return buffer
}

export function createHyperblastAudio(options?: {
  context?: AudioContext
  mixer?: Mixer
  createContext?: () => AudioContext
}) {
  const context =
    options?.context ??
    options?.mixer?.context ??
    options?.createContext?.() ??
    new AudioContext({ latencyHint: 'interactive' })
  const mixer =
    options?.mixer ??
    createAudioMixer({ context, buses: ['music', 'sfx', 'ui'], masterVolume: 0.72 })
  mixer.setVolume('music', 0.55)
  mixer.setVolume('sfx', 0.8)
  mixer.setVolume('ui', 0.62)

  const tracks = new Map<string, AudioBuffer>()
  const cues = new Map<Cue, AudioBuffer>()
  let music: ReturnType<Mixer['playBuffer']> | null = null
  let theme: StageTheme = 'neon-drift'
  let lastMode: GameState['mode'] | null = null
  let lastBombsUsed = 0
  let lastLivesLost = 0
  let lastKills = 0
  let started = false

  function track(intensity: 'stage' | 'boss'): AudioBuffer {
    const key = `${theme}:${intensity}`
    let buffer = tracks.get(key)
    if (!buffer) {
      buffer = createTrackBuffer(context, theme, intensity)
      tracks.set(key, buffer)
    }
    return buffer
  }

  function cueBuffer(cue: Cue): AudioBuffer {
    let buffer = cues.get(cue)
    if (!buffer) {
      buffer = createCueBuffer(context, cue)
      cues.set(cue, buffer)
    }
    return buffer
  }

  function playCue(cue: Cue): void {
    mixer.playBuffer(cueBuffer(cue), { bus: cue === 'start' ? 'ui' : 'sfx', volume: 0.75 })
  }

  function startMusic(intensity: 'stage' | 'boss'): void {
    music?.stop()
    music = mixer.playBuffer(track(intensity), { bus: 'music', volume: intensity === 'boss' ? 0.72 : 0.56, loop: true })
  }

  async function start(nextTheme: StageTheme): Promise<void> {
    theme = nextTheme
    await mixer.resume()
    startMusic('stage')
    playCue('start')
    started = true
  }

  function sync(state: GameState): void {
    if (!started) return
    if (state.stats.bombsUsed > lastBombsUsed) playCue('bomb')
    if (state.stats.livesLost > lastLivesLost) playCue('hit')
    if (state.stats.enemiesDestroyed > lastKills && state.mode !== 'result') playCue('kill')

    if (state.mode !== lastMode) {
      if (state.mode === 'midboss' || state.mode === 'boss') {
        playCue('boss')
        startMusic('boss')
      } else if (lastMode === 'midboss' && state.mode === 'combat') {
        startMusic('stage')
      } else if (state.mode === 'result') {
        music?.stop()
        music = null
        playCue('clear')
      } else if (state.mode === 'gameover') {
        music?.stop()
        music = null
      }
    }

    lastMode = state.mode
    lastBombsUsed = state.stats.bombsUsed
    lastLivesLost = state.stats.livesLost
    lastKills = state.stats.enemiesDestroyed
  }

  return {
    start,
    sync,
    setMasterVolume: (volume: number) => mixer.setMasterVolume(volume),
    mute: (muted: boolean) => mixer.mute('master', muted),
    snapshot: () => ({ ...mixer.snapshot(), started, theme, generatedTracks: tracks.size, generatedCues: cues.size }),
    async destroy(): Promise<void> {
      music?.stop()
      music = null
      await mixer.destroy()
    },
  }
}
