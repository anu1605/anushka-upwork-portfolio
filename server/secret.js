import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

import { config, paths } from './config.js';

/**
 * Application secret used to sign session cookies and CSRF tokens.
 *
 * `APP_KEY` wins when set. Otherwise a random key is generated once and
 * persisted to `data/.session-key` so development sessions survive restarts.
 */

const KEY_FILE = path.join(paths.data, '.session-key');

function resolveSecret() {
    if (config.key) {
        return config.key;
    }

    if (existsSync(KEY_FILE)) {
        return readFileSync(KEY_FILE, 'utf8').trim();
    }

    const generated = randomBytes(32).toString('hex');

    mkdirSync(paths.data, { recursive: true });
    writeFileSync(KEY_FILE, `${generated}\n`, 'utf8');

    if (config.isProduction) {
        console.warn('[portfolio] APP_KEY is not set — generated one in data/.session-key. Set APP_KEY in production.');
    }

    return generated;
}

export const secret = resolveSecret();
