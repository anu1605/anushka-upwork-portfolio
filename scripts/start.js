// Production entry point.
//
// `config.js` derives `isProduction` from APP_ENV. Setting it here (before the
// server is imported) keeps `npm start` working on Windows, where the
// `APP_ENV=production ...` prefix syntax used by POSIX shells is not supported.

process.env.APP_ENV = process.env.APP_ENV || 'production';

const { start } = await import('../server/index.js');

start({ dev: false }).catch((error) => {
    console.error('[portfolio] Failed to start:', error);
    process.exit(1);
});
