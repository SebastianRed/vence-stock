
import { Capacitor } from '@capacitor/core'
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite'

const DATABASE_NAME = 'vencestock'
const sqlite = new SQLiteConnection(CapacitorSQLite)

let connectionPromise: Promise<SQLiteDBConnection> | null = null

async function openDatabase(): Promise<SQLiteDBConnection> {
  if (Capacitor.getPlatform() !== 'android') {
    throw new Error(
      'La prueba SQLite está disponible únicamente en Android.'
    )
  }

  const consistent = await sqlite.checkConnectionsConsistency()
  const exists = await sqlite.isConnection(DATABASE_NAME, false)

  const db =
    consistent.result && exists.result
      ? await sqlite.retrieveConnection(DATABASE_NAME, false)
      : await sqlite.createConnection(
          DATABASE_NAME,
          false,
          'no-encryption',
          1,
          false
        )

  const opened = await db.isDBOpen()

  if (!opened.result) {
    await db.open()
  }

  return db
}

export function getDatabase(): Promise<SQLiteDBConnection> {
  if (!connectionPromise) {
    connectionPromise = openDatabase().catch((error: unknown) => {
      connectionPromise = null
      throw error
    })
  }

  return connectionPromise
}