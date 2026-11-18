import { config } from '../server/config.js';
import * as store from '../server/store.js';
import * as users from '../server/models/users.js';

/**
 * Idempotent seed.
 *
 * - Creates the admin account from ADMIN_USERNAME / ADMIN_PASSWORD when the users
 *   file is empty, so a fresh clone can sign in immediately.
 * - Makes sure every JSON collection exists.
 *
 * Run with `npm run seed`. Pass `--force-user` to reset the password of an
 * existing account (useful after changing ADMIN_PASSWORD).
 */

const forceUser = process.argv.includes('--force-user');

async function main() {
    await store.read('users', []);
    await store.read('messages', []);

    const existing = await users.findByUsername(config.admin.username);

    if (!existing) {
        const user = await users.create(config.admin.name, config.admin.username, config.admin.password);

        console.log(`[seed] created admin ${user.username} (password: ${config.admin.password})`);
    } else if (forceUser) {
        await users.updatePassword(existing.id, config.admin.password);

        console.log(`[seed] reset password for ${existing.username}`);
    } else {
        console.log(`[seed] admin ${existing.username} already exists`);
    }

    console.log('[seed] done');
}

main().catch((error) => {
    console.error('[seed] failed:', error);
    process.exit(1);
});
