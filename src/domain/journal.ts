import type {
  AppLocale,
  JournalDraft,
  JournalTransaction,
  LocalTotals,
  TransactionType,
} from './types';

export const copy = {
  en: {
    activity: 'Recent activity',
    amount: 'Amount',
    appSubtitle: 'Your local business journal',
    cancel: 'Back to edit',
    category: 'Category or purpose',
    confirm: 'Confirm and save',
    date: 'Date',
    emptyActivity: 'No local records yet.',
    estimatedProfit: 'Estimated local profit',
    expense: 'Expense',
    formHelp: 'Enter a sale or expense. Nothing is saved until you confirm.',
    localEstimate:
      'These are local prototype estimates, not audited statements.',
    moneyEarned: 'Money earned',
    moneySpent: 'Money spent',
    note: 'Optional note',
    review: 'Review entry',
    reviewHeading: 'Review before saving',
    sale: 'Sale',
    savedLocal: 'Saved on this phone',
    saveError: 'We could not save this entry. Please try again.',
    saving: 'Saving locally…',
    title: 'Reinvest to Grow',
    validationAmount: 'Enter an amount greater than zero.',
    validationCategory: 'Enter a category or purpose.',
    validationDate: 'Enter a date as YYYY-MM-DD.',
    waitingToSync: 'Waiting to sync',
  },
  fr: {
    activity: 'Activité récente',
    amount: 'Montant',
    appSubtitle: 'Votre journal d’entreprise local',
    cancel: 'Retour à la saisie',
    category: 'Catégorie ou objectif',
    confirm: 'Confirmer et enregistrer',
    date: 'Date',
    emptyActivity: 'Aucun enregistrement local pour le moment.',
    estimatedProfit: 'Bénéfice local estimé',
    expense: 'Dépense',
    formHelp:
      'Saisissez une vente ou une dépense. Rien n’est enregistré avant confirmation.',
    localEstimate:
      'Ce sont des estimations locales de prototype, pas des états financiers vérifiés.',
    moneyEarned: 'Argent gagné',
    moneySpent: 'Argent dépensé',
    note: 'Note facultative',
    review: 'Vérifier la saisie',
    reviewHeading: 'Vérifier avant d’enregistrer',
    sale: 'Vente',
    savedLocal: 'Enregistré sur ce téléphone',
    saveError: 'Cette saisie n’a pas pu être enregistrée. Réessayez.',
    saving: 'Enregistrement local…',
    title: 'Reinvest to Grow',
    validationAmount: 'Saisissez un montant supérieur à zéro.',
    validationCategory: 'Saisissez une catégorie ou un objectif.',
    validationDate: 'Saisissez une date au format AAAA-MM-JJ.',
    waitingToSync: 'En attente de synchronisation',
  },
} as const;

export type CopyKey = keyof (typeof copy)['en'];

export function text(locale: AppLocale, key: CopyKey): string {
  return copy[locale][key];
}

export function resolveLocale(languageCode?: string | null): AppLocale {
  return languageCode?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function formatHtg(amountCents: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-HT' : 'en-US', {
    currency: 'HTG',
    currencyDisplay: 'code',
    style: 'currency',
  }).format(amountCents / 100);
}

export function parseAmountToCents(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

export function validateDraft(
  draft: JournalDraft,
  locale: AppLocale,
): string[] {
  const errors: string[] = [];
  if (parseAmountToCents(draft.amount) === null) {
    errors.push(text(locale, 'validationAmount'));
  }
  if (!isIsoDate(draft.date)) {
    errors.push(text(locale, 'validationDate'));
  }
  if (!draft.category.trim()) {
    errors.push(text(locale, 'validationCategory'));
  }
  return errors;
}

export function initialDraft(type: TransactionType): JournalDraft {
  return {
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    type,
  };
}

export function calculateTotals(records: JournalTransaction[]): LocalTotals {
  return records.reduce<LocalTotals>(
    (totals, record) => {
      if (record.type === 'sale') {
        totals.earnedCents += record.amountCents;
      } else {
        totals.spentCents += record.amountCents;
      }
      totals.estimatedProfitCents = totals.earnedCents - totals.spentCents;
      return totals;
    },
    { earnedCents: 0, estimatedProfitCents: 0, spentCents: 0 },
  );
}

export function makeConfirmedTransaction(
  draft: JournalDraft,
  createId: () => string,
  now: string,
): JournalTransaction {
  const amountCents = parseAmountToCents(draft.amount);
  if (amountCents === null) {
    throw new Error('A confirmed transaction needs a valid amount.');
  }

  const id = createId();
  return {
    amountCents,
    category: draft.category.trim(),
    clientIdempotencyKey: `client-${id}`,
    confirmationState: 'confirmed',
    createdAt: now,
    currency: 'HTG',
    date: draft.date,
    id,
    note: draft.note.trim() || null,
    operationId: `create-transaction-${id}`,
    status: 'saved_local',
    type: draft.type,
  };
}
