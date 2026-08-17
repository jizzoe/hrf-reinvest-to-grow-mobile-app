export type AppLocale = 'en' | 'fr';

export type TransactionType = 'sale' | 'expense';

export type TransactionStatus = 'saved_local';

export type JournalDraft = {
  type: TransactionType;
  amount: string;
  date: string;
  category: string;
  note: string;
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
