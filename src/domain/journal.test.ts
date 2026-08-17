import { describe, expect, it } from '@jest/globals';

import {
  calculateTotals,
  formatHtg,
  initialDraft,
  makeConfirmedTransaction,
  parseAmountToCents,
  text,
  validateDraft,
} from './journal';

describe('manual journal domain', () => {
  it('validates a draft before it can be confirmed', () => {
    const invalid = {
      ...initialDraft('sale'),
      amount: '0',
      category: '',
      date: '2026-13-44',
    };

    expect(validateDraft(invalid, 'en')).toEqual([
      'Enter an amount greater than zero.',
      'Enter a date as YYYY-MM-DD.',
      'Enter a category or purpose.',
    ]);
    expect(validateDraft(invalid, 'fr')).toHaveLength(3);
  });

  it('creates a confirmed local transaction with a stable future-sync identity', () => {
    const draft = {
      ...initialDraft('sale'),
      amount: '125.50',
      category: 'Market sales',
      note: 'Synthetic cash sale',
    };
    const transaction = makeConfirmedTransaction(
      draft,
      () => 'txn-001',
      '2026-08-16T12:00:00.000Z',
    );

    expect(transaction).toMatchObject({
      amountCents: 12550,
      clientIdempotencyKey: 'client-txn-001',
      confirmationState: 'confirmed',
      id: 'txn-001',
      operationId: 'create-transaction-txn-001',
      status: 'saved_local',
      type: 'sale',
    });
  });

  it('calculates local prototype totals from confirmed records only', () => {
    const sale = makeConfirmedTransaction(
      { ...initialDraft('sale'), amount: '200', category: 'Market sales' },
      () => 'sale-001',
      '2026-08-16T12:00:00.000Z',
    );
    const expense = makeConfirmedTransaction(
      { ...initialDraft('expense'), amount: '45.25', category: 'Supplies' },
      () => 'expense-001',
      '2026-08-16T13:00:00.000Z',
    );

    expect(calculateTotals([sale, expense])).toEqual({
      earnedCents: 20000,
      estimatedProfitCents: 15475,
      spentCents: 4525,
    });
    expect(formatHtg(15475, 'en')).toContain('HTG');
    expect(parseAmountToCents('45,25')).toBe(4525);
  });

  it('provides French plain-language local-status copy', () => {
    expect(text('fr', 'savedLocal')).toBe('Enregistré sur ce téléphone');
    expect(text('fr', 'waitingToSync')).toBe('En attente de synchronisation');
  });
});
