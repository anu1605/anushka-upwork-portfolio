import { createContext, useContext, useEffect, useRef } from 'react';

/**
 * Head management.
 *
 * Pages describe their meta data with `<Seo />`. During server rendering the
 * values are collected into a plain object and turned into `<head>` markup by
 * the server; on the client they are applied to the live document.
 */

const HeadContext = createContext(null);

/**
 * Shared collector used by the server renderer. Each request resets it before
 * rendering so head data never leaks between pages.
 */
export const collector = { current: {} };

export function HeadProvider({ collector: target, children }) {
    const fallback = useRef({ current: {} });

    return <HeadContext.Provider value={target ?? fallback.current}>{children}</HeadContext.Provider>;
}

export function useHeadCollector() {
    return useContext(HeadContext);
}

/**
 * Declare the meta data for the current route.
 *
 * Only the values that are provided are overridden, so a page can inherit the
 * defaults declared by the layout.
 */
export function Seo({ title, description, keywords, image, type, canonical, status }) {
    const target = useContext(HeadContext);

    const values = {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(keywords !== undefined ? { keywords } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(canonical !== undefined ? { canonical } : {}),
        ...(status !== undefined ? { status } : {}),
    };

    if (target) {
        target.current = { ...target.current, ...values };
    }

    // On the client the same values are pushed into the document once the
    // component is mounted, which keeps the head in sync during client side
    // navigation. The effect never runs during server rendering.
    useEffect(() => {
        applyHead({ title, description, keywords, image, type, canonical });
    }, [title, description, keywords, image, type, canonical]);

    return null;
}

export function applyHead(head) {
    if (typeof document === 'undefined') {
        return;
    }

    if (head.title) {
        document.title = head.title;
    }

    setMeta('name', 'description', head.description);
    setMeta('name', 'keywords', head.keywords);

    setMeta('property', 'og:title', head.title);
    setMeta('property', 'og:description', head.description);
    setMeta('property', 'og:type', head.type);
    setMeta('property', 'og:image', head.image);

    if (head.canonical) {
        let link = document.querySelector('link[rel="canonical"]');

        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }

        link.setAttribute('href', head.canonical);
    }
}

function setMeta(attribute, key, value) {
    if (value === undefined || value === null || value === '') {
        return;
    }

    let tag = document.querySelector(`meta[${attribute}="${key}"]`);

    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
    }

    tag.setAttribute('content', value);
}
