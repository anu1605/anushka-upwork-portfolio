import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Seo } from '../../context/HeadContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';

export default function Dashboard() {
    const { profile } = useData();
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        let cancelled = false;

        Promise.all([api('/admin/api/stats'), api('/admin/api/messages')])
            .then(([statsResponse, messagesResponse]) => {
                if (cancelled) {
                    return;
                }

                setStats(statsResponse.data);
                setRecent(messagesResponse.data.slice(0, 5));
            })
            .catch(() => {
                /* handled by the empty state */
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <Seo title="Dashboard" description="Overview of your portfolio content." />

            <div className="admin-head">
                <div>
                    <h1 className="admin-title">Dashboard</h1>
                    <p className="muted">Overview of your portfolio content.</p>
                </div>
                <Link className="btn btn-primary" to="/admin/projects/create">
                    New project
                </Link>
            </div>

            <div className="grid grid-4 stat-cards">
                <div className="card stat-card">
                    <span className="muted">Projects</span>
                    <strong>{stats?.projectCount ?? 0}</strong>
                </div>
                <div className="card stat-card">
                    <span className="muted">Messages</span>
                    <strong>{stats?.messageCount ?? 0}</strong>
                </div>
                <div className="card stat-card">
                    <span className="muted">Unread</span>
                    <strong>{stats?.unreadCount ?? 0}</strong>
                </div>
                <div className="card stat-card">
                    <span className="muted">Profile</span>
                    <strong className="stat-text">{profile?.name ?? ''}</strong>
                </div>
            </div>

            <div className="grid grid-2 admin-columns">
                <section className="card">
                    <div className="card-head">
                        <h2>Recent messages</h2>
                        <Link className="link-arrow" to="/admin/messages">
                            View all
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <p className="muted">No messages yet.</p>
                    ) : (
                        <ul className="message-list">
                            {recent.map((message) => (
                                <li key={message.id}>
                                    <Link to={`/admin/messages/${message.id}`}>
                                        <span className="message-subject">
                                            {Number(message.is_read) === 0 ? (
                                                <span className="unread-dot" aria-label="Unread"></span>
                                            ) : null}
                                            {message.subject}
                                        </span>
                                        <span className="muted">
                                            {message.name} &middot; {formatDate(message.created_at)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="card">
                    <div className="card-head">
                        <h2>Quick links</h2>
                    </div>
                    <ul className="quick-links">
                        <li>
                            <Link to="/admin/projects">
                                Manage projects <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/messages">
                                Read messages <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </li>
                        <li>
                            <a href="/" target="_blank" rel="noopener">
                                Open live site <span aria-hidden="true">&rarr;</span>
                            </a>
                        </li>
                        <li>
                            <a href="/sitemap.xml" target="_blank" rel="noopener">
                                View sitemap <span aria-hidden="true">&rarr;</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </div>
        </>
    );
}
