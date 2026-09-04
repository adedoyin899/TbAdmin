import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPage } from './components/Auth/LoginPage';
import { LandingPage } from './components/Landing/LandingPage';
import { Layout } from './components/Layout/Layout';
import { FunnelDashboard } from './components/Dashboard/FunnelDashboard';
import { FeatureDashboard } from './components/Dashboard/FeatureDashboard';
import { RetentionDashboard } from './components/Dashboard/RetentionDashboard';
import { EmailDashboard } from './components/Dashboard/EmailDashboard';
import { RoomInsightsDashboard } from './components/Dashboard/RoomInsightsDashboard';
import { WebsiteAnalyticsDashboard } from './components/Dashboard/WebsiteAnalyticsDashboard';

import { SocialMediaOverview } from './components/SocialMedia/SocialMediaOverview';
import { LinkedInDetailedView } from './components/SocialMedia/LinkedInDetailedView';
import { RedditDetailedView } from './components/SocialMedia/RedditDetailedView';
import { EmailDetailedView } from './components/Email/EmailDetailedView';
import { CampaignList } from './components/Campaigns/CampaignList';
import { CampaignPerformance } from './components/Campaigns/CampaignPerformance';
import { SocialMediaTabs } from './components/SocialMedia/SocialMediaTabs';
import { HelpGuide } from './components/Help/HelpGuide';
import { UserLookupPage } from './pages/UserLookup';

import { SettingsPage } from './pages/Settings';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

const CampaignPerformanceWrapper: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  return <CampaignPerformance campaignId={campaignId || 'camp_q3_launch'} />;
};





const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes (matches cache TTL)
      retry: 2,
    },
  },
});

// On app load — default to dark mode for executive portal
const savedMode = localStorage.getItem('theme-mode') || 'dark';
document.documentElement.setAttribute('data-mode', savedMode);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SettingsProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/landing" element={<LandingPage />} />

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
                path="/dashboard/website"
                element={
                  <ProtectedRoute>
                    <Layout><WebsiteAnalyticsDashboard /></Layout>
                  </ProtectedRoute>
                }
              />
              {/* Social Media Routes */}
              <Route
                path="/dashboard/social-media"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SocialMediaTabs />
                      <SocialMediaOverview />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social-media/overview"
                element={<Navigate to="/dashboard/social-media" replace />}
              />
              <Route
                path="/social-media/linkedin"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SocialMediaTabs />
                      <LinkedInDetailedView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/social-media/linkedin"
                element={<Navigate to="/social-media/linkedin" replace />}
              />
              <Route
                path="/social-media/reddit"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SocialMediaTabs />
                      <RedditDetailedView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/social-media/reddit"
                element={<Navigate to="/social-media/reddit" replace />}
              />

              {/* Marketing Campaigns Routes */}
              <Route
                path="/dashboard/campaigns"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SocialMediaTabs />
                      <CampaignList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns"
                element={<Navigate to="/dashboard/campaigns" replace />}
              />
              <Route
                path="/dashboard/campaigns/:campaignId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SocialMediaTabs />
                      <CampaignPerformanceWrapper />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/campaigns/:campaignId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SocialMediaTabs />
                      <CampaignPerformanceWrapper />
                    </Layout>
                  </ProtectedRoute>
                }
              />


              {/* Email Routes */}
              <Route
                path="/dashboard/email"
                element={
                  <ProtectedRoute>
                    <Layout><EmailDashboard /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/email/detailed"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SocialMediaTabs />
                      <EmailDetailedView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/email/detailed"
                element={<Navigate to="/email/detailed" replace />}
              />



              <Route
                path="/dashboard/rooms"
                element={
                  <ProtectedRoute>
                    <Layout><RoomInsightsDashboard /></Layout>
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
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout><SettingsPage /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* Help & Knowledge Guide */}
              <Route
                path="/help/guide"
                element={
                  <ProtectedRoute>
                    <Layout><HelpGuide /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/help"
                element={<Navigate to="/help/guide" replace />}
              />
              <Route
                path="/help"
                element={<Navigate to="/help/guide" replace />}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
  );
}

export default App;
