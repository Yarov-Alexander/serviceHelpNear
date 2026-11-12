import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { clearUser, getMe, setUser } from "@/entities/user";
import { ApiError, tokenStorage } from "@/shared/api";
import { Field } from "@/shared/ui/Field";
import { ROUTES } from "@/shared/config";
import { login } from "../api/login";
import { LOGIN_VALIDATION, type LoginRequest } from "../model/types";
import "./LoginForm.scss";

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState<LoginRequest>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof LoginRequest, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = await login(values);
      tokenStorage.set(token.access_token);
      setUser(await getMe());
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      navigate(destination ?? ROUTES.account, { replace: true });
    } catch (requestError) {
      tokenStorage.clear();
      clearUser();
      if (requestError instanceof ApiError) setError(requestError.message);
      else if (requestError instanceof Error) setError(requestError.message);
      else throw requestError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit} className="login__form">
        <Field
          id="login-email"
          label="Введите email"
          type="email"
          name="email"
          className="login__field"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          required={LOGIN_VALIDATION.email.required}
        />
        <Field
          id="login-password"
          label="Введите пароль"
          type="password"
          name="password"
          className="login__field"
          autoComplete="current-password"
          minLength={LOGIN_VALIDATION.password.minLength}
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          required={LOGIN_VALIDATION.password.required}
        />
        {error && <p className="login__error" role="alert">{error}</p>}
        <button type="submit" className="login__submit" disabled={isSubmitting}>
          {isSubmitting ? "Входим..." : "Войти"}
        </button>
        <Link to={ROUTES.register} className="login__register-link">
          Зарегистрироваться
        </Link>
      </form>
    </div>
  );
}