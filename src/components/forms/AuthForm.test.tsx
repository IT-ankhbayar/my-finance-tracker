import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Mail, LogIn } from 'lucide-react';
import {
  AuthField,
  AuthFooterLink,
  AuthInput,
  AuthPageShell,
  AuthSubmitButton,
} from './AuthForm';

afterEach(() => {
  cleanup();
});

describe('AuthForm primitives', () => {
  it('renders field error text', () => {
    render(
      <AuthField label="И-мэйл" error="Алдаа">
        <input />
      </AuthField>,
    );

    expect(screen.getByText('И-мэйл')).toBeTruthy();
    expect(screen.getByText('Алдаа')).toBeTruthy();
  });

  it('applies invalid styling to auth input', () => {
    const { container } = render(<AuthInput icon={<Mail size={16} />} invalid type="email" />);

    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.className).toContain('border-red-300');
  });

  it('renders loading state for auth submit button', () => {
    render(
      <AuthSubmitButton
        loading
        loadingText="Уншиж байна..."
        idleText="Илгээх"
        icon={<LogIn size={18} />}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Уншиж байна...')).toBeTruthy();
  });

  it('renders auth page shell footer link', () => {
    render(
      <AuthPageShell
        subtitle="Туршилтын тайлбар"
        heading="Нэвтрэх"
        footer={<AuthFooterLink prompt="Бүртгэлгүй юу?" href="/register" label="Бүртгүүлэх" />}
      >
        <form />
      </AuthPageShell>,
    );

    expect(screen.getByText('MyFinance')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Бүртгүүлэх' }).getAttribute('href')).toBe('/register');
  });
});
