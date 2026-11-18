import express from 'express';

import { attachSession } from './auth.js';
import { config, paths } from './config.js';
import { adminRouter } from './routes/admin.js';
import { apiRouter } from './routes/api.js';
import { seoRouter } from './routes/seo.js';
import { buildInitialData, loadTemplate, renderPage } from './ssr.js';

/**
 * Express server.
 *
 * - `GET /api/*`  -> JSON API (public + admin)
 * - `GET /sitemap.xml`, `GET /robots.txt` -> SEO endpoints
 * - Everything else -> React SSR (public site and admin UI)
 *
 * In development Vite's middleware serves the client assets and compiles the
 * React entry points on the fly. In production the pre-built files in
 * `dist/client` are served as static assets.
 */

async function createApp({ dev = !config.isProduction } = {}) {
    const app = express();

    app.disable('x-powered-by');

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    app.use(attachSession);

    app.use('/api', apiRouter);
    app.use('/admin/api', adminRouter);
    app.use(seoRouter);

    let vite = null;

    if (dev) {
        const { createServer: createViteServer } = await import('vite');

        vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom',
            root: paths.root,
        });

        app.use(vite.middlewares);
    } else {
        // Vite copies `public/` into `dist/client`, so one static mount serves
        // the built JS/CSS as well as the favicon and OG image.
        // `redirect: false` keeps `/about` on the SSR path instead of
        // redirecting to the prerendered `about/` directory.
        app.use(
            express.static(paths.client, {
                index: false,
                redirect: false,
                setHeaders(res, filePath) {
                    if (/(^|[\\/])assets[\\/]/.test(filePath)) {
                        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                    }
                },
            }),
        );
    }

    app.use('*', async (req, res, next) => {
        try {
            if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/admin/api/')) {
                return next();
            }

            if (req.originalUrl === '/sitemap.xml' || req.originalUrl === '/robots.txt') {
                return next();
            }

            const url = req.originalUrl;

            // React Router's <Navigate> cannot redirect during the initial
            // server render, so the admin gate is enforced here as well.
            if (url === '/admin' || url.startsWith('/admin/')) {
                const isLogin = url === '/admin/login';

                if (!req.user && !isLogin) {
                    return res.redirect(302, '/admin/login');
                }

                if (req.user && isLogin) {
                    return res.redirect(302, '/admin');
                }
            }

            const template = await loadTemplate(vite, url);
            const state = await buildInitialData(req);
            const { document, status } = await renderPage(url, state, { vite, template });

            res.status(status).set('Content-Type', 'text/html; charset=utf-8').end(document);
        } catch (error) {
            if (vite) {
                vite.ssrFixStacktrace(error);
            }

            console.error('[portfolio] SSR error:', error);

            if (!res.headersSent) {
                res
                    .status(500)
                    .set('Content-Type', 'text/html; charset=utf-8')
                    .end(
                        config.debug
                            ? `<pre>${escapeHtml(error.stack ?? error.message)}</pre>`
                            : '<h1>Something went wrong</h1>',
                    );
            }
        }
    });

    app.use((err, req, res, next) => {
        console.error('[portfolio] Unhandled error:', err);

        if (res.headersSent) {
            return next(err);
        }

        res.status(500).json({ error: config.debug ? err.message : 'Internal server error.' });
    });

    return app;
}

export { createApp };

/**
 * Start the HTTP server and resolve once it is listening.
 */
export async function start(options) {
    const app = await createApp(options);

    return new Promise((resolve) => {
        const server = app.listen(config.port, () => {
            console.log(`[portfolio] listening on http://localhost:${config.port} (${config.env})`);
            resolve(server);
        });
    });
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
