// ============================================================================
// Offline storage - SQLite for messages, AsyncStorage for simple state
// ============================================================================

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage, LayerProgress, EngineMeta } from './types';

const DB_NAME = 'verso.db';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      acknowledgment TEXT,
      thoughtPattern TEXT,
      patternNote TEXT,
      reframe TEXT,
      question TEXT,
      encouragement TEXT,
      icebergLayer TEXT,
      layerInsight TEXT,
      progressScore INTEGER,
      layerProgress TEXT,
      groundingMode INTEGER DEFAULT 0,
      groundingTurns INTEGER DEFAULT 0,
      isCrisisResponse INTEGER DEFAULT 0,
      meta TEXT,
      createdAt INTEGER NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(createdAt);

    CREATE TABLE IF NOT EXISTS pending_checkins (
      id TEXT PRIMARY KEY,
      mood INTEGER NOT NULL,
      energy INTEGER NOT NULL,
      confidence INTEGER NOT NULL,
      impactTags TEXT,
      notes TEXT,
      createdAt INTEGER NOT NULL
    );
  `);

  // Best-effort schema migration - add columns that may not exist on older DBs.
  // ALTER TABLE ADD COLUMN is idempotent-safe via try/catch.
  const migrations: Array<{ col: string; type: string }> = [
    { col: 'patternNote', type: 'TEXT' },
    { col: 'encouragement', type: 'TEXT' },
    { col: 'layerInsight', type: 'TEXT' },
    { col: 'progressScore', type: 'INTEGER' },
    { col: 'layerProgress', type: 'TEXT' },
    { col: 'groundingMode', type: 'INTEGER DEFAULT 0' },
    { col: 'groundingTurns', type: 'INTEGER DEFAULT 0' },
    { col: 'meta', type: 'TEXT' },
  ];
  for (const m of migrations) {
    try {
      await db.execAsync(`ALTER TABLE messages ADD COLUMN ${m.col} ${m.type};`);
    } catch {
      // Column already exists - ignore.
    }
  }

  return db;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function saveMessage(message: ChatMessage): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT OR REPLACE INTO messages
      (id, role, content, acknowledgment, thoughtPattern, patternNote, reframe,
       question, encouragement, icebergLayer, layerInsight, progressScore,
       layerProgress, groundingMode, groundingTurns, isCrisisResponse, meta,
       createdAt, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.role,
      message.content,
      message.acknowledgment ?? null,
      message.thoughtPattern ?? null,
      message.patternNote ?? null,
      message.reframe ?? null,
      message.question ?? null,
      message.encouragement ?? null,
      message.icebergLayer ?? null,
      message.layerInsight ?? null,
      typeof message.progressScore === 'number' ? message.progressScore : null,
      message.layerProgress ? JSON.stringify(message.layerProgress) : null,
      message.groundingMode ? 1 : 0,
      typeof message.groundingTurns === 'number' ? message.groundingTurns : 0,
      message.isCrisisResponse ? 1 : 0,
      message.meta ? JSON.stringify(message.meta) : null,
      message.createdAt,
      message.synced ? 1 : 0,
    ]
  );
}

export async function loadMessages(limit = 100): Promise<ChatMessage[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<
    Omit<ChatMessage, 'isCrisisResponse' | 'synced' | 'groundingMode' | 'layerProgress' | 'meta'> & {
      isCrisisResponse: number;
      synced: number;
      groundingMode: number;
      layerProgress: string | null;
      meta: string | null;
    }
  >(
    `SELECT * FROM messages ORDER BY createdAt DESC LIMIT ?`,
    [limit]
  );
  return rows
    .map((row) => {
      let layerProgress: LayerProgress | undefined;
      if (row.layerProgress) {
        try {
          layerProgress = JSON.parse(row.layerProgress) as LayerProgress;
        } catch {
          layerProgress = undefined;
        }
      }
      let meta: EngineMeta | undefined;
      if (row.meta) {
        try {
          meta = JSON.parse(row.meta) as EngineMeta;
        } catch {
          meta = undefined;
        }
      }
      return {
        id: row.id,
        role: row.role as 'user' | 'assistant',
        content: row.content,
        acknowledgment: row.acknowledgment ?? undefined,
        thoughtPattern: row.thoughtPattern ?? undefined,
        patternNote: row.patternNote ?? undefined,
        reframe: row.reframe ?? undefined,
        question: row.question ?? undefined,
        encouragement: row.encouragement ?? undefined,
        icebergLayer: row.icebergLayer ?? undefined,
        layerInsight: row.layerInsight ?? undefined,
        progressScore: typeof row.progressScore === 'number' ? row.progressScore : undefined,
        layerProgress,
        groundingMode: row.groundingMode === 1,
        groundingTurns: typeof row.groundingTurns === 'number' ? row.groundingTurns : undefined,
        isCrisisResponse: row.isCrisisResponse === 1,
        meta,
        createdAt: row.createdAt,
        synced: row.synced === 1,
      } satisfies ChatMessage;
    })
    .reverse(); // Return oldest first
}

export async function clearMessages(): Promise<void> {
  const database = await getDb();
  await database.execAsync(`DELETE FROM messages;`);
}

export async function markMessageSynced(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(`UPDATE messages SET synced = 1 WHERE id = ?`, [id]);
}

// ---------------------------------------------------------------------------
// Pending check-ins (for offline → sync)
// ---------------------------------------------------------------------------

export async function savePendingCheckIn(
  checkIn: {
    id: string;
    mood: number;
    energy: number;
    confidence: number;
    impactTags?: string[];
    notes?: string;
  }
): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT OR REPLACE INTO pending_checkins (id, mood, energy, confidence, impactTags, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      checkIn.id,
      checkIn.mood,
      checkIn.energy,
      checkIn.confidence,
      JSON.stringify(checkIn.impactTags ?? []),
      checkIn.notes ?? null,
      Date.now(),
    ]
  );
}

export async function loadPendingCheckIns(): Promise<
  Array<{
    id: string;
    mood: number;
    energy: number;
    confidence: number;
    impactTags: string[];
    notes: string | null;
    createdAt: number;
  }>
> {
  const database = await getDb();
  const rows = await database.getAllAsync<{
    id: string;
    mood: number;
    energy: number;
    confidence: number;
    impactTags: string;
    notes: string | null;
    createdAt: number;
  }>(`SELECT * FROM pending_checkins ORDER BY createdAt ASC`);
  return rows.map((r) => ({
    ...r,
    impactTags: r.impactTags ? JSON.parse(r.impactTags) : [],
  }));
}

export async function deletePendingCheckIn(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM pending_checkins WHERE id = ?`, [id]);
}

// ---------------------------------------------------------------------------
// AsyncStorage helpers - for simple key-value state
// ---------------------------------------------------------------------------

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// Storage keys
export const STORAGE_KEYS = {
  HAS_SEEN_WELCOME: 'verso:has_seen_welcome',
  LAST_CHECK_IN_DATE: 'verso:last_checkin_date',
  PUSH_TOKEN: 'verso:push_token',
} as const;
