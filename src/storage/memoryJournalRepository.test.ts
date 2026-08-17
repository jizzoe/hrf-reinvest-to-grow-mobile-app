import { describe, expect, it } from '@jest/globals';

import { initialDraft, makeConfirmedTransaction } from '../domain/journal';
import {
  createMemoryJournalStorage,
  MemoryJournalRepository,
} from './memoryJournalRepository';

describe('local outbox persistence model', () => {
  it('preserves a confirmed transaction and outbox identity across repository reinitialization', async () => {
    const storage = createMemoryJournalStorage();
    const firstRepository = new MemoryJournalRepository(storage);
    await firstRepository.initialize();

    const transaction = makeConfirmedTransaction(
      { ...initialDraft('expense'), amount: '60', category: 'Transport' },
      () => 'expense-restart-001',
      '2026-08-16T14:00:00.000Z',
    );
    await firstRepository.saveConfirmedTransaction(transaction);
    await firstRepository.saveConfirmedTransaction(transaction);

    const restartedRepository = new MemoryJournalRepository(storage);
    await restartedRepository.initialize();
    const records = await restartedRepository.listTransactions();
    const outbox = await restartedRepository.getOutboxForTransaction(
      transaction.id,
    );

    expect(records).toHaveLength(1);
    expect(records[0]).toEqual(transaction);
    expect(outbox).toEqual({
      clientIdempotencyKey: 'client-expense-restart-001',
      createdAt: '2026-08-16T14:00:00.000Z',
      id: 'outbox-expense-restart-001',
      operationId: 'create-transaction-expense-restart-001',
      state: 'queued',
      transactionId: 'expense-restart-001',
    });
  });
});
