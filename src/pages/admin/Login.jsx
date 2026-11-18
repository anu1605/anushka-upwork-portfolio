import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Seo } from '../../context/HeadContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';

export default function Login() {
    const { user, login } = useAuth();
    const { settings } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    if (user) {
        return <Navigate to="/admin" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setError(null);

        try {
            await login(username, password);
            navigate(location.state?.from ?? '/admin', { replace: true });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Seo title="Admin sign in" description="Sign in to manage the portfolio." status={200} />

            <section className="admin-login">
                <div className="container">
                    <div className="card auth-card">
                        <div className="auth-head">
                            <span className="brand-mark brand-mark-lg" aria-hidden="true">
                                AT
                            </span>
                            <h1>Admin sign in</h1>
                            <p className="muted">Manage projects and messages for {settings?.name ?? 'the site'}.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={username}
                                    required
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(event) => setUsername(event.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    required
                                    autoComplete="current-password"
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                            </div>

                            {error ? <p className="field-error">{error}</p> : null}

                            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                                {busy ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>

                        <p className="auth-hint muted">
                            Default credentials come from <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> in
                            your <code>.env</code> file.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
