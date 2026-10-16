'use strict';

/* =====================================================================
 * CONFIG — 밸런스 수치는 모두 여기서 조정
 * t = 경과 시간(분)
 * ===================================================================== */
const CONFIG = {
  pools: { enemies: 600, projectiles: 400, enemyBullets: 200, gems: 500, pickups: 60, particles: 900, popups: 160, effects: 120 },
  grid: { cell: 64, size: 64 }, // 64x64 셀 해시 그리드 (size는 2의 거듭제곱)

  player: {
    speed: 165,        // px/s
    maxHp: 100,
    radius: 12,
    invuln: 0.6,       // 피격 후 무적 시간(s)
    magnet: 75,        // 젬 흡수 시작 반경
    pickupRadius: 20,
  },

  xp: { base: 5, linear: 4, quad: 0.25 }, // 다음 레벨 필요 XP = base + linear*k + quad*k^2 (k = level-1)

  spawn: {
    baseRate: 1.0, linear: 0.9, quad: 0.08,   // 초당 스폰 수
    maxAlive: 450,
    hpLinear: 0.25, hpQuad: 0.02,             // 적 체력 배율
    dmgLinear: 0.08,                          // 적 공격력 배율
    speedLinear: 0.03, speedMax: 1.35,        // 적 이동속도 배율
    swarmInterval: 60, swarmBase: 14, swarmPerMin: 4, // 주기적 포위 웨이브
    margin: 50,                               // 화면 밖 스폰 여유
    lateStart: 8, lateHp: 0.3, lateDmg: 0.2, lateRate: 0.3, // 8분 이후 추가 난이도 (late = t - lateStart)
  },

  boss: { interval: 120, hpGrowthPerBoss: 0.6, chargeEvery: [3, 5], chargeSpeed: 4.5, ringEvery: 5, ringBullets: 12, bulletSpeed: 170 },

  drops: { healChance: 0.008, magnetChance: 0.002, healAmount: 20 },

  enemies: {
    basic: { name: '구울',  hp: 10, speed: 58,  dmg: 8,   r: 11, xp: 1,  color: '#d2524b', kb: 1.0 },
    fast:  { name: '박쥐',  hp: 6,  speed: 108, dmg: 5,   r: 8,  xp: 1,  color: '#9c5ad6', kb: 1.3 },
    tank:  { name: '골렘',  hp: 45, speed: 36,  dmg: 12,  r: 18, xp: 4,  color: '#4f9440', kb: 0.3 },
    boss:  { name: '밤의 군주', hp: 600, speed: 62, dmg: 25, r: 40, xp: 60, color: '#e8862a', kb: 0 },
  },
  maxEnemyRadius: 52, // 보스는 회차마다 커짐 (40 + 최대 12)

  maxWeapons: 6,
  maxLevel: 5,
  weapons: {
    bolt: {
      name: '마법탄', color: '#6fd3ff', desc: '가장 가까운 적에게 마법 탄환을 발사합니다.',
      levels: [
        { dmg: 12, cd: 0.85, count: 1, pierce: 1, speed: 460, size: 5 },
        { dmg: 15, cd: 0.78, count: 1, pierce: 1, speed: 460, size: 5 },
        { dmg: 18, cd: 0.7,  count: 2, pierce: 1, speed: 480, size: 6 },
        { dmg: 22, cd: 0.62, count: 2, pierce: 2, speed: 500, size: 6 },
        { dmg: 28, cd: 0.5,  count: 3, pierce: 2, speed: 520, size: 7 },
      ],
    },
    orbit: {
      name: '수호 오브', color: '#ffd84a', desc: '플레이어 주위를 도는 빛의 구슬이 닿는 적을 공격합니다.',
      levels: [
        { dmg: 8,  count: 2, radius: 62, rot: 3.0, size: 8,  hitCd: 0.45 },
        { dmg: 11, count: 3, radius: 66, rot: 3.2, size: 9,  hitCd: 0.45 },
        { dmg: 14, count: 3, radius: 72, rot: 3.4, size: 10, hitCd: 0.4 },
        { dmg: 18, count: 4, radius: 78, rot: 3.6, size: 11, hitCd: 0.4 },
        { dmg: 24, count: 5, radius: 88, rot: 4.0, size: 12, hitCd: 0.35 },
      ],
    },
    nova: {
      name: '화염 노바', color: '#ff7a3d', desc: '주기적으로 주변에 화염 폭발을 일으켜 적을 밀어냅니다.',
      levels: [
        { dmg: 18, cd: 3.0, radius: 95 },
        { dmg: 24, cd: 2.7, radius: 108 },
        { dmg: 32, cd: 2.4, radius: 122 },
        { dmg: 42, cd: 2.1, radius: 138 },
        { dmg: 55, cd: 1.8, radius: 158 },
      ],
    },
    blade: {
      name: '관통 칼날', color: '#e0e6ee', desc: '이동 방향으로 적을 꿰뚫는 칼날을 던집니다.',
      levels: [
        { dmg: 14, cd: 1.2,  count: 1, pierce: 3, speed: 620 },
        { dmg: 18, cd: 1.1,  count: 2, pierce: 4, speed: 620 },
        { dmg: 22, cd: 1.0,  count: 2, pierce: 5, speed: 650 },
        { dmg: 27, cd: 0.9,  count: 3, pierce: 6, speed: 650 },
        { dmg: 34, cd: 0.75, count: 4, pierce: 8, speed: 680 },
      ],
    },
    lightning: {
      name: '천둥 번개', color: '#b4a6ff', desc: '화면 안의 무작위 적에게 번개를 떨어뜨립니다.',
      levels: [
        { dmg: 22, cd: 2.2, count: 1, splash: 30 },
        { dmg: 28, cd: 2.0, count: 2, splash: 34 },
        { dmg: 36, cd: 1.8, count: 3, splash: 38 },
        { dmg: 46, cd: 1.6, count: 4, splash: 44 },
        { dmg: 60, cd: 1.3, count: 5, splash: 50 },
      ],
    },
    axe: {
      name: '회전 도끼', color: '#c98a52', desc: '위로 던진 도끼가 포물선을 그리며 모든 적을 관통합니다.',
      levels: [
        { dmg: 20, cd: 1.6, count: 1, size: 10 },
        { dmg: 26, cd: 1.5, count: 1, size: 11 },
        { dmg: 33, cd: 1.4, count: 2, size: 12 },
        { dmg: 42, cd: 1.3, count: 2, size: 13 },
        { dmg: 54, cd: 1.1, count: 3, size: 14 },
      ],
    },
  },

  passives: {
    speed:  { name: '신속의 장화',   color: '#4dd0e1', perLevel: 0.10, desc: '이동속도 +10%' },
    maxHp:  { name: '강철 심장',     color: '#ef5350', perLevel: 20,   desc: '최대 체력 +20 (즉시 회복)' },
    haste:  { name: '시간의 모래',   color: '#ffb74d', perLevel: 0.08, desc: '모든 무기 쿨다운 -8%' },
    magnet: { name: '자력의 부적',   color: '#64b5f6', perLevel: 0.35, desc: '젬 흡수 범위 +35%' },
    might:  { name: '힘의 반지',     color: '#ba68c8', perLevel: 0.10, desc: '모든 무기 데미지 +10%' },
  },
};

const WEAPON_KEYS = Object.keys(CONFIG.weapons);
const PASSIVE_KEYS = Object.keys(CONFIG.passives);
const STAT_LABELS = { dmg: '데미지', cd: '쿨다운', count: '개수', pierce: '관통', radius: '범위', splash: '폭발 범위', rot: '회전속도', size: '크기', speed: '탄속', hitCd: '타격 간격' };

