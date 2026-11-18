import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Seo } from '../../context/HeadContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useFlash } from '../../context/FlashContext.jsx';
import { api } from '../../lib/api.js';

export default function ProjectsAdmin() {
    const { csrfCookie } = useData();
    const { success, error: showError } = useFlash();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const response = await api('/admin/api/projects');

            setProjects(response.data);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleDelete(project) {
        const confirmed = window.confirm(`Delete “${project.title}”? This cannot be undone.`);

        if (!confirmed) {
            return;
        }

        try {
            await api(`/admin/api/projects/${project.id}`, { method: 'DELETE', csrfCookie });

            success('Project deleted.');
            await load();
        } catch (error) {
            showError(error.message);
        }
    }

    const visible = filter === 'all' ? projects : projects.filter((project) => project.status === filter);

    return (
        <>
            <Seo title="Projects" description="Manage portfolio projects." />

            <div className="admin-head">
                <div>
                    <h1 className="admin-title">Projects</h1>
                    <p className="muted">{projects.length} total</p>
                </div>
                <Link className="btn btn-primary" to="/admin/projects/create">
                    New project
                </Link>
            </div>

            <div className="filter-bar">
                <div className="filter-chips">
                    {['all', 'published', 'draft'].map((status) => (
                        <button
                            type="button"
                            key={status}
                            className={`chip${filter === status ? ' is-active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status === 'all' ? 'All' : status}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="muted">Loading projects…</p>
            ) : visible.length === 0 ? (
                <div className="empty-state">
                    <h2>Nothing here yet</h2>
                    <p>Create your first project to show it on the public site.</p>
                    <Link className="btn btn-primary" to="/admin/projects/create">
                        New project
                    </Link>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Year</th>
                                <th>Status</th>
                                <th>Featured</th>
                                <th aria-label="Actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        <Link className="table-title" to={`/admin/projects/${project.id}/edit`}>
                                            {project.title}
                                        </Link>
                                        <small className="muted">/{project.slug}</small>
                                    </td>
                                    <td>{project.category}</td>
                                    <td>{project.year}</td>
                                    <td>
                                        <span className={`status status-${project.status}`}>{project.status}</span>
                                    </td>
                                    <td>{Number(project.featured) === 1 ? '★' : '—'}</td>
                                    <td className="actions-cell">
                                        <Link className="btn btn-ghost btn-sm" to={`/admin/projects/${project.id}/edit`}>
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(project)}
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
