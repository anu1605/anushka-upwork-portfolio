import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import Icon from './Icon.jsx';
import Flash from './Flash.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { api } from '../lib/api.js';

/**
 * Admin chrome — shared by every signed-in admin screen.
 */
export default function AdminLayout() {
    const { settings } = useData();
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    const reloadStats = useCallback(() => {
        api('/admin/api/stats')
            .then((response) => setStats(response.data))
            .catch(() => {
                /* the badge is decorative — ignore failures */
            });
    }, []);

    useEffect(() => {
        reloadStats();
    }, [location.pathname, reloadStats]);

    async function handleLogout() {
        await logout();
        navigate('/admin/login');
    }

    return (
        <div className="admin-body">
            <a className="skip-link" href="#main">
                Skip to content
            </a>

            <header className="site-header">
                <div className="container header-inner">
                    <Link className="brand" to="/admin">
                        <span className="brand-mark" aria-hidden="true">
                            AT
                        </span>
                        <span className="brand-text">
                            <strong>Admin</strong>
                            <small>{settings?.name ?? ''}</small>
                        </span>
                    </Link>

                    <nav className="site-nav" id="site-nav" aria-label="Admin">
                        <ul>
                            <li>
                                <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
                                    Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/projects"
                                    className={({ isActive }) => (isActive ? 'is-active' : '')}
                                >
                                    Projects
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/admin/messages"
                                    className={({ isActive }) => (isActive ? 'is-active' : '')}
                                >
                                    Messages
                                    {stats?.unreadCount > 0 ? (
                                        <span className="badge">{stats.unreadCount}</span>
                                    ) : null}
                                </NavLink>
                            </li>
                            <li>
                                <a href="/" target="_blank" rel="noopener">
                                    View site
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div className="header-actions">
                        <span className="admin-user">
                            <Icon name="user" />
                            {user?.name ?? ''}
                        </span>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                            Sign out
                        </button>
                        <button
                            type="button"
                            className="theme-toggle"
                            onClick={toggle}
                            aria-label="Toggle colour theme"
                            aria-pressed={theme === 'light' ? 'true' : 'false'}
                        >
                            <Icon name="sun" className="icon icon-sun" />
                            <Icon name="moon" className="icon icon-moon" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="site-main admin-main" id="main">
                <div className="container">
                    <Flash />
                    <Outlet context={{ stats, reloadStats }} />
                </div>
            </main>
        </div>
    );
}
