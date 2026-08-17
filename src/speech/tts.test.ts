import { describe, expect, it, jest } from '@jest/globals';

import { createDeviceTtsAdapter } from './tts';

describe('device TTS adapter', () => {
  it('speaks only the supplied visible summary with locale callbacks', () => {
    const mockSpeak = jest.fn();
    const adapter = createDeviceTtsAdapter({
      speak: mockSpeak,
      stop: jest.fn(async () => undefined),
    });
    const callbacks = {
      onDone: jest.fn(),
      onError: jest.fn(),
      onStart: jest.fn(),
    };
    adapter.speak('Visible synthetic summary', 'fr', callbacks);

    expect(mockSpeak).toHaveBeenCalledWith(
      'Visible synthetic summary',
      expect.objectContaining({
        language: 'fr-FR',
        onDone: callbacks.onDone,
        onError: callbacks.onError,
        onStart: callbacks.onStart,
      }),
    );
  });

  it('stops queued device speech', () => {
    const mockStop = jest.fn(async () => undefined);
    const adapter = createDeviceTtsAdapter({
      speak: jest.fn(),
      stop: mockStop,
    });
    adapter.stop();
    expect(mockStop).toHaveBeenCalled();
  });

  it('converts native exceptions into the visible error callback', () => {
    const onError = jest.fn();
    const adapter = createDeviceTtsAdapter({
      speak: () => {
        throw new Error('Synthetic native failure');
      },
      stop: jest.fn(async () => undefined),
    });

    adapter.speak('Visible summary', 'en', {
      onDone: jest.fn(),
      onError,
      onStart: jest.fn(),
    });

    expect(onError).toHaveBeenCalled();
  });
});
