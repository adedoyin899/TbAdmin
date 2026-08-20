import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPage } from './components/Auth/LoginPage';
import { Layout } from './components/Layout/Layout';
import { FunnelDashboard } from './components/Dashboard/FunnelDashboard';
import { FeatureDashboard } from './components/Dashboard/FeatureDashboard';
import { RetentionDashboard } from './components/Dashboard/RetentionDashboard';
import { EmailDashboard } from './components/Dashboard/EmailDashboard';
import { UserLookupPage } from './pages/UserLookup';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes (matches cache TTL)
      retry: 2,
    },
  },
});

// On app load — restore dark mode preference
const savedMode = localStorage.getItem('theme-mode') || 'light';
document.documentElement.setAttribute('data-mode', savedMode);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LoginPage />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard/funnel"
              element={
                <ProtectedRoute>
                  <Layout><FunnelDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/features"
              element={
                <ProtectedRoute>
                  <Layout><FeatureDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/retention"
              element={
                <ProtectedRoute>
                  <Layout><RetentionDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/email"
              element={
                <ProtectedRoute>
                  <Layout><EmailDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lookup"
              element={
                <ProtectedRoute>
                  <Layout><UserLookupPage /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
