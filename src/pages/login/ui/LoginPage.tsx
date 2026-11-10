

export function LoginPage() {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
    };

    return (
        <>
            <div className="login">
                <form onSubmit={handleSubmit} className="login__form">
                    <input type="email" className="login__email" placeholder="Email" />
                    <input type="password" className="login__password" placeholder="Password" />
                    <button type="submit" className="login__submit">Login</button>
                </form>
            </div>
        </>
    )
}