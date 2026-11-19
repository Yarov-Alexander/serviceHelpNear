import type { ProfileData } from "./types";

export type ProfileErrors = Partial<Record<"name" | "email" | "phone", string>>;
export type PasswordErrors = Partial<Record<"current" | "next" | "repeat", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateProfile(data: ProfileData): ProfileErrors {
  const errors: ProfileErrors = {};

  if (data.name.trim().length < 2) {
    errors.name = "Введите имя и фамилию";
  }
  if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = "Проверьте email — например, name@mail.ru";
  }
  const phone = data.phone.trim();
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      errors.phone = "Телефон: от 10 до 15 цифр";
    }
  }

  return errors;
}

export function validatePassword(current: string, next: string, repeat: string): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!current) {
    errors.current = "Введите текущий пароль";
  }
  if (next.length < 8) {
    errors.next = "Минимум 8 символов";
  } else if (next === current) {
    errors.next = "Новый пароль должен отличаться от текущего";
  }
  if (repeat !== next) {
    errors.repeat = "Пароли не совпадают";
  }

  return errors;
}
