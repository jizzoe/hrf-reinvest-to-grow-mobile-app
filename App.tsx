import { StatusBar } from 'expo-status-bar';
import * as Crypto from 'expo-crypto';
import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  reviewSummary,
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
import {
  DeterministicSpeechProposalAdapter,
  type SpeechProposalAdapter,
} from './src/speech/speechProposal';
import { deviceTtsAdapter, type TtsAdapter } from './src/speech/tts';

type Screen = 'entry' | 'home' | 'review' | 'speech-failure' | 'speech-start';
type TtsStatus = 'done' | 'error' | 'idle' | 'speaking';

type AppProps = {
  speechAdapter?: SpeechProposalAdapter;
  ttsAdapter?: TtsAdapter;
};

const businessName = 'Ti Komès Lakay';

export function AppView({
  speechAdapter = new DeterministicSpeechProposalAdapter(),
  ttsAdapter = deviceTtsAdapter,
}: AppProps = {}) {
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
  const [ttsStatus, setTtsStatus] = useState<TtsStatus>('idle');

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

  useEffect(
    () => () => {
      ttsAdapter.stop();
    },
    [ttsAdapter],
  );

  const totals = useMemo(() => calculateTotals(records), [records]);

  const changeLocale = (nextLocale: AppLocale) => {
    ttsAdapter.stop();
    setTtsStatus('idle');
    setLocale(nextLocale);
  };

  const updateDraft = <Key extends keyof JournalDraft>(
    key: Key,
    value: JournalDraft[Key],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const startEntry = (type: TransactionType) => {
    ttsAdapter.stop();
    setTtsStatus('idle');
    setDraft(initialDraft(type));
    setErrors([]);
    setSaveError(null);
    setScreen('entry');
  };

  const startSpeech = () => {
    ttsAdapter.stop();
    setTtsStatus('idle');
    setDraft(initialDraft('sale'));
    setErrors([]);
    setSaveError(null);
    setScreen('speech-start');
  };

  const runSpeechSample = (result: 'success' | 'unavailable') => {
    ttsAdapter.stop();
    setTtsStatus('idle');
    const proposal = speechAdapter.createSample(
      new Date().toISOString().slice(0, 10),
      result,
    );
    if (proposal.status === 'unavailable') {
      setScreen('speech-failure');
      return;
    }
    setDraft(proposal.draft);
    setErrors([]);
    setScreen('review');
  };

  const leaveSpeechReview = (nextScreen: Screen) => {
    ttsAdapter.stop();
    setTtsStatus('idle');
    setScreen(nextScreen);
  };

  const readDraftAloud = () => {
    ttsAdapter.stop();
    ttsAdapter.speak(reviewSummary(draft, locale), locale, {
      onDone: () => setTtsStatus('done'),
      onError: () => setTtsStatus('error'),
      onStart: () => setTtsStatus('speaking'),
    });
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
    ttsAdapter.stop();
    setTtsStatus('idle');
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
            onLocaleChange={changeLocale}
            onStartEntry={startEntry}
            onStartSpeech={startSpeech}
            records={records}
            saveError={saveError}
            totals={totals}
          />
        ) : screen === 'speech-start' ? (
          <SpeechStartScreen
            locale={locale}
            onBack={() => leaveSpeechReview('home')}
            onLocaleChange={changeLocale}
            onManual={() => startEntry('sale')}
            onRunSample={runSpeechSample}
          />
        ) : screen === 'speech-failure' ? (
          <SpeechFailureScreen
            locale={locale}
            onBack={startSpeech}
            onLocaleChange={changeLocale}
            onManual={() => startEntry('sale')}
            onRetry={() => runSpeechSample('success')}
          />
        ) : screen === 'entry' ? (
          <EntryScreen
            draft={draft}
            errors={errors}
            locale={locale}
            onBack={() => setScreen(draft.sourceContext ? 'review' : 'home')}
            onChange={updateDraft}
            onLocaleChange={changeLocale}
            onReview={reviewDraft}
            saveError={saveError}
          />
        ) : (
          <ReviewScreen
            draft={draft}
            isSaving={isSaving}
            locale={locale}
            onBack={() => leaveSpeechReview('entry')}
            onCancel={() => leaveSpeechReview('home')}
            onConfirm={() => void confirmDraft()}
            onLocaleChange={changeLocale}
            onReadAloud={readDraftAloud}
            onRecordAgain={() => leaveSpeechReview('speech-start')}
            saveError={saveError}
            ttsStatus={ttsStatus}
          />
        )}
      </ScrollView>
    </View>
  );
}

export default function App() {
  return <AppView />;
}

