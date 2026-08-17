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

type Screen = 'entry' | 'home' | 'review';

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
  const [screen, setScreen] = useState<Screen>('home');
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

  const startEntry = (type: TransactionType) => {
    setDraft(initialDraft(type));
    setErrors([]);
    setSaveError(null);
    setScreen('entry');
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
      setScreen('home');
    } catch {
      setSaveError(text(locale, 'saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.green} size="large" />
          </View>
        ) : screen === 'home' ? (
          <HomeScreen
            locale={locale}
            onLocaleChange={setLocale}
            onStartEntry={startEntry}
            records={records}
            saveError={saveError}
            totals={totals}
          />
        ) : screen === 'entry' ? (
          <EntryScreen
            draft={draft}
            errors={errors}
            locale={locale}
            onBack={() => setScreen('home')}
            onChange={updateDraft}
            onLocaleChange={setLocale}
            onReview={reviewDraft}
            saveError={saveError}
          />
        ) : (
          <ReviewScreen
            draft={draft}
            isSaving={isSaving}
            locale={locale}
            onBack={() => setScreen('entry')}
            onCancel={() => setScreen('home')}
            onConfirm={() => void confirmDraft()}
            onLocaleChange={setLocale}
            saveError={saveError}
          />
        )}
      </ScrollView>
    </View>
  );
}

function HomeScreen({
  locale,
  onLocaleChange,
  onStartEntry,
  records,
  saveError,
  totals,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
  onStartEntry: (type: TransactionType) => void;
  records: JournalTransaction[];
  saveError: string | null;
  totals: ReturnType<typeof calculateTotals>;
}) {
  return (
    <>
      <BrandHeader locale={locale} onLocaleChange={onLocaleChange} />
      <Text style={styles.greeting}>{text(locale, 'homeGreeting')}</Text>
      <Text style={styles.businessName}>{businessName}</Text>
      <Text style={styles.period}>{text(locale, 'thisWeek')}</Text>

      <View style={styles.metricList}>
        <MetricRow
          icon="▣"
          label={text(locale, 'moneyEarned')}
          value={formatHtg(totals.earnedCents, locale)}
          variant="earned"
        />
        <MetricRow
          icon="▢"
          label={text(locale, 'moneySpent')}
          value={formatHtg(totals.spentCents, locale)}
          variant="spent"
        />
        <MetricRow
          icon="⌁"
          label={text(locale, 'estimatedProfit')}
          value={formatHtg(totals.estimatedProfitCents, locale)}
          variant="profit"
        />
      </View>

      <Text style={styles.sectionHeading}>
        {text(locale, 'whatHappenedToday')}
      </Text>
      <View style={styles.actionGrid}>
        <QuickAction
          icon="＋"
          label={text(locale, 'recordSale')}
          onPress={() => onStartEntry('sale')}
        />
        <QuickAction
          icon="−"
          label={text(locale, 'recordExpense')}
          onPress={() => onStartEntry('expense')}
        />
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionHeading}>{text(locale, 'activity')}</Text>
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        {records.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>
              {text(locale, 'noActivityYet')}
            </Text>
            <Text style={styles.emptyCopy}>
              {text(locale, 'emptyActivity')}
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <ActivityRow key={record.id} locale={locale} record={record} />
          ))
        )}
      </View>
      <Text style={styles.disclaimer}>{text(locale, 'localEstimate')}</Text>
    </>
  );
}

