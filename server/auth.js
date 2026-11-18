import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { config } from './config.js';
import { secret } from './secret.js';
import * as users from './models/users.js';

/**
 * Session based authentication for the admin area.
 *
 * The session lives in a signed, httpOnly cookie. The CSRF token is derived
 * from the session id, exposed through a readable cookie and echoed back in the
 * `X-CSRF-Token` header — a stateless double submit check that cannot be
 * forged by a third-party site.
 */

const SESSION_COOKIE = config.session.name;
const CSRF_COOKIE = `${config.session.name}_csrf`;

/**
 * Name of the readable cookie that holds the CSRF token. The client reads it to
 * populate the `X-CSRF-Token` header.
 */
export const CSRF_COOKIE_NAME = CSRF_COOKIE;

const SESSION_TTL_MS = config.session.lifetime * 1000;

let dummyHash = null;

function sign(value) {
    return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEquals(a, b) {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));

    if (left.length !== right.length) {
        return false;
    }

    return timingSafeEqual(left, right);
}

function parseCookies(header) {
    const jar = {};

    if (!header) {
        return jar;
    }

    for (const part of header.split(';')) {
        const index = part.indexOf('=');

        if (index === -1) {
            continue;
        }

        const key = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();

        if (key === '') {
            continue;
        }

        try {
            jar[key] = decodeURIComponent(value);
        } catch {
            jar[key] = value;
        }
    }

    return jar;
}

export function cookies(req) {
    if (!req.cookies) {
        req.cookies = parseCookies(req.headers.cookie);
    }

    return req.cookies;
}

// Express treats `maxAge` as milliseconds and derives both `Expires` and the
// cookie's (seconds based) `Max-Age` from it.
function cookieOptions(maxAgeMs, httpOnly = true) {
    return {
        httpOnly,
        secure: config.session.secure,
        sameSite: config.session.sameSite,
        path: '/',
        maxAge: maxAgeMs,
    };
}

function encodeSession(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');

    return `${body}.${sign(body)}`;
}

function decodeSession(raw) {
    const parts = String(raw ?? '').split('.');

    if (parts.length !== 2) {
        return null;
    }

    const [body, mac] = parts;

    if (!safeEquals(sign(body), mac)) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

        if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

/**
 * Issue a fresh session and return its payload.
 */
export function issueSession(res, userId = null) {
    const payload = {
        sid: randomBytes(24).toString('base64url'),
        uid: userId,
        exp: Date.now() + SESSION_TTL_MS,
    };

    res.cookie(
        SESSION_COOKIE,
        encodeSession(payload),
        cookieOptions(SESSION_TTL_MS),
    );

    setCsrfCookie(res, payload.sid);

    return payload;
}

export function clearSession(res) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.clearCookie(CSRF_COOKIE, { path: '/' });
}

/**
 * Read and verify the session cookie. Returns `{ sid, uid }` or null.
 */
export function readSession(req) {
    const raw = cookies(req)[SESSION_COOKIE];

    if (!raw) {
        return null;
    }

    return decodeSession(raw);
}

/**
 * Derive the CSRF token for a session id.
 */
export function csrfToken(sid) {
    return sign(`csrf:${sid}`);
}

export function setCsrfCookie(res, sid) {
    res.cookie(CSRF_COOKIE, csrfToken(sid), cookieOptions(SESSION_TTL_MS, false));
}

/**
 * Attach `req.session` and `req.user` to every request, creating a session
 * when the visitor does not have one yet (needed for CSRF tokens).
 */
export async function attachSession(req, res, next) {
    let session = readSession(req);

    if (!session) {
        session = issueSession(res);
    } else if (cookies(req)[CSRF_COOKIE] !== csrfToken(session.sid)) {
        setCsrfCookie(res, session.sid);
    }

    req.session = session;

    if (session.uid) {
        const user = await users.find(session.uid);

        if (user) {
            req.user = users.publicUser(user);
        } else {
            session.uid = null;
        }
    }

    next();
}

/**
 * Verify the CSRF token sent by the client.
 */
export function verifyCsrf(req) {
    const header = req.get('x-csrf-token');

    if (!header || !req.session) {
        return false;
    }

    return safeEquals(csrfToken(req.session.sid), header);
}

/**
 * Attempt to sign in. Returns the user on success, null otherwise.
 */
export async function attempt(username, password) {
    const user = await users.findByUsername(String(username ?? '').trim());

    if (!user) {
        // Hash against a throwaway value so timing does not reveal whether the
        // account exists.
        if (!dummyHash) {
            dummyHash = await users.hashPassword(randomBytes(24).toString('hex'));
        }

        await users.verifyPassword(String(password ?? ''), dummyHash);

        return null;
    }

    const valid = await users.verifyPassword(String(password ?? ''), user.password_hash);

    if (!valid) {
        return null;
    }

    return users.publicUser(user);
}

/**
 * Guard for the admin routes.
 */
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    return next();
}
