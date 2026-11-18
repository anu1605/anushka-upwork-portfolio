import * as store from '../store.js';

/**
 * Contact form submissions.
 *
 * Backed by `data/messages.json`.
 */

const FILE = 'messages';

export async function create({ name, subject, body, ipAddress = '', userAgent = '' }) {
    return store.withLock(FILE, async () => {
        const rows = await store.read(FILE, []);

        const message = {
            id: store.nextId(rows),
            name,
            subject,
            body,
            ip_address: ipAddress,
            user_agent: String(userAgent).slice(0, 255),
            is_read: 0,
            created_at: store.timestamp(),
        };

        rows.push(message);
        await store.write(FILE, rows);

        return message;
    });
}

export async function all() {
    const rows = await store.read(FILE, []);

    return [...rows].sort((a, b) => {
        if (Number(a.is_read) !== Number(b.is_read)) {
            return Number(a.is_read) - Number(b.is_read);
        }

        return String(b.created_at).localeCompare(String(a.created_at));
    });
}

export async function find(id) {
    const rows = await store.read(FILE, []);
    const message = rows.find((row) => Number(row.id) === Number(id));

    return message ?? null;
}

export async function setRead(id, isRead) {
    return store.withLock(FILE, async () => {
        const rows = await store.read(FILE, []);
        const index = rows.findIndex((row) => Number(row.id) === Number(id));

        if (index === -1) {
            return false;
        }

        rows[index].is_read = isRead ? 1 : 0;
        await store.write(FILE, rows);

        return rows[index];
    });
}

export async function remove(id) {
    return store.withLock(FILE, async () => {
        const rows = await store.read(FILE, []);
        const index = rows.findIndex((row) => Number(row.id) === Number(id));

        if (index === -1) {
            return false;
        }

        rows.splice(index, 1);
        await store.write(FILE, rows);

        return true;
    });
}

export async function unreadCount() {
    const rows = await store.read(FILE, []);

    return rows.filter((row) => Number(row.is_read) === 0).length;
}

export async function count() {
    const rows = await store.read(FILE, []);

    return rows.length;
}
