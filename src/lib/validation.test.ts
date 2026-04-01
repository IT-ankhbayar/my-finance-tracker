import { describe, expect, it } from 'vitest';
import {
  isValidEmail,
  validateLoginForm,
  validateRegisterForm,
  validateTransactionForm,
} from './validation';

describe('validation helpers', () => {
  it('validates email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('bad-email')).toBe(false);
  });

  it('validates login form fields', () => {
    expect(validateLoginForm('', '')).toEqual({
      email: 'И-мэйл хаяг оруулна уу',
      password: 'Нууц үг оруулна уу',
    });

    expect(validateLoginForm('bad', '123')).toEqual({
      email: 'Зөв и-мэйл хаяг оруулна уу',
      password: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна',
    });
  });

  it('validates register form fields', () => {
    expect(validateRegisterForm('', 'bad', '123', '456')).toEqual({
      name: 'Нэр оруулна уу',
      email: 'Зөв и-мэйл хаяг оруулна уу',
      password: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой',
      confirm: 'Нууц үг таарахгүй байна',
    });
  });

  it('validates transaction form fields', () => {
    expect(validateTransactionForm('', '', '')).toEqual({
      title: 'Тайлбар оруулна уу',
      amount: 'Дүн оруулна уу',
      category: 'Ангилал сонгоно уу',
    });

    expect(validateTransactionForm('Lunch', '-5', 'Хоол')).toEqual({
      amount: '0-ээс их дүн оруулна уу',
    });
  });
});
