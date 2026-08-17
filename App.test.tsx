import { render, userEvent, waitFor } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: async () => ({
    execAsync: async () => undefined,
    getAllAsync: async () => [],
    getFirstAsync: async () => null,
    withExclusiveTransactionAsync: async (
      task: (transaction: {
        runAsync: () => Promise<{ changes: number; lastInsertRowId: number }>;
      }) => Promise<void>,
    ) => task({ runAsync: async () => ({ changes: 1, lastInsertRowId: 1 }) }),
  }),
}));

jest.mock('expo-crypto', () => ({ randomUUID: () => 'app-test-transaction' }));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

import App from './App';

describe('manual entry screen', () => {
  it('requires review before saving a synthetic sale', async () => {
    const rendered = await render(<App />);
    const user = userEvent.setup();

    const reviewButton = await rendered.findByRole('button', {
      name: 'Review entry',
    });
    await user.type(rendered.getByLabelText('Amount'), '150');
    await user.type(
      rendered.getByLabelText('Category or purpose'),
      'Synthetic market sale',
    );
    await user.press(reviewButton);

    await waitFor(() =>
      expect(rendered.getByText('Review before saving')).toBeTruthy(),
    );
    expect(rendered.getByText('Waiting to sync')).toBeTruthy();
  });
});
