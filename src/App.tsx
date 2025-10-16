import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@store/auth/AuthContext';
import { SidebarProvider } from '@store/sidebar/SidebarContext';
import { DroneProvider } from '@store/drone/DroneContext';
import { TrackingProvider } from '@store/tracking/TrackingContext';
import { ErrorBoundary } from '@components/ui/ErrorBoundary';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { MainLayout } from '@components/layout/MainLayout';
import { LoginPage } from '@pages/LoginPage';

const NewDashboardPage = lazy(() => import('@pages/NewDashboardPage').then(m => ({ default: m.NewDashboardPage })));
const DronesPage = lazy(() => import('@pages/DronesPage').then(m => ({ default: m.DronesPage })));

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <DroneProvider>
                        <TrackingProvider>
                            <SidebarProvider>
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />

                                    <Route
                                        path="/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <MainLayout>
                                                    <Suspense fallback={<LoadingFallback />}>
                                                        <NewDashboardPage />
                                                    </Suspense>
                                                </MainLayout>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/drones"
                                        element={
                                            <ProtectedRoute>
                                                <MainLayout>
                                                    <Suspense fallback={<LoadingFallback />}>
                                                        <DronesPage />
                                                    </Suspense>
                                                </MainLayout>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/users"
                                        element={
                                            <ProtectedRoute>
                                                <MainLayout>
                                                    <div className="text-center py-12">
                                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h2>
                                                        <p className="text-gray-600 dark:text-gray-400 mt-2">Página en construcción</p>
                                                    </div>
                                                </MainLayout>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/reports"
                                        element={
                                            <ProtectedRoute>
                                                <MainLayout>
                                                    <div className="text-center py-12">
                                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h2>
                                                        <p className="text-gray-600 dark:text-gray-400 mt-2">Página en construcción</p>
                                                    </div>
                                                </MainLayout>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/analytics"
                                        element={
                                            <ProtectedRoute>
                                                <MainLayout>
                                                    <div className="text-center py-12">
                                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analítica</h2>
                                                        <p className="text-gray-600 dark:text-gray-400 mt-2">Página en construcción</p>
                                                    </div>
                                                </MainLayout>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/settings"
                                        element={
                                            <ProtectedRoute>
                                                <MainLayout>
                                                    <div className="text-center py-12">
                                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h2>
                                                        <p className="text-gray-600 dark:text-gray-400 mt-2">Página en construcción</p>
                                                    </div>
                                                </MainLayout>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </SidebarProvider>
                        </TrackingProvider>
                    </DroneProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;