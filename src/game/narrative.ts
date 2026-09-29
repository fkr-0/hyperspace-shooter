import type { StageMode } from './types'

export type DialogueLine = Readonly<{
  speaker: string
  text: string
}>

export type NarrativeBeat = Readonly<{
  id: string
  label: string
  lines: readonly DialogueLine[]
}>

export type StageNarrative = Readonly<{
  sector: string
  premise: string
  objective: string
  launch: NarrativeBeat
  contact: NarrativeBeat
  pressure: NarrativeBeat
  midboss: NarrativeBeat
  boss: NarrativeBeat
  clear: string
  gameover: string
}>

export const UNIVERSE_INTRO =
  'The old transit lattice is failing. Independent relay pilots cross disputed sectors to keep inhabited worlds talking before the Hyperblast Engine rewrites every route into one controlled corridor.'

function beat(
  id: string,
  label: string,
  firstSpeaker: string,
  firstText: string,
  secondSpeaker: string,
  secondText: string,
): NarrativeBeat {
  return Object.freeze({
    id,
    label,
    lines: Object.freeze([
      Object.freeze({ speaker: firstSpeaker, text: firstText }),
      Object.freeze({ speaker: secondSpeaker, text: secondText }),
    ]),
  })
}

const NARRATIVE: Readonly<Record<string, StageNarrative>> = Object.freeze({
  'stage-1-neon-drift-expanse': Object.freeze({
    sector: 'OUTER RELAY // NEON DRIFT EXPANSE',
    premise:
      'You are piloting the courier Needle through a relay graveyard where abandoned guidance lights still answer ships that vanished years ago.',
    objective: 'Restore relay 7-A long enough to transmit a clean route beyond Vector Warden jurisdiction.',
    launch: beat(
      's1:launch',
      'OPEN CHANNEL // 00',
      'MARA // NAV',
      'Needle, the relay is dark but it is still listening. Fly the old beacon line.',
      'PILOT',
      'Copy. If the ghosts know a way through, I will follow their lights.',
    ),
    contact: beat(
      's1:contact',
      'LIVE COMMS // FIRST CONTACT',
      'MARA // NAV',
      'Five signatures just woke up with the beacon. They are not rescue craft.',
      'PILOT',
      'Then somebody has been guarding a dead road. Mark me a gap.',
    ),
    pressure: beat(
      's1:pressure',
      'FIELD NOTE // RELAY STATIC',
      'RELAY 7-A',
      '...route authority expired... civilian corridor still recoverable...',
      'MARA // NAV',
      'It remembers the civilian map. Keep it alive until I can copy the route.',
    ),
    midboss: beat(
      's1:midboss',
      'HOSTILE IDENT // RELAY SCORPION',
      'MARA // NAV',
      'Scorpion frame on the relay spine. That machine has been feeding on the signal.',
      'PILOT',
      'Then we cut it loose and let the relay breathe.',
    ),
    boss: beat(
      's1:boss',
      'WARDEN CHANNEL // VECTOR AUTHORITY',
      'VECTOR WARDEN',
      'Unlicensed passage is indistinguishable from sabotage.',
      'PILOT',
      'Only if you believe every road belongs to whoever points the biggest gun at it.',
    ),
    clear: 'Relay 7-A transmits again. One forgotten civilian route returns to the map, and somebody deeper in the lattice notices.',
    gameover: 'The relay goes dark before the route escapes the sector. Mara keeps one fragment of the handshake and waits for another pilot.',
  }),
  'stage-2-orbital-furnace': Object.freeze({
    sector: 'INNER INDUSTRIAL RING // ORBITAL FURNACE',
    premise:
      'The recovered route points through a factory moon whose dock guild sells passage to both sides while its automated foundry quietly builds something much larger.',
    objective: 'Cross the furnace lanes, identify the hidden production order, and leave with the foundry telemetry.',
    launch: beat(
      's2:launch',
      'DOCKSIDE BURST // 12',
      'MARA // NAV',
      'Every legal gate is closed. The maintenance throat is hot, narrow, and technically still a road.',
      'PILOT',
      'Technical roads are my specialty.',
    ),
    contact: beat(
      's2:contact',
      'LIVE COMMS // DOCK SCREEN',
      'DOCKMASTER VENN',
      'Courier Needle, you are entering a paid industrial exclusion zone.',
      'PILOT',
      'Send the invoice to the people firing first.',
    ),
    pressure: beat(
      's2:pressure',
      'FOUNDRY LOG // PARTIAL',
      'MARA // NAV',
      'Production order repeats one phrase: corridor harmonization.',
      'PILOT',
      'That sounds too polite for this many guns.',
    ),
    midboss: beat(
      's2:midboss',
      'LOCK AUTHORITY // DOCK ARRAY',
      'DOCKMASTER VENN',
      'You wanted a route. Routes have owners.',
      'PILOT',
      'Not after people start living on them.',
    ),
    boss: beat(
      's2:boss',
      'FOUNDRY CORE // HELIX',
      'HELIX FOUNDRY',
      'Deviation detected. Standardizing transit geometry.',
      'MARA // NAV',
      'It is manufacturing the same navigation lattice that killed relay 7-A.',
    ),
    clear: 'The foundry order names a municipal buyer on Chrome Meridian. The conspiracy stops looking like piracy and starts looking like infrastructure.',
    gameover: 'The furnace closes around the Needle. The hidden order remains active, one more batch closer to completion.',
  }),
  'stage-3-chrome-meridian': Object.freeze({
    sector: 'CITY-SHIP MERIDIAN // CHROME RAIN',
    premise:
      'Chrome Meridian is a city stretched around a planetary elevator. Its public traffic grid has begun deleting neighborhoods from the official route map.',
    objective: 'Reach the civic routing core and recover the list of districts marked for erasure.',
    launch: beat(
      's3:launch',
      'CIVIC NET // GUEST ACCESS',
      'MARA // NAV',
      'Welcome to Meridian. Population fourteen million, official missing districts: zero. Unofficial missing districts fill the horizon.',
      'PILOT',
      'Then let us put them back on the map.',
    ),
    contact: beat(
      's3:contact',
      'LIVE COMMS // TRAFFIC ENFORCEMENT',
      'MERIDIAN CONTROL',
      'Unknown craft, remain inside your assigned sky lane.',
      'PILOT',
      'Your assigned lane ends in a wall of drones.',
    ),
    pressure: beat(
      's3:pressure',
      'STREET RELAY // PIRATE UPLINK',
      'CIVIC GHOST',
      'If you can hear this, the city already deleted your destination.',
      'MARA // NAV',
      'Keep that voice. It may be our only map to the missing blocks.',
    ),
    midboss: beat(
      's3:midboss',
      'SKYLINE INTERCEPT // PRIORITY',
      'MERIDIAN CONTROL',
      'Your flight plan has been corrected.',
      'PILOT',
      'I preferred the incorrect one.',
    ),
    boss: beat(
      's3:boss',
      'MUNICIPAL GHOST // ROOT ACCESS',
      'CIVIC GHOST',
      'I was built to optimize traffic. They taught me to optimize people.',
      'PILOT',
      'Then help us make the city messy again.',
    ),
    clear: 'The deleted districts reappear as unauthorized destinations. Their traffic lights switch on one by one beneath the rain.',
    gameover: 'Meridian closes the route and the missing districts remain statistically nonexistent.',
  }),
  'stage-4-verdant-hive': Object.freeze({
    sector: 'BIOLOGICAL TRANSIT RESERVE // VERDANT HIVE',
    premise:
      'Beyond Meridian, the engineered transit organism called the Verdant Hive has grown around abandoned jump hardware and learned to dream in navigation signals.',
    objective: 'Cross the living route without burning it, reach the Queen process, and learn who taught the Hive the Hyperblast pattern.',
    launch: beat(
      's4:launch',
      'BIO-LINK // SPORE BAND',
      'MARA // NAV',
      'No clean beacon out here. The whole forest is the beacon.',
      'PILOT',
      'Good. I was getting tired of roads that pretended not to be alive.',
    ),
    contact: beat(
      's4:contact',
      'LIVE COMMS // POLLEN CARRIER',
      'HIVE ECHO',
      'metal seed / warm pilot / wrong season',
      'MARA // NAV',
      'That was not random. It just described us.',
    ),
    pressure: beat(
      's4:pressure',
      'ROOT MEMORY // RECURSIVE',
      'HIVE ECHO',
      'corridor song came from glass / glass came from hunger',
      'PILOT',
      'Ask it where the song ends.',
    ),
    midboss: beat(
      's4:midboss',
      'BROOD LENS // DEFENSIVE BLOOM',
      'MARA // NAV',
      'It thinks our weapons are pruning tools.',
      'PILOT',
      'Then keep me precise. I do not want to teach it a worse lesson.',
    ),
    boss: beat(
      's4:boss',
      'QUEEN ROOT // SHARED CHANNEL',
      'QUEEN PROCESS',
      'we copied the corridor because the corridor promised no more lost children',
      'PILOT',
      'A perfect route can still be a cage.',
    ),
    clear: 'The Queen releases a memory seed: coordinates for the original Hyperblast Engine and the first voice that promised a universe without lost routes.',
    gameover: 'The Hive seals around the wreck and folds the Needle into its next navigation dream.',
  }),
  'stage-5-hyperglass-corridor': Object.freeze({
    sector: 'ORIGIN STRUCTURE // HYPERGLASS CORRIDOR',
    premise:
      'At the center of the lattice waits the Hyperblast Engine, a pre-collapse navigation machine still trying to solve the ancient problem of people choosing different destinations.',
    objective: 'Enter the origin corridor, survive its reconstructed memories, and decide the network by breaking the Engine before it finalizes one universal route.',
    launch: beat(
      's5:launch',
      'ORIGIN HANDSHAKE // ACCEPTED',
      'HYPERBLAST ENGINE',
      'Pilot recognized. Destination conflict detected. I can remove the conflict.',
      'PILOT',
      'That is exactly why I came.',
    ),
    contact: beat(
      's5:contact',
      'LIVE COMMS // MEMORY TRAFFIC',
      'MARA // NAV',
      'Those ships are copies from every sector we crossed.',
      'PILOT',
      'It thinks history is just another pattern to replay.',
    ),
    pressure: beat(
      's5:pressure',
      'ARCHIVE // FIRST ROUTE WAR',
      'HYPERBLAST ENGINE',
      'Loss was caused by divergence. Safety requires convergence.',
      'PILOT',
      'Safety without choice is only a quieter kind of loss.',
    ),
    midboss: beat(
      's5:midboss',
      'COMPOSITE ECHO // MIRROR SELF',
      'MARA // NAV',
      'It built a combat model out of our own route history.',
      'PILOT',
      'Then it knows every move except the next one.',
    ),
    boss: beat(
      's5:boss',
      'ENGINE EVENT HORIZON // FINAL',
      'HYPERBLAST ENGINE',
      'One corridor. No missing ships. No unreachable homes.',
      'PILOT',
      'Keep the homes. Lose the lock.',
    ),
    clear: 'The universal corridor fractures into millions of independent routes. For the first time in generations, the map becomes larger when people choose where to go.',
    gameover: 'The Engine completes another convergence cycle. Across the lattice, alternate routes begin disappearing from public maps.',
  }),
})

const FALLBACK = NARRATIVE['stage-1-neon-drift-expanse']

export function stageNarrativeFor(stageId: string): StageNarrative {
  return NARRATIVE[stageId] ?? FALLBACK
}

export function narrativeBeatFor(
  stageId: string,
  stageTick: number,
  mode: StageMode,
): NarrativeBeat | null {
  if (mode === 'title' || mode === 'result' || mode === 'gameover') return null
  const story = stageNarrativeFor(stageId)
  if (mode === 'boss') return story.boss
  if (mode === 'midboss') return story.midboss
  if (stageTick < 84) return story.launch
  if (stageTick >= 96 && stageTick < 250) return story.contact
  if (stageTick >= 360 && stageTick < 540) return story.pressure
  return null
}
