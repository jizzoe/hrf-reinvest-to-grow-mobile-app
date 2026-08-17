import { render, userEvent, waitFor } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockRunAsync = jest.fn(async () => ({
  changes: 1,
  lastInsertRowId: 1,
}));
const mockTtsSpeak = jest.fn(
  (
    _summary: string,
    _locale: 'en' | 'fr',
    callbacks: { onStart: () => void },
  ) => {
    callbacks.onStart();
  },
);
const mockTtsStop = jest.fn();
const mockTtsAdapter = { speak: mockTtsSpeak, stop: mockTtsStop };

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: async () => ({
    execAsync: async () => undefined,
    getAllAsync: async () => [],
    getFirstAsync: async () => null,
    withExclusiveTransactionAsync: async (
      task: (transaction: { runAsync: typeof mockRunAsync }) => Promise<void>,
    ) => task({ runAsync: mockRunAsync }),
  }),
}));

jest.mock('expo-crypto', () => ({ randomUUID: () => 'app-test-transaction' }));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));
import { AppView } from './App';
import type { TtsAdapter } from './src/speech/tts';

describe('Home-first manual entry flow', () => {
  beforeEach(() => {
    mockRunAsync.mockClear();
    mockTtsSpeak.mockClear();
    mockTtsStop.mockClear();
  });

  it('opens Home before a synthetic sale can be reviewed', async () => {
    const rendered = await render(<AppView ttsAdapter={mockTtsAdapter} />);
    const user = userEvent.setup();

    expect(await rendered.findByText('Good morning')).toBeTruthy();
    const recordSale = rendered.getByRole('button', {
      name: 'Record sale',
    });
    await user.press(recordSale);

    await user.type(rendered.getByLabelText('Amount'), '150');
    await user.type(
      rendered.getByLabelText('Category or purpose'),
      'Synthetic market sale',
    );
    const reviewButton = rendered.getByRole('button', {
      name: 'Review sale',
    });
    await user.press(reviewButton);

    await waitFor(() =>
      expect(
        rendered.getByText('Check the details before you save.'),
      ).toBeTruthy(),
    );
    expect(rendered.getByText('Saved on this phone')).toBeTruthy();

    await user.press(rendered.getByRole('button', { name: 'Confirm sale' }));
    await waitFor(() =>
      expect(rendered.getByText('What happened today?')).toBeTruthy(),
    );
  });

  it('discloses the prototype sample and saves only after edited confirmation', async () => {
    const rendered = await render(<AppView ttsAdapter={mockTtsAdapter} />);
    const user = userEvent.setup();

    await user.press(
      await rendered.findByRole('button', { name: 'Use speech' }),
    );
    expect(
      rendered.getByText(
        'Prototype sample: this does not record or transcribe you.',
      ),
    ).toBeTruthy();
    expect(rendered.getByText('Back')).toBeTruthy();
    await user.press(
      rendered.getByRole('button', { name: 'Use prototype sample' }),
    );

    expect(
      await rendered.findByText('I sold rice for 500 gourdes today'),
    ).toBeTruthy();
    expect(rendered.getByText(/Suggested from speech/)).toBeTruthy();
    expect(mockRunAsync).not.toHaveBeenCalled();

    await user.press(rendered.getByRole('button', { name: 'Edit Amount' }));
    const amount = rendered.getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '650');
    await user.press(rendered.getByRole('button', { name: 'Review sale' }));
    await user.press(rendered.getByRole('button', { name: 'Confirm sale' }));

    await waitFor(() => expect(mockRunAsync).toHaveBeenCalledTimes(2));
  });

  it('record again and cancel do not write a transaction', async () => {
    const rendered = await render(<AppView ttsAdapter={mockTtsAdapter} />);
    const user = userEvent.setup();

    await user.press(
      await rendered.findByRole('button', { name: 'Use speech' }),
    );
    await user.press(
      rendered.getByRole('button', { name: 'Use prototype sample' }),
    );
    mockTtsStop.mockClear();
    await user.press(rendered.getByRole('button', { name: 'Record again' }));
    expect(rendered.getByTestId('speech-start-state')).toBeTruthy();
    expect(mockTtsStop).toHaveBeenCalled();
    expect(mockRunAsync).not.toHaveBeenCalled();

    await user.press(
      rendered.getByRole('button', { name: 'Use prototype sample' }),
    );
    await user.press(rendered.getByRole('button', { name: 'Cancel entry' }));
    expect(await rendered.findByText('What happened today?')).toBeTruthy();
    expect(mockRunAsync).not.toHaveBeenCalled();
  });

  it('keeps visible review usable when device TTS reports an error', async () => {
    const errorTtsAdapter: TtsAdapter = {
      speak: (_summary, _locale, callbacks) => callbacks.onError(),
      stop: jest.fn(),
    };
    const rendered = await render(<AppView ttsAdapter={errorTtsAdapter} />);
    const user = userEvent.setup();

    await user.press(
      await rendered.findByRole('button', { name: 'Use speech' }),
    );
    await user.press(
      rendered.getByRole('button', { name: 'Use prototype sample' }),
    );
    await user.press(
      rendered.getByRole('button', { name: 'Read summary aloud' }),
    );

    expect(
      rendered.getByText(
        'Read-aloud is unavailable. You can still review and confirm on screen.',
      ),
    ).toBeTruthy();
    expect(rendered.getByRole('button', { name: 'Confirm sale' })).toBeTruthy();
    expect(rendered.getByRole('button', { name: 'Record again' })).toBeTruthy();
    expect(mockRunAsync).not.toHaveBeenCalled();
  });

  it('keeps read aloud visible and non-authoritative', async () => {
    const rendered = await render(<AppView ttsAdapter={mockTtsAdapter} />);
    const user = userEvent.setup();

    await user.press(
      await rendered.findByRole('button', { name: 'Use speech' }),
    );
    await user.press(
      rendered.getByRole('button', { name: 'Use prototype sample' }),
    );
    const visibleSummary = rendered.getByText(/Record this Sale/);
    await user.press(
      rendered.getByRole('button', { name: 'Read summary aloud' }),
    );

    expect(visibleSummary).toBeTruthy();
    expect(mockTtsSpeak).toHaveBeenCalledWith(
      visibleSummary.props.children,
      'en',
      expect.objectContaining({ onStart: expect.any(Function) }),
    );
    expect(
      rendered.getByText('Reading the visible summary aloud.'),
    ).toBeTruthy();
    expect(mockRunAsync).not.toHaveBeenCalled();
  });

  it('offers retry and complete manual sale fallback from failure', async () => {
    const rendered = await render(<AppView ttsAdapter={mockTtsAdapter} />);
    const user = userEvent.setup();

    await user.press(
      await rendered.findByRole('button', { name: 'Use speech' }),
    );
    await user.press(
      rendered.getByRole('button', { name: 'Show unavailable example' }),
    );
    expect(rendered.getByTestId('speech-failure-state')).toBeTruthy();
    await user.press(
      rendered.getByRole('button', { name: 'Enter sale yourself' }),
    );

    expect(await rendered.findByText('What did you earn today?')).toBeTruthy();
    expect(rendered.getByLabelText('Amount')).toBeTruthy();
    expect(mockRunAsync).not.toHaveBeenCalled();
  });

  it('uses visible and named French speech controls', async () => {
    const rendered = await render(<AppView ttsAdapter={mockTtsAdapter} />);
    const user = userEvent.setup();

    await user.press(await rendered.findByText('FR'));
    expect(mockTtsStop).toHaveBeenCalled();
    await user.press(
      rendered.getByRole('button', { name: 'Utiliser la parole' }),
    );
    expect(
      rendered.getByText(
        'Exemple de prototype : ceci ne vous enregistre pas et ne vous transcrit pas.',
      ),
    ).toBeTruthy();
    expect(
      rendered.getByRole('button', {
        name: 'Utiliser l’exemple du prototype',
      }),
    ).toBeTruthy();
  });
});
