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
    back: 'Back',
    cancel: 'Cancel entry',
    category: 'Category or purpose',
    confirmExpense: 'Confirm expense',
    confirmSale: 'Confirm sale',
    confirm: 'Confirm and save',
    date: 'Date',
    edit: 'Edit',
    enteredByYou: 'Entered by you',
    emptyActivity: 'No local records yet.',
    estimatedProfit: 'Estimated local profit',
    expense: 'Expense',
    expenseExample: 'For example: supplies',
    expensePrompt: 'What did you spend today?',
    for: 'for',
    formHelp: 'Enter a sale or expense. Nothing is saved until you confirm.',
    homeGreeting: 'Good morning',
    localEstimate:
      'These are local prototype estimates, not audited statements.',
    moneyEarned: 'Money earned',
    moneySpent: 'Money spent',
    noActivityYet: 'No activity yet',
    note: 'Optional note',
    noteExample: 'Example: market sales',
    of: 'of',
    recordExpense: 'Record expense',
    recordSale: 'Record sale',
    recordThis: 'Record this',
    review: 'Review entry',
    reviewExpense: 'Review expense',
    reviewHeading: 'Review before saving',
    reviewHint: 'You will review before this is saved.',
    reviewPrompt: 'Check the details before you save.',
    reviewSale: 'Review sale',
    sale: 'Sale',
    saleExample: 'For example: rice',
    salePrompt: 'What did you earn today?',
    savedLocal: 'Saved on this phone',
    savedOnPhone: 'Saved on this phone',
    saveError: 'We could not save this entry. Please try again.',
    saving: 'Saving locally…',
    thisWeek: 'This week',
    title: 'Reinvest to Grow',
    validationAmount: 'Enter an amount greater than zero.',
    validationCategory: 'Enter a category or purpose.',
    validationDate: 'Enter a date as YYYY-MM-DD.',
    waitingToSync: 'Waiting to sync',
    whatHappenedToday: 'What happened today?',
    whatSold: 'What did you sell?',
    whatSpent: 'What did you spend?',
  },
  fr: {
    activity: 'Activité récente',
    amount: 'Montant',
    appSubtitle: 'Votre journal d’entreprise local',
    back: 'Retour',
    cancel: 'Annuler la saisie',
    category: 'Catégorie ou objectif',
    confirmExpense: 'Confirmer la dépense',
    confirmSale: 'Confirmer la vente',
    confirm: 'Confirmer et enregistrer',
    date: 'Date',
    edit: 'Modifier',
    enteredByYou: 'Saisi par vous',
    emptyActivity: 'Aucun enregistrement local pour le moment.',
    estimatedProfit: 'Bénéfice local estimé',
    expense: 'Dépense',
    expenseExample: 'Par exemple : fournitures',
    expensePrompt: 'Qu’avez-vous dépensé aujourd’hui ?',
    for: 'pour',
    formHelp:
      'Saisissez une vente ou une dépense. Rien n’est enregistré avant confirmation.',
    homeGreeting: 'Bonjour',
    localEstimate:
      'Ce sont des estimations locales de prototype, pas des états financiers vérifiés.',
    moneyEarned: 'Argent gagné',
    moneySpent: 'Argent dépensé',
    noActivityYet: 'Aucune activité pour le moment',
    note: 'Note facultative',
    noteExample: 'Exemple : ventes du marché',
    of: 'de',
    recordExpense: 'Enregistrer une dépense',
    recordSale: 'Enregistrer une vente',
    recordThis: 'Enregistrer cette',
    review: 'Vérifier la saisie',
    reviewExpense: 'Vérifier la dépense',
    reviewHeading: 'Vérifier avant d’enregistrer',
    reviewHint: 'Vous vérifierez avant l’enregistrement.',
    reviewPrompt: 'Vérifiez les détails avant d’enregistrer.',
    reviewSale: 'Vérifier la vente',
    sale: 'Vente',
    saleExample: 'Par exemple : riz',
    salePrompt: 'Qu’avez-vous gagné aujourd’hui ?',
    savedLocal: 'Enregistré sur ce téléphone',
    savedOnPhone: 'Enregistré sur ce téléphone',
    saveError: 'Cette saisie n’a pas pu être enregistrée. Réessayez.',
    saving: 'Enregistrement local…',
    thisWeek: 'Cette semaine',
    title: 'Reinvest to Grow',
    validationAmount: 'Saisissez un montant supérieur à zéro.',
    validationCategory: 'Saisissez une catégorie ou un objectif.',
    validationDate: 'Saisissez une date au format AAAA-MM-JJ.',
    waitingToSync: 'En attente de synchronisation',
    whatHappenedToday: 'Que s’est-il passé aujourd’hui ?',
    whatSold: 'Qu’avez-vous vendu ?',
    whatSpent: 'Qu’avez-vous dépensé ?',
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
