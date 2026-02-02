import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import CreateNotificationPage from './pages/notifications/CreateNotificationPage';
import NotificationDetailPage from './pages/notifications/NotificationDetailPage';
import WardsPage from './pages/wards/WardsPage';
import SettingsPage from './pages/settings/SettingsPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          user ? <MainLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notifications/create" element={<CreateNotificationPage />} />
        <Route path="/notifications/:id" element={<NotificationDetailPage />} />
        <Route path="/wards" element={<WardsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
