import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, LoginPage } from '@features/auth';
import { MainLayout } from '@shared/layout';
import { ROUTES } from './routes';

// Lazy load de páginas para code splitting
const DashboardPage = lazy(() => import('@features/tracking').then(m => ({ default: m.DashboardPage })));
const DronesPage = lazy(() => import('@features/drones').then(m => ({ default: m.DronesPage })));
const GeofencesPage = lazy(() => import('@features/geofences').then(m => ({ default: m.GeofencesPage })));
const RoutesPage = lazy(() => import('@features/routes').then(m => ({ default: m.RoutesPage })));
const MissionsListPage = lazy(() => import('@features/missions').then(m => ({ default: m.MissionsListPage })));
const MissionFormPage = lazy(() => import('@features/missions').then(m => ({ default: m.MissionFormPage })));
const MissionControlPage = lazy(() => import('@features/mission').then(m => ({ default: m.MissionPage })));
const MissionPlaybackPage = lazy(() => import('@features/mission').then(m => ({ default: m.MissionPlaybackPage })));
const OperatorsPage = lazy(() => import('@features/operators').then(m => ({ default: m.OperatorsPage })));

// Componente de carga
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
    </div>
);

// Componente placeholder para páginas en construcción
const UnderConstruction = ({ title }: { title: string }) => (
    <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Página en construcción</p>
    </div>
);

/**
 * AppRouter - Configuración centralizada de rutas
 */
export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública - Login */}
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />

                {/* Rutas protegidas */}
                <Route
                    path={ROUTES.DASHBOARD}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <DashboardPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.DRONES}
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
                    path={ROUTES.GEOFENCES}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <GeofencesPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.ROUTES}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <RoutesPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.OPERATORS}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <OperatorsPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Misiones */}
                <Route
                    path={ROUTES.MISSIONS}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <MissionsListPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.MISSIONS_NEW}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <MissionFormPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.MISSIONS_EDIT}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <MissionFormPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.MISSIONS_CONTROL}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <MissionControlPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.MISSIONS_PLAYBACK}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Suspense fallback={<LoadingFallback />}>
                                    <MissionPlaybackPage />
                                </Suspense>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Rutas en construcción */}
                <Route
                    path={ROUTES.USERS}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <UnderConstruction title="Usuarios" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.REPORTS}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <UnderConstruction title="Reportes" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.ANALYTICS}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <UnderConstruction title="Analítica" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path={ROUTES.SETTINGS}
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <UnderConstruction title="Configuración" />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Redirecciones */}
                <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route path={ROUTES.WILDCARD} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
        </BrowserRouter>
    );
};