/* ============================ 유틸 ============================ */
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function fmtTime(s) {
  s = Math.floor(s);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
function hash2(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function xpToNext(level) {
  const c = CONFIG.xp, k = level - 1;
  return Math.floor(c.base + c.linear * k + c.quad * k * k);
}
const Store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* file:// 등에서 실패해도 무시 */ } },
};

/* ======================= 오브젝트 풀 =======================
 * 활성 객체는 items[0..count-1]에 촘촘히 유지. 제거는 마지막과 swap (역순 순회에서 안전) */
class Pool {
  constructor(size, factory) { this.items = Array.from({ length: size }, factory); this.count = 0; }
  spawn() { return this.count < this.items.length ? this.items[this.count++] : null; }
  removeAt(i) {
    const last = --this.count, t = this.items[i];
    this.items[i] = this.items[last]; this.items[last] = t;
  }
  clear() { this.count = 0; }
}

/* ===================== 공간 분할 그리드 =====================
 * 월드 좌표를 셀로 나눈 뒤 size x size로 랩핑하는 해시 그리드 (연결 리스트 방식) */
class SpatialGrid {
  constructor(cell, size, maxItems) {
    this.cell = cell; this.size = size; this.mask = size - 1;
    this.head = new Int32Array(size * size);
    this.next = new Int32Array(maxItems);
  }
  build(items, count) {
    this.head.fill(-1);
    const c = this.cell, m = this.mask, s = this.size;
    for (let i = 0; i < count; i++) {
      const e = items[i];
      if (e.dead) continue;
      const idx = (Math.floor(e.x / c) & m) + (Math.floor(e.y / c) & m) * s;
      this.next[i] = this.head[idx];
      this.head[idx] = i;
    }
  }
  query(x, y, r, out) {
    const c = this.cell, m = this.mask, s = this.size;
    const x0 = Math.floor((x - r) / c), y0 = Math.floor((y - r) / c);
    const x1 = Math.min(Math.floor((x + r) / c), x0 + s - 1), y1 = Math.min(Math.floor((y + r) / c), y0 + s - 1);
    let n = 0;
    const max = out.length;
    for (let iy = y0; iy <= y1; iy++) {
      const row = (iy & m) * s;
      for (let ix = x0; ix <= x1; ix++) {
        let i = this.head[(ix & m) + row];
        while (i !== -1) { if (n < max) out[n++] = i; i = this.next[i]; }
      }
    }
    return n;
  }
}
const QBUF = new Int32Array(2048);

/* ========================= 사운드 =========================
 * Web Audio로 짧은 효과음 합성. 같은 소리는 최소 간격으로 스로틀 */
class SoundFX {
  constructor() {
    this.ctx = null; this.master = null; this.noiseBuf = null;
    this.muted = !!Store.get('ns_muted', false);
    this.last = {};
    this.gaps = { shoot: 0.06, hit: 0.045, kill: 0.04, gem: 0.05, zap: 0.08, nova: 0.1, axe: 0.08, blade: 0.08 };
  }
  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.35;
        this.master.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 0.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { this.ctx = null; }
  }
  setMuted(m) {
    this.muted = m;
    Store.set('ns_muted', m);
    if (this.master) this.master.gain.value = m ? 0 : 0.35;
  }
  tone(freq, dur, type = 'square', vol = 0.1, slide = 1, delay = 0) {
    const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide !== 1) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  noise(dur, vol, freq = 1500, delay = 0) {
    const c = this.ctx, t = c.currentTime + delay;
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noiseBuf;
    f.type = 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.02);
  }
  play(name) {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime, gap = this.gaps[name] || 0;
    if (this.last[name] !== undefined && now - this.last[name] < gap) return;
    this.last[name] = now;
    switch (name) {
      case 'shoot': this.tone(900, 0.06, 'square', 0.03, 0.5); break;
      case 'blade': this.tone(1400, 0.07, 'triangle', 0.05, 0.4); break;
      case 'axe': this.tone(260, 0.1, 'triangle', 0.07, 1.8); break;
      case 'hit': this.tone(240, 0.05, 'triangle', 0.06, 0.6); break;
      case 'kill': this.noise(0.07, 0.06, 2200); break;
      case 'gem': this.tone(1100 + Math.random() * 300, 0.05, 'sine', 0.05, 1.5); break;
      case 'nova': this.noise(0.35, 0.15, 700); this.tone(110, 0.3, 'sawtooth', 0.06, 0.5); break;
      case 'zap': this.noise(0.15, 0.1, 5000); this.tone(1600, 0.12, 'sawtooth', 0.04, 0.25); break;
      case 'hurt': this.tone(170, 0.22, 'sawtooth', 0.13, 0.45); break;
      case 'heal': this.tone(600, 0.12, 'sine', 0.1, 1.5); this.tone(900, 0.15, 'sine', 0.08, 1.4, 0.08); break;
      case 'levelup': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'square', 0.06, 1, i * 0.07)); break;
      case 'select': this.tone(760, 0.08, 'square', 0.06, 1.3); break;
      case 'boss': this.tone(98, 0.7, 'sawtooth', 0.12, 0.9); this.tone(104, 0.7, 'sawtooth', 0.1, 0.9, 0.35); break;
      case 'bossDie': this.noise(0.8, 0.2, 900); [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.08, 1, i * 0.1)); break;
      case 'magnet': this.tone(300, 0.4, 'sine', 0.1, 3); break;
      case 'gameover': [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.1, 0.9, i * 0.18)); break;
    }
  }
}
const sfx = new SoundFX();

/* ========================= 입력 ========================= */
class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.joy = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0, R: 55 };
    this.move = { x: 0, y: 0 };
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.reset());
    canvas.addEventListener('pointerdown', (e) => {
      sfx.unlock();
      if (game.state !== 'playing' || this.joy.active) return;
      const j = this.joy;
      j.active = true; j.id = e.pointerId;
      j.ox = j.x = e.clientX; j.oy = j.y = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.joy.active && e.pointerId === this.joy.id) { this.joy.x = e.clientX; this.joy.y = e.clientY; }
    });
    const end = (e) => { if (e.pointerId === this.joy.id) this.joy.active = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }
  reset() { this.keys.clear(); this.joy.active = false; this.joy.id = -1; }
  getMove() {
    const k = this.keys;
    let x = 0, y = 0;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (k.has('KeyW') || k.has('ArrowUp')) y -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) y += 1;
    const j = this.joy;
    if (j.active) {
      const dx = (j.x - j.ox) / j.R, dy = (j.y - j.oy) / j.R;
      if (dx * dx + dy * dy > 0.15 * 0.15) { x += dx; y += dy; }
    }
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    this.move.x = x; this.move.y = y;
    return this.move;
  }
}

/* ========================= 엔티티 ========================= */
class Enemy {
  constructor() { this.dead = true; }
  init(id, typeKey, x, y, hpMult, spdMult, dmgMult) {
    const T = CONFIG.enemies[typeKey];
    this.id = id; this.type = typeKey; this.dead = false;
    this.x = x; this.y = y; this.kbx = 0; this.kby = 0;
    this.r = T.r; this.color = T.color; this.kbRes = T.kb; this.xp = T.xp;
    this.maxHp = this.hp = Math.ceil(T.hp * hpMult);
    this.speed = T.speed * spdMult; this.dmg = T.dmg * dmgMult;
    this.flash = 0; this.orbitCd = 0;
    this.isBoss = typeKey === 'boss';
    this.bState = 'chase'; this.bTimer = rand(2, 3); this.ringTimer = CONFIG.boss.ringEvery; this.cdx = 0; this.cdy = 0;
    this.wobble = Math.random() * TAU;
  }
}

class Weapon {
  constructor(key) { this.key = key; this.level = 1; this.timer = 0.3; this.angle = 0; this.orbs = []; }
  get def() { return CONFIG.weapons[this.key]; }
  get stats() { return CONFIG.weapons[this.key].levels[this.level - 1]; }
}

/* ========================= 게임 ========================= */
class Game {
  constructor() {
    this.state = 'title';
    this.debug = /debug/.test(location.search);
    this.fps = 60;
    this.tmpList = [];
    this.reset();
  }

