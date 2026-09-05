import type {
  AppLocale,
  JournalDraft,
  JournalTransaction,
  LocalTotals,
  TransactionType,
} from './types';

import enCopy from '../i18n/en.json';
import frCopy from '../i18n/fr.json';
import htCopy from '../i18n/ht.json';

/**
 * User-facing words live in reviewable per-language JSON, not in source, so a
 * Haitian Creole reviewer can correct wording without editing code. English is
 * the canonical key set and the runtime fallback.
 */
export type CopyKey = keyof typeof enCopy;

type CopyTable = Record<CopyKey, string>;

// `_meta` records review status for the language and is not a displayable key.
const { _meta: haitianCreoleReviewMeta, ...haitianCreoleStrings } = htCopy;

export const haitianCreoleTranslationMeta = haitianCreoleReviewMeta;

export const copy: Record<AppLocale, CopyTable> = {
  en: enCopy,
  fr: frCopy,
  ht: haitianCreoleStrings,
};

/**
 * Number and date formatting locale per interface language. The platform has
 * no Haitian Creole formatting data and silently falls back to United States
 * English, so a Haitian Creole interface is formatted with Haitian French
 * conventions instead: `1 250,50 HTG` rather than `HTG 1,250.50`.
 */
const FORMATTING_LOCALE: Record<AppLocale, string> = {
  en: 'en-US',
  fr: 'fr-HT',
  ht: 'fr-HT',
};

export function text(locale: AppLocale, key: CopyKey): string {
  return copy[locale][key] ?? copy.en[key];
}

export function resolveLocale(languageCode?: string | null): AppLocale {
  const code = languageCode?.toLowerCase() ?? '';
  if (code.startsWith('ht')) {
    return 'ht';
  }
  return code.startsWith('fr') ? 'fr' : 'en';
}

export function formatHtg(amountCents: number, locale: AppLocale): string {
  return new Intl.NumberFormat(FORMATTING_LOCALE[locale], {
    currency: 'HTG',
    currencyDisplay: 'code',
    style: 'currency',
  }).format(amountCents / 100);
}

export function reviewSummary(draft: JournalDraft, locale: AppLocale): string {
  const amount = formatHtg(
    Number(draft.amount.replace(',', '.')) * 100,
    locale,
  );
  const type = text(locale, draft.type === 'sale' ? 'sale' : 'expense');
  return `${text(locale, 'recordThis')} ${type} ${text(locale, 'of')} ${amount} ${text(locale, 'for')} ${draft.category}?`;
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
    ...(draft.sourceContext
      ? {
          sourceContext: {
            ...draft.sourceContext,
            originalProposal: { ...draft.sourceContext.originalProposal },
          },
        }
      : {}),
  };
}
