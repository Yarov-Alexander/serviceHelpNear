import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ApiError } from "@/shared/api";
import { Field } from "@/shared/ui/Field";
import { ROUTES } from "@/shared/config";
import { register } from "../api/register";
import { REGISTER_VALIDATION } from "../model/types";
import "./RegisterForm.scss";

type RegisterValues = {
  email: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "executor";
};

export function RegisterForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterValues>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof RegisterValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      values.password.length < REGISTER_VALIDATION.password.minLength ||
      values.password.length > REGISTER_VALIDATION.password.maxLength
    ) {
      setError(
        `Пароль должен содержать от ${REGISTER_VALIDATION.password.minLength} до ${REGISTER_VALIDATION.password.maxLength} символов`,
      );
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await register({
        email: values.email,
        password: values.password,
        role: values.role,
      });
      navigate(ROUTES.login, { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError) setError(requestError.message);
      else if (requestError instanceof Error) setError(requestError.message);
      else throw requestError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register">
      <form onSubmit={handleSubmit} className="register__form">
        <Field
          id="register-email"
          label="Введите email"
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          required={REGISTER_VALIDATION.email.required}
        />
        <Field
          id="register-password"
          label="Введите пароль"
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={REGISTER_VALIDATION.password.minLength}
          maxLength={REGISTER_VALIDATION.password.maxLength}
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          required={REGISTER_VALIDATION.password.required}
        />
        <Field
          id="register-confirm-password"
          label="Повторите пароль"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          aria-invalid={Boolean(error)}
          onChange={(event) => update("confirmPassword", event.target.value)}
          required={REGISTER_VALIDATION.confirmPassword.required}
        />
        <label className="register__role-label" htmlFor="register-role">
          Тип аккаунта
          <select
            id="register-role"
            className="register__role"
            value={values.role}
            onChange={(event) => {
              const role = event.target.value;
              if (role === "customer" || role === "executor") {
                setValues((current) => ({ ...current, role }));
              }
            }}
          >
            <option value="customer">Заказчик</option>
            <option value="executor">Исполнитель</option>
          </select>
        </label>
        {error && <p className="register__error" role="alert">{error}</p>}
        <button type="submit" className="register__submit" disabled={isSubmitting}>
          {isSubmitting ? "Регистрируем..." : "Зарегистрироваться"}
        </button>
        <Link to={ROUTES.login} className="register__login-link">
          Уже есть аккаунт? Войти
        </Link>
      </form>
    </div>
  );
}