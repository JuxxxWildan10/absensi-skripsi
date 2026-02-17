import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import LoadingSpinner from './components/LoadingSpinner'
import InstallPrompt from './components/InstallPrompt'

// Lazy Load Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Login = React.lazy(() => import('./pages/Login'))
const Layout = React.lazy(() => import('./components/Layout'))
const Classes = React.lazy(() => import('./pages/Classes'))
const Students = React.lazy(() => import('./pages/Students'))
const Attendance = React.lazy(() => import('./pages/Attendance'))
const Reports = React.lazy(() => import('./pages/Reports'))
const Teachers = React.lazy(() => import('./pages/Teachers'))
const Schedules = React.lazy(() => import('./pages/Schedules'))
const Kiosk = React.lazy(() => import('./pages/Kiosk'))

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    if (user?.role !== 'admin') return <Navigate to="/" replace />; // Redirect non-admins to dashboard
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <DataProvider>
                    <InstallPrompt />
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/kiosk" element={<Kiosk />} />

                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }>
                                <Route index element={<Dashboard />} />
                                <Route path="attendance" element={<Attendance />} />
                                <Route path="reports" element={<Reports />} />

                                {/* Admin Only Routes */}
                                <Route path="classes" element={
                                    <AdminRoute>
                                        <Classes />
                                    </AdminRoute>
                                } />
                                <Route path="students" element={<Students />} />
                                <Route path="teachers" element={
                                    <AdminRoute>
                                        <Teachers />
                                    </AdminRoute>
                                } />
                                <Route path="schedules" element={
                                    <AdminRoute>
                                        <Schedules />
                                    </AdminRoute>
                                } />
                            </Route>
                        </Routes>
                    </Suspense>
                </DataProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
