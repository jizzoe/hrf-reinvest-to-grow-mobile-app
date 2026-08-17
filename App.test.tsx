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

describe('Home-first manual entry flow', () => {
  it('opens Home before a synthetic sale can be reviewed', async () => {
    const rendered = await render(<App />);
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
});
