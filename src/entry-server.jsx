import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { FlashProvider } from './context/FlashContext.jsx';
import { HeadProvider, collector } from './context/HeadContext.jsx';

/**
 * Server entry point — renders the app to HTML for each request.
 */

export function render(url, state) {
    collector.current = {};

    const html = renderToString(
        <StaticRouter location={url}>
            <DataProvider state={state}>
                <AuthProvider initialUser={state.user} csrfCookie={state.csrfCookie}>
                    <FlashProvider>
                        <HeadProvider collector={collector}>
                            <App />
                        </HeadProvider>
                    </FlashProvider>
                </AuthProvider>
            </DataProvider>
        </StaticRouter>,
    );

    return { html, head: collector.current };
}
