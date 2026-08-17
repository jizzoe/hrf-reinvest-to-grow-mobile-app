import { describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-sqlite', () => ({}));

import { mapTransaction, sourceColumnMigrations } from './journalRepository';

describe('speech source SQLite compatibility', () => {
  it('adds only missing nullable source columns', () => {
    expect(sourceColumnMigrations(['id'])).toHaveLength(4);
    expect(
      sourceColumnMigrations([
        'id',
        'source_type',
        'source_fixture_id',
        'source_raw_input',
        'source_proposed_values',
      ]),
    ).toEqual([]);
  });

  it('maps persisted speech source context separately from confirmed values', () => {
    const transaction = mapTransaction({
      amount_cents: 65000,
      category: 'Edited rice sales',
      client_idempotency_key: 'client-speech-001',
      confirmation_state: 'confirmed',
      created_at: '2026-08-17T12:00:00.000Z',
      currency: 'HTG',
      date: '2026-08-17',
      id: 'speech-001',
      note: null,
      operation_id: 'create-transaction-speech-001',
      source_fixture_id: 'synthetic-rice-sale-500',
      source_proposed_values: JSON.stringify({
        amount: '500',
        category: 'Rice sales',
        date: '2026-08-17',
        note: '',
        type: 'sale',
      }),
      source_raw_input: 'I sold rice for 500 gourdes today',
      source_type: 'speech_transcript',
      status: 'saved_local',
      type: 'sale',
    });

    expect(transaction.amountCents).toBe(65000);
    expect(transaction.sourceContext?.originalProposal.amount).toBe('500');
  });

  it('keeps legacy manual rows compatible', () => {
    const transaction = mapTransaction({
      amount_cents: 10000,
      category: 'Manual sale',
      client_idempotency_key: 'client-manual-001',
      confirmation_state: 'confirmed',
      created_at: '2026-08-16T12:00:00.000Z',
      currency: 'HTG',
      date: '2026-08-16',
      id: 'manual-001',
      note: null,
      operation_id: 'create-transaction-manual-001',
      source_fixture_id: null,
      source_proposed_values: null,
      source_raw_input: null,
      source_type: null,
      status: 'saved_local',
      type: 'sale',
    });

    expect(transaction.sourceContext).toBeUndefined();
  });

  it('keeps a confirmed transaction readable when optional source JSON is malformed', () => {
    const transaction = mapTransaction({
      amount_cents: 50000,
      category: 'Rice sales',
      client_idempotency_key: 'client-speech-malformed',
      confirmation_state: 'confirmed',
      created_at: '2026-08-17T12:00:00.000Z',
      currency: 'HTG',
      date: '2026-08-17',
      id: 'speech-malformed',
      note: null,
      operation_id: 'create-transaction-speech-malformed',
      source_fixture_id: 'synthetic-rice-sale-500',
      source_proposed_values: '{not-json',
      source_raw_input: 'I sold rice for 500 gourdes today',
      source_type: 'speech_transcript',
      status: 'saved_local',
      type: 'sale',
    });

    expect(transaction.amountCents).toBe(50000);
    expect(transaction.sourceContext).toBeUndefined();
  });
});
