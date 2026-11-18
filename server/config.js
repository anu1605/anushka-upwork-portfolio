import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

dotenv.config({ path: path.join(ROOT, '.env') });

/**
 * Read an environment variable with a fallback default.
 */
export function env(key, fallback = undefined) {
    const value = process.env[key];

    if (value === undefined || value === '') {
        return fallback;
    }

    if (value === 'true' || value === '(true)') {
        return true;
    }

    if (value === 'false' || value === '(false)') {
        return false;
    }

    if (value === 'null' || value === '(null)') {
        return null;
    }

    return value;
}

const isProduction = env('APP_ENV', 'local') === 'production';

export const config = {
    name: env('APP_NAME', 'Anushka Tyagi'),
    env: env('APP_ENV', 'local'),
    debug: Boolean(env('APP_DEBUG', !isProduction)),
    url: String(
        env('APP_URL', env('DEPLOY_PRIME_URL', env('URL', 'http://localhost:5173'))),
    ).replace(/\/+$/, ''),
    timezone: env('APP_TIMEZONE', 'Asia/Kolkata'),
    port: Number(env('PORT', 5173)),
    key: String(env('APP_KEY', '')),
    isProduction,
    session: {
        name: env('SESSION_NAME', 'portfolio_session'),
        lifetime: Number(env('SESSION_LIFETIME', 7200)),
        secure: Boolean(env('SESSION_SECURE', isProduction)),
        sameSite: env('SESSION_SAME_SITE', 'Lax'),
    },
    admin: {
        name: env('ADMIN_NAME', 'Admin'),
        username: env('ADMIN_USERNAME', 'admin'),
        password: env('ADMIN_PASSWORD', 'ChangeMe!2026'),
    },
};

export const dataDir = env('DATA_DIR', path.join(ROOT, 'data'));
export const paths = {
    root: ROOT,
    data: dataDir,
    client: path.join(ROOT, 'dist', 'client'),
    server: path.join(ROOT, 'dist', 'server'),
    public: path.join(ROOT, 'public'),
};

if (config.timezone) {
    process.env.TZ = config.timezone;
}
