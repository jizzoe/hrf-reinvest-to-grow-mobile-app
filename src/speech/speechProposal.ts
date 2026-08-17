import type { JournalDraft, SpeechProposalContext } from '../domain/types';

export const syntheticSpeechContext = (
  date: string,
): SpeechProposalContext => ({
  fixtureId: 'synthetic-rice-sale-500',
  originalProposal: {
    amount: '500',
    category: 'Rice sales',
    date,
    note: '',
    type: 'sale',
  },
  rawInput: 'I sold rice for 500 gourdes today',
  sourceType: 'speech_transcript',
});

export type SpeechSampleResult =
  { status: 'proposal'; draft: JournalDraft } | { status: 'unavailable' };

export interface SpeechProposalAdapter {
  createSample(
    date: string,
    requestedResult?: 'success' | 'unavailable',
  ): SpeechSampleResult;
}

export class DeterministicSpeechProposalAdapter implements SpeechProposalAdapter {
  createSample(
    date: string,
    requestedResult: 'success' | 'unavailable' = 'success',
  ): SpeechSampleResult {
    if (requestedResult === 'unavailable') {
      return { status: 'unavailable' };
    }
    const sourceContext = syntheticSpeechContext(date);
    return {
      draft: { ...sourceContext.originalProposal, sourceContext },
      status: 'proposal',
    };
  }
}
