import { useEffect, useRef } from 'react';

/**
 * Reveal cards on scroll.
 *
 * Mirrors the original progressive enhancement: elements start slightly
 * offset and fade in once they enter the viewport.
 */
export function useReveal(dependency) {
    const ref = useRef(null);

    useEffect(() => {
        const root = ref.current;

        if (!root || !('IntersectionObserver' in window)) {
            return undefined;
        }

        const targets = root.querySelectorAll('.card, .timeline-item');

        if (targets.length === 0) {
            return undefined;
        }

        targets.forEach((element) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(12px)';
            element.style.transition = 'opacity 420ms ease, transform 420ms ease';
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'none';
                    }, index * 55);

                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
        );

        targets.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [dependency]);

    return ref;
}
