// Development entry point.

process.env.APP_ENV = process.env.APP_ENV || 'local';

const { start } = await import('../server/index.js');

start().catch((error) => {
    console.error('[portfolio] Failed to start:', error);
    process.exit(1);
});
