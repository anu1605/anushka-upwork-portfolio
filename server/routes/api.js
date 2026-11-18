import { Router } from 'express';

import { verifyCsrf } from '../auth.js';
import { make as validate } from '../validate.js';
import * as messages from '../models/messages.js';
import * as profile from '../models/profile.js';
import * as projects from '../models/projects.js';

/**
 * Read-only public endpoints plus the contact form.
 */

export const apiRouter = Router();

apiRouter.get('/profile', async (req, res) => {
    const [siteProfile, settings] = await Promise.all([profile.all(), profile.settings()]);

    res.json({ data: { ...siteProfile, settings } });
});

apiRouter.get('/projects', async (req, res) => {
    const category = String(req.query.category ?? 'all');
    const search = String(req.query.q ?? '');

    const rows = await projects.published(
        category === 'all' ? null : category,
        search === '' ? null : search,
    );

    const data = rows.map((project) => ({
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        category: project.category,
        tech_stack: projects.techList(project),
        year: project.year,
        featured: Number(project.featured) === 1,
        url: `/projects/${project.slug}`,
    }));

    res.json({
        data,
        meta: {
            count: data.length,
            categories: await projects.categories(),
        },
    });
});

apiRouter.get('/projects/:slug', async (req, res) => {
    const project = await projects.findBySlug(req.params.slug);

    if (!project || project.status !== 'published') {
        return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({
        data: {
            ...project,
            tech_stack: projects.techList(project),
        },
    });
});

apiRouter.post('/contact', async (req, res) => {
    if (!verifyCsrf(req)) {
        return res.status(419).json({ error: 'Your session expired. Please refresh the page and try again.' });
    }

    const body = req.body ?? {};
    const validator = validate(body, {
        name: 'required|min:2|max:120',
        subject: 'required|min:3|max:200',
        message: 'required|min:10|max:5000',
    });

    if (validator.fails()) {
        return res.status(422).json({
            error: 'Please correct the highlighted fields and try again.',
            errors: validator.errors(),
        });
    }

    const data = validator.validated();

    await messages.create({
        name: String(data.name).trim(),
        subject: String(data.subject).trim(),
        body: String(data.message).trim(),
        ipAddress: req.ip ?? '',
        userAgent: req.get('user-agent') ?? '',
    });

    return res.status(201).json({
        data: {
            message: 'Thanks for reaching out! Your message has been received.',
        },
    });
});
