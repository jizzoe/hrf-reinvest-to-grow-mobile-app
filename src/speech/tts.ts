import * as Speech from 'expo-speech';

/**
 * Explicit speech language per interface language. Haitian Creole has no
 * widely available device voice, so it maps to Haitian French; when no voice
 * exists the adapter's existing unavailable path keeps on-screen review and
 * confirmation usable.
 */
const SPEECH_LANGUAGE: Record<AppLocale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ht: 'fr-HT',
};

import type { AppLocale } from '../domain/types';

export type TtsCallbacks = {
  onDone: () => void;
  onError: () => void;
  onStart: () => void;
};

export interface TtsAdapter {
  speak(summary: string, locale: AppLocale, callbacks: TtsCallbacks): void;
  stop(): void;
}

type NativeSpeechModule = Pick<typeof Speech, 'speak' | 'stop'>;

export function createDeviceTtsAdapter(
  nativeSpeech: NativeSpeechModule,
): TtsAdapter {
  return {
    speak(summary, locale, callbacks) {
      try {
        nativeSpeech.speak(summary, {
          language: SPEECH_LANGUAGE[locale],
          onDone: callbacks.onDone,
          onError: callbacks.onError,
          onStart: callbacks.onStart,
        });
      } catch {
        callbacks.onError();
      }
    },
    stop() {
      void nativeSpeech.stop().catch(() => undefined);
    },
  };
}

export const deviceTtsAdapter = createDeviceTtsAdapter(Speech);
