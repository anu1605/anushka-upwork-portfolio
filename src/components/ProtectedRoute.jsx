import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

/**
 * Guard for the admin area — redirects to the sign in screen when there is no
 * session.
 */
export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}
