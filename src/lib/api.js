/**
 * Thin fetch wrapper around the JSON API.
 *
 * Mutating requests carry the CSRF token from the readable session cookie in
 * the `X-CSRF-Token` header.
 */

export function readCookie(name) {
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));

    return match ? decodeURIComponent(match[1]) : null;
}

export async function api(path, { method = 'GET', body, headers = {}, csrfCookie } = {}) {
    const requestHeaders = { Accept: 'application/json', ...headers };

    if (body !== undefined && requestHeaders['Content-Type'] === undefined) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    if (method !== 'GET' && method !== 'HEAD' && csrfCookie) {
        const token = readCookie(csrfCookie);

        if (token) {
            requestHeaders['X-CSRF-Token'] = token;
        }
    }

    const response = await fetch(path, {
        method,
        headers: requestHeaders,
        credentials: 'same-origin',
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(payload.error || `Request failed with status ${response.status}`);

        error.status = response.status;
        error.errors = payload.errors ?? {};

        throw error;
    }

    return payload;
}