function EntryScreen({
  draft,
  errors,
  locale,
  onBack,
  onChange,
  onLocaleChange,
  onReview,
  saveError,
}: {
  draft: JournalDraft;
  errors: string[];
  locale: AppLocale;
  onBack: () => void;
  onChange: <Key extends keyof JournalDraft>(
    key: Key,
    value: JournalDraft[Key],
  ) => void;
  onLocaleChange: (locale: AppLocale) => void;
  onReview: () => void;
  saveError: string | null;
}) {
  const isSale = draft.type === 'sale';
  const heading = text(locale, isSale ? 'recordSale' : 'recordExpense');

  return (
    <>
      <BrandHeader
        locale={locale}
        onBack={onBack}
        onLocaleChange={onLocaleChange}
      />
      <Text style={styles.screenHeading}>{heading}</Text>
      <Text style={styles.screenPrompt}>
        {text(locale, isSale ? 'salePrompt' : 'expensePrompt')}
      </Text>

      <View style={styles.amountRow}>
        <Text style={styles.currencyMark}>HTG</Text>
        <TextInput
          accessibilityLabel={text(locale, 'amount')}
          keyboardType="decimal-pad"
          onChangeText={(value) => onChange('amount', value)}
          placeholder="0"
          placeholderTextColor="#75808c"
          style={styles.amountInput}
          value={draft.amount}
        />
      </View>

      <FormRow
        label={text(locale, isSale ? 'whatSold' : 'whatSpent')}
        value={draft.category}
      >
        <TextInput
          accessibilityLabel={text(locale, 'category')}
          onChangeText={(value) => onChange('category', value)}
          placeholder={text(locale, isSale ? 'saleExample' : 'expenseExample')}
          placeholderTextColor="#75808c"
          style={styles.rowInput}
          value={draft.category}
        />
      </FormRow>
      <FormRow label={text(locale, 'date')} value={draft.date}>
        <TextInput
          accessibilityLabel={text(locale, 'date')}
          onChangeText={(value) => onChange('date', value)}
          placeholder="2026-08-17"
          placeholderTextColor="#75808c"
          style={styles.rowInput}
          value={draft.date}
        />
      </FormRow>
      <FormRow label={text(locale, 'note')} value="">
        <TextInput
          accessibilityLabel={text(locale, 'note')}
          multiline
          onChangeText={(value) => onChange('note', value)}
          placeholder={text(locale, 'noteExample')}
          placeholderTextColor="#75808c"
          style={[styles.rowInput, styles.noteInput]}
          value={draft.note}
        />
      </FormRow>

      {errors.map((error) => (
        <Text key={error} style={styles.errorText}>
          {error}
        </Text>
      ))}
      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
      <Text style={styles.actionHint}>{text(locale, 'reviewHint')}</Text>
      <PrimaryButton
        label={text(locale, isSale ? 'reviewSale' : 'reviewExpense')}
        onPress={onReview}
      />
    </>
  );
}

function ReviewScreen({
  draft,
  isSaving,
  locale,
  onBack,
  onCancel,
  onConfirm,
  onLocaleChange,
  saveError,
}: {
  draft: JournalDraft;
  isSaving: boolean;
  locale: AppLocale;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onLocaleChange: (locale: AppLocale) => void;
  saveError: string | null;
}) {
  const isSale = draft.type === 'sale';
  const amount = formatHtg(
    Number(draft.amount.replace(',', '.')) * 100,
    locale,
  );
  const typeKey = isSale ? 'sale' : 'expense';

  return (
    <>
      <BrandHeader
        locale={locale}
        onBack={onBack}
        onLocaleChange={onLocaleChange}
      />
      <Text style={styles.screenHeading}>
        {text(locale, isSale ? 'reviewSale' : 'reviewExpense')}
      </Text>
      <Text style={styles.screenPrompt}>{text(locale, 'reviewPrompt')}</Text>
      <Text style={styles.sourceLabel}>◉ {text(locale, 'enteredByYou')}</Text>
      <Text style={styles.reviewSentence}>
        {text(locale, 'recordThis')}{' '}
        {typeKey === 'sale' ? text(locale, 'sale') : text(locale, 'expense')}{' '}
        {text(locale, 'of')} {amount} {text(locale, 'for')} {draft.category}?
      </Text>

      <ReviewRow
        label={text(locale, 'amount')}
        locale={locale}
        value={amount}
        onPress={onBack}
      />
      <ReviewRow
        label={text(locale, isSale ? 'whatSold' : 'whatSpent')}
        locale={locale}
        value={draft.category}
        onPress={onBack}
      />
      <ReviewRow
        label={text(locale, 'date')}
        locale={locale}
        value={draft.date}
        onPress={onBack}
      />
      {draft.note ? (
        <ReviewRow
          label={text(locale, 'note')}
          locale={locale}
          value={draft.note}
          onPress={onBack}
        />
      ) : null}

      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
      <Text style={styles.actionHint}>{text(locale, 'savedOnPhone')}</Text>
      <Pressable
        accessibilityLabel={text(locale, 'cancel')}
        accessibilityRole="button"
        onPress={onCancel}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelText}>{text(locale, 'cancel')}</Text>
      </Pressable>
      <PrimaryButton
        disabled={isSaving}
        label={
          isSaving
            ? text(locale, 'saving')
            : text(locale, isSale ? 'confirmSale' : 'confirmExpense')
        }
        onPress={onConfirm}
      />
    </>
  );
}