  reset() {
    const P = CONFIG.player, C = CONFIG.pools;
    this.time = 0; this.kills = 0; this.idSeq = 1;
    this.player = {
      x: 0, y: 0, r: P.radius, hp: P.maxHp, invuln: 0, fx: 1, fy: 0, moving: false,
      level: 1, xp: 0, xpNext: xpToNext(1), pendingLevels: 0, walk: 0,
    };
    this.passives = {};
    for (const k of PASSIVE_KEYS) this.passives[k] = 0;
    this.weapons = [];
    this.addWeapon('bolt');

    this.enemies = new Pool(C.enemies, () => new Enemy());
    this.projectiles = new Pool(C.projectiles, () => ({ kind: '', x: 0, y: 0, vx: 0, vy: 0, r: 0, dmg: 0, pierce: 0, life: 0, color: '', spin: 0, hits: [] }));
    this.enemyBullets = new Pool(C.enemyBullets, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, dmg: 0, life: 0 }));
    this.gems = new Pool(C.gems, () => ({ x: 0, y: 0, value: 0, magnet: false, speed: 0 }));
    this.pickups = new Pool(C.pickups, () => ({ kind: '', x: 0, y: 0, magnet: false, speed: 0, t: 0 }));
    this.particles = new Pool(C.particles, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, color: '' }));
    this.popups = new Pool(C.popups, () => ({ x: 0, y: 0, text: '', life: 0, color: '', big: false }));
    this.effects = new Pool(C.effects, () => ({ kind: '', x: 0, y: 0, r: 0, maxR: 0, life: 0, maxLife: 0, color: '', pts: new Float32Array(8), dx: 0, dy: 0 }));
    this.grid = new SpatialGrid(CONFIG.grid.cell, CONFIG.grid.size, C.enemies);

    this.spawnAcc = 0;
    this.nextSwarm = CONFIG.spawn.swarmInterval;
    this.nextBoss = CONFIG.boss.interval;
    this.bossCount = 0;
    this.bosses = [];
    this.shakeT = 0; this.shakeMag = 0;
    this.banner = null;
    this.hurtFlash = 0;
    this.camX = 0; this.camY = 0;
  }

  /* ---------- 파생 스탯 ---------- */
  get moveSpeed() { return CONFIG.player.speed * (1 + CONFIG.passives.speed.perLevel * this.passives.speed); }
  get magnetRange() { return CONFIG.player.magnet * (1 + CONFIG.passives.magnet.perLevel * this.passives.magnet); }
  get cdMult() { return Math.max(0.5, 1 - CONFIG.passives.haste.perLevel * this.passives.haste); }
  get dmgMult() { return 1 + CONFIG.passives.might.perLevel * this.passives.might; }
  get maxHp() { return CONFIG.player.maxHp + CONFIG.passives.maxHp.perLevel * this.passives.maxHp; }
  get viewW() { return view.w / view.scale; }
  get viewH() { return view.h / view.scale; }

  addWeapon(key) {
    const w = new Weapon(key);
    this.weapons.push(w);
    return w;
  }

  /* ================= 메인 업데이트 ================= */
  update(dt) {
    this.time += dt;
    const pl = this.player;

    // 플레이어 이동
    const mv = input.getMove();
    const spd = this.moveSpeed;
    pl.x += mv.x * spd * dt;
    pl.y += mv.y * spd * dt;
    pl.moving = mv.x !== 0 || mv.y !== 0;
    if (pl.moving) {
      const l = Math.hypot(mv.x, mv.y);
      pl.fx = mv.x / l; pl.fy = mv.y / l;
      pl.walk += dt * 10;
    }
    if (pl.invuln > 0) pl.invuln -= dt;
    if (this.shakeT > 0) this.shakeT -= dt;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;
    if (this.banner) { this.banner.t -= dt; if (this.banner.t <= 0) this.banner = null; }

    this.updateSpawning(dt);
    this.grid.build(this.enemies.items, this.enemies.count);
    this.updateEnemies(dt);
    this.grid.build(this.enemies.items, this.enemies.count);

    this.checkPlayerContact();
    this.updateEnemyBullets(dt);
    if (this.state !== 'playing') return;

    this.updateWeapons(dt);
    this.updateProjectiles(dt);
    this.compactEnemies();

    this.updateGems(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updatePopups(dt);
    this.updateEffects(dt);
  }

  /* ---------- 스폰 ---------- */
  difficulty() {
    const t = this.time / 60, S = CONFIG.spawn, late = Math.max(0, t - S.lateStart);
    return {
      t,
      hp: 1 + S.hpLinear * t + S.hpQuad * t * t + S.lateHp * late * late,
      dmg: 1 + S.dmgLinear * t + S.lateDmg * late,
      spd: Math.min(1 + S.speedLinear * t, S.speedMax),
    };
  }

  updateSpawning(dt) {
    const S = CONFIG.spawn, t = this.time / 60, late = Math.max(0, t - S.lateStart);
    const rate = S.baseRate + S.linear * t + S.quad * t * t + S.lateRate * late * late;
    this.spawnAcc += rate * dt;
    while (this.spawnAcc >= 1) {
      this.spawnAcc -= 1;
      if (this.enemies.count >= S.maxAlive) { this.spawnAcc = 0; break; }
      const p = this.randomSpawnPos();
      this.spawnEnemy(this.pickEnemyType(t), p.x, p.y);
    }
    if (this.time >= this.nextSwarm) { this.nextSwarm += S.swarmInterval; this.spawnSwarm(); }
    if (this.time >= this.nextBoss) { this.nextBoss += CONFIG.boss.interval; this.spawnBoss(); }
  }

  pickEnemyType(t) {
    const wFast = clamp((t - 0.5) * 0.4, 0, 0.8);
    const wTank = clamp((t - 2) * 0.15, 0, 0.5);
    const r = Math.random() * (1 + wFast + wTank);
    return r < 1 ? 'basic' : r < 1 + wFast ? 'fast' : 'tank';
  }

  // 화면 바깥 테두리의 임의 지점
  randomSpawnPos() {
    const m = CONFIG.spawn.margin;
    const hw = this.viewW / 2 + m, hh = this.viewH / 2 + m;
    const per = 4 * (hw + hh);
    let d = Math.random() * per, x, y;
    if (d < 2 * hw) { x = -hw + d; y = -hh; }
    else if ((d -= 2 * hw) < 2 * hh) { x = hw; y = -hh + d; }
    else if ((d -= 2 * hh) < 2 * hw) { x = hw - d; y = hh; }
    else { d -= 2 * hw; x = -hw; y = hh - d; }
    this._sp = this._sp || { x: 0, y: 0 };
    this._sp.x = this.player.x + x; this._sp.y = this.player.y + y;
    return this._sp;
  }

  spawnEnemy(type, x, y) {
    const e = this.enemies.spawn();
    if (!e) return null;
    const d = this.difficulty();
    e.init(this.idSeq++, type, x, y, d.hp, d.spd, d.dmg);
    return e;
  }

  spawnSwarm() {
    const t = this.time / 60, S = CONFIG.spawn;
    const n = Math.floor(S.swarmBase + S.swarmPerMin * t);
    const R = Math.hypot(this.viewW, this.viewH) / 2 + 30;
    const type = t >= 1.5 ? 'fast' : 'basic';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      this.spawnEnemy(type, this.player.x + Math.cos(a) * R, this.player.y + Math.sin(a) * R);
    }
    this.showBanner('포위 공격!', '사방에서 적이 몰려옵니다', '#ff9a5a', 2);
  }

  spawnBoss() {
    this.bossCount++;
    const p = this.randomSpawnPos();
    const e = this.spawnEnemy('boss', p.x, p.y);
    if (!e) return;
    const mult = 1 + CONFIG.boss.hpGrowthPerBoss * (this.bossCount - 1);
    e.maxHp = e.hp = Math.ceil(e.hp * mult);
    e.r = CONFIG.enemies.boss.r + Math.min(this.bossCount - 1, 4) * 3;
    this.bosses.push(e);
    this.showBanner('⚠ 보스 출현 ⚠', `${CONFIG.enemies.boss.name} #${this.bossCount}`, '#ff5a5a', 3);
    sfx.play('boss');
  }

  showBanner(text, sub, color, dur) { this.banner = { text, sub, color, t: dur, max: dur }; }

  /* ---------- 적 ---------- */
  updateEnemies(dt) {
    const pl = this.player, items = this.enemies.items, n = this.enemies.count;
    const farX = this.viewW / 2 + 450, farY = this.viewH / 2 + 450;
    const kbDecay = Math.exp(-10 * dt);
    const maxR = CONFIG.maxEnemyRadius;
    for (let i = 0; i < n; i++) {
      const e = items[i];
      if (e.dead) continue;
      if (e.flash > 0) e.flash -= dt;
      if (e.orbitCd > 0) e.orbitCd -= dt;
      let dx = pl.x - e.x, dy = pl.y - e.y;
      // 너무 멀어진 적은 화면 밖 다른 위치로 재배치
      if (Math.abs(dx) > farX || Math.abs(dy) > farY) {
        const p = this.randomSpawnPos();
        e.x = p.x; e.y = p.y;
        continue;
      }
      const d = Math.hypot(dx, dy) || 1;
      let mx = (dx / d) * e.speed, my = (dy / d) * e.speed;
      if (e.isBoss) {
        const v = this.bossAI(e, dx / d, dy / d, dt);
        mx = v.x; my = v.y;
      } else {
        // 이웃 적과 분리
        let sx = 0, sy = 0, checked = 0;
        const qn = this.grid.query(e.x, e.y, e.r + maxR, QBUF);
        for (let k = 0; k < qn && checked < 10; k++) {
          const o = items[QBUF[k]];
          if (o === e || o.dead) continue;
          const ox = e.x - o.x, oy = e.y - o.y, rr = e.r + o.r, d2 = ox * ox + oy * oy;
          if (d2 < rr * rr) {
            checked++;
            if (d2 > 0.0001) {
              const dd = Math.sqrt(d2), push = (rr - dd) / rr * (o.isBoss ? 3 : 1);
              sx += (ox / dd) * push; sy += (oy / dd) * push;
            } else { sx += rand(-1, 1); sy += rand(-1, 1); }
          }
        }
        const sep = 140 * (e.type === 'tank' ? 0.5 : 1);
        mx += sx * sep; my += sy * sep;
      }
      e.x += (mx + e.kbx) * dt;
      e.y += (my + e.kby) * dt;
      e.kbx *= kbDecay; e.kby *= kbDecay;
    }
  }

  bossAI(e, nx, ny, dt) {
    const B = CONFIG.boss, out = this._bv || (this._bv = { x: 0, y: 0 });
    e.bTimer -= dt;
    if (e.bState === 'chase') {
      out.x = nx * e.speed; out.y = ny * e.speed;
      e.ringTimer -= dt;
      if (e.ringTimer <= 0) { e.ringTimer = B.ringEvery; this.bossRing(e); }
      if (e.bTimer <= 0) { e.bState = 'tele'; e.bTimer = 0.75; e.cdx = nx; e.cdy = ny; }
    } else if (e.bState === 'tele') {
      out.x = 0; out.y = 0;
      e.cdx = nx; e.cdy = ny; // 예고 중에는 계속 조준
      if (e.bTimer <= 0) { e.bState = 'charge'; e.bTimer = 0.6; }
    } else {
      out.x = e.cdx * e.speed * B.chargeSpeed; out.y = e.cdy * e.speed * B.chargeSpeed;
      if (e.bTimer <= 0) { e.bState = 'chase'; e.bTimer = rand(B.chargeEvery[0], B.chargeEvery[1]); }
    }
    return out;
  }

  bossRing(e) {
    const B = CONFIG.boss, n = B.ringBullets + (this.bossCount - 1) * 2, off = Math.random() * TAU;
    for (let i = 0; i < n; i++) {
      const b = this.enemyBullets.spawn();
      if (!b) break;
      const a = off + (i / n) * TAU;
      b.x = e.x; b.y = e.y; b.vx = Math.cos(a) * B.bulletSpeed; b.vy = Math.sin(a) * B.bulletSpeed;
      b.r = 6; b.dmg = e.dmg * 0.5; b.life = 5;
    }
  }

  compactEnemies() {
    const p = this.enemies;
    for (let i = p.count - 1; i >= 0; i--) if (p.items[i].dead) p.removeAt(i);
    if (this.bosses.length) this.bosses = this.bosses.filter((b) => !b.dead);
  }

  checkPlayerContact() {
    const pl = this.player;
    if (pl.invuln > 0) return;
    const items = this.enemies.items;
    const n = this.grid.query(pl.x, pl.y, pl.r + CONFIG.maxEnemyRadius + 12, QBUF);
    for (let k = 0; k < n; k++) {
      const e = items[QBUF[k]];
      if (e.dead) continue;
      const dx = e.x - pl.x, dy = e.y - pl.y, rr = e.r + pl.r - 2;
      if (dx * dx + dy * dy < rr * rr) { this.hurtPlayer(e.dmg); return; }
    }
  }

  hurtPlayer(dmg) {
    const pl = this.player;
    if (pl.invuln > 0 || this.state !== 'playing') return;
    dmg = Math.round(dmg);
    pl.hp -= dmg;
    pl.invuln = CONFIG.player.invuln;
    this.shakeT = 0.25; this.shakeMag = 7;
    this.hurtFlash = 0.2;
    this.addPopup(pl.x, pl.y - 20, '-' + dmg, '#ff4d4d', true);
    sfx.play('hurt');
    if (pl.hp <= 0) { pl.hp = 0; gameOver(); }
  }

  updateEnemyBullets(dt) {
    const P = this.enemyBullets, pl = this.player;
    for (let i = P.count - 1; i >= 0; i--) {
      const b = P.items[i];
      b.life -= dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.life <= 0) { P.removeAt(i); continue; }
      const dx = b.x - pl.x, dy = b.y - pl.y, rr = b.r + pl.r;
      if (dx * dx + dy * dy < rr * rr && pl.invuln <= 0) {
        P.removeAt(i);
        this.hurtPlayer(b.dmg);
        if (this.state !== 'playing') return;
      }
    }
  }

  damageEnemy(e, base, kx, ky, kb) {
    if (e.dead) return;
    const dmg = Math.max(1, Math.round(base * this.dmgMult * rand(0.9, 1.1)));
    e.hp -= dmg;
    e.flash = 0.1;
    if (kb && e.kbRes > 0) { e.kbx += kx * kb * e.kbRes; e.kby += ky * kb * e.kbRes; }
    this.addPopup(e.x + rand(-6, 6), e.y - e.r, String(dmg), dmg >= 40 ? '#ffd54f' : '#ffffff', dmg >= 40);
    sfx.play('hit');
    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e) {
    e.dead = true;
    this.kills++;
    this.burst(e.x, e.y, e.color, e.isBoss ? 50 : 7, e.isBoss ? 260 : 140);
    this.dropGem(e.x, e.y, e.xp);
    const D = CONFIG.drops;
    if (e.isBoss) {
      for (let i = 0; i < 6; i++) this.dropGem(e.x + rand(-30, 30), e.y + rand(-30, 30), 10);
      this.spawnPickup('heal', e.x + 20, e.y);
      this.spawnPickup('magnet', e.x - 20, e.y);
      this.shakeT = 0.4; this.shakeMag = 10;
      this.showBanner('보스 처치!', '보상이 떨어졌습니다', '#ffd54f', 2.5);
      sfx.play('bossDie');
    } else {
      const r = Math.random();
      if (r < D.healChance) this.spawnPickup('heal', e.x, e.y);
      else if (r < D.healChance + D.magnetChance) this.spawnPickup('magnet', e.x, e.y);
      sfx.play('kill');
    }
  }

  /* ---------- 무기 ---------- */
  updateWeapons(dt) {
    for (const w of this.weapons) {
      const s = w.stats;
      if (w.key === 'orbit') { this.updateOrbit(w, s, dt); continue; }
      w.timer -= dt;
      if (w.timer <= 0) w.timer = this.fireWeapon(w, s) ? s.cd * this.cdMult : 0.1;
    }
  }

  fireWeapon(w, s) {
    const pl = this.player;
    switch (w.key) {
      case 'bolt': {
        const t = this.findNearestEnemy(Math.max(this.viewW, this.viewH) * 0.75);
        if (!t) return false;
        const base = Math.atan2(t.y - pl.y, t.x - pl.x);
        for (let i = 0; i < s.count; i++) {
          const a = base + (i - (s.count - 1) / 2) * 0.16;
          this.spawnProjectile('bolt', pl.x, pl.y, Math.cos(a) * s.speed, Math.sin(a) * s.speed, s.size, s.dmg, s.pierce, 1.6, w.def.color);
        }
        sfx.play('shoot');
        return true;
      }
      case 'blade': {
        const base = Math.atan2(pl.fy, pl.fx);
        for (let i = 0; i < s.count; i++) {
          const a = base + (i - (s.count - 1) / 2) * 0.14;
          this.spawnProjectile('blade', pl.x, pl.y, Math.cos(a) * s.speed, Math.sin(a) * s.speed, 8, s.dmg, s.pierce, 1.1, w.def.color);
        }
        sfx.play('blade');
        return true;
      }
      case 'axe': {
        for (let i = 0; i < s.count; i++) {
          const dir = s.count === 1 ? (pl.fx >= 0 ? 1 : -1) : (i % 2 === 0 ? 1 : -1);
          const vx = dir * rand(60, 170) + pl.fx * 40;
          this.spawnProjectile('axe', pl.x, pl.y, vx, -rand(400, 470), s.size, s.dmg, 9999, 2.2, w.def.color);
        }
        sfx.play('axe');
        return true;
      }
      case 'nova': {
        const n = this.grid.query(pl.x, pl.y, s.radius + CONFIG.maxEnemyRadius, QBUF);
        const items = this.enemies.items;
        for (let k = 0; k < n; k++) {
          const e = items[QBUF[k]];
          if (e.dead) continue;
          const dx = e.x - pl.x, dy = e.y - pl.y, rr = s.radius + e.r;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr) {
            const d = Math.sqrt(d2) || 1;
            this.damageEnemy(e, s.dmg, dx / d, dy / d, 420);
          }
        }
        this.addEffect('ring', pl.x, pl.y, s.radius, 0.35, w.def.color);
        sfx.play('nova');
        return true;
      }
      case 'lightning': {
        const list = this.tmpList;
        list.length = 0;
        const hw = this.viewW / 2, hh = this.viewH / 2, items = this.enemies.items;
        for (let i = 0; i < this.enemies.count; i++) {
          const e = items[i];
          if (!e.dead && Math.abs(e.x - pl.x) < hw && Math.abs(e.y - pl.y) < hh) list.push(e);
        }
        if (!list.length) return false;
        for (let c = 0; c < s.count && list.length; c++) {
          const idx = (Math.random() * list.length) | 0;
          const t = list[idx];
          list[idx] = list[list.length - 1]; list.pop();
          const tx = t.x, ty = t.y;
          const n = this.grid.query(tx, ty, s.splash + CONFIG.maxEnemyRadius, QBUF);
          for (let k = 0; k < n; k++) {
            const e = items[QBUF[k]];
            if (e.dead) continue;
            const dx = e.x - tx, dy = e.y - ty, rr = s.splash + e.r;
            if (dx * dx + dy * dy < rr * rr) this.damageEnemy(e, s.dmg, 0, 0, 0);
          }
          this.addEffect('lightning', tx, ty, s.splash, 0.25, w.def.color);
        }
        sfx.play('zap');
        return true;
      }
    }
    return false;
  }

  updateOrbit(w, s, dt) {
    const pl = this.player, items = this.enemies.items;
    w.angle = (w.angle + s.rot * dt) % TAU;
    w.orbs.length = s.count * 2;
    for (let i = 0; i < s.count; i++) {
      const a = w.angle + (i / s.count) * TAU;
      const ox = pl.x + Math.cos(a) * s.radius, oy = pl.y + Math.sin(a) * s.radius;
      w.orbs[i * 2] = ox; w.orbs[i * 2 + 1] = oy;
      const n = this.grid.query(ox, oy, s.size + CONFIG.maxEnemyRadius, QBUF);
      for (let k = 0; k < n; k++) {
        const e = items[QBUF[k]];
        if (e.dead || e.orbitCd > 0) continue;
        const dx = e.x - ox, dy = e.y - oy, rr = s.size + e.r;
        if (dx * dx + dy * dy < rr * rr) {
          e.orbitCd = s.hitCd;
          const ex = e.x - pl.x, ey = e.y - pl.y, d = Math.hypot(ex, ey) || 1;
          this.damageEnemy(e, s.dmg, ex / d, ey / d, 260);
        }
      }
    }
  }

  findNearestEnemy(maxDist) {
    const pl = this.player, items = this.enemies.items;
    let best = null, bd = maxDist * maxDist;
    for (let i = 0; i < this.enemies.count; i++) {
      const e = items[i];
      if (e.dead) continue;
      const dx = e.x - pl.x, dy = e.y - pl.y, d2 = dx * dx + dy * dy;
      if (d2 < bd) { bd = d2; best = e; }
    }
    return best;
  }

  spawnProjectile(kind, x, y, vx, vy, r, dmg, pierce, life, color) {
    const p = this.projectiles.spawn();
    if (!p) return;
    p.kind = kind; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.r = r; p.dmg = dmg;
    p.pierce = pierce; p.life = life; p.color = color; p.spin = 0; p.hits.length = 0;
  }

  updateProjectiles(dt) {
    const P = this.projectiles, items = this.enemies.items, maxR = CONFIG.maxEnemyRadius;
    for (let i = P.count - 1; i >= 0; i--) {
      const p = P.items[i];
      p.life -= dt;
      if (p.kind === 'axe') { p.vy += 900 * dt; p.spin += 14 * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) { P.removeAt(i); continue; }
      const n = this.grid.query(p.x, p.y, p.r + maxR, QBUF);
      let removed = false;
      for (let k = 0; k < n; k++) {
        const e = items[QBUF[k]];
        if (e.dead) continue;
        const dx = e.x - p.x, dy = e.y - p.y, rr = e.r + p.r;
        if (dx * dx + dy * dy >= rr * rr || p.hits.includes(e.id)) continue;
        p.hits.push(e.id);
        const sp = Math.hypot(p.vx, p.vy) || 1;
        this.damageEnemy(e, p.dmg, p.vx / sp, p.vy / sp, p.kind === 'axe' ? 120 : 200);
        if (--p.pierce <= 0) { P.removeAt(i); removed = true; break; }
      }
      if (removed) continue;
    }
  }

  /* ---------- 젬 / 아이템 ---------- */
  dropGem(x, y, value) {
    const g = this.gems.spawn();
    if (!g) { // 풀이 가득 차면 기존 젬에 합산
      const t = this.gems.items[(Math.random() * this.gems.count) | 0];
      if (t) t.value += value;
      return;
    }
    g.x = x + rand(-5, 5); g.y = y + rand(-5, 5); g.value = value; g.magnet = false; g.speed = 0;
  }

  spawnPickup(kind, x, y) {
    const p = this.pickups.spawn();
    if (!p) return;
    p.kind = kind; p.x = x; p.y = y; p.magnet = false; p.speed = 0; p.t = 0;
  }

  // 자석 이동 공통 처리. 수집되면 true
  attract(o, dt, range2, pick2) {
    const pl = this.player;
    let dx = pl.x - o.x, dy = pl.y - o.y;
    const d2 = dx * dx + dy * dy;
    if (!o.magnet && d2 < range2) { o.magnet = true; o.speed = -120; }
    if (o.magnet) {
      o.speed = Math.min(o.speed + 1400 * dt, 900);
      const d = Math.sqrt(d2) || 1, step = Math.min(o.speed * dt, d);
      o.x += (dx / d) * step; o.y += (dy / d) * step;
      dx = pl.x - o.x; dy = pl.y - o.y;
    }
    return dx * dx + dy * dy < pick2;
  }

  updateGems(dt) {
    const G = this.gems, mr = this.magnetRange, r2 = mr * mr, pr = CONFIG.player.pickupRadius, p2 = pr * pr;
    for (let i = G.count - 1; i >= 0; i--) {
      const g = G.items[i];
      if (this.attract(g, dt, r2, p2)) {
        this.addXp(g.value);
        G.removeAt(i);
        sfx.play('gem');
      }
    }
  }

  updatePickups(dt) {
    const P = this.pickups, pl = this.player, mr = this.magnetRange, r2 = mr * mr, pr = CONFIG.player.pickupRadius, p2 = pr * pr;
    for (let i = P.count - 1; i >= 0; i--) {
      const p = P.items[i];
      p.t += dt;
      if (Math.abs(p.x - pl.x) > 2500 || Math.abs(p.y - pl.y) > 2500) { P.removeAt(i); continue; }
      if (!this.attract(p, dt, r2, p2)) continue;
      if (p.kind === 'heal') {
        const amt = Math.min(CONFIG.drops.healAmount, this.maxHp - pl.hp);
        pl.hp += amt;
        this.addPopup(pl.x, pl.y - 24, '+' + Math.round(amt), '#6dff8a', true);
        sfx.play('heal');
      } else if (p.kind === 'magnet') {
        for (let k = 0; k < this.gems.count; k++) { const g = this.gems.items[k]; g.magnet = true; g.speed = 200; }
        sfx.play('magnet');
      }
      P.removeAt(i);
    }
  }

  addXp(v) {
    const pl = this.player;
    pl.xp += v;
    while (pl.xp >= pl.xpNext) {
      pl.xp -= pl.xpNext;
      pl.level++;
      pl.xpNext = xpToNext(pl.level);
      pl.pendingLevels++;
    }
  }

  /* ---------- 이펙트 ---------- */
  burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      const p = this.particles.spawn();
      if (!p) return;
      const a = Math.random() * TAU, s = rand(0.3, 1) * speed;
      p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s;
      p.maxLife = p.life = rand(0.25, 0.55); p.size = rand(2, 5); p.color = color;
    }
  }
  addPopup(x, y, text, color, big) {
    const p = this.popups.spawn();
    if (!p) return;
    p.x = x; p.y = y; p.text = text; p.color = color; p.big = big; p.life = 0.7;
  }
  addEffect(kind, x, y, r, life, color) {
    const f = this.effects.spawn();
    if (!f) return;
    f.kind = kind; f.x = x; f.y = y; f.maxR = r; f.r = 0; f.maxLife = f.life = life; f.color = color;
    if (kind === 'lightning') for (let i = 0; i < f.pts.length; i++) f.pts[i] = rand(-14, 14);
  }
  updateParticles(dt) {
    const P = this.particles, drag = Math.exp(-5 * dt);
    for (let i = P.count - 1; i >= 0; i--) {
      const p = P.items[i];
      p.life -= dt;
      if (p.life <= 0) { P.removeAt(i); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= drag; p.vy *= drag;
    }
  }
  updatePopups(dt) {
    const P = this.popups;
    for (let i = P.count - 1; i >= 0; i--) {
      const p = P.items[i];
      p.life -= dt; p.y -= 40 * dt;
      if (p.life <= 0) P.removeAt(i);
    }
  }
  updateEffects(dt) {
    const P = this.effects;
    for (let i = P.count - 1; i >= 0; i--) {
      const f = P.items[i];
      f.life -= dt;
      if (f.life <= 0) { P.removeAt(i); continue; }
      f.r = f.maxR * (1 - f.life / f.maxLife);
    }
  }

  /* ---------- 레벨업 ---------- */
  buildChoices() {
    const pool = [];
    for (const key of WEAPON_KEYS) {
      const w = this.weapons.find((x) => x.key === key);
      if (w) { if (w.level < CONFIG.maxLevel) pool.push({ kind: 'weapon', key, level: w.level + 1 }); }
      else if (this.weapons.length < CONFIG.maxWeapons) pool.push({ kind: 'weapon', key, level: 1 });
    }
    for (const key of PASSIVE_KEYS) {
      if (this.passives[key] < CONFIG.maxLevel) pool.push({ kind: 'passive', key, level: this.passives[key] + 1 });
    }
    const choices = shuffle(pool).slice(0, 3);
    if (choices.length < 3) choices.push({ kind: 'heal' });
    return choices;
  }

  applyChoice(c) {
    if (c.kind === 'weapon') {
      const w = this.weapons.find((x) => x.key === c.key);
      if (w) w.level = Math.min(CONFIG.maxLevel, w.level + 1);
      else this.addWeapon(c.key);
    } else if (c.kind === 'passive') {
      this.passives[c.key] = Math.min(CONFIG.maxLevel, this.passives[c.key] + 1);
      if (c.key === 'maxHp') this.player.hp = Math.min(this.maxHp, this.player.hp + CONFIG.passives.maxHp.perLevel);
    } else {
      this.player.hp = Math.min(this.maxHp, this.player.hp + 40);
    }
  }

  /* ================= 렌더 ================= */
  render() {
    const c = ctx, pl = this.player, s = view.scale, d = view.dpr;
    let shx = 0, shy = 0;
    if (this.shakeT > 0 && this.state === 'playing') {
      const m = this.shakeMag * Math.min(1, this.shakeT / 0.25);
      shx = rand(-m, m); shy = rand(-m, m);
    }
    const camX = (this.camX = pl.x + shx), camY = (this.camY = pl.y + shy);
    const vw = this.viewW, vh = this.viewH;
    const left = camX - vw / 2, top = camY - vh / 2;

    c.setTransform(d * s, 0, 0, d * s, d * (view.w / 2 - camX * s), d * (view.h / 2 - camY * s));
    this.drawBackground(c, left, top, vw, vh);
    this.drawGems(c, left, top, vw, vh);
    this.drawPickups(c);
    this.drawEnemies(c, left, top, vw, vh);
    this.drawEnemyBullets(c);
    this.drawProjectiles(c);
    this.drawOrbits(c);
    this.drawPlayer(c);
    this.drawEffects(c);
    this.drawParticles(c);
    this.drawPopups(c);

    c.setTransform(d, 0, 0, d, 0, 0);
    if (this.hurtFlash > 0) {
      c.fillStyle = `rgba(255,0,0,${(this.hurtFlash / 0.2) * 0.18})`;
      c.fillRect(0, 0, view.w, view.h);
    }
    if (this.state !== 'title') this.drawHUD(c);
    this.drawJoystick(c);
  }

  drawBackground(c, left, top, vw, vh) {
    if (!bgPattern) bgPattern = makeBgPattern();
    c.fillStyle = bgPattern;
    c.fillRect(left - 2, top - 2, vw + 4, vh + 4);
    // 타일별 결정적 장식 (풀, 돌)
    const T = 64, tx0 = Math.floor(left / T), ty0 = Math.floor(top / T), tx1 = Math.floor((left + vw) / T), ty1 = Math.floor((top + vh) / T);
    c.beginPath();
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const h = hash2(tx, ty);
      if (h < 0.1) {
        const x = tx * T + 10 + hash2(tx + 7, ty) * 40, y = ty * T + 10 + hash2(tx, ty + 7) * 40;
        c.rect(x, y, 2, 7); c.rect(x + 4, y - 2, 2, 9); c.rect(x + 8, y + 1, 2, 6);
      }
    }
    c.fillStyle = '#2f4a33';
    c.fill();
    c.beginPath();
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const h = hash2(tx, ty);
      if (h > 0.96) {
        const x = tx * T + 32, y = ty * T + 32, r = 3 + h * 5;
        c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
      }
    }
    c.fillStyle = '#3a423c';
    c.fill();
  }

  drawGems(c, left, top, vw, vh) {
    const G = this.gems, tiers = [[0, 3, '#4fc3f7'], [3, 10, '#66d36e'], [10, 40, '#ff5f6d'], [40, Infinity, '#ffd54f']];
    for (const [lo, hi, col] of tiers) {
      c.beginPath();
      let any = false;
      for (let i = 0; i < G.count; i++) {
        const g = G.items[i];
        if (g.value < lo || g.value >= hi) continue;
        if (g.x < left - 10 || g.x > left + vw + 10 || g.y < top - 10 || g.y > top + vh + 10) continue;
        const sz = 5 + Math.min(4, Math.log2(g.value + 1));
        c.moveTo(g.x, g.y - sz); c.lineTo(g.x + sz * 0.7, g.y); c.lineTo(g.x, g.y + sz); c.lineTo(g.x - sz * 0.7, g.y); c.closePath();
        any = true;
      }
      if (any) { c.fillStyle = col; c.fill(); }
    }
  }

  drawPickups(c) {
    const P = this.pickups, now = this.time;
    for (let i = 0; i < P.count; i++) {
      const p = P.items[i], bob = Math.sin(now * 5 + i) * 2;
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.beginPath(); c.ellipse(p.x, p.y + 11, 9, 3, 0, 0, TAU); c.fill();
      if (p.kind === 'heal') {
        c.fillStyle = '#e53935';
        c.beginPath(); c.arc(p.x, p.y + bob, 10, 0, TAU); c.fill();
        c.fillStyle = '#fff';
        c.fillRect(p.x - 2.5, p.y + bob - 6, 5, 12); c.fillRect(p.x - 6, p.y + bob - 2.5, 12, 5);
      } else {
        c.fillStyle = '#1e88e5';
        c.beginPath(); c.arc(p.x, p.y + bob, 10, 0, TAU); c.fill();
        c.strokeStyle = '#fff'; c.lineWidth = 3;
        c.beginPath(); c.arc(p.x, p.y + bob - 1, 5, Math.PI, 0, true); c.stroke();
      }
    }
  }

  drawEnemies(c, left, top, vw, vh) {
    const items = this.enemies.items, n = this.enemies.count;
    const inView = (e) => e.x > left - e.r && e.x < left + vw + e.r && e.y > top - e.r && e.y < top + vh + e.r;
    const E = CONFIG.enemies;
    // 그림자
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const e = items[i];
      if (e.dead || e.isBoss || !inView(e)) continue;
      c.moveTo(e.x + e.r, e.y + e.r * 0.8); c.ellipse(e.x, e.y + e.r * 0.8, e.r, e.r * 0.35, 0, 0, TAU);
    }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
    // 타입별 일괄 그리기 (피격 중인 적은 흰색으로 따로)
    for (const pass of [0, 1]) {
      for (const type of ['tank', 'basic', 'fast']) {
        c.beginPath();
        for (let i = 0; i < n; i++) {
          const e = items[i];
          if (e.dead || e.type !== type || (e.flash > 0) !== (pass === 1) || !inView(e)) continue;
          this.enemyShape(c, e);
        }
        c.fillStyle = pass ? '#ffffff' : E[type].color;
        c.fill();
      }
    }
    // 눈
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const e = items[i];
      if (e.dead || e.isBoss || !inView(e)) continue;
      const ex = e.r * 0.35, ey = e.y - e.r * 0.2, er = Math.max(1.5, e.r * 0.16);
      c.rect(e.x - ex - er, ey - er, er * 2, er * 2); c.rect(e.x + ex - er, ey - er, er * 2, er * 2);
    }
    c.fillStyle = '#ffeb3b'; c.fill();
    for (const b of this.bosses) if (!b.dead) this.drawBoss(c, b);
  }

  enemyShape(c, e) {
    const x = e.x, y = e.y, r = e.r;
    if (e.type === 'tank') {
      c.rect(x - r, y - r, r * 2, r * 2);
    } else if (e.type === 'fast') {
      const f = Math.sin(this.time * 18 + e.wobble) * 0.5 + 0.5; // 날개짓
      c.moveTo(x, y - r); c.lineTo(x + r * (1.4 + f * 0.6), y - r * 0.2 - f * r * 0.6); c.lineTo(x + r * 0.6, y + r);
      c.lineTo(x - r * 0.6, y + r); c.lineTo(x - r * (1.4 + f * 0.6), y - r * 0.2 - f * r * 0.6); c.closePath();
    } else {
      const wob = Math.sin(this.time * 6 + e.wobble) * 1.2;
      c.moveTo(x + r, y + wob); c.arc(x, y + wob, r, 0, TAU);
    }
  }

  drawBoss(c, b) {
    const t = this.time;
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath(); c.ellipse(b.x, b.y + b.r * 0.85, b.r, b.r * 0.3, 0, 0, TAU); c.fill();
    if (b.bState === 'tele') { // 돌진 예고선
      c.strokeStyle = `rgba(255,60,60,${0.4 + 0.4 * Math.sin(t * 40)})`;
      c.lineWidth = b.r * 0.8;
      c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x + b.cdx * 420, b.y + b.cdy * 420); c.stroke();
    }
    const pulse = 1 + Math.sin(t * 4) * 0.04;
    c.fillStyle = b.flash > 0 ? '#fff' : b.bState === 'charge' ? '#ff3d3d' : b.color;
    c.beginPath(); c.arc(b.x, b.y, b.r * pulse, 0, TAU); c.fill();
    c.fillStyle = '#5a1f0a';
    c.beginPath(); c.arc(b.x, b.y + 4, b.r * 0.62, 0, TAU); c.fill();
    // 왕관
    c.fillStyle = '#ffd54f';
    c.beginPath();
    const cy = b.y - b.r * 0.85, w = b.r * 0.9;
    c.moveTo(b.x - w / 2, cy); c.lineTo(b.x - w / 2, cy - b.r * 0.45); c.lineTo(b.x - w / 4, cy - b.r * 0.2);
    c.lineTo(b.x, cy - b.r * 0.55); c.lineTo(b.x + w / 4, cy - b.r * 0.2); c.lineTo(b.x + w / 2, cy - b.r * 0.45);
    c.lineTo(b.x + w / 2, cy); c.closePath(); c.fill();
    // 눈
    c.fillStyle = '#ff1744';
    c.fillRect(b.x - b.r * 0.35, b.y - b.r * 0.1, b.r * 0.22, b.r * 0.22);
    c.fillRect(b.x + b.r * 0.13, b.y - b.r * 0.1, b.r * 0.22, b.r * 0.22);
    // 머리 위 체력바
    const bw = b.r * 2, bh = 6, bx = b.x - b.r, by = b.y - b.r - 30;
    c.fillStyle = '#300'; c.fillRect(bx, by, bw, bh);
    c.fillStyle = '#ff5252'; c.fillRect(bx, by, bw * Math.max(0, b.hp / b.maxHp), bh);
  }

  drawEnemyBullets(c) {
    const P = this.enemyBullets;
    if (!P.count) return;
    c.beginPath();
    for (let i = 0; i < P.count; i++) { const b = P.items[i]; c.moveTo(b.x + b.r + 3, b.y); c.arc(b.x, b.y, b.r + 3, 0, TAU); }
    c.fillStyle = 'rgba(255,80,40,0.35)'; c.fill();
    c.beginPath();
    for (let i = 0; i < P.count; i++) { const b = P.items[i]; c.moveTo(b.x + b.r, b.y); c.arc(b.x, b.y, b.r, 0, TAU); }
    c.fillStyle = '#ff7043'; c.fill();
  }

  drawProjectiles(c) {
    const P = this.projectiles;
    // 마법탄: 글로우 + 코어 일괄
    c.beginPath();
    for (let i = 0; i < P.count; i++) { const p = P.items[i]; if (p.kind === 'bolt') { c.moveTo(p.x + p.r * 2, p.y); c.arc(p.x, p.y, p.r * 2, 0, TAU); } }
    c.fillStyle = 'rgba(111,211,255,0.25)'; c.fill();
    c.beginPath();
    for (let i = 0; i < P.count; i++) { const p = P.items[i]; if (p.kind === 'bolt') { c.moveTo(p.x + p.r, p.y); c.arc(p.x, p.y, p.r, 0, TAU); } }
    c.fillStyle = '#d8f4ff'; c.fill();
    for (let i = 0; i < P.count; i++) {
      const p = P.items[i];
      if (p.kind === 'blade') {
        c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(p.vy, p.vx));
        c.fillStyle = 'rgba(224,230,238,0.25)'; c.fillRect(-30, -3, 22, 6);
        c.fillStyle = p.color; c.beginPath(); c.moveTo(14, 0); c.lineTo(-8, -5); c.lineTo(-8, 5); c.closePath(); c.fill();
        c.fillStyle = '#7a5230'; c.fillRect(-14, -2.5, 7, 5);
        c.restore();
      } else if (p.kind === 'axe') {
        c.save(); c.translate(p.x, p.y); c.rotate(p.spin);
        c.fillStyle = '#6d4c2f'; c.fillRect(-2, -p.r * 1.2, 4, p.r * 2.4);
        c.fillStyle = '#cfd8dc'; c.fillRect(2, -p.r * 1.2, p.r, p.r);
        c.fillStyle = p.color; c.fillRect(-p.r - 2, -p.r * 1.2, p.r, p.r);
        c.restore();
      }
    }
  }

  drawOrbits(c) {
    for (const w of this.weapons) {
      if (w.key !== 'orbit') continue;
      const s = w.stats;
      c.beginPath();
      for (let i = 0; i < w.orbs.length; i += 2) { c.moveTo(w.orbs[i] + s.size * 1.8, w.orbs[i + 1]); c.arc(w.orbs[i], w.orbs[i + 1], s.size * 1.8, 0, TAU); }
      c.fillStyle = 'rgba(255,216,74,0.22)'; c.fill();
      c.beginPath();
      for (let i = 0; i < w.orbs.length; i += 2) { c.moveTo(w.orbs[i] + s.size, w.orbs[i + 1]); c.arc(w.orbs[i], w.orbs[i + 1], s.size, 0, TAU); }
      c.fillStyle = '#fff3b0'; c.fill();
    }
  }

  drawPlayer(c) {
    const pl = this.player;
    if (this.state === 'gameover') return;
    if (pl.invuln > 0 && Math.floor(pl.invuln * 16) % 2 === 0) return; // 무적 깜빡임
    const bob = pl.moving ? Math.abs(Math.sin(pl.walk)) * 2 : 0;
    const x = pl.x, y = pl.y - bob, r = pl.r;
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath(); c.ellipse(pl.x, pl.y + r * 0.9, r, r * 0.35, 0, 0, TAU); c.fill();
    // 망토
    c.fillStyle = '#3f51b5';
    c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.lineTo(x + r * 1.1, y + r * 1.1); c.lineTo(x - r * 1.1, y + r * 1.1); c.closePath(); c.fill();
    c.fillStyle = '#e8e2d0';
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = '#2b2b3a'; // 눈 (바라보는 방향)
    const ex = x + pl.fx * 4, ey = y + pl.fy * 3 - 2;
    c.fillRect(ex - 5, ey - 2, 3, 4); c.fillRect(ex + 2, ey - 2, 3, 4);
    // 머리 위 체력바
    const hpw = 30;
    c.fillStyle = '#400'; c.fillRect(pl.x - hpw / 2, pl.y + r + 6, hpw, 4);
    c.fillStyle = '#ff5252'; c.fillRect(pl.x - hpw / 2, pl.y + r + 6, hpw * clamp(pl.hp / this.maxHp, 0, 1), 4);
  }

  drawEffects(c) {
    const P = this.effects;
    for (let i = 0; i < P.count; i++) {
      const f = P.items[i], a = f.life / f.maxLife;
      if (f.kind === 'ring') {
        c.globalAlpha = a * 0.35; c.fillStyle = f.color;
        c.beginPath(); c.arc(f.x, f.y, f.r, 0, TAU); c.fill();
        c.globalAlpha = a; c.strokeStyle = f.color; c.lineWidth = 5;
        c.beginPath(); c.arc(f.x, f.y, f.r, 0, TAU); c.stroke();
      } else if (f.kind === 'lightning') {
        c.globalAlpha = a; c.strokeStyle = '#f3efff'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(f.x + f.pts[0], f.y - 420);
        for (let k = 1; k < f.pts.length; k++) c.lineTo(f.x + f.pts[k], f.y - 420 + (420 * k) / (f.pts.length - 1));
        c.lineTo(f.x, f.y); c.stroke();
        c.fillStyle = f.color; c.globalAlpha = a * 0.5;
        c.beginPath(); c.arc(f.x, f.y, f.maxR, 0, TAU); c.fill();
      }
    }
    c.globalAlpha = 1;
  }

  drawParticles(c) {
    const P = this.particles;
    for (let i = 0; i < P.count; i++) {
      const p = P.items[i];
      c.globalAlpha = p.life / p.maxLife;
      c.fillStyle = p.color;
      c.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    c.globalAlpha = 1;
  }

  drawPopups(c) {
    const P = this.popups;
    if (!P.count) return;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.8)';
    for (const big of [false, true]) {
      c.font = big ? 'bold 18px sans-serif' : 'bold 13px sans-serif';
      for (let i = 0; i < P.count; i++) {
        const p = P.items[i];
        if (p.big !== big) continue;
        c.globalAlpha = Math.min(1, p.life / 0.3);
        c.strokeText(p.text, p.x, p.y);
        c.fillStyle = p.color; c.fillText(p.text, p.x, p.y);
      }
    }
    c.globalAlpha = 1;
  }

  drawHUD(c) {
    const pl = this.player, W = view.w;
    // 경험치 바
    c.fillStyle = '#0d1a2a'; c.fillRect(0, 0, W, 10);
    c.fillStyle = '#3ea0ff'; c.fillRect(0, 0, W * Math.min(1, pl.xp / pl.xpNext), 10);
    c.textBaseline = 'middle';
    // 체력 바
    const narrow = W < 520, hpW = Math.min(220, W * (narrow ? 0.3 : 0.4));
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(12, 18, hpW + 4, 20);
    c.fillStyle = '#5a1010'; c.fillRect(14, 20, hpW, 16);
    c.fillStyle = pl.hp / this.maxHp < 0.3 ? '#ff3b3b' : '#e53935';
    c.fillRect(14, 20, hpW * clamp(pl.hp / this.maxHp, 0, 1), 16);
    c.fillStyle = '#fff'; c.font = 'bold 12px sans-serif'; c.textAlign = 'center';
    c.fillText(`${Math.ceil(pl.hp)} / ${this.maxHp}`, 14 + hpW / 2, 28);
    c.textAlign = 'left'; c.font = 'bold 16px sans-serif';
    c.strokeStyle = 'rgba(0,0,0,0.8)'; c.lineWidth = 3;
    const lvText = `Lv ${pl.level}`;
    c.strokeText(lvText, 14, 52); c.fillStyle = '#9fd0ff'; c.fillText(lvText, 14, 52);
    // 타이머
    c.textAlign = 'center'; c.font = narrow ? 'bold 20px sans-serif' : 'bold 26px sans-serif';
    const tt = fmtTime(this.time);
    c.strokeText(tt, W / 2, 30); c.fillStyle = '#fff'; c.fillText(tt, W / 2, 30);
    // 처치 수
    c.textAlign = 'right'; c.font = 'bold 16px sans-serif';
    const kt = `처치 ${this.kills}`;
    c.strokeText(kt, W - 14, 28); c.fillStyle = '#ffcf5a'; c.fillText(kt, W - 14, 28);
    // 무기 / 패시브 목록
    c.textAlign = 'left'; c.font = 'bold 12px sans-serif';
    let y = 74;
    for (const w of this.weapons) {
      c.fillStyle = w.def.color; c.fillRect(14, y - 6, 12, 12);
      const t = `${w.def.name} ${w.level >= CONFIG.maxLevel ? 'MAX' : 'Lv' + w.level}`;
      c.strokeText(t, 32, y); c.fillStyle = '#eee'; c.fillText(t, 32, y);
      y += 17;
    }
    for (const k of PASSIVE_KEYS) {
      if (!this.passives[k]) continue;
      const P = CONFIG.passives[k];
      c.fillStyle = P.color; c.beginPath(); c.arc(20, y, 6, 0, TAU); c.fill();
      const t = `${P.name} ${this.passives[k] >= CONFIG.maxLevel ? 'MAX' : 'Lv' + this.passives[k]}`;
      c.strokeText(t, 32, y); c.fillStyle = '#ccc'; c.fillText(t, 32, y);
      y += 17;
    }
    // 보스 체력바 + 화면 밖 방향 표시
    const boss = this.bosses.find((b) => !b.dead);
    if (boss) {
      const bw = Math.min(420, W * 0.7), bx = (W - bw) / 2, by = view.h - 34;
      c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(bx - 2, by - 2, bw + 4, 18);
      c.fillStyle = '#4a0d0d'; c.fillRect(bx, by, bw, 14);
      c.fillStyle = '#ff7a2a'; c.fillRect(bx, by, bw * Math.max(0, boss.hp / boss.maxHp), 14);
      c.textAlign = 'center'; c.font = 'bold 13px sans-serif';
      c.strokeText(CONFIG.enemies.boss.name, W / 2, by - 12); c.fillStyle = '#ffd0a0'; c.fillText(CONFIG.enemies.boss.name, W / 2, by - 12);
      const sx = (boss.x - this.camX) * view.scale + W / 2, sy = (boss.y - this.camY) * view.scale + view.h / 2;
      if (sx < 0 || sx > W || sy < 0 || sy > view.h) {
        const a = Math.atan2(sy - view.h / 2, sx - W / 2);
        const ax = clamp(sx, 30, W - 30), ay = clamp(sy, 70, view.h - 60);
        c.save(); c.translate(ax, ay); c.rotate(a);
        c.fillStyle = '#ff5252'; c.beginPath(); c.moveTo(16, 0); c.lineTo(-10, -10); c.lineTo(-10, 10); c.closePath(); c.fill();
        c.restore();
      }
    }
    // 배너
    if (this.banner) {
      const b = this.banner, a = Math.min(1, b.t / 0.4, (b.max - b.t) / 0.2 + 0.2);
      c.globalAlpha = clamp(a, 0, 1);
      c.textAlign = 'center'; c.font = 'bold 34px sans-serif'; c.lineWidth = 5;
      c.strokeText(b.text, W / 2, view.h * 0.28); c.fillStyle = b.color; c.fillText(b.text, W / 2, view.h * 0.28);
      c.font = 'bold 16px sans-serif'; c.lineWidth = 3;
      c.strokeText(b.sub, W / 2, view.h * 0.28 + 32); c.fillStyle = '#fff'; c.fillText(b.sub, W / 2, view.h * 0.28 + 32);
      c.globalAlpha = 1;
    }
    if (this.debug || showFps) {
      c.textAlign = 'right'; c.font = '12px monospace'; c.fillStyle = '#0f0';
      c.fillText(`FPS ${this.fps.toFixed(0)}  적 ${this.enemies.count}  탄 ${this.projectiles.count}  젬 ${this.gems.count}`, W - 14, view.h - 10);
    }
  }

  drawJoystick(c) {
    const j = input.joy;
    if (!j.active || this.state !== 'playing') return;
    let dx = j.x - j.ox, dy = j.y - j.oy;
    const l = Math.hypot(dx, dy);
    if (l > j.R) { dx = (dx / l) * j.R; dy = (dy / l) * j.R; }
    c.fillStyle = 'rgba(255,255,255,0.12)'; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
    c.beginPath(); c.arc(j.ox, j.oy, j.R, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.45)';
    c.beginPath(); c.arc(j.ox + dx, j.oy + dy, 22, 0, TAU); c.fill();
  }
}

