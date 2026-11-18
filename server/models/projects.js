import * as store from '../store.js';

/**
 * Portfolio project / case study.
 *
 * Backed by `data/projects.json`.
 */

const FILE = 'projects';

export async function find(id) {
    const rows = await store.read(FILE, []);
    const project = rows.find((row) => Number(row.id) === Number(id));

    return project ?? null;
}

export async function findBySlug(slug) {
    const rows = await store.read(FILE, []);
    const project = rows.find((row) => row.slug === slug);

    return project ?? null;
}

/**
 * Published projects, optionally filtered by category and free-text search.
 */
export async function published(category = null, search = null) {
    const rows = await store.read(FILE, []);
    const needle = search ? search.trim().toLowerCase() : '';

    return rows
        .filter((row) => row.status === 'published')
        .filter((row) => {
            if (!category || category === 'all') {
                return true;
            }

            return row.category === category;
        })
        .filter((row) => {
            if (needle === '') {
                return true;
            }

            return (
                String(row.title).toLowerCase().includes(needle) ||
                String(row.summary).toLowerCase().includes(needle) ||
                String(row.tech_stack).toLowerCase().includes(needle)
            );
        })
        .sort(sortProjects);
}

export async function all() {
    const rows = await store.read(FILE, []);

    return [...rows].sort(sortProjects);
}

export async function featured(limit = 3) {
    const rows = await store.read(FILE, []);

    return rows
        .filter((row) => row.status === 'published' && Number(row.featured) === 1)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || Number(b.id) - Number(a.id))
        .slice(0, limit);
}

export async function categories() {
    const rows = await store.read(FILE, []);

    return [
        ...new Set(
            rows
                .filter((row) => row.status === 'published' && row.category)
                .map((row) => row.category),
        ),
    ].sort();
}

export async function count() {
    const rows = await store.read(FILE, []);

    return rows.length;
}

export async function create(data) {
    return store.withLock(FILE, async () => {
        const rows = await store.read(FILE, []);
        const now = store.timestamp();

        const project = {
            id: store.nextId(rows),
            slug: data.slug,
            title: data.title,
            summary: data.summary,
            description: data.description,
            category: data.category,
            tech_stack: data.tech_stack,
            highlights: data.highlights ?? '',
            client: data.client ?? '',
            role: data.role ?? '',
            year: data.year ?? String(new Date().getFullYear()),
            demo_url: data.demo_url ?? '',
            repo_url: data.repo_url ?? '',
            featured: data.featured ? 1 : 0,
            status: data.status ?? 'published',
            sort_order: Number(data.sort_order ?? 0),
            created_at: now,
            updated_at: now,
        };

        rows.push(project);
        await store.write(FILE, rows);

        return project;
    });
}

export async function update(id, data) {
    return store.withLock(FILE, async () => {
        const rows = await store.read(FILE, []);
        const index = rows.findIndex((row) => Number(row.id) === Number(id));

        if (index === -1) {
            return null;
        }

        rows[index] = {
            ...rows[index],
            slug: data.slug,
            title: data.title,
            summary: data.summary,
            description: data.description,
            category: data.category,
            tech_stack: data.tech_stack,
            highlights: data.highlights ?? '',
            client: data.client ?? '',
            role: data.role ?? '',
            year: data.year ?? String(new Date().getFullYear()),
            demo_url: data.demo_url ?? '',
            repo_url: data.repo_url ?? '',
            featured: data.featured ? 1 : 0,
            status: data.status ?? 'published',
            sort_order: Number(data.sort_order ?? 0),
            updated_at: store.timestamp(),
        };

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

/**
 * Ensure the slug is unique, appending a numeric suffix when required.
 */
export async function uniqueSlug(slug, ignoreId = null) {
    const rows = await store.read(FILE, []);
    const base = slug;

    let candidate = base;
    let suffix = 2;

    while (true) {
        const existing = rows.find((row) => row.slug === candidate);

        if (!existing || Number(existing.id) === Number(ignoreId)) {
            return candidate;
        }

        candidate = `${base}-${suffix}`;
        suffix += 1;
    }
}

/**
 * Split the comma separated tech stack into a clean list.
 */
export function techList(project) {
    const stack = String(project?.tech_stack ?? '');

    if (stack === '') {
        return [];
    }

    return stack
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function sortProjects(a, b) {
    if (Number(a.featured) !== Number(b.featured)) {
        return Number(b.featured) - Number(a.featured);
    }

    if (Number(a.sort_order) !== Number(b.sort_order)) {
        return Number(a.sort_order) - Number(b.sort_order);
    }

    return Number(b.id) - Number(a.id);
}
