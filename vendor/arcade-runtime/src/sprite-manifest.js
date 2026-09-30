const ARCADE_SPRITE_DEFAULT_VERSION = '1.0.0';

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function freezeFrameCollision(collision) {
  return Object.freeze({
    frame: collision.frame,
    ...(collision.hitboxes === undefined ? {} : { hitboxes: Object.freeze(collision.hitboxes.map(freezeBox)) }),
    ...(collision.hurtboxes === undefined ? {} : { hurtboxes: Object.freeze(collision.hurtboxes.map(freezeBox)) }),
  });
}

function validateFrameCollision(value, frameCount) {
  if (!isRecord(value) || !isNonNegativeInteger(value.frame) || value.frame >= frameCount) return false;
  let hasOverride = false;
  for (const key of ['hitboxes', 'hurtboxes']) {
    if (value[key] === undefined) continue;
    hasOverride = true;
    if (!Array.isArray(value[key]) || !value[key].every(validateBox)) return false;
  }
  return hasOverride;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateBox(value) {
  return isRecord(value)
    && isFiniteNumber(value.x)
    && isFiniteNumber(value.y)
    && isFiniteNumber(value.w)
    && isFiniteNumber(value.h)
    && value.w > 0
    && value.h > 0
    && (value.label === undefined || typeof value.label === 'string');
}

function validateEvent(value, frameCount) {
  return isRecord(value)
    && isNonNegativeInteger(value.frame)
    && value.frame < frameCount
    && typeof value.kind === 'string'
    && value.kind.length > 0
    && (value.name === undefined || typeof value.name === 'string')
    && (value.payload === undefined || isRecord(value.payload));
}

function validateAnimation(value, totalFrames) {
  if (!isRecord(value)) return false;
  if (!isPositiveInteger(value.frames)) return false;
  if (!isFiniteNumber(value.fps) || value.fps <= 0) return false;

  const frameCount = Number(value.frames);
  if (value.order !== undefined) {
    if (!Array.isArray(value.order) || value.order.length !== frameCount) return false;
    for (const frame of value.order) {
      if (!isNonNegativeInteger(frame) || frame >= totalFrames) return false;
    }
  }
  if (value.loop !== undefined && typeof value.loop !== 'boolean') return false;
  if (value.anchor !== undefined) {
    if (!Array.isArray(value.anchor)
      || value.anchor.length !== 2
      || !value.anchor.every(isFiniteNumber)) return false;
  }
  for (const key of ['hitboxes', 'hurtboxes']) {
    if (value[key] !== undefined
      && (!Array.isArray(value[key]) || !value[key].every(validateBox))) return false;
  }
  if (value.frameCollisions !== undefined) {
    if (!Array.isArray(value.frameCollisions)) return false;
    const seenFrames = new Set();
    for (const collision of value.frameCollisions) {
      if (!validateFrameCollision(collision, frameCount) || seenFrames.has(collision.frame)) return false;
      seenFrames.add(collision.frame);
    }
  }
  if (value.events !== undefined
    && (!Array.isArray(value.events)
      || !value.events.every((event) => validateEvent(event, frameCount)))) return false;
  if (value.tags !== undefined
    && (!Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === 'string'))) return false;
  return true;
}

function sourceSheets(manifest) {
  return manifest.sheets ?? manifest.spriteSheets;
}

export function validateArcadeSpriteManifest(manifest) {
  if (!isRecord(manifest)) return false;
  if (!(typeof manifest.version === 'string'
    || typeof manifest.schemaVersion === 'string'
    || typeof manifest.schemaVersion === 'number')) return false;

  const sheets = sourceSheets(manifest);
  if (!Array.isArray(sheets)) return false;

  const seenIds = new Set();
  for (const sheet of sheets) {
    if (!isRecord(sheet)) return false;
    if (typeof sheet.id !== 'string' || sheet.id.length === 0 || seenIds.has(sheet.id)) return false;
    seenIds.add(sheet.id);
    if (typeof sheet.file !== 'string' || sheet.file.length === 0) return false;
    if (!Array.isArray(sheet.frameSize)
      || sheet.frameSize.length !== 2
      || !sheet.frameSize.every(isPositiveInteger)) return false;

    let totalGridFrames;
    if (sheet.grid !== undefined) {
      if (!isRecord(sheet.grid)
        || !isPositiveInteger(sheet.grid.columns)
        || !isPositiveInteger(sheet.grid.rows)) return false;
      totalGridFrames = sheet.grid.columns * sheet.grid.rows;
    }

    if (!isRecord(sheet.animations) || Object.keys(sheet.animations).length === 0) return false;
    for (const animation of Object.values(sheet.animations)) {
      const frameCount = isRecord(animation) && isPositiveInteger(animation.frames)
        ? animation.frames
        : 0;
      if (!validateAnimation(animation, totalGridFrames ?? frameCount)) return false;
    }
    if (sheet.source !== undefined && !isRecord(sheet.source)) return false;
  }
  return true;
}

function freezeBox(box) {
  return Object.freeze({
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    ...(box.label === undefined ? {} : { label: box.label }),
  });
}

function freezeEvent(event) {
  return Object.freeze({
    frame: event.frame,
    kind: event.kind,
    ...(event.name === undefined ? {} : { name: event.name }),
    ...(event.payload === undefined ? {} : { payload: Object.freeze({ ...event.payload }) }),
  });
}

function normalizeAnimation(animation) {
  return Object.freeze({
    frames: animation.frames,
    fps: animation.fps,
    ...(animation.order === undefined ? {} : { order: Object.freeze([...animation.order]) }),
    ...(animation.loop === undefined ? {} : { loop: animation.loop }),
    ...(animation.anchor === undefined ? {} : { anchor: Object.freeze([...animation.anchor]) }),
    ...(animation.hitboxes === undefined ? {} : { hitboxes: Object.freeze(animation.hitboxes.map(freezeBox)) }),
    ...(animation.hurtboxes === undefined ? {} : { hurtboxes: Object.freeze(animation.hurtboxes.map(freezeBox)) }),
    ...(animation.frameCollisions === undefined ? {} : { frameCollisions: Object.freeze(animation.frameCollisions.map(freezeFrameCollision)) }),
    ...(animation.events === undefined ? {} : { events: Object.freeze(animation.events.map(freezeEvent)) }),
    ...(animation.tags === undefined ? {} : { tags: Object.freeze([...animation.tags]) }),
  });
}

function normalizeSheet(sheet) {
  const animations = Object.fromEntries(
    Object.entries(sheet.animations).map(([name, animation]) => [name, normalizeAnimation(animation)]),
  );
  return Object.freeze({
    id: sheet.id,
    file: sheet.file,
    frameSize: Object.freeze([...sheet.frameSize]),
    ...(sheet.grid === undefined
      ? {}
      : { grid: Object.freeze({ columns: sheet.grid.columns, rows: sheet.grid.rows }) }),
    animations: Object.freeze(animations),
    ...(sheet.source === undefined ? {} : { source: Object.freeze({ ...sheet.source }) }),
  });
}

export function normalizeArcadeSpriteManifest(manifest) {
  if (!validateArcadeSpriteManifest(manifest)) throw new Error('Invalid arcade sprite manifest');
  const sheets = sourceSheets(manifest).map(normalizeSheet);
  return Object.freeze({
    version: String(manifest.version ?? manifest.schemaVersion ?? ARCADE_SPRITE_DEFAULT_VERSION),
    sheets: Object.freeze(sheets),
  });
}