/* ========================= 화면 / 메인 ========================= */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
const view = { w: 1, h: 1, dpr: 1, scale: 1 };
let bgPattern = null;
let showFps = false;

function makeBgPattern() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#1b281d'; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#1f2e21'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
  g.fillStyle = 'rgba(0,0,0,0.18)';
  g.fillRect(0, 0, 128, 1); g.fillRect(0, 64, 128, 1); g.fillRect(0, 0, 1, 128); g.fillRect(64, 0, 1, 128);
  return ctx.createPattern(cv, 'repeat');
}

function resize() {
  view.dpr = Math.min(window.devicePixelRatio || 1, 2);
  view.w = window.innerWidth; view.h = window.innerHeight;
  canvas.width = Math.max(1, Math.floor(view.w * view.dpr));
  canvas.height = Math.max(1, Math.floor(view.h * view.dpr));
  view.scale = clamp(Math.min(view.w, view.h) / 720, 0.6, 1.25);
}
window.addEventListener('resize', resize);
resize();

const input = new Input(canvas);
const game = new Game();
window.game = game; // 디버깅용

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const ui = {
  title: $('titleScreen'), levelUp: $('levelUpScreen'), pause: $('pauseScreen'), over: $('gameOverScreen'),
  hudButtons: $('hudButtons'), muteBtn: $('muteBtn'), cards: $('levelCards'),
};
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
function hideAllOverlays() { [ui.title, ui.levelUp, ui.pause, ui.over].forEach(hide); }

