import { createContext, useContext } from 'react';

/**
 * Server-rendered data made available to the whole app.
 *
 * The server renders with the real content already in memory, so the first
 * paint needs no network round trip. The same object is serialised into the
 * HTML and handed to the client for hydration.
 */

const DataContext = createContext(null);

export function DataProvider({ state, children }) {
    return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}

export function useData() {
    const state = useContext(DataContext);

    if (!state) {
        throw new Error('useData() must be used inside a <DataProvider>.');
    }

    return state;
}
