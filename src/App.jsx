import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Recommendations from './pages/Recommendations';

function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function AdminRoute({ children }) {
    const { currentUser } = useAuth();
    if (currentUser) {
        return <Navigate to="/admin" replace />;
    }
    return children;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="statistika" element={<Statistics />} />
                        <Route path="ai-tavsiyalar" element={<Recommendations />} />

                        <Route
                            path="login"
                            element={
                                <AdminRoute>
                                    <Login />
                                </AdminRoute>
                            }
                        />

                        <Route
                            path="admin"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
