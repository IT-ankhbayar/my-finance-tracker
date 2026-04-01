export type LoginErrors = {
  email?: string;
  password?: string;
};

export type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export type TransactionErrors = {
  title?: string;
  amount?: string;
  category?: string;
};

export function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export function validateLoginForm(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};

  if (!email.trim()) errors.email = 'И-мэйл хаяг оруулна уу';
  else if (!isValidEmail(email)) errors.email = 'Зөв и-мэйл хаяг оруулна уу';

  if (!password) errors.password = 'Нууц үг оруулна уу';
  else if (password.length < 6) errors.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байна';

  return errors;
}

export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirm: string,
): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!name.trim()) errors.name = 'Нэр оруулна уу';

  if (!email.trim()) errors.email = 'И-мэйл хаяг оруулна уу';
  else if (!isValidEmail(email)) errors.email = 'Зөв и-мэйл хаяг оруулна уу';

  if (!password) errors.password = 'Нууц үг оруулна уу';
  else if (password.length < 6) errors.password = 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой';

  if (!confirm) errors.confirm = 'Нууц үгээ давтаж оруулна уу';
  else if (password !== confirm) errors.confirm = 'Нууц үг таарахгүй байна';

  return errors;
}

export function validateTransactionForm(
  title: string,
  amount: string,
  category: string,
): TransactionErrors {
  const errors: TransactionErrors = {};

  if (!title.trim()) errors.title = 'Тайлбар оруулна уу';

  const parsedAmount = Number(amount);
  if (!amount.trim()) errors.amount = 'Дүн оруулна уу';
  else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) errors.amount = '0-ээс их дүн оруулна уу';

  if (!category) errors.category = 'Ангилал сонгоно уу';

  return errors;
}
