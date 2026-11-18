import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Seo } from '../../context/HeadContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useFlash } from '../../context/FlashContext.jsx';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';

export default function MessageDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error: showError } = useFlash();
    const { csrfCookie } = useData();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api(`/admin/api/messages/${id}`)
            .then((response) => setMessage(response.data))
            .catch((error) => {
                showError(error.message);
                navigate('/admin/messages');
            })
            .finally(() => setLoading(false));
    }, [id, navigate, showError]);

    async function handleDelete() {
        const confirmed = window.confirm('Delete this message?');

        if (!confirmed) {
            return;
        }

        try {
            await api(`/admin/api/messages/${id}`, { method: 'DELETE', csrfCookie });

            success('Message deleted.');
            navigate('/admin/messages');
        } catch (error) {
            showError(error.message);
        }
    }

    if (loading) {
        return <p className="muted">Loading message…</p>;
    }

    return (
        <>
            <Seo title={message.subject} description="Contact form submission." />

            <div className="admin-head">
                <div>
                    <p className="muted">
                        <Link className="link-arrow" to="/admin/messages">
                            Back to messages
                        </Link>
                    </p>
                    <h1 className="admin-title">{message.subject}</h1>
                </div>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Delete
                </button>
            </div>

            <section className="card message-detail">
                <dl className="meta-list">
                    <div>
                        <dt>From</dt>
                        <dd>{message.name}</dd>
                    </div>
                    <div>
                        <dt>Received</dt>
                        <dd>{formatDate(message.created_at)}</dd>
                    </div>
                    <div>
                        <dt>Status</dt>
                        <dd>{Number(message.is_read) === 0 ? 'Unread' : 'Read'}</dd>
                    </div>
                </dl>

                <div className="message-body">
                    {String(message.body)
                        .split(/\n{2,}/)
                        .map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                </div>
            </section>
        </>
    );
}
