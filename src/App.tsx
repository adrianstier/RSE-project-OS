import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy load page components for better code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scenarios = lazy(() => import('./pages/Scenarios'));
const ActionItems = lazy(() => import('./pages/ActionItems'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="loading-spinner" />
        <p className="text-text-secondary text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="scenarios" element={<Scenarios />} />
                  <Route path="actions" element={<ActionItems />} />
                  <Route path="timeline" element={<Timeline />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
