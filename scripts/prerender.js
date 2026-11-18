import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { config, paths } from '../server/config.js';
import { buildInitialData, renderPage } from '../server/ssr.js';
import { buildRobots, buildSitemap } from '../server/routes/seo.js';

/**
 * Static prerender.
 *
 * Runs after the client and SSR bundles are built and writes real HTML for
 * every public route into `dist/client`, so the site can be hosted on a plain
 * static host (Netlify, GitHub Pages, S3, ...). The admin API and contact
 * endpoint are server-only and are not part of the static build.
 *
 * Run with `npm run build`.
 */

async function writePage(template, state, route, file) {
    const { document } = await renderPage(route, state, { template });
    const target = path.join(paths.client, file);

    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, document, 'utf8');

    console.log(`[prerender] ${route} -> ${path.relative(paths.root, target)}`);
}

async function main() {
    const template = await readFile(path.join(paths.client, 'index.html'), 'utf8');

    // Keep the unrendered shell for the Express server; the client copy is
    // overwritten with prerendered HTML below.
    await writeFile(path.join(paths.server, 'index.html'), template, 'utf8');

    const state = await buildInitialData({ user: null });

    const routes = [
        { route: '/', file: 'index.html' },
        { route: '/about', file: 'about/index.html' },
        { route: '/projects', file: 'projects/index.html' },
        ...state.projects.map((project) => ({
            route: `/projects/${project.slug}`,
            file: `projects/${project.slug}/index.html`,
        })),
    ];

    for (const { route, file } of routes) {
        await writePage(template, state, route, file);
    }

    await writePage(template, state, '/404', '404.html');

    await writeFile(path.join(paths.client, 'sitemap.xml'), await buildSitemap(), 'utf8');
    await writeFile(path.join(paths.client, 'robots.txt'), buildRobots(), 'utf8');

    console.log('[prerender] sitemap.xml, robots.txt');
    console.log(`[prerender] done for ${config.url}`);
}

main().catch((error) => {
    console.error('[prerender] failed:', error);
    process.exit(1);
});
