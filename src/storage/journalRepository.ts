import * as SQLite from 'expo-sqlite';

import type {
  JournalTransaction,
  OutboxRecord,
  SpeechProposalValues,
} from '../domain/types';

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
  source_fixture_id: 'synthetic-rice-sale-500' | null;
  source_proposed_values: string | null;
  source_raw_input: 'I sold rice for 500 gourdes today' | null;
  source_type: 'speech_transcript' | null;
};

type OutboxRow = {
  client_idempotency_key: string;
  created_at: string;
  id: string;
  operation_id: string;
  state: 'queued';
  transaction_id: string;
};

export function sourceColumnMigrations(existingColumns: string[]): string[] {
  const existing = new Set(existingColumns);
  return [
    [
      'source_type',
      'ALTER TABLE journal_transactions ADD COLUMN source_type TEXT',
    ],
    [
      'source_fixture_id',
      'ALTER TABLE journal_transactions ADD COLUMN source_fixture_id TEXT',
    ],
    [
      'source_raw_input',
      'ALTER TABLE journal_transactions ADD COLUMN source_raw_input TEXT',
    ],
    [
      'source_proposed_values',
      'ALTER TABLE journal_transactions ADD COLUMN source_proposed_values TEXT',
    ],
  ].flatMap(([column, statement]) => (existing.has(column) ? [] : [statement]));
}

export function mapTransaction(row: TransactionRow): JournalTransaction {
  const sourceContext = parseSpeechSourceContext(row);
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
    ...(sourceContext ? { sourceContext } : {}),
  };
}

function parseSpeechSourceContext(
  row: TransactionRow,
): JournalTransaction['sourceContext'] {
  if (
    row.source_type !== 'speech_transcript' ||
    row.source_fixture_id !== 'synthetic-rice-sale-500' ||
    row.source_raw_input !== 'I sold rice for 500 gourdes today' ||
    !row.source_proposed_values
  ) {
    return undefined;
  }
  try {
    const proposed: unknown = JSON.parse(row.source_proposed_values);
    if (!isSpeechProposalValues(proposed)) {
      return undefined;
    }
    return {
      fixtureId: row.source_fixture_id,
      originalProposal: proposed,
      rawInput: row.source_raw_input,
      sourceType: row.source_type,
    };
  } catch {
    return undefined;
  }
}

function isSpeechProposalValues(value: unknown): value is SpeechProposalValues {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const proposal = value as Partial<SpeechProposalValues>;
  return (
    proposal.type === 'sale' &&
    typeof proposal.amount === 'string' &&
    typeof proposal.date === 'string' &&
    typeof proposal.category === 'string' &&
    typeof proposal.note === 'string'
  );
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
    const columns = await this.database.getAllAsync<{ name: string }>(
      'PRAGMA table_info(journal_transactions)',
    );
    for (const migration of sourceColumnMigrations(
      columns.map((column) => column.name),
    )) {
      await this.database.execAsync(migration);
    }
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
          (id, client_idempotency_key, operation_id, type, amount_cents, date, category, note, currency, confirmation_state, status, created_at, source_type, source_fixture_id, source_raw_input, source_proposed_values)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          transaction.sourceContext?.sourceType ?? null,
          transaction.sourceContext?.fixtureId ?? null,
          transaction.sourceContext?.rawInput ?? null,
          transaction.sourceContext
            ? JSON.stringify(transaction.sourceContext.originalProposal)
            : null,
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
