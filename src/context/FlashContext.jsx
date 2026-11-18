import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Flash (toast) messages.
 *
 * The PHP app used session flash messages that survived a redirect. In a
 * single page app the message is held in memory for the lifetime of the view.
 */

const FlashContext = createContext(null);

export function FlashProvider({ children }) {
    const [flash, setFlash] = useState(null);

    const show = useCallback((type, message) => {
        setFlash({ type, message, id: Date.now() });
    }, []);

    const success = useCallback((message) => show('success', message), [show]);
    const error = useCallback((message) => show('error', message), [show]);
    const clear = useCallback(() => setFlash(null), []);

    const value = useMemo(() => ({ flash, show, success, error, clear }), [flash, show, success, error, clear]);

    return <FlashContext.Provider value={value}>{children}</FlashContext.Provider>;
}

export function useFlash() {
    const value = useContext(FlashContext);

    if (!value) {
        throw new Error('useFlash() must be used inside a <FlashProvider>.');
    }

    return value;
}
