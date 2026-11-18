import { Router } from 'express';

import { attempt, issueSession, requireAuth, verifyCsrf } from '../auth.js';
import { make as validate } from '../validate.js';
import * as messages from '../models/messages.js';
import * as projects from '../models/projects.js';

/**
 * Admin API — authentication, project CRUD and the contact inbox.
 */

export const adminRouter = Router();

adminRouter.post('/login', async (req, res) => {
    if (!verifyCsrf(req)) {
        return res.status(419).json({ error: 'Your session expired. Please refresh the page and try again.' });
    }

    const username = String(req.body?.username ?? '').trim();
    const password = String(req.body?.password ?? '');

    const user = await attempt(username, password);

    if (!user) {
        return res.status(422).json({ error: 'Those credentials do not match our records.' });
    }

    // Regenerate the session id on sign in to prevent session fixation.
    issueSession(res, user.id);

    return res.json({ data: user });
});

adminRouter.post('/logout', (req, res) => {
    issueSession(res, null);

    res.json({ data: { message: 'You have been signed out.' } });
});

adminRouter.get('/me', (req, res) => {
    res.json({ data: req.user ?? null });
});

/* --- Stats --------------------------------------------------------------- */

adminRouter.get('/stats', requireAuth, async (req, res) => {
    res.json({
        data: {
            projectCount: await projects.count(),
            messageCount: await messages.count(),
            unreadCount: await messages.unreadCount(),
        },
    });
});

/* --- Projects ------------------------------------------------------------ */

adminRouter.get('/projects', requireAuth, async (req, res) => {
    res.json({ data: await projects.all() });
});

adminRouter.get('/projects/:id', requireAuth, async (req, res) => {
    const project = await projects.find(req.params.id);

    if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ data: project });
});

adminRouter.post('/projects', requireAuth, async (req, res) => {
    if (!verifyCsrf(req)) {
        return res.status(419).json({ error: 'Your session expired. Please refresh the page and try again.' });
    }

    const validated = validateProject(req.body);

    if (validated.data === null) {
        return res.status(422).json({
            error: 'Please correct the highlighted fields.',
            errors: validated.errors,
        });
    }

    validated.data.slug = await projects.uniqueSlug(validated.data.slug);

    const project = await projects.create(validated.data);

    return res.status(201).json({ data: project });
});

adminRouter.put('/projects/:id', requireAuth, async (req, res) => {
    if (!verifyCsrf(req)) {
        return res.status(419).json({ error: 'Your session expired. Please refresh the page and try again.' });
    }

    const existing = await projects.find(req.params.id);

    if (!existing) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    const validated = validateProject({ ...existing, ...(req.body ?? {}) });

    if (validated.data === null) {
        return res.status(422).json({
            error: 'Please correct the highlighted fields.',
            errors: validated.errors,
        });
    }

    validated.data.slug = await projects.uniqueSlug(validated.data.slug, Number(req.params.id));

    const project = await projects.update(req.params.id, validated.data);

    return res.json({ data: project });
});

adminRouter.delete('/projects/:id', requireAuth, async (req, res) => {
    if (!verifyCsrf(req)) {
        return res.status(419).json({ error: 'Your session expired. Please refresh the page and try again.' });
    }

    const removed = await projects.remove(req.params.id);

    if (!removed) {
        return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ data: { message: 'Project deleted.' } });
});

/* --- Messages ------------------------------------------------------------ */

adminRouter.get('/messages', requireAuth, async (req, res) => {
    const rows = await messages.all();

    res.json({
        data: rows,
        meta: { count: rows.length, unread: await messages.unreadCount() },
    });
});

adminRouter.get('/messages/:id', requireAuth, async (req, res) => {
    const message = await messages.find(req.params.id);

    if (!message) {
        return res.status(404).json({ error: 'Message not found.' });
    }

    if (Number(message.is_read) === 0) {
        await messages.setRead(message.id, true);
        message.is_read = 1;
    }

    return res.json({ data: message });
});

adminRouter.post('/messages/:id/read', requireAuth, async (req, res) => {
    const message = await messages.setRead(req.params.id, true);

    if (!message) {
        return res.status(404).json({ error: 'Message not found.' });
    }

    return res.json({ data: message });
});

adminRouter.post('/messages/:id/unread', requireAuth, async (req, res) => {
    const message = await messages.setRead(req.params.id, false);

    if (!message) {
        return res.status(404).json({ error: 'Message not found.' });
    }

    return res.json({ data: message });
});

adminRouter.delete('/messages/:id', requireAuth, async (req, res) => {
    if (!verifyCsrf(req)) {
        return res.status(419).json({ error: 'Your session expired. Please refresh the page and try again.' });
    }

    const removed = await messages.remove(req.params.id);

    if (!removed) {
        return res.status(404).json({ error: 'Message not found.' });
    }

    return res.json({ data: { message: 'Message deleted.' } });
});

/**
 * Validate the project payload.
 *
 * Returns `{ data, errors }`. `data` is null when the payload is invalid.
 */
function validateProject(body = {}) {
    const validator = validate(body, {
        title: 'required|min:3|max:180',
        slug: 'required|slug|max:160',
        summary: 'required|max:400',
        description: 'required|min:20',
        category: 'required|max:80',
        tech_stack: 'required|max:400',
        year: 'max:12',
        demo_url: 'url',
        repo_url: 'url',
        status: 'required|in:published,draft',
    });

    if (validator.fails()) {
        return { data: null, errors: validator.errors() };
    }

    const data = validator.validated();

    return {
        errors: {},
        data: {
            title: String(data.title).trim(),
            slug: String(data.slug).trim(),
            summary: String(data.summary).trim(),
            description: String(data.description).trim(),
            category: String(data.category).trim(),
            tech_stack: String(data.tech_stack).trim(),
            highlights: String(body.highlights ?? ''),
            client: String(body.client ?? '').trim(),
            role: String(body.role ?? '').trim(),
            year: String(data.year ?? new Date().getFullYear()),
            demo_url: String(data.demo_url ?? '').trim(),
            repo_url: String(data.repo_url ?? '').trim(),
            featured: Boolean(body.featured),
            status: String(data.status),
            sort_order: Number(body.sort_order ?? 0),
        },
    };
}
