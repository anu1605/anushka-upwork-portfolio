import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { paths } from './config.js';

/**
 * File backed JSON store.
 *
 * Every collection lives in its own JSON file under `data/`. The files are the
 * single source of truth: there is no database, no schema and no migration
 * step. Writes are atomic (write to a temp file, then rename) and serialised
 * per file so two concurrent requests can never interleave.
 */

const locks = new Map();

export function filePath(name) {
    return path.join(paths.data, `${name}.json`);
}

export async function read(name, fallback) {
    const file = filePath(name);

    try {
        const raw = await readFile(file, 'utf8');

        // Windows editors happily prepend a UTF-8 BOM, which JSON.parse
        // rejects. Strip it so hand-edited content files still load.
        return JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }

        if (fallback === undefined) {
            throw new Error(`Data file "${name}.json" is missing. Run "npm run seed".`);
        }

        await write(name, fallback);

        return structuredClone(fallback);
    }
}

export async function write(name, value) {
    const file = filePath(name);

    await mkdir(path.dirname(file), { recursive: true });

    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;

    await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await rename(tmp, file);

    return value;
}

export async function exists(name) {
    try {
        await readFile(filePath(name), 'utf8');

        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }

        throw error;
    }
}

/**
 * Serialise async work per data file. Two calls for the same name run one
 * after the other; calls for different names run in parallel.
 */
export async function withLock(name, callback) {
    const previous = locks.get(name) ?? Promise.resolve();

    let release;
    const current = new Promise((resolve) => {
        release = resolve;
    });

    locks.set(name, current);

    await previous;

    try {
        return await callback();
    } finally {
        release();

        if (locks.get(name) === current) {
            locks.delete(name);
        }
    }
}

/**
 * Read, transform and write back a collection inside a single lock.
 */
export async function update(name, fallback, mutator) {
    return withLock(name, async () => {
        const current = await read(name, fallback);
        const result = await mutator(current);

        if (result !== false) {
            await write(name, current);
        }

        return current;
    });
}

/**
 * Next auto-increment id for a collection.
 */
export function nextId(rows) {
    return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

/**
 * "YYYY-MM-DD HH:MM:SS" in the configured timezone.
 */
export function timestamp(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: process.env.TZ || 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date);

    const pick = (type) => parts.find((part) => part.type === type)?.value ?? '00';

    return `${pick('year')}-${pick('month')}-${pick('day')} ${pick('hour')}:${pick('minute')}:${pick('second')}`;
}
