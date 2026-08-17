import type { JournalTransaction, OutboxRecord } from '../domain/types';
import type { JournalRepository } from './journalRepository';

export type MemoryJournalStorage = {
  outbox: Map<string, OutboxRecord>;
  transactions: Map<string, JournalTransaction>;
};

export function createMemoryJournalStorage(): MemoryJournalStorage {
  return { outbox: new Map(), transactions: new Map() };
}

export class MemoryJournalRepository implements JournalRepository {
  constructor(private readonly storage: MemoryJournalStorage) {}

  async initialize(): Promise<void> {}

  async listTransactions(): Promise<JournalTransaction[]> {
    return [...this.storage.transactions.values()].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }

  async saveConfirmedTransaction(
    transaction: JournalTransaction,
  ): Promise<void> {
    if (this.storage.transactions.has(transaction.id)) {
      return;
    }
    this.storage.transactions.set(transaction.id, transaction);
    this.storage.outbox.set(transaction.id, {
      clientIdempotencyKey: transaction.clientIdempotencyKey,
      createdAt: transaction.createdAt,
      id: `outbox-${transaction.id}`,
      operationId: transaction.operationId,
      state: 'queued',
      transactionId: transaction.id,
    });
  }

  async getOutboxForTransaction(
    transactionId: string,
  ): Promise<OutboxRecord | null> {
    return this.storage.outbox.get(transactionId) ?? null;
  }
}
