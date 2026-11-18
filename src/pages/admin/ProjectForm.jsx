import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Seo } from '../../context/HeadContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useFlash } from '../../context/FlashContext.jsx';
import { api } from '../../lib/api.js';

const blank = {
    title: '',
    slug: '',
    summary: '',
    description: '',
    highlights: '',
    category: '',
    tech_stack: '',
    client: '',
    role: '',
    year: String(new Date().getFullYear()),
    demo_url: '',
    repo_url: '',
    status: 'published',
    featured: false,
    sort_order: 0,
};

export default function ProjectForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { success, error: showError } = useFlash();
    const { csrfCookie } = useData();

    const [form, setForm] = useState(blank);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (!isEdit) {
            return;
        }

        api(`/admin/api/projects/${id}`)
            .then((response) => {
                const project = response.data;

                setForm({
                    ...blank,
                    ...project,
                    featured: Number(project.featured) === 1,
                    highlights: String(project.highlights ?? ''),
                });
            })
            .catch((error) => {
                showError(error.message);
                navigate('/admin/projects');
            })
            .finally(() => setLoading(false));
    }, [id, isEdit, navigate, showError]);

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setErrors({});

        try {
            if (isEdit) {
                await api(`/admin/api/projects/${id}`, { method: 'PUT', body: form, csrfCookie });
                success('Project updated.');
            } else {
                await api('/admin/api/projects', { method: 'POST', body: form, csrfCookie });
                success('Project created.');
            }

            navigate('/admin/projects');
        } catch (error) {
            setErrors(error.errors ?? {});
            showError(error.message);
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return <p className="muted">Loading project…</p>;
    }

    return (
        <>
            <Seo title={isEdit ? 'Edit project' : 'New project'} description="Create or update a portfolio project." />

            <div className="admin-head">
                <div>
                    <h1 className="admin-title">{isEdit ? 'Edit project' : 'New project'}</h1>
                    <p className="muted">
                        <Link className="link-arrow" to="/admin/projects">
                            Back to projects
                        </Link>
                    </p>
                </div>
            </div>

            <form className="admin-form" onSubmit={handleSubmit} noValidate>
                <section className="card">
                    <h2>Basics</h2>

                    <div className="form-field">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            maxLength={180}
                            value={form.title}
                            onChange={(event) => update('title', event.target.value)}
                        />
                        {errors.title ? <p className="field-error">{errors.title[0]}</p> : null}
                    </div>

                    <div className="form-field">
                        <label htmlFor="slug">Slug</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            required
                            maxLength={160}
                            value={form.slug}
                            placeholder="payment-gateway-integration"
                            onChange={(event) => update('slug', event.target.value)}
                        />
                        <p className="field-hint">Used in the URL: /projects/&lt;slug&gt;</p>
                        {errors.slug ? <p className="field-error">{errors.slug[0]}</p> : null}
                    </div>

                    <div className="form-field">
                        <label htmlFor="summary">Summary</label>
                        <textarea
                            id="summary"
                            name="summary"
                            rows={3}
                            required
                            maxLength={400}
                            value={form.summary}
                            onChange={(event) => update('summary', event.target.value)}
                        ></textarea>
                        {errors.summary ? <p className="field-error">{errors.summary[0]}</p> : null}
                    </div>

                    <div className="form-field">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={8}
                            required
                            value={form.description}
                            onChange={(event) => update('description', event.target.value)}
                        ></textarea>
                        <p className="field-hint">Separate paragraphs with a blank line.</p>
                        {errors.description ? <p className="field-error">{errors.description[0]}</p> : null}
                    </div>

                    <div className="form-field">
                        <label htmlFor="highlights">Highlights</label>
                        <textarea
                            id="highlights"
                            name="highlights"
                            rows={4}
                            value={form.highlights}
                            placeholder={'One highlight per line'}
                            onChange={(event) => update('highlights', event.target.value)}
                        ></textarea>
                        {errors.highlights ? <p className="field-error">{errors.highlights[0]}</p> : null}
                    </div>
                </section>

                <section className="card">
                    <h2>Details</h2>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="category">Category</label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                required
                                maxLength={80}
                                value={form.category}
                                onChange={(event) => update('category', event.target.value)}
                            />
                            {errors.category ? <p className="field-error">{errors.category[0]}</p> : null}
                        </div>

                        <div className="form-field">
                            <label htmlFor="tech_stack">Tech stack</label>
                            <input
                                type="text"
                                id="tech_stack"
                                name="tech_stack"
                                required
                                maxLength={400}
                                value={form.tech_stack}
                                placeholder="PHP, Stripe, MySQL"
                                onChange={(event) => update('tech_stack', event.target.value)}
                            />
                            {errors.tech_stack ? <p className="field-error">{errors.tech_stack[0]}</p> : null}
                        </div>

                        <div className="form-field">
                            <label htmlFor="client">Client</label>
                            <input
                                type="text"
                                id="client"
                                name="client"
                                maxLength={120}
                                value={form.client}
                                onChange={(event) => update('client', event.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="role">Role</label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                maxLength={120}
                                value={form.role}
                                onChange={(event) => update('role', event.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="year">Year</label>
                            <input
                                type="text"
                                id="year"
                                name="year"
                                maxLength={12}
                                value={form.year}
                                onChange={(event) => update('year', event.target.value)}
                            />
                            {errors.year ? <p className="field-error">{errors.year[0]}</p> : null}
                        </div>

                        <div className="form-field">
                            <label htmlFor="demo_url">Demo URL</label>
                            <input
                                type="url"
                                id="demo_url"
                                name="demo_url"
                                value={form.demo_url}
                                onChange={(event) => update('demo_url', event.target.value)}
                            />
                            {errors.demo_url ? <p className="field-error">{errors.demo_url[0]}</p> : null}
                        </div>

                        <div className="form-field">
                            <label htmlFor="repo_url">Repository URL</label>
                            <input
                                type="url"
                                id="repo_url"
                                name="repo_url"
                                value={form.repo_url}
                                onChange={(event) => update('repo_url', event.target.value)}
                            />
                            {errors.repo_url ? <p className="field-error">{errors.repo_url[0]}</p> : null}
                        </div>
                    </div>
                </section>

                <section className="card">
                    <h2>Publishing</h2>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={(event) => update('status', event.target.value)}
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                            {errors.status ? <p className="field-error">{errors.status[0]}</p> : null}
                        </div>

                        <div className="form-field">
                            <label htmlFor="sort_order">Sort order</label>
                            <input
                                type="number"
                                id="sort_order"
                                name="sort_order"
                                value={form.sort_order}
                                onChange={(event) => update('sort_order', Number(event.target.value))}
                            />
                        </div>
                    </div>

                    <label className="checkbox">
                        <input
                            type="checkbox"
                            name="featured"
                            checked={form.featured}
                            onChange={(event) => update('featured', event.target.checked)}
                        />
                        <span>Feature on the home page</span>
                    </label>
                </section>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                        {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
                    </button>
                    <Link className="btn btn-ghost" to="/admin/projects">
                        Cancel
                    </Link>
                </div>
            </form>
        </>
    );
}
