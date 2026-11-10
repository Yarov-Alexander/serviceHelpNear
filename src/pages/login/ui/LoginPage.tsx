import { Link } from "react-router";
import './LoginPage.scss';
import {useId} from "react";

export function LoginPage() {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
    };
    const emailInputId = useId();
    const passwordInputId = useId();

    return (
        <>
            <div className="login">
                <form onSubmit={handleSubmit} className="login__form">
                    <label htmlFor={emailInputId} className="login__label">Введите email</label>
                    <input id={emailInputId} type="email" className="login__input" placeholder="Email" />
                    <label htmlFor={passwordInputId} className="login__label">Введите password</label>
                    <input id={passwordInputId} type="password" className="login__input" placeholder="Password" />
                    <button type="submit" className="login__submit">Login</button>
                    <Link to="/register" className="login__register-link">
                        Зарегистрироваться
                    </Link>
                </form>
            </div>
        </>
    )
    
}