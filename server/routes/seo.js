import { Router } from 'express';

import { config } from '../config.js';
import * as projects from '../models/projects.js';

/**
 * SEO endpoints — sitemap.xml and robots.txt.
 *
 * The builders are exported so the static prerender script can write the same
 * output to disk for hosts that do not run Node (Netlify, GitHub Pages, ...).
 */

export const seoRouter = Router();

seoRouter.get('/sitemap.xml', async (req, res) => {
    res.set('Content-Type', 'application/xml; charset=UTF-8').send(await buildSitemap());
});

seoRouter.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=UTF-8').send(buildRobots());
});

export async function buildSitemap() {
    const urls = [
        { loc: `${config.url}/`, priority: '1.0', freq: 'weekly' },
        { loc: `${config.url}/about`, priority: '0.9', freq: 'monthly' },
        { loc: `${config.url}/projects`, priority: '0.9', freq: 'weekly' },
    ];

    for (const project of await projects.published()) {
        urls.push({
            loc: `${config.url}/projects/${project.slug}`,
            priority: '0.8',
            freq: 'monthly',
            lastmod: project.updated_at ?? '',
        });
    }

    const entries = urls
        .map((url) => {
            const parts = [`    <loc>${escapeXml(url.loc)}</loc>`];

            if (url.lastmod) {
                parts.push(`    <lastmod>${escapeXml(toDate(url.lastmod))}</lastmod>`);
            }

            parts.push(`    <changefreq>${url.freq}</changefreq>`);
            parts.push(`    <priority>${url.priority}</priority>`);

            return `  <url>\n${parts.join('\n')}\n  </url>`;
        })
        .join('\n');

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        `${entries}\n</urlset>\n`
    );
}

export function buildRobots() {
    return (
        'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\n' +
        `Sitemap: ${config.url}/sitemap.xml\n`
    );
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function toDate(value) {
    const parsed = new Date(String(value).replace(' ', 'T'));

    if (Number.isNaN(parsed.getTime())) {
        return new Date().toISOString().slice(0, 10);
    }

    return parsed.toISOString().slice(0, 10);
}
