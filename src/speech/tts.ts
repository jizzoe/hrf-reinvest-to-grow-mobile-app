import * as Speech from 'expo-speech';

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
          language: locale === 'fr' ? 'fr-FR' : 'en-US',
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
