import { describe, expect, it } from '@jest/globals';

import { initialDraft, makeConfirmedTransaction } from '../domain/journal';
import { DeterministicSpeechProposalAdapter } from '../speech/speechProposal';
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

  it('preserves speech source context with one transaction and outbox across restart', async () => {
    const storage = createMemoryJournalStorage();
    const proposal = new DeterministicSpeechProposalAdapter().createSample(
      '2026-08-17',
    );
    if (proposal.status !== 'proposal') {
      throw new Error('Expected deterministic proposal.');
    }
    const transaction = makeConfirmedTransaction(
      proposal.draft,
      () => 'speech-restart-001',
      '2026-08-17T14:00:00.000Z',
    );
    const repository = new MemoryJournalRepository(storage);
    await repository.saveConfirmedTransaction(transaction);
    await repository.saveConfirmedTransaction(transaction);

    const restarted = new MemoryJournalRepository(storage);
    expect(await restarted.listTransactions()).toEqual([transaction]);
    expect(
      await restarted.getOutboxForTransaction('speech-restart-001'),
    ).toMatchObject({
      clientIdempotencyKey: 'client-speech-restart-001',
      transactionId: 'speech-restart-001',
    });
  });
});
