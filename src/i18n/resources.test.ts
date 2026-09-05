import { describe, expect, it } from '@jest/globals';

import {
  copy,
  formatHtg,
  haitianCreoleTranslationMeta,
  resolveLocale,
  text,
} from '../domain/journal';
import type { AppLocale } from '../domain/types';

const LOCALES: AppLocale[] = ['en', 'fr', 'ht'];

describe('every language carries the same keys', () => {
  const englishKeys = Object.keys(copy.en).sort();

  it('has 68 user-facing keys', () => {
    expect(englishKeys).toHaveLength(68);
  });

  it.each(LOCALES)('%s has exactly the English key set', (locale) => {
    expect(Object.keys(copy[locale]).sort()).toEqual(englishKeys);
  });

  it.each(LOCALES)('%s has no empty value', (locale) => {
    const empty = englishKeys.filter(
      (key) => copy[locale][key as keyof typeof copy.en].trim().length === 0,
    );
    expect(empty).toEqual([]);
  });

  it('does not expose the review metadata as a displayable key', () => {
    expect(englishKeys).not.toContain('_meta');
    expect(Object.keys(copy.ht)).not.toContain('_meta');
  });
});

describe('existing English and French wording is unchanged', () => {
  // Values quoted from the pre-extraction source, so this fails if the move
  // altered any wording rather than relocating it.
  it.each([
    ['en', 'savedLocal', 'Saved on this phone'],
    [
      'en',
      'localEstimate',
      'These are local prototype estimates, not audited statements.',
    ],
    ['en', 'validationDate', 'Enter a date as YYYY-MM-DD.'],
    ['fr', 'savedLocal', 'Enregistré sur ce téléphone'],
    ['fr', 'category', 'Catégorie ou objectif'],
    [
      'fr',
      'formHelp',
      'Saisissez une vente ou une dépense. Rien n’est enregistré avant confirmation.',
    ],
  ])('%s.%s is preserved verbatim', (locale, key, expected) => {
    expect(text(locale as AppLocale, key as keyof typeof copy.en)).toBe(
      expected,
    );
  });
});

describe('Haitian Creole is present but marked unreviewed', () => {
  it('records its review status in the resource data', () => {
    expect(haitianCreoleTranslationMeta.reviewStatus).toBe('unreviewed');
    expect(haitianCreoleTranslationMeta.generatedBy).toBe(
      'machine-translation',
    );
  });

  it('serves Haitian Creole words, not English ones', () => {
    expect(text('ht', 'recordSale')).toBe('Anrejistre yon vant');
    expect(text('ht', 'recordSale')).not.toBe(text('en', 'recordSale'));
  });
});

describe('device language resolution', () => {
  it.each([
    ['ht', 'ht'],
    ['ht-HT', 'ht'],
    ['fr', 'fr'],
    ['fr-FR', 'fr'],
    ['en-US', 'en'],
    ['es-MX', 'en'],
    [null, 'en'],
  ])('resolves %s to %s', (input, expected) => {
    expect(resolveLocale(input)).toBe(expected);
  });
});

describe('Haitian Creole formats amounts with Haitian conventions', () => {
  it('does not silently fall back to United States formatting', () => {
    const haitianCreole = formatHtg(125050, 'ht');
    const english = formatHtg(125050, 'en');
    expect(haitianCreole).not.toBe(english);
    expect(english).toContain('1,250.50');
  });

  it('matches French Haitian formatting', () => {
    expect(formatHtg(125050, 'ht')).toBe(formatHtg(125050, 'fr'));
  });

  it('groups thousands and marks decimals the Haitian way', () => {
    const formatted = formatHtg(125050, 'ht');
    expect(formatted).toContain('250,50');
    expect(formatted).toContain('HTG');
  });
});
