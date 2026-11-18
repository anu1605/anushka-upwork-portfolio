import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * End to end API tests against a throwaway data directory.
 *
 * The data layer is file based, so each run uses its own temp folder and never
 * touches the real `data/` files.
 */

let dir;
let app;
let config;
let users;
let csrfName;

const project = {
    id: 1,
    slug: 'demo-project',
    title: 'Demo Project',
    summary: 'A short summary.',
    description: 'A description that is comfortably long enough to pass validation.',
    category: 'Web',
    tech_stack: 'PHP, MySQL',
    highlights: '',
    client: '',
    role: 'Developer',
    year: '2024',
    demo_url: '',
    repo_url: '',
    featured: 1,
    status: 'published',
    sort_order: 0,
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
};

beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'portfolio-test-'));

    process.env.DATA_DIR = dir;
    process.env.APP_ENV = 'production';
    process.env.APP_KEY = 'test-key';
    process.env.SESSION_NAME = 'test_session';

    await writeFile(path.join(dir, 'projects.json'), `${JSON.stringify([project], null, 2)}\n`, 'utf8');
    await writeFile(path.join(dir, 'messages.json'), '[]\n', 'utf8');

    ({ config } = await import('../server/config.js'));
    users = await import('../server/models/users.js');
    ({ CSRF_COOKIE_NAME: csrfName } = await import('../server/auth.js'));

    const { createApp } = await import('../server/index.js');

    app = await createApp({ dev: false });

    await users.create('Admin', 'admin', 'secret-password');
});

afterAll(async () => {
    if (dir) {
        await rm(dir, { recursive: true, force: true });
    }
});

function cookiesFrom(response) {
    const raw = response.headers['set-cookie'] ?? [];
    const jar = raw.map((cookie) => cookie.split(';')[0]).join('; ');
    const csrfCookie = raw.find((cookie) => cookie.startsWith(csrfName));

    return {
        cookie: jar,
        csrf: csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1].split(';')[0]) : '',
    };
}

async function withSession() {
    const response = await request(app).get('/api/projects');

    return cookiesFrom(response);
}

describe('public API', () => {
    it('lists published projects', async () => {
        const response = await request(app).get('/api/projects');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].slug).toBe('demo-project');
        expect(response.body.meta.categories).toEqual(['Web']);
    });

    it('filters by category and search', async () => {
        const miss = await request(app).get('/api/projects').query({ category: 'Mobile' });
        const hit = await request(app).get('/api/projects').query({ q: 'mysql' });

        expect(miss.body.data).toHaveLength(0);
        expect(hit.body.data).toHaveLength(1);
    });

    it('returns a single project by slug', async () => {
        const response = await request(app).get('/api/projects/demo-project');

        expect(response.status).toBe(200);
        expect(response.body.data.title).toBe('Demo Project');
    });

    it('returns 404 for unknown projects', async () => {
        const response = await request(app).get('/api/projects/nope');

        expect(response.status).toBe(404);
    });

    it('rejects contact submissions without a CSRF token', async () => {
        const response = await request(app).post('/api/contact').send({
            name: 'Test',
            subject: 'Hello',
            message: 'A message that is long enough.',
        });

        expect(response.status).toBe(419);
    });

    it('rejects invalid contact submissions', async () => {
        const { cookie, csrf } = await withSession();
        const response = await request(app)
            .post('/api/contact')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf)
            .send({ name: 'A', subject: '', message: 'short' });

        expect(response.status).toBe(422);
        expect(Object.keys(response.body.errors).sort()).toEqual(['message', 'name', 'subject']);
    });

    it('stores valid contact submissions', async () => {
        const { cookie, csrf } = await withSession();
        const response = await request(app)
            .post('/api/contact')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf)
            .send({
                name: 'Test User',
                subject: 'Hello there',
                message: 'A message that is long enough to pass validation.',
            });

        expect(response.status).toBe(201);
        expect(response.body.data.message).toMatch(/Thanks for reaching out/);
    });
});

describe('admin API', () => {
    async function login() {
        const { cookie, csrf } = await withSession();
        const response = await request(app)
            .post('/admin/api/login')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf)
            .send({ username: config.admin.username, password: 'secret-password' });

        return { response, ...cookiesFrom(response) };
    }

    it('rejects unauthenticated access', async () => {
        const response = await request(app).get('/admin/api/projects');

        expect(response.status).toBe(401);
    });

    it('rejects a wrong password', async () => {
        const { cookie, csrf } = await withSession();
        const response = await request(app)
            .post('/admin/api/login')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf)
            .send({ username: config.admin.username, password: 'wrong' });

        expect(response.status).toBe(422);
    });

    it('signs in and exposes the admin project list', async () => {
        const { response, cookie, csrf } = await login();

        expect(response.status).toBe(200);
        expect(response.body.data.username).toBe(config.admin.username);
        expect(response.body.data.password_hash).toBeUndefined();

        const list = await request(app).get('/admin/api/projects').set('Cookie', cookie);

        expect(list.status).toBe(200);
        expect(list.body.data).toHaveLength(1);

        const me = await request(app).get('/admin/api/me').set('Cookie', cookie);

        expect(me.body.data.username).toBe(config.admin.username);
        expect(csrf).not.toBe('');
    });

    it('creates, updates and deletes a project', async () => {
        const { cookie, csrf } = await login();

        const created = await request(app)
            .post('/admin/api/projects')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf)
            .send({
                title: 'Second Project',
                slug: 'demo-project',
                summary: 'Another summary.',
                description: 'Another description that is long enough to pass.',
                category: 'Web',
                tech_stack: 'React, Node',
                status: 'draft',
                featured: false,
                sort_order: 2,
            });

        expect(created.status).toBe(201);
        expect(created.body.data.slug).toBe('demo-project-2');

        const updated = await request(app)
            .put(`/admin/api/projects/${created.body.data.id}`)
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf)
            .send({
                title: 'Second Project (edited)',
                slug: 'second-project',
                summary: 'Another summary.',
                description: 'Another description that is long enough to pass.',
                category: 'Web',
                tech_stack: 'React, Node',
                status: 'published',
                featured: true,
                sort_order: 1,
            });

        expect(updated.status).toBe(200);
        expect(updated.body.data.title).toBe('Second Project (edited)');
        expect(updated.body.data.featured).toBe(1);

        const removed = await request(app)
            .delete(`/admin/api/projects/${created.body.data.id}`)
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf);

        expect(removed.status).toBe(200);

        const missing = await request(app)
            .get(`/admin/api/projects/${created.body.data.id}`)
            .set('Cookie', cookie);

        expect(missing.status).toBe(404);
    });

    it('validates project payloads', async () => {
        const { cookie, csrf } = await login();

        const response = await request(app)
            .post('/admin/api/projects')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrf)
            .send({ title: 'x', slug: 'Not A Slug', summary: '', description: 'short', category: '', tech_stack: '', status: 'nope' });

        expect(response.status).toBe(422);
        expect(response.body.errors.title).toBeDefined();
        expect(response.body.errors.slug).toBeDefined();
        expect(response.body.errors.status).toBeDefined();
    });
});
