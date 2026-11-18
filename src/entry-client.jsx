import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { FlashProvider } from './context/FlashContext.jsx';
import { HeadProvider } from './context/HeadContext.jsx';
import './styles/main.css';

/**
 * Client entry point — hydrates the markup produced by the server.
 */

function readState() {
    const node = document.getElementById('app-state');

    if (!node) {
        return { profile: {}, settings: {}, projects: [], categories: [], user: null };
    }

    try {
        return JSON.parse(node.textContent);
    } catch {
        return { profile: {}, settings: {}, projects: [], categories: [], user: null };
    }
}

const state = readState();

hydrateRoot(
    document.getElementById('root'),
    <StrictMode>
        <DataProvider state={state}>
            <AuthProvider initialUser={state.user} csrfCookie={state.csrfCookie}>
                <FlashProvider>
                    <HeadProvider>
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </HeadProvider>
                </FlashProvider>
            </AuthProvider>
        </DataProvider>
    </StrictMode>,
);
