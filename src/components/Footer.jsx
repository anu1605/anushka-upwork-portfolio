import { Link } from 'react-router-dom';

import { useData } from '../context/DataContext.jsx';

export default function Footer() {
    const { profile, settings } = useData();
    const year = new Date().getFullYear();
    const base = settings?.url ?? '';

    return (
        <footer className="site-footer">
            <div className="container footer-grid">
                <div className="footer-col">
                    <Link className="brand" to="/">
                        <span className="brand-mark" aria-hidden="true">
                            AT
                        </span>
                        <span className="brand-text">
                            <strong>{profile?.name ?? ''}</strong>
                            <small>{profile?.role ?? ''}</small>
                        </span>
                    </Link>
                    <p className="footer-blurb">{profile?.tagline ?? ''}</p>
                </div>

                <div className="footer-col">
                    <h3>Navigate</h3>
                    <ul className="footer-links">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/projects">Projects</Link>
                        </li>
                        <li>
                            <Link to="/about">About</Link>
                        </li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h3>Focus areas</h3>
                    <ul className="footer-links">
                        <li>Payment integrations</li>
                        <li>Marketplace &amp; POS</li>
                        <li>CMS connectors</li>
                        <li>Performance &amp; PWA</li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h3>Location</h3>
                    <ul className="footer-links">
                        <li>{profile?.location ?? ''}</li>
                    </ul>
                </div>
            </div>

            <div className="container footer-bottom">
                <p>
                    &copy; {year} {profile?.name ?? ''}. Built with React.
                </p>
                <p className="footer-links-inline">
                    <a href={`${base}/sitemap.xml`}>Sitemap</a>
                    <a href={`${base}/api/projects`}>JSON API</a>
                </p>
            </div>
        </footer>
    );
}
