import * as SQLite from 'expo-sqlite';

import type { JournalTransaction, OutboxRecord } from '../domain/types';

export interface JournalRepository {
  initialize(): Promise<void>;
  listTransactions(): Promise<JournalTransaction[]>;
  saveConfirmedTransaction(transaction: JournalTransaction): Promise<void>;
  getOutboxForTransaction(transactionId: string): Promise<OutboxRecord | null>;
}

type TransactionRow = {
  amount_cents: number;
  category: string;
  client_idempotency_key: string;
  confirmation_state: 'confirmed';
  created_at: string;
  currency: 'HTG';
  date: string;
  id: string;
  note: string | null;
  operation_id: string;
  status: 'saved_local';
  type: 'sale' | 'expense';
};

type OutboxRow = {
  client_idempotency_key: string;
  created_at: string;
  id: string;
  operation_id: string;
  state: 'queued';
  transaction_id: string;
};

function mapTransaction(row: TransactionRow): JournalTransaction {
  return {
    amountCents: row.amount_cents,
    category: row.category,
    clientIdempotencyKey: row.client_idempotency_key,
    confirmationState: row.confirmation_state,
    createdAt: row.created_at,
    currency: row.currency,
    date: row.date,
    id: row.id,
    note: row.note,
    operationId: row.operation_id,
    status: row.status,
    type: row.type,
  };
}

function mapOutbox(row: OutboxRow): OutboxRecord {
  return {
    clientIdempotencyKey: row.client_idempotency_key,
    createdAt: row.created_at,
    id: row.id,
    operationId: row.operation_id,
    state: row.state,
    transactionId: row.transaction_id,
  };
}

export class SQLiteJournalRepository implements JournalRepository {
  private constructor(private readonly database: SQLite.SQLiteDatabase) {}

  static async open(): Promise<SQLiteJournalRepository> {
    const database = await SQLite.openDatabaseAsync('reinvest-to-grow-m1.db');
    const repository = new SQLiteJournalRepository(database);
    await repository.initialize();
    return repository;
  }

  async initialize(): Promise<void> {
    await this.database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS journal_transactions (
        id TEXT PRIMARY KEY NOT NULL,
        client_idempotency_key TEXT UNIQUE NOT NULL,
        operation_id TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('sale', 'expense')),
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        note TEXT,
        currency TEXT NOT NULL CHECK (currency = 'HTG'),
        confirmation_state TEXT NOT NULL CHECK (confirmation_state = 'confirmed'),
        status TEXT NOT NULL CHECK (status = 'saved_local'),
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY NOT NULL,
        transaction_id TEXT UNIQUE NOT NULL REFERENCES journal_transactions(id),
        client_idempotency_key TEXT UNIQUE NOT NULL,
        operation_id TEXT UNIQUE NOT NULL,
        state TEXT NOT NULL CHECK (state = 'queued'),
        created_at TEXT NOT NULL
      );
    `);
  }

  async listTransactions(): Promise<JournalTransaction[]> {
    const rows = await this.database.getAllAsync<TransactionRow>(
      'SELECT * FROM journal_transactions ORDER BY date DESC, created_at DESC',
    );
    return rows.map(mapTransaction);
  }

  async saveConfirmedTransaction(
    transaction: JournalTransaction,
  ): Promise<void> {
    await this.database.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync(
        `INSERT OR IGNORE INTO journal_transactions
          (id, client_idempotency_key, operation_id, type, amount_cents, date, category, note, currency, confirmation_state, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction.id,
          transaction.clientIdempotencyKey,
          transaction.operationId,
          transaction.type,
          transaction.amountCents,
          transaction.date,
          transaction.category,
          transaction.note,
          transaction.currency,
          transaction.confirmationState,
          transaction.status,
          transaction.createdAt,
        ],
      );
      await tx.runAsync(
        `INSERT OR IGNORE INTO sync_outbox
          (id, transaction_id, client_idempotency_key, operation_id, state, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `outbox-${transaction.id}`,
          transaction.id,
          transaction.clientIdempotencyKey,
          transaction.operationId,
          'queued',
          transaction.createdAt,
        ],
      );
    });
  }

  async getOutboxForTransaction(
    transactionId: string,
  ): Promise<OutboxRecord | null> {
    const row = await this.database.getFirstAsync<OutboxRow>(
      'SELECT * FROM sync_outbox WHERE transaction_id = ?',
      transactionId,
    );
    return row ? mapOutbox(row) : null;
  }
}
