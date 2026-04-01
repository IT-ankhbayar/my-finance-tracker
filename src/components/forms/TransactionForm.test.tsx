import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  TransactionField,
  TransactionFormShell,
  TransactionInput,
  TransactionSelect,
  TransactionSubmitButton,
} from './TransactionForm';

afterEach(() => {
  cleanup();
});

describe('TransactionForm primitives', () => {
  it('renders transaction field error text', () => {
    render(
      <TransactionField label="Дүн" error="Шаардлагатай">
        <input />
      </TransactionField>,
    );

    expect(screen.getByText('Дүн')).toBeTruthy();
    expect(screen.getByText('Шаардлагатай')).toBeTruthy();
  });

  it('applies invalid styling to transaction input', () => {
    render(<TransactionInput accent="blue" invalid type="number" />);

    const input = screen.getByRole('spinbutton');
    expect(input.className).toContain('border-red-300');
  });

  it('renders transaction select options', () => {
    render(
      <TransactionSelect accent="green" defaultValue="Хоол">
        <option value="Хоол">Хоол</option>
        <option value="Унаа">Унаа</option>
      </TransactionSelect>,
    );

    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Хоол' })).toBeTruthy();
  });

  it('renders loading state for transaction submit button', () => {
    render(
      <TransactionSubmitButton
        accent="green"
        loading
        loadingText="Хадгалж байна..."
        idleText="Хадгалах"
      />,
    );

    const button = screen.getByRole('button');
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Хадгалж байна...')).toBeTruthy();
  });

  it('renders transaction shell back link', () => {
    render(
      <TransactionFormShell title="Шинэ орлого">
        <form />
      </TransactionFormShell>,
    );

    expect(screen.getByText('Шинэ орлого')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Буцах' }).getAttribute('href')).toBe('/');
  });
});
