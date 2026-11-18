import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { config, paths } from './config.js';
import { CSRF_COOKIE_NAME } from './auth.js';
import * as profile from './models/profile.js';
import * as projects from './models/projects.js';
import * as seo from './models/seo.js';

/**
 * Server side rendering.
 *
 * The React app is rendered to a string for every request so crawlers get
 * real HTML (title, meta description, Open Graph tags, JSON-LD and the visible
 * copy) instead of an empty shell. The client then hydrates the same markup.
 */

let renderer = null;

async function loadRenderer(vite) {
    if (vite) {
        // Vite invalidates the module graph when a source file changes, so
        // reloading on every request keeps server rendering in sync during
        // development.
        const module = await vite.ssrLoadModule('/src/entry-server.jsx');

        return module.render;
    }

    if (renderer) {
        return renderer;
    }

    const entry = pathToFileURL(path.join(paths.server, 'entry-server.js')).href;
    const module = await import(entry);
    renderer = module.render;

    return renderer;
}

export async function buildInitialData(req) {
    const [siteProfile, settings, published, categories] = await Promise.all([
        profile.all(),
        profile.settings(),
        projects.published(),
        projects.categories(),
    ]);

    return {
        profile: siteProfile,
        settings: { ...settings, url: config.url },
        projects: published,
        categories,
        user: req.user ?? null,
        csrfCookie: CSRF_COOKIE_NAME,
    };
}

export async function renderPage(url, state, { vite, template }) {
    const render = await loadRenderer(vite);
    const { html, head } = await render(url, state);

    const headHtml = await buildHead(head, state);
    const document = template
        .replace('__PORTFOLIO_HEAD__', headHtml)
        .replace('__PORTFOLIO_APP__', html)
        .replace('__PORTFOLIO_STATE__', serializeState(state));

    return { document, status: head.status ?? 200 };
}

export async function loadTemplate(vite, url) {
    if (vite) {
        const raw = await readFile(path.join(paths.root, 'index.html'), 'utf8');

        return vite.transformIndexHtml(url, raw);
    }

    // `npm run build` prerenders `dist/client` and keeps the untouched shell
    // in `dist/server/index.html` for the Express server to render from.
    try {
        return await readFile(path.join(paths.server, 'index.html'), 'utf8');
    } catch {
        return readFile(path.join(paths.client, 'index.html'), 'utf8');
    }
}

/**
 * Build the <head> markup for a route.
 */
async function buildHead(head, state) {
    const siteProfile = state.profile ?? {};
    const siteSettings = state.settings ?? {};
    const siteName = siteSettings.name ?? config.name;
    const meta = await seo.meta({
        title: head.title,
        description: head.description,
        keywords: head.keywords,
        image: head.image,
        type: head.type,
        canonical: head.canonical,
    });

    const canonical = absolute(meta.canonical ?? config.url, siteSettings.url ?? config.url);
    const image = absolute(meta.image, siteSettings.url ?? config.url);
    const jsonLd = await seo.jsonLd();

    return [
        `<title>${escapeHtml(meta.title)}</title>`,
        `<meta name="description" content="${escapeHtml(meta.description)}">`,
        `<meta name="keywords" content="${escapeHtml(meta.keywords)}">`,
        `<meta name="author" content="${escapeHtml(siteProfile.name ?? '')}">`,
        '<meta name="theme-color" content="#0b1020">',
        `<meta property="og:type" content="${escapeHtml(meta.type)}">`,
        `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
        `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
        `<meta property="og:image" content="${escapeHtml(image)}">`,
        `<meta property="og:url" content="${escapeHtml(canonical)}">`,
        `<meta property="og:site_name" content="${escapeHtml(siteName)}">`,
        '<meta name="twitter:card" content="summary_large_image">',
        `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
        `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
        `<meta name="twitter:image" content="${escapeHtml(image)}">`,
        `<link rel="canonical" href="${escapeHtml(canonical)}">`,
        `<link rel="alternate" type="application/json" href="${escapeHtml(`${siteSettings.url ?? config.url}/api/projects`)}">`,
        `<script type="application/ld+json">${jsonLd}</script>`,
    ].join('\n    ');
}

function serializeState(state) {
    return JSON.stringify(state).replace(/</g, '\\u003c');
}

function absolute(path, base) {
    if (!path) {
        return '';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `${String(base).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
