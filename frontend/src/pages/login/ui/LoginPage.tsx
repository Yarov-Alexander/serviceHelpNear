import { Link } from "react-router";
import './LoginPage.scss';
import {useId} from "react";
import {useState} from "react";

export function LoginPage() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(values);
    };
    const loginId = useId();

    return (
        <>
            <div className="login">
                <form onSubmit={handleSubmit} className="login__form">
                    <label htmlFor={`${loginId}-email`} className="login__label">Введите email</label>
                    <input 
                        id={`${loginId}-email`} 
                        type="email" 
                        name="email" 
                        className="login__input" 
                        placeholder="Email" 
                        value={values.email}
                        onChange={handleChange}
                    />
                    <label htmlFor={`${loginId}-password`} className="login__label">Введите password</label>
                    <input 
                        id={`${loginId}-password`} 
                        type="password" 
                        name="password" 
                        className="login__input" 
                        placeholder="Password" 
                        value={values.password}
                        onChange={handleChange}
                    />
                    <button 
                        type="submit" 
                        className="login__submit"
                    >
                        Login
                    </button>
                    <Link to="/register" className="login__register-link">
                        Зарегистрироваться
                    </Link>
                </form>
            </div>
        </>
    )
    
}