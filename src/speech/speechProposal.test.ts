import { describe, expect, it } from '@jest/globals';

import { makeConfirmedTransaction } from '../domain/journal';
import { DeterministicSpeechProposalAdapter } from './speechProposal';

describe('deterministic speech proposal adapter', () => {
  it('returns the truthful known fixture without accepting external input', () => {
    const adapter = new DeterministicSpeechProposalAdapter();
    const result = adapter.createSample('2026-08-17');

    expect(result).toEqual({
      draft: {
        amount: '500',
        category: 'Rice sales',
        date: '2026-08-17',
        note: '',
        sourceContext: {
          fixtureId: 'synthetic-rice-sale-500',
          originalProposal: {
            amount: '500',
            category: 'Rice sales',
            date: '2026-08-17',
            note: '',
            type: 'sale',
          },
          rawInput: 'I sold rice for 500 gourdes today',
          sourceType: 'speech_transcript',
        },
        type: 'sale',
      },
      status: 'proposal',
    });
  });

  it('preserves original proposed values after an edited draft is confirmed', () => {
    const result = new DeterministicSpeechProposalAdapter().createSample(
      '2026-08-17',
    );
    if (result.status !== 'proposal') {
      throw new Error('Expected deterministic proposal.');
    }
    const transaction = makeConfirmedTransaction(
      { ...result.draft, amount: '650', category: 'Edited rice sales' },
      () => 'speech-001',
      '2026-08-17T12:00:00.000Z',
    );

    expect(transaction.amountCents).toBe(65000);
    expect(transaction.category).toBe('Edited rice sales');
    expect(transaction.sourceContext?.originalProposal).toMatchObject({
      amount: '500',
      category: 'Rice sales',
    });
  });

  it('returns an unavailable result without creating a draft', () => {
    expect(
      new DeterministicSpeechProposalAdapter().createSample(
        '2026-08-17',
        'unavailable',
      ),
    ).toEqual({ status: 'unavailable' });
  });
});
