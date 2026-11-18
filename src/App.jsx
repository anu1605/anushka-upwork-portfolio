import { Route, Routes } from 'react-router-dom';

import AdminLayout from './components/AdminLayout.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import About from './pages/About.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Projects from './pages/Projects.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Login from './pages/admin/Login.jsx';
import MessageDetail from './pages/admin/MessageDetail.jsx';
import Messages from './pages/admin/Messages.jsx';
import ProjectForm from './pages/admin/ProjectForm.jsx';
import ProjectsAdmin from './pages/admin/ProjectsAdmin.jsx';

/**
 * Route table.
 */
export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:slug" element={<ProjectDetail />} />
            </Route>

            <Route path="admin/login" element={<Login />} />

            <Route
                path="admin"
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<ProjectsAdmin />} />
                <Route path="projects/create" element={<ProjectForm />} />
                <Route path="projects/:id/edit" element={<ProjectForm />} />
                <Route path="messages" element={<Messages />} />
                <Route path="messages/:id" element={<MessageDetail />} />
            </Route>

            <Route element={<Layout />}>
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
