import { Link } from 'react-router-dom';

import { Seo } from '../context/HeadContext.jsx';

export default function NotFound() {
    return (
        <>
            <Seo title="Page not found" description="The page you are looking for does not exist." status={404} />

            <section className="error-page">
                <div className="container">
                    <p className="error-code">404</p>
                    <h1 className="page-title">This page slipped off the radar</h1>
                    <p className="page-lead">
                        The page you are looking for does not exist or has been moved.
                    </p>

                    <div className="hero-actions">
                        <Link className="btn btn-primary" to="/">
                            Back to home
                        </Link>
                        <Link className="btn btn-ghost" to="/projects">
                            Browse projects
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
