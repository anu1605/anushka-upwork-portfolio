import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import * as store from '../store.js';

const scrypt = promisify(scryptCallback);

/**
 * Admin user accounts.
 *
 * Backed by `data/users.json`.
 */

const FILE = 'users';

const KEY_LENGTH = 64;

export async function find(id) {
    const rows = await store.read(FILE, []);
    const user = rows.find((row) => Number(row.id) === Number(id));

    return user ?? null;
}

export async function findByUsername(username) {
    const rows = await store.read(FILE, []);
    const user = rows.find((row) => row.username === String(username).toLowerCase());

    return user ?? null;
}

export async function count() {
    const rows = await store.read(FILE, []);

    return rows.length;
}

export async function create(name, username, password) {
    return store.withLock(FILE, async () => {
        const rows = await store.read(FILE, []);
        const now = store.timestamp();

        const user = {
            id: store.nextId(rows),
            name,
            username: String(username).toLowerCase(),
            password_hash: await hashPassword(password),
            role: 'admin',
            created_at: now,
            updated_at: now,
        };

        rows.push(user);
        await store.write(FILE, rows);

        return user;
    });
}

export async function updatePassword(id, password) {
    return store.withLock(FILE, async () => {
        const rows = await store.read(FILE, []);
        const index = rows.findIndex((row) => Number(row.id) === Number(id));

        if (index === -1) {
            return false;
        }

        rows[index].password_hash = await hashPassword(password);
        rows[index].updated_at = store.timestamp();
        await store.write(FILE, rows);

        return true;
    });
}

/**
 * Hash a password with scrypt. Format: `scrypt$<salt>$<hash>` (both hex).
 */
export async function hashPassword(password) {
    const salt = randomBytes(16);
    const derived = await scrypt(String(password), salt, KEY_LENGTH);

    return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/**
 * Verify a password against a stored hash. Returns false on any mismatch.
 */
export async function verifyPassword(password, stored) {
    const parts = String(stored ?? '').split('$');

    if (parts.length !== 3 || parts[0] !== 'scrypt') {
        return false;
    }

    let salt;
    let expected;

    try {
        salt = Buffer.from(parts[1], 'hex');
        expected = Buffer.from(parts[2], 'hex');
    } catch {
        return false;
    }

    if (expected.length !== KEY_LENGTH) {
        return false;
    }

    const derived = await scrypt(String(password), salt, KEY_LENGTH);

    return timingSafeEqual(derived, expected);
}

/**
 * Strip the password hash before sending a user to the browser.
 */
export function publicUser(user) {
    if (!user) {
        return null;
    }

    const { password_hash: _hash, ...safe } = user;

    return safe;
}
