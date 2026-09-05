export type AppLocale = 'en' | 'fr' | 'ht';

export type TransactionType = 'sale' | 'expense';

export type TransactionStatus = 'saved_local';

export type SpeechProposalValues = {
  type: 'sale';
  amount: string;
  date: string;
  category: string;
  note: string;
};

export type SpeechProposalContext = {
  sourceType: 'speech_transcript';
  fixtureId: 'synthetic-rice-sale-500';
  rawInput: 'I sold rice for 500 gourdes today';
  originalProposal: SpeechProposalValues;
};

export type JournalDraft = {
  type: TransactionType;
  amount: string;
  date: string;
  category: string;
  note: string;
  sourceContext?: SpeechProposalContext;
};

export type JournalTransaction = {
  id: string;
  clientIdempotencyKey: string;
  operationId: string;
  type: TransactionType;
  amountCents: number;
  date: string;
  category: string;
  note: string | null;
  currency: 'HTG';
  confirmationState: 'confirmed';
  status: TransactionStatus;
  createdAt: string;
  sourceContext?: SpeechProposalContext;
};

export type OutboxRecord = {
  id: string;
  transactionId: string;
  clientIdempotencyKey: string;
  operationId: string;
  state: 'queued';
  createdAt: string;
};

export type LocalTotals = {
  earnedCents: number;
  spentCents: number;
  estimatedProfitCents: number;
};
