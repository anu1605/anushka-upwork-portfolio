import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { useData } from '../context/DataContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import Icon from './Icon.jsx';

const navigation = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' },
];

export default function Header() {
    const { profile } = useData();
    const { theme, toggle } = useTheme();
    const location = useLocation();
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        setNavOpen(false);
    }, [location.pathname]);

    return (
        <header className="site-header">
            <div className="container header-inner">
                <Link className="brand" to="/">
                    <span className="brand-mark" aria-hidden="true">
                        AT
                    </span>
                    <span className="brand-text">
                        <strong>{profile?.name ?? 'Portfolio'}</strong>
                        <small>{profile?.role ?? ''}</small>
                    </span>
                </Link>

                <nav className={`site-nav${navOpen ? ' is-open' : ''}`} id="site-nav" aria-label="Primary">
                    <ul>
                        {navigation.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    end={item.href === '/'}
                                    className={({ isActive }) => (isActive ? 'is-active' : '')}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="header-actions">
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

                    <button
                        type="button"
                        className="nav-toggle"
                        onClick={() => setNavOpen((open) => !open)}
                        aria-label="Toggle navigation"
                        aria-expanded={navOpen ? 'true' : 'false'}
                        aria-controls="site-nav"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
