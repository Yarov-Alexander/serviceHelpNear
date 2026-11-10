import { Link } from "react-router";
import { useId, useState } from "react";
import { useDebounce } from "./useDebounce";
import './RegisterPage.scss';

export function RegisterPage() {
    const id = useId();

    const [values, setValues] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
        setSubmitError('');
    };


    const debouncedPassword = useDebounce(values.password, 500);
    const debouncedConfirm = useDebounce(values.confirmPassword, 500);
    const passwordsMismatch =
        debouncedConfirm !== '' && debouncedPassword !== debouncedConfirm;

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (passwordsMismatch) {
            setSubmitError('Пароли не совпадают');
            return;
        }

        const { confirmPassword, ...payload } = values;
        console.log(payload); //Отправка данных на сервер или другая логика
    };

    const error = submitError || (passwordsMismatch ? 'Пароли не совпадают' : '');

    return (
        <div className="register">
            <form onSubmit={handleSubmit} className="register__form">
                <div className="register__row">
                    <div className="register__field">
                        <label htmlFor={`${id}-firstName`} className="register__label">Имя</label>
                        <input
                            id={`${id}-firstName`}
                            name="firstName"
                            type="text"
                            className="register__input"
                            placeholder="Иван"
                            autoComplete="given-name"
                            value={values.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="register__field">
                        <label htmlFor={`${id}-lastName`} className="register__label">Фамилия</label>
                        <input
                            id={`${id}-lastName`}
                            name="lastName"
                            type="text"
                            className="register__input"
                            placeholder="Иванов"
                            autoComplete="family-name"
                            value={values.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="register__field">
                    <label htmlFor={`${id}-phone`} className="register__label">Телефон</label>
                    <input
                        id={`${id}-phone`}
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        className="register__input"
                        placeholder="+7 900 123-45-67"
                        autoComplete="tel"
                        minLength={10}
                        value={values.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="register__field">
                    <label htmlFor={`${id}-email`} className="register__label">Введите email</label>
                    <input
                        id={`${id}-email`}
                        name="email"
                        type="email"
                        className="register__input"
                        placeholder="Email"
                        autoComplete="email"
                        value={values.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="register__field">
                    <label htmlFor={`${id}-password`} className="register__label">Введите password</label>
                    <input
                        id={`${id}-password`}
                        name="password"
                        type="password"
                        className="register__input"
                        placeholder="Password"
                        autoComplete="new-password"
                        minLength={8}
                        value={values.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="register__field">
                    <label htmlFor={`${id}-confirmPassword`} className="register__label">Повторите password</label>
                    <input
                        id={`${id}-confirmPassword`}
                        name="confirmPassword"
                        type="password"
                        className="register__input"
                        placeholder="Password"
                        autoComplete="new-password"
                        aria-invalid={!!error}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <p className="register__error" role="alert">{error}</p>}

                <button type="submit" className="register__submit">Зарегистрироваться</button>

                <Link to="/login" className="register__login-link">
                    Уже есть аккаунт? Войти
                </Link>
            </form>
        </div>
    );
}