import * as store from '../store.js';

/**
 * Site owner profile and site settings.
 *
 * Backed by `data/profile.json` and `data/settings.json`.
 */

export async function all() {
    return store.read('profile', {});
}

export async function settings() {
    return store.read('settings', {});
}

export async function get(key, fallback = null) {
    const profile = await all();

    return key in profile ? profile[key] : fallback;
}

export async function skills() {
    const profile = await all();

    return profile.skills ?? {};
}

export async function highlights() {
    const profile = await all();

    return profile.highlights ?? {};
}

export async function experience() {
    const profile = await all();

    return profile.experience ?? [];
}
