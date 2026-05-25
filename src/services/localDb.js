/**
 * localDb.js — SQLite en el navegador via sql.js (WebAssembly).
 * Persiste los datos en IndexedDB para sobrevivir recargas de página.
 * Se usa como fallback cuando Supabase no está disponible.
 */

let _db = null
let _initPromise = null

const IDB_DB    = 'equilibrastudy_local'
const IDB_STORE = 'sqlite_db'
const IDB_KEY   = 'main'

// ── IndexedDB helpers ─────────────────────────────────────────────────────────

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE)
    req.onsuccess  = e => resolve(e.target.result)
    req.onerror    = e => reject(e.target.error)
  })
}

async function loadFromIDB() {
  try {
    const db  = await openIDB()
    const tx  = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY)
    return await new Promise((res, rej) => {
      req.onsuccess = e => res(e.target.result ?? null)
      req.onerror   = e => rej(e.target.error)
    })
  } catch { return null }
}

async function saveToIDB(uint8Array) {
  try {
    const db = await openIDB()
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(uint8Array, IDB_KEY)
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej })
  } catch { /* silencioso */ }
}

// ── Schema SQL ────────────────────────────────────────────────────────────────

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'estudiante',
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS academic_events (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  deadline   TEXT NOT NULL,
  priority   TEXT NOT NULL DEFAULT 'media',
  notes      TEXT,
  is_active  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL,
  started_at            TEXT NOT NULL,
  ended_at              TEXT NOT NULL,
  work_duration_min     INTEGER NOT NULL,
  break_duration_min    INTEGER NOT NULL,
  pause_count           INTEGER NOT NULL DEFAULT 0,
  pause_count_over_1min INTEGER NOT NULL DEFAULT 0,
  fatigue_level         INTEGER,
  status                TEXT NOT NULL,
  effective_minutes     INTEGER NOT NULL DEFAULT 0,
  was_suggested         INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS weekly_goals (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  week_start TEXT NOT NULL,
  goal_hours REAL NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, week_start)
);
`

// ── Init ──────────────────────────────────────────────────────────────────────

export async function initLocalDb() {
  if (_db) return _db
  if (_initPromise) return _initPromise

  _initPromise = (async () => {
    const initSqlJs = (await import('sql.js')).default
    const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })

    const saved = await loadFromIDB()
    _db = saved ? new SQL.Database(saved) : new SQL.Database()
    _db.run(SCHEMA)
    if (!saved) {
      migrateFromLocalStorage(_db)
      await persist()
    }
    return _db
  })()

  return _initPromise
}

async function persist() {
  if (!_db) return
  await saveToIDB(_db.export())
}

// ── Migración desde localStorage (primera vez) ───────────────────────────────

function migrateFromLocalStorage(db) {
  try {
    const raw = localStorage.getItem('eq_users')
    if (!raw) return
    const users = JSON.parse(raw)
    if (!Array.isArray(users) || !users.length) return
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO users (id, email, password_hash, name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    for (const u of users) {
      stmt.run([
        u.id   ?? `u_${Date.now()}_${Math.random()}`,
        u.email,
        u.pass ?? '',
        u.name ?? '',
        u.role ?? 'estudiante',
        u.isActive !== false ? 1 : 0,
        u.createdAt ?? new Date().toISOString(),
      ])
    }
    stmt.free()
  } catch { /* silencioso */ }
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function lsqlAddUser(user) {
  const db = await initLocalDb()
  try {
    db.run(
      `INSERT INTO users (id, email, password_hash, name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.pass, user.name, user.role ?? 'estudiante', user.isActive ? 1 : 0, user.createdAt ?? new Date().toISOString()]
    )
    await persist()
    return user
  } catch (e) {
    if (e.message?.includes('UNIQUE')) throw new Error('duplicate key: email already exists')
    throw e
  }
}

export async function lsqlFindUser(email) {
  const db = await initLocalDb()
  const res = db.exec(
    `SELECT id, email, password_hash, name, role, is_active, created_at FROM users WHERE email = ? LIMIT 1`,
    [email.toLowerCase().trim()]
  )
  if (!res.length || !res[0].values.length) return null
  const [id, em, pass, name, role, is_active, created_at] = res[0].values[0]
  return { id, email: em, pass, name, role, isActive: !!is_active, createdAt: created_at }
}

export async function lsqlGetUsers() {
  const db = await initLocalDb()
  const res = db.exec(
    `SELECT id, email, password_hash, name, role, is_active, created_at FROM users ORDER BY created_at DESC`
  )
  if (!res.length) return []
  return res[0].values.map(([id, email, pass, name, role, is_active, created_at]) => ({
    id, email, pass, name, role, isActive: !!is_active, createdAt: created_at,
  }))
}

export async function lsqlUpdateUser(id, patch) {
  const db = await initLocalDb()
  const sets = []
  const vals = []
  if (patch.name      !== undefined) { sets.push('name = ?');          vals.push(patch.name) }
  if (patch.isActive  !== undefined) { sets.push('is_active = ?');     vals.push(patch.isActive ? 1 : 0) }
  if (patch.pass      !== undefined) { sets.push('password_hash = ?'); vals.push(patch.pass) }
  if (!sets.length) return
  vals.push(id)
  db.run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals)
  await persist()
}
