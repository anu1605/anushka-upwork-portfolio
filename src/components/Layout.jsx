import { Outlet, useLocation } from 'react-router-dom';

import Flash from './Flash.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import { useReveal } from '../hooks/useReveal.js';

/**
 * Public page chrome: header, main region and footer.
 */
export default function Layout() {
    const location = useLocation();
    const mainRef = useReveal(location.pathname);

    return (
        <>
            <a className="skip-link" href="#main">
                Skip to content
            </a>

            <Header />

            <main id="main" className="site-main" ref={mainRef}>
                <Flash />
                <Outlet />
            </main>

            <Footer />
        </>
    );
}
