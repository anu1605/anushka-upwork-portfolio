import { useCallback, useEffect, useState } from 'react';

/**
 * Dark / light theme toggle.
 *
 * The initial theme is applied by the inline script in `index.html` so there is
 * no flash of the wrong colours before React boots.
 */
export function useTheme() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    }, []);

    const toggle = useCallback(() => {
        setTheme((current) => {
            const next = current === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', next);

            try {
                localStorage.setItem('theme', next);
            } catch {
                // storage unavailable — the theme still applies for this page
            }

            return next;
        });
    }, []);

    return { theme, toggle };
}
