import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { api } from '../lib/api.js';

/**
 * Admin authentication state.
 */

const AuthContext = createContext(null);

export function AuthProvider({ initialUser = null, csrfCookie, children }) {
    const [user, setUser] = useState(initialUser);

    const login = useCallback(
        async (username, password) => {
            const response = await api('/admin/api/login', {
                method: 'POST',
                body: { username, password },
                csrfCookie,
            });

            setUser(response.data);

            return response.data;
        },
        [csrfCookie],
    );

    const logout = useCallback(async () => {
        try {
            await api('/admin/api/logout', { method: 'POST', csrfCookie });
        } finally {
            setUser(null);
        }
    }, [csrfCookie]);

    const value = useMemo(() => ({ user, setUser, login, logout }), [user, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error('useAuth() must be used inside an <AuthProvider>.');
    }

    return value;
}
