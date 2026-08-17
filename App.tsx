import { StatusBar } from 'expo-status-bar';
import * as Crypto from 'expo-crypto';
import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  calculateTotals,
  formatHtg,
  initialDraft,
  makeConfirmedTransaction,
  resolveLocale,
  text,
  validateDraft,
} from './src/domain/journal';
import type {
  AppLocale,
  JournalDraft,
  JournalTransaction,
  TransactionType,
} from './src/domain/types';
import { SQLiteJournalRepository } from './src/storage/journalRepository';

type Screen = 'entry' | 'review';

const businessName = 'Ti Komès Lakay';

export default function App() {
  const [locale, setLocale] = useState<AppLocale>(() =>
    resolveLocale(getLocales()[0]?.languageCode),
  );
  const [draft, setDraft] = useState<JournalDraft>(() => initialDraft('sale'));
  const [records, setRecords] = useState<JournalTransaction[]>([]);
  const [repository, setRepository] = useState<SQLiteJournalRepository | null>(
    null,
  );
  const [screen, setScreen] = useState<Screen>('entry');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void SQLiteJournalRepository.open()
      .then(async (openedRepository) => {
        const existingRecords = await openedRepository.listTransactions();
        if (active) {
          setRepository(openedRepository);
          setRecords(existingRecords);
        }
      })
      .catch(() => {
        if (active) {
          setSaveError(text(locale, 'saveError'));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [locale]);

  const totals = useMemo(() => calculateTotals(records), [records]);

  const updateDraft = <Key extends keyof JournalDraft>(
    key: Key,
    value: JournalDraft[Key],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const chooseType = (type: TransactionType) => {
    setDraft((current) => ({ ...current, type }));
  };

  const reviewDraft = () => {
    const nextErrors = validateDraft(draft, locale);
    setErrors(nextErrors);
    setSaveError(null);
    if (nextErrors.length === 0) {
      setScreen('review');
    }
  };

  const confirmDraft = async () => {
    if (!repository || isSaving) {
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const transaction = makeConfirmedTransaction(
        draft,
        Crypto.randomUUID,
        new Date().toISOString(),
      );
      await repository.saveConfirmedTransaction(transaction);
      setRecords(await repository.listTransactions());
      setDraft(initialDraft(draft.type));
      setErrors([]);
      setScreen('entry');
    } catch {
      setSaveError(text(locale, 'saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const typeLabel = (type: TransactionType) =>
    text(locale, type === 'sale' ? 'sale' : 'expense');

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{text(locale, 'title')}</Text>
          <Text style={styles.subtitle}>{text(locale, 'appSubtitle')}</Text>
          <Text style={styles.business}>{businessName} · HTG</Text>
          <View style={styles.localeRow}>
            {(['en', 'fr'] as AppLocale[]).map((candidate) => (
              <Pressable
                key={candidate}
                accessibilityRole="button"
                onPress={() => setLocale(candidate)}
                style={[
                  styles.localeButton,
                  locale === candidate && styles.localeButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.localeText,
                    locale === candidate && styles.localeTextSelected,
                  ]}
                >
                  {candidate === 'en' ? 'English' : 'Français'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label={text(locale, 'moneyEarned')}
            value={formatHtg(totals.earnedCents, locale)}
          />
          <SummaryCard
            label={text(locale, 'moneySpent')}
            value={formatHtg(totals.spentCents, locale)}
          />
          <SummaryCard
            label={text(locale, 'estimatedProfit')}
            value={formatHtg(totals.estimatedProfitCents, locale)}
          />
        </View>
        <Text style={styles.disclaimer}>{text(locale, 'localEstimate')}</Text>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#0b5d3b" />
          </View>
        ) : screen === 'entry' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{text(locale, 'review')}</Text>
            <Text style={styles.helpText}>{text(locale, 'formHelp')}</Text>
            <View style={styles.typeRow}>
              {(['sale', 'expense'] as TransactionType[]).map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="button"
                  onPress={() => chooseType(type)}
                  style={[
                    styles.typeButton,
                    draft.type === type && styles.typeButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      draft.type === type && styles.typeTextSelected,
                    ]}
                  >
                    {typeLabel(type)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Field
              label={text(locale, 'amount')}
              value={draft.amount}
              onChangeText={(value) => updateDraft('amount', value)}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <Field
              label={text(locale, 'date')}
              value={draft.date}
              onChangeText={(value) => updateDraft('date', value)}
              placeholder="2026-08-16"
            />
            <Field
              label={text(locale, 'category')}
              value={draft.category}
              onChangeText={(value) => updateDraft('category', value)}
              placeholder={
                locale === 'fr' ? 'Par exemple: stock' : 'For example: stock'
              }
            />
            <Field
              label={text(locale, 'note')}
              value={draft.note}
              onChangeText={(value) => updateDraft('note', value)}
              placeholder={locale === 'fr' ? 'Facultatif' : 'Optional'}
              multiline
            />
            {errors.map((error) => (
              <Text key={error} style={styles.errorText}>
                {error}
              </Text>
            ))}
            {saveError ? (
              <Text style={styles.errorText}>{saveError}</Text>
            ) : null}
            <PrimaryButton
              label={text(locale, 'review')}
              onPress={reviewDraft}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {text(locale, 'reviewHeading')}
            </Text>
            <ReviewRow
              label={typeLabel(draft.type)}
              value={formatHtg(
                Number(draft.amount.replace(',', '.')) * 100,
                locale,
              )}
            />
            <ReviewRow label={text(locale, 'date')} value={draft.date} />
            <ReviewRow
              label={text(locale, 'category')}
              value={draft.category}
            />
            {draft.note ? (
              <ReviewRow label={text(locale, 'note')} value={draft.note} />
            ) : null}
            <Text style={styles.statusText}>
              {text(locale, 'waitingToSync')}
            </Text>
            {saveError ? (
              <Text style={styles.errorText}>{saveError}</Text>
            ) : null}
            <PrimaryButton
              disabled={isSaving}
              label={
                isSaving ? text(locale, 'saving') : text(locale, 'confirm')
              }
              onPress={() => void confirmDraft()}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setScreen('entry')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                {text(locale, 'cancel')}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{text(locale, 'activity')}</Text>
          {records.length === 0 ? (
            <Text style={styles.helpText}>{text(locale, 'emptyActivity')}</Text>
          ) : (
            records.map((record) => (
              <View key={record.id} style={styles.activityRow}>
                <View>
                  <Text style={styles.activityTitle}>
                    {typeLabel(record.type)} · {record.category}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {record.date} · {text(locale, 'savedLocal')}
                  </Text>
                </View>
                <Text style={styles.activityAmount}>
                  {formatHtg(record.amountCents, locale)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function Field({
  keyboardType,
  label,
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: 'decimal-pad';
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

function PrimaryButton({
  disabled = false,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activityAmount: { color: '#0b5d3b', fontSize: 15, fontWeight: '700' },
  activityMeta: { color: '#52616b', fontSize: 13, marginTop: 3 },
  activityRow: {
    alignItems: 'center',
    borderTopColor: '#e4e9e6',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  activityTitle: { color: '#1f2933', fontSize: 15, fontWeight: '600' },
  business: { color: '#52616b', fontSize: 14, marginTop: 6 },
  buttonDisabled: { opacity: 0.55 },
  card: {
    backgroundColor: '#fff',
    borderColor: '#dfe7e2',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
    padding: 18,
  },
  disclaimer: { color: '#52616b', fontSize: 12, lineHeight: 18, marginTop: 10 },
  errorText: { color: '#aa1b1b', fontSize: 14, marginBottom: 8 },
  field: { marginTop: 14 },
  fieldLabel: {
    color: '#334e3d',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  header: { marginBottom: 8 },
  helpText: { color: '#52616b', fontSize: 14, lineHeight: 20 },
  input: {
    backgroundColor: '#f8faf9',
    borderColor: '#b8cbbf',
    borderRadius: 10,
    borderWidth: 1,
    color: '#17211a',
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: { alignItems: 'center', minHeight: 220, paddingTop: 70 },
  localeButton: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  localeButtonSelected: { backgroundColor: '#d9f4e4' },
  localeRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
  },
  localeText: { color: '#42634d', fontSize: 13, fontWeight: '600' },
  localeTextSelected: { color: '#075c36' },
  multilineInput: { minHeight: 72, textAlignVertical: 'top' },
  page: { backgroundColor: '#f3f7f4', flexGrow: 1, padding: 18 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0b6b40',
    borderRadius: 10,
    marginTop: 18,
    minHeight: 48,
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  reviewLabel: { color: '#52616b', fontSize: 14 },
  reviewRow: {
    borderTopColor: '#e4e9e6',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  reviewValue: {
    color: '#1f2933',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3,
  },
  safeArea: { backgroundColor: '#f3f7f4', flex: 1 },
  secondaryButton: { alignItems: 'center', marginTop: 12, padding: 10 },
  secondaryButtonText: { color: '#0b6b40', fontSize: 15, fontWeight: '700' },
  sectionTitle: {
    color: '#173d27',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusText: {
    color: '#075c36',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: { color: '#334e3d', fontSize: 16, marginTop: 4 },
  summaryCard: {
    backgroundColor: '#e7f5ec',
    borderRadius: 12,
    flex: 1,
    minHeight: 92,
    padding: 12,
  },
  summaryGrid: { flexDirection: 'row', gap: 8, marginTop: 10 },
  summaryLabel: { color: '#3b5c47', fontSize: 12, lineHeight: 16 },
  summaryValue: {
    color: '#124d30',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  title: { color: '#123b27', fontSize: 29, fontWeight: '800' },
  typeButton: {
    alignItems: 'center',
    borderColor: '#9cbda8',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  typeButtonSelected: { backgroundColor: '#0b6b40', borderColor: '#0b6b40' },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  typeText: { color: '#234b33', fontSize: 15, fontWeight: '700' },
  typeTextSelected: { color: '#fff' },
});
