import { config } from '../config.js';

import * as profile from './profile.js';

/**
 * SEO and social meta helpers.
 */

export async function meta(overrides = {}) {
    const [siteProfile, siteSettings] = await Promise.all([profile.all(), profile.settings()]);
    const siteName = siteSettings.name || config.name;

    return {
        title: overrides.title ?? `${siteName} — ${siteProfile.role ?? 'Portfolio'}`,
        description: overrides.description ?? siteProfile.headline ?? '',
        keywords: overrides.keywords ?? siteSettings.seo?.keywords ?? '',
        image: overrides.image ?? siteSettings.seo?.image ?? '/assets/img/og-cover.svg',
        type: overrides.type ?? siteSettings.seo?.type ?? 'website',
        canonical: overrides.canonical ?? config.url,
        site_name: siteName,
        author: siteProfile.name ?? '',
    };
}

export async function jsonLd() {
    const siteProfile = await profile.all();

    const data = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: siteProfile.name ?? '',
        jobTitle: siteProfile.role ?? '',
        url: config.url,
        address: {
            '@type': 'PostalAddress',
            addressLocality: siteProfile.location ?? '',
        },
        sameAs: [siteProfile.linkedin, siteProfile.github].filter(Boolean),
    };

    return JSON.stringify(data);
}
