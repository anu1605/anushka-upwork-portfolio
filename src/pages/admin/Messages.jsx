import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Seo } from '../../context/HeadContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useFlash } from '../../context/FlashContext.jsx';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';

export default function Messages() {
    const { csrfCookie } = useData();
    const { success, error: showError } = useFlash();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const response = await api('/admin/api/messages');

            setMessages(response.data);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleDelete(message) {
        const confirmed = window.confirm(`Delete the message from ${message.name}?`);

        if (!confirmed) {
            return;
        }

        try {
            await api(`/admin/api/messages/${message.id}`, { method: 'DELETE', csrfCookie });

            success('Message deleted.');
            await load();
        } catch (error) {
            showError(error.message);
        }
    }

    async function toggleRead(message) {
        try {
            const route = Number(message.is_read) === 0 ? 'read' : 'unread';

            await api(`/admin/api/messages/${message.id}/${route}`, { method: 'POST' });
            await load();
        } catch (error) {
            showError(error.message);
        }
    }

    const unread = messages.filter((message) => Number(message.is_read) === 0).length;
    const visible =
        filter === 'all' ? messages : filter === 'unread' ? messages.filter((m) => Number(m.is_read) === 0) : messages.filter((m) => Number(m.is_read) === 1);

    return (
        <>
            <Seo title="Messages" description="Read and manage contact form submissions." />

            <div className="admin-head">
                <div>
                    <h1 className="admin-title">Messages</h1>
                    <p className="muted">
                        {messages.length} total &middot; {unread} unread
                    </p>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-chips">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'unread', label: `Unread${unread > 0 ? ` (${unread})` : ''}` },
                        { key: 'read', label: 'Read' },
                    ].map((option) => (
                        <button
                            type="button"
                            key={option.key}
                            className={`chip${filter === option.key ? ' is-active' : ''}`}
                            onClick={() => setFilter(option.key)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="muted">Loading messages…</p>
            ) : visible.length === 0 ? (
                <div className="empty-state">
                    <h2>No messages</h2>
                    <p>Submissions from the contact form will appear here.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>From</th>
                                <th>Received</th>
                                <th aria-label="Actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((message) => (
                                <tr key={message.id} className={Number(message.is_read) === 0 ? 'is-unread' : ''}>
                                    <td>
                                        <Link className="table-title" to={`/admin/messages/${message.id}`}>
                                            {Number(message.is_read) === 0 ? <span className="unread-dot"></span> : null}
                                            {message.subject}
                                        </Link>
                                    </td>
                                    <td>{message.name}</td>
                                    <td>{formatDate(message.created_at)}</td>
                                    <td className="actions-cell">
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleRead(message)}>
                                            {Number(message.is_read) === 0 ? 'Mark read' : 'Mark unread'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(message)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
