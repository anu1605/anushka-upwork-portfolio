/**
 * Inline SVG icons (stroke based, 24x24 grid).
 */

const paths = {
    arrowRight: <path d="M5 12h13M12 5l7 7-7 7" />,
    check: <path d="M20 6 9 17l-5-5" />,
    alert: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16.5v.5" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </>
    ),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </>
    ),
    star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />,
};

export default function Icon({ name, className = 'icon', ...rest }) {
    const shape = paths[name];

    if (!shape) {
        return null;
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...rest}>
            {shape}
        </svg>
    );
}
