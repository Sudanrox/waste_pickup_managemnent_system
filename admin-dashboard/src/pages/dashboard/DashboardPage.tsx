import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  Bell,
  MapPin,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { dashboardService } from '../../services/dashboard.service';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: recentNotifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: () => dashboardService.getRecentNotifications(5),
  });

  return (
    <div>
      <Header
        title="Dashboard"
        description="Welcome back! Here's an overview of your system."
        actions={
          <Link to="/notifications/create">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              New Notification
            </Button>
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={Users}
            color="blue"
            loading={statsLoading}
          />
          <StatsCard
            title="Active Wards"
            value={`${stats?.activeWards || 0}/${stats?.totalWards || 32}`}
            icon={MapPin}
            color="green"
            loading={statsLoading}
          />
          <StatsCard
            title="Today's Pickups"
            value={stats?.todayPickups || 0}
            icon={Calendar}
            color="purple"
            loading={statsLoading}
          />
          <StatsCard
            title="Response Rate"
            value={`${stats?.overallResponseRate || 0}%`}
            icon={TrendingUp}
            color="orange"
            loading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <Card>
            <CardHeader
              title="Recent Notifications"
              description="Latest pickup notifications sent"
              action={
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All
                  </Button>
                </Link>
              }
            />
            {notificationsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentNotifications && recentNotifications.length > 0 ? (
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={`/notifications/${notification.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Ward {notification.wardNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(notification.scheduledDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success-500" />
                          <span className="text-gray-600">{notification.yesCount}</span>
                          <XCircle className="w-4 h-4 text-error-500 ml-2" />
                          <span className="text-gray-600">{notification.noCount}</span>
                        </div>
                      </div>
                      <StatusBadge status={notification.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No notifications yet
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader
              title="Quick Actions"
              description="Common tasks and shortcuts"
            />
            <div className="grid grid-cols-2 gap-4">
              <Link to="/notifications/create">
                <QuickActionCard
                  icon={Bell}
                  title="Create Notification"
                  description="Send pickup alert"
                  color="green"
                />
              </Link>
              <Link to="/wards">
                <QuickActionCard
                  icon={MapPin}
                  title="View Wards"
                  description="Ward statistics"
                  color="blue"
                />
              </Link>
              <Link to="/notifications">
                <QuickActionCard
                  icon={Calendar}
                  title="All Notifications"
                  description="View history"
                  color="purple"
                />
              </Link>
              <Link to="/settings">
                <QuickActionCard
                  icon={Users}
                  title="Settings"
                  description="Manage account"
                  color="orange"
                />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}

function StatsCard({ title, value, icon: Icon, color, loading }: StatsCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Card hover>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function QuickActionCard({ icon: Icon, title, description, color }: QuickActionCardProps) {
  const colors = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 border-green-200',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div className={`p-4 rounded-xl border transition-colors duration-200 ${colors[color]}`}>
      <Icon className={`w-8 h-8 mb-3 ${iconColors[color]}`} />
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