function bestText(b) {
  return b ? `최고 기록 — 생존 ${fmtTime(b.time)} · 처치 ${b.kills} · Lv ${b.level}` : '아직 기록이 없습니다';
}
function updateMuteBtn() { ui.muteBtn.textContent = sfx.muted ? '소리 OFF' : '소리 ON'; }

function startGame() {
  sfx.unlock();
  game.reset();
  input.reset();
  hideAllOverlays();
  show(ui.hudButtons);
  game.state = 'playing';
  lastTime = performance.now();
}

function toTitle() {
  game.reset();
  game.state = 'title';
  hideAllOverlays();
  hide(ui.hudButtons);
  $('titleBest').textContent = bestText(Store.get('ns_best', null));
  show(ui.title);
}

function togglePause() {
  if (game.state === 'playing') {
    game.state = 'paused';
    input.reset();
    renderBuild($('pauseBuild'));
    show(ui.pause);
  } else if (game.state === 'paused') {
    game.state = 'playing';
    hide(ui.pause);
    lastTime = performance.now();
  }
}

function renderBuild(el) {
  const parts = [];
  for (const w of game.weapons) parts.push(`<span class="chip" style="border-color:${w.def.color}">${w.def.name} Lv${w.level}</span>`);
  for (const k of PASSIVE_KEYS) if (game.passives[k]) parts.push(`<span class="chip" style="border-color:${CONFIG.passives[k].color}">${CONFIG.passives[k].name} Lv${game.passives[k]}</span>`);
  el.innerHTML = parts.join('');
}

function gameOver() {
  game.state = 'gameover';
  input.reset();
  sfx.play('gameover');
  const best = Store.get('ns_best', null);
  const rec = { time: Math.floor(game.time), kills: game.kills, level: game.player.level };
  const isNew = !best || rec.time > best.time || (rec.time === best.time && rec.kills > best.kills);
  if (isNew) Store.set('ns_best', rec);
  $('goTime').textContent = fmtTime(rec.time);
  $('goKills').textContent = rec.kills;
  $('goLevel').textContent = rec.level;
  $('goBest').textContent = bestText(isNew ? rec : best);
  $('newRecord').classList.toggle('hidden', !isNew);
  hide(ui.pause); hide(ui.levelUp);
  show(ui.over);
}

/* ---------- 레벨업 UI ---------- */
let currentChoices = [];
let choiceReadyAt = 0;

function openLevelUp() {
  game.state = 'levelup';
  input.reset();
  currentChoices = game.buildChoices();
  choiceReadyAt = performance.now() + 250; // 실수로 즉시 선택되는 것 방지
  $('levelUpSub').textContent = `Lv ${game.player.level - game.player.pendingLevels + 1} 달성` + (game.player.pendingLevels > 1 ? ` (남은 선택 ${game.player.pendingLevels})` : '');
  ui.cards.innerHTML = '';
  currentChoices.forEach((c, i) => {
    const el = document.createElement('button');
    el.className = 'card';
    let name, color, tag, desc, square = false;
    if (c.kind === 'weapon') {
      const W = CONFIG.weapons[c.key];
      name = W.name; color = W.color; square = true;
      tag = c.level === 1 ? '새 무기!' : `Lv ${c.level - 1} → ${c.level}${c.level === CONFIG.maxLevel ? ' (MAX)' : ''}`;
      desc = c.level === 1 ? W.desc : describeUpgrade(c.key, c.level);
    } else if (c.kind === 'passive') {
      const P = CONFIG.passives[c.key];
      name = P.name; color = P.color;
      tag = c.level === 1 ? '새 패시브!' : `Lv ${c.level - 1} → ${c.level}${c.level === CONFIG.maxLevel ? ' (MAX)' : ''}`;
      desc = P.desc;
    } else {
      name = '생명의 물약'; color = '#e53935'; tag = '회복'; desc = '체력을 40 회복합니다.';
    }
    el.innerHTML = `<span class="key">[${i + 1}]</span><div class="head"><div class="icon${square ? ' square' : ''}" style="background:${color}"></div>` +
      `<div><div class="name">${name}</div><div class="tag${c.level === 1 ? ' new' : ''}">${tag}</div></div></div><div class="desc">${desc}</div>`;
    el.addEventListener('click', () => chooseUpgrade(i));
    ui.cards.appendChild(el);
  });
  show(ui.levelUp);
  sfx.play('levelup');
}