function HomeScreen({
  locale,
  onLocaleChange,
  onStartEntry,
  onStartSpeech,
  records,
  saveError,
  totals,
}: {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
  onStartEntry: (type: TransactionType) => void;
  onStartSpeech: () => void;
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
      <SecondaryButton
        label={text(locale, 'useSpeech')}
        onPress={onStartSpeech}
      />

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

function SpeechStartScreen({
  locale,
  onBack,
  onLocaleChange,
  onManual,
  onRunSample,
}: {
  locale: AppLocale;
  onBack: () => void;
  onLocaleChange: (locale: AppLocale) => void;
  onManual: () => void;
  onRunSample: (result: 'success' | 'unavailable') => void;
}) {
  return (
    <>
      <BrandHeader
        locale={locale}
        onBack={onBack}
        onLocaleChange={onLocaleChange}
      />
      <View style={styles.speechPanel} testID="speech-start-state">
        <Text style={styles.screenHeading}>
          {text(locale, 'sampleHeading')}
        </Text>
        <Text style={styles.disclosureText}>
          {text(locale, 'sampleDisclosure')}
        </Text>
        <Text style={styles.formLabel}>{text(locale, 'sampleMessage')}</Text>
        <Text style={styles.transcriptText}>
          I sold rice for 500 gourdes today
        </Text>
      </View>
      <PrimaryButton
        label={text(locale, 'useSample')}
        onPress={() => onRunSample('success')}
      />
      <SecondaryButton
        label={text(locale, 'showUnavailable')}
        onPress={() => onRunSample('unavailable')}
      />
      <SecondaryButton
        label={text(locale, 'enterSaleYourself')}
        onPress={onManual}
      />
    </>
  );
}

function SpeechFailureScreen({
  locale,
  onBack,
  onLocaleChange,
  onManual,
  onRetry,
}: {
  locale: AppLocale;
  onBack: () => void;
  onLocaleChange: (locale: AppLocale) => void;
  onManual: () => void;
  onRetry: () => void;
}) {
  return (
    <>
      <BrandHeader
        locale={locale}
        onBack={onBack}
        onLocaleChange={onLocaleChange}
      />
      <View style={styles.speechPanel} testID="speech-failure-state">
        <Text style={styles.screenHeading}>
          {text(locale, 'sampleFailure')}
        </Text>
        <Text style={styles.screenPrompt}>
          {text(locale, 'sampleFailureHelp')}
        </Text>
      </View>
      <PrimaryButton label={text(locale, 'tryAgain')} onPress={onRetry} />
      <SecondaryButton
        label={text(locale, 'enterSaleYourself')}
        onPress={onManual}
      />
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
  onReadAloud,
  onRecordAgain,
  saveError,
  ttsStatus,
}: {
  draft: JournalDraft;
  isSaving: boolean;
  locale: AppLocale;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onLocaleChange: (locale: AppLocale) => void;
  onReadAloud: () => void;
  onRecordAgain: () => void;
  saveError: string | null;
  ttsStatus: TtsStatus;
}) {
  const isSale = draft.type === 'sale';
  const amount = formatHtg(
    Number(draft.amount.replace(',', '.')) * 100,
    locale,
  );
  const summary = reviewSummary(draft, locale);
  const fromSpeech = Boolean(draft.sourceContext);

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
      <Text style={styles.sourceLabel}>
        ◉ {text(locale, fromSpeech ? 'speechSource' : 'enteredByYou')}
      </Text>
      {draft.sourceContext ? (
        <View style={styles.transcriptPanel} testID="speech-review-source">
          <Text style={styles.formLabel}>{text(locale, 'sampleMessage')}</Text>
          <Text style={styles.transcriptText}>
            {draft.sourceContext.rawInput}
          </Text>
          <Text style={styles.disclosureText}>
            {text(locale, 'sampleDisclosure')}
          </Text>
        </View>
      ) : null}
      <Text style={styles.reviewSentence}>{summary}</Text>

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
      {fromSpeech ? (
        <>
          <SecondaryButton
            label={text(locale, 'readAloud')}
            onPress={onReadAloud}
          />
          {ttsStatus !== 'idle' ? (
            <Text accessibilityLiveRegion="polite" style={styles.ttsStatus}>
              {text(
                locale,
                ttsStatus === 'error'
                  ? 'speechError'
                  : ttsStatus === 'done'
                    ? 'speechDone'
                    : 'speechSpeaking',
              )}
            </Text>
          ) : null}
          <SecondaryButton
            label={text(locale, 'recordAgain')}
            onPress={onRecordAgain}
          />
        </>
      ) : null}
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
          <Text style={styles.backLabel}>{text(locale, 'back')}</Text>
        </Pressable>
      ) : null}
      <Image
        accessibilityLabel="Home Roots Foundation"
        resizeMode="contain"
        source={require('./assets/brand/home-roots-foundation-logo-temporary.png')}
        style={styles.brandLogo}
      />
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

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.secondaryButton}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
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
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 8,
    padding: 4,
  },
  backLabel: { color: colors.navy, fontSize: 16, fontWeight: '800' },
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
  brandLogo: { height: 78, width: 142 },
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
  disclosureText: {
    color: colors.coral,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 25,
    marginBottom: 24,
    marginTop: 18,
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
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.green,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 12,
    minHeight: 54,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
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
  speechPanel: { marginBottom: 12 },
  spentIcon: { backgroundColor: '#FBE7E4' },
  spentValue: {
    color: colors.coral,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'right',
  },
  transcriptPanel: {
    backgroundColor: '#F3F7F1',
    borderRadius: 8,
    marginTop: 18,
    padding: 16,
  },
  transcriptText: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 29,
  },
  ttsStatus: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
});
