/**
 * Small formatting helpers shared by the pages.
 */

export function excerpt(value, limit = 160, end = '…') {
    const text = String(value ?? '').trim();

    if (text.length <= limit) {
        return text;
    }

    const cut = text.slice(0, limit);
    const space = cut.lastIndexOf(' ');

    return `${space > 0 ? cut.slice(0, space) : cut}${end}`;
}

export function initials(title) {
    return String(title ?? '').slice(0, 2).toUpperCase();
}

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

export function slugify(value) {
    return String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 160);
}

export function paragraphs(value) {
    return String(value ?? '')
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);
}

export function lines(value) {
    return String(value ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

export function formatDate(value, options = {}) {
    const parsed = new Date(String(value ?? '').replace(' ', 'T'));

    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...options,
    }).format(parsed);
}

export function formatDateTime(value) {
    return formatDate(value, { hour: '2-digit', minute: '2-digit' });
}

export function absoluteUrl(path, base) {
    if (!path) {
        return '';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return `${String(base).replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}
