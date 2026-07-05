// ============================================================================
// Offline storage — SQLite for messages, AsyncStorage for simple state
// ============================================================================

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from './types';

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
      reframe TEXT,
      question TEXT,
      icebergLayer TEXT,
      isCrisisResponse INTEGER DEFAULT 0,
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
  return db;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function saveMessage(message: ChatMessage): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `INSERT OR REPLACE INTO messages
      (id, role, content, acknowledgment, thoughtPattern, reframe, question, icebergLayer, isCrisisResponse, createdAt, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.role,
      message.content,
      message.acknowledgment ?? null,
      message.thoughtPattern ?? null,
      message.reframe ?? null,
      message.question ?? null,
      message.icebergLayer ?? null,
      message.isCrisisResponse ? 1 : 0,
      message.createdAt,
      message.synced ? 1 : 0,
    ]
  );
}

export async function loadMessages(limit = 100): Promise<ChatMessage[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<
    Omit<ChatMessage, 'isCrisisResponse' | 'synced'> & {
      isCrisisResponse: number;
      synced: number;
    }
  >(
    `SELECT * FROM messages ORDER BY createdAt DESC LIMIT ?`,
    [limit]
  );
  return rows
    .map((row) => ({
      id: row.id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      acknowledgment: row.acknowledgment ?? undefined,
      thoughtPattern: row.thoughtPattern ?? undefined,
      reframe: row.reframe ?? undefined,
      question: row.question ?? undefined,
      icebergLayer: row.icebergLayer ?? undefined,
      isCrisisResponse: row.isCrisisResponse === 1,
      createdAt: row.createdAt,
      synced: row.synced === 1,
    }))
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
// AsyncStorage helpers — for simple key-value state
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