function BrandHeader({
  locale,
  onBack,
  onLocaleChange,
}: {
  locale: AppLocale;
  onBack?: () => void;
  onLocaleChange: (locale: AppLocale) => void;
}) {
  return (
    <View style={styles.brandHeader}>
      {onBack ? (
        <Pressable
          accessibilityLabel={text(locale, 'back')}
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      ) : null}
      <View style={styles.wordmark}>
        <Text style={styles.wordmarkHome}>HOME</Text>
        <Text style={styles.wordmarkRoots}>ROOTS</Text>
        <Text style={styles.wordmarkFoundation}>FOUNDATION</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.savedStatus}>✓ {text(locale, 'savedOnPhone')}</Text>
        <View style={styles.localeRow}>
          {(['en', 'fr'] as AppLocale[]).map((candidate) => (
            <Pressable
              key={candidate}
              accessibilityRole="button"
              onPress={() => onLocaleChange(candidate)}
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
                {candidate === 'en' ? 'EN' : 'FR'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function MetricRow({
  icon,
  label,
  value,
  variant,
}: {
  icon: string;
  label: string;
  value: string;
  variant: 'earned' | 'profit' | 'spent';
}) {
  const valueStyle =
    variant === 'spent'
      ? styles.spentValue
      : variant === 'profit'
        ? styles.profitValue
        : styles.metricValue;

  return (
    <View style={styles.metricRow}>
      <View
        style={[
          styles.metricIcon,
          variant === 'spent' ? styles.spentIcon : styles.greenIcon,
        ]}
      >
        <Text style={styles.metricIconText}>{icon}</Text>
      </View>
      <Text
        style={[styles.metricLabel, variant === 'profit' && styles.profitValue]}
      >
        {label}
      </Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.quickAction}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function ActivityRow({
  locale,
  record,
}: {
  locale: AppLocale;
  record: JournalTransaction;
}) {
  const isSale = record.type === 'sale';
  return (
    <View style={styles.activityRow}>
      <View
        style={[
          styles.activityIcon,
          isSale ? styles.greenIcon : styles.spentIcon,
        ]}
      >
        <Text style={styles.metricIconText}>{isSale ? '+' : '−'}</Text>
      </View>
      <View style={styles.activityDescription}>
        <Text style={styles.activityTitle}>{record.category}</Text>
        <Text style={styles.activityMeta}>
          {record.date} · {text(locale, 'savedLocal')}
        </Text>
      </View>
      <Text style={isSale ? styles.activityEarned : styles.activitySpent}>
        {isSale ? '+' : '−'}
        {formatHtg(record.amountCents, locale)}
      </Text>
    </View>
  );
}

function FormRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.formRow}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ReviewRow({
  label,
  locale,
  onPress,
  value,
}: {
  label: string;
  locale: AppLocale;
  onPress: () => void;
  value: string;
}) {
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewCopy}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
      </View>
      <Pressable
        accessibilityLabel={`${text(locale, 'edit')} ${label}`}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>✎ {text(locale, 'edit')}</Text>
      </Pressable>
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
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const colors = {
  coral: '#C83E35',
  divider: '#D9DDD8',
  green: '#2D7A3D',
  navy: '#16265D',
  surface: '#FFFEFB',
  text: '#1B2430',
};

const styles = StyleSheet.create({
  actionGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionHint: {
    color: '#53606c',
    fontSize: 15,
    marginTop: 40,
    textAlign: 'center',
  },
  activityDescription: { flex: 1, marginLeft: 12 },
  activityEarned: { color: colors.green, fontSize: 16, fontWeight: '800' },
  activityIcon: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  activityMeta: { color: '#52616b', fontSize: 12, marginTop: 3 },
  activityRow: {
    alignItems: 'center',
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  activitySection: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    marginTop: 30,
    paddingTop: 24,
  },
  activitySpent: { color: colors.coral, fontSize: 16, fontWeight: '800' },
  activityTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  amountInput: {
    borderBottomColor: colors.green,
    borderBottomWidth: 3,
    color: colors.navy,
    flex: 1,
    fontSize: 48,
    fontWeight: '800',
    minHeight: 76,
    paddingHorizontal: 12,
  },
  amountRow: { alignItems: 'center', flexDirection: 'row', marginTop: 36 },
  backButton: { marginRight: 8, padding: 4 },
  backText: {
    color: colors.navy,
    fontSize: 52,
    fontWeight: '300',
    lineHeight: 42,
  },
  brandHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.55 },
  cancelButton: { alignItems: 'center', marginTop: 18, padding: 12 },
  cancelText: { color: colors.navy, fontSize: 18, fontWeight: '800' },
  currencyMark: {
    color: colors.navy,
    fontSize: 29,
    fontWeight: '800',
    marginRight: 12,
  },
  disclaimer: {
    color: '#52616b',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
    marginTop: 28,
    textAlign: 'center',
  },
  editButton: {
    borderColor: colors.green,
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editButtonText: { color: colors.green, fontSize: 15, fontWeight: '800' },
  emptyActivity: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyCopy: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyIcon: { color: colors.green, fontSize: 46, fontWeight: '800' },
  emptyTitle: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12,
  },
  errorText: { color: '#A6201A', fontSize: 14, lineHeight: 20, marginTop: 14 },
  formLabel: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  formRow: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    marginTop: 28,
    paddingTop: 22,
  },
  greenIcon: { backgroundColor: '#E8F4E9' },
  greeting: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 40,
  },
  headerRight: { alignItems: 'flex-end', flex: 1 },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 500,
  },
  localeButton: { borderRadius: 12, paddingHorizontal: 7, paddingVertical: 4 },
  localeButtonSelected: { backgroundColor: '#E8F4E9' },
  localeRow: { flexDirection: 'row', gap: 2, marginTop: 8 },
  localeText: { color: '#52616b', fontSize: 11, fontWeight: '800' },
  localeTextSelected: { color: colors.green },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  metricIconText: { color: colors.green, fontSize: 23, fontWeight: '800' },
  metricLabel: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
  },
  metricList: {
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    marginTop: 30,
  },
  metricRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 94,
  },
  metricValue: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'right',
  },
  noteInput: { minHeight: 64, textAlignVertical: 'top' },
  page: { backgroundColor: colors.surface, flexGrow: 1, padding: 22 },
  period: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: '700',
    marginTop: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: 8,
    marginBottom: 18,
    marginTop: 16,
    minHeight: 58,
    paddingVertical: 16,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  profitValue: { color: colors.green },
  quickAction: {
    alignItems: 'center',
    borderColor: colors.green,
    borderRadius: 10,
    borderWidth: 2,
    flex: 1,
    minHeight: 116,
    padding: 14,
  },
  quickActionIcon: { color: colors.green, fontSize: 34, fontWeight: '800' },
  quickActionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  reviewCopy: { flex: 1, paddingRight: 12 },
  reviewLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  reviewRow: {
    alignItems: 'center',
    borderTopColor: colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  reviewSentence: {
    color: colors.navy,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 28,
    marginTop: 30,
  },
  reviewValue: {
    color: colors.navy,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 5,
  },
  rowInput: { color: colors.text, fontSize: 19, minHeight: 44, padding: 0 },
  safeArea: { backgroundColor: colors.surface, flex: 1 },
  savedStatus: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  screenHeading: {
    color: colors.navy,
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
    marginTop: 44,
  },
  screenPrompt: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '600',
    lineHeight: 30,
    marginTop: 14,
  },
  sectionHeading: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 30,
  },
  sourceLabel: {
    color: colors.green,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 26,
  },
  spentIcon: { backgroundColor: '#FBE7E4' },
  spentValue: {
    color: colors.coral,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'right',
  },
  wordmark: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 148,
  },
  wordmarkFoundation: {
    color: '#52616b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    width: '100%',
  },
  wordmarkHome: {
    color: '#C71924',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  wordmarkRoots: {
    color: colors.green,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginLeft: 3,
  },
});