function describeUpgrade(key, level) {
  const L = CONFIG.weapons[key].levels, a = L[level - 2], b = L[level - 1], parts = [];
  for (const k in b) {
    if (a[k] === b[k] || !STAT_LABELS[k]) continue;
    parts.push(k === 'cd' || k === 'hitCd' ? `${STAT_LABELS[k]} ${a[k]}s → ${b[k]}s` : `${STAT_LABELS[k]} ${a[k]} → ${b[k]}`);
  }
  return parts.join('<br>');
}

function chooseUpgrade(i) {
  if (game.state !== 'levelup' || performance.now() < choiceReadyAt) return;
  const c = currentChoices[i];
  if (!c) return;
  game.applyChoice(c);
  game.player.pendingLevels = Math.max(0, game.player.pendingLevels - 1);
  sfx.play('select');
  if (game.player.pendingLevels > 0) {
    openLevelUp();
  } else {
    hide(ui.levelUp);
    game.state = 'playing';
    lastTime = performance.now();
  }
}

/* ---------- 이벤트 ---------- */
window.addEventListener('keydown', (e) => {
  sfx.unlock();
  const code = e.code;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) e.preventDefault();
  if (e.repeat && !['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) return;
  input.keys.add(code);
  if (code === 'KeyM') { sfx.setMuted(!sfx.muted); updateMuteBtn(); return; }
  if (code === 'KeyF') { showFps = !showFps; return; }
  switch (game.state) {
    case 'title': if (code === 'Enter' || code === 'Space') startGame(); break;
    case 'playing': case 'paused': if (code === 'Escape' || code === 'KeyP') togglePause(); break;
    case 'levelup': {
      const idx = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[code];
      if (idx !== undefined) chooseUpgrade(idx);
      break;
    }
    case 'gameover': if (code === 'KeyR' || code === 'Enter') startGame(); break;
  }
});

$('startBtn').addEventListener('click', startGame);
$('restartBtn').addEventListener('click', startGame);
$('pauseRestartBtn').addEventListener('click', startGame);
$('resumeBtn').addEventListener('click', togglePause);
$('pauseTitleBtn').addEventListener('click', toTitle);
$('goTitleBtn').addEventListener('click', toTitle);
$('pauseBtn').addEventListener('click', (e) => { e.currentTarget.blur(); togglePause(); });
ui.muteBtn.addEventListener('click', (e) => { e.currentTarget.blur(); sfx.unlock(); sfx.setMuted(!sfx.muted); updateMuteBtn(); });
// 버튼에 포커스가 남아 Space/Enter로 재클릭되는 것 방지
document.querySelectorAll('button').forEach((b) => b.addEventListener('mouseup', () => b.blur()));

// 창이 가려지면 자동 일시정지
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'playing') togglePause(); });
window.addEventListener('blur', () => { if (game.state === 'playing') togglePause(); });

updateMuteBtn();
$('titleBest').textContent = bestText(Store.get('ns_best', null));

/* ---------- 게임 루프 ---------- */
let lastTime = performance.now();
function frame(now) {
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (!(dt > 0)) dt = 0;
  dt = Math.min(dt, 0.1);
  if (dt > 0) game.fps += (1 / dt - game.fps) * 0.05;

  if (game.state === 'playing') {
    // 프레임이 늦으면 하위 스텝으로 나눠 터널링 방지
    const steps = Math.max(1, Math.ceil(dt / 0.034));
    const h = dt / steps;
    for (let i = 0; i < steps && game.state === 'playing'; i++) {
      game.update(h);
      if (game.player.pendingLevels > 0) break;
    }
    if (game.state === 'playing' && game.player.pendingLevels > 0) openLevelUp();
  }
  game.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
