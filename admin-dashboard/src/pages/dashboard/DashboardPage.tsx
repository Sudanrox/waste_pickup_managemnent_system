/**
 * Dashboard Page
 * Main overview showing stats, today's pickups, calendar preview, and recent notifications
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { dashboardService } from '../../services/dashboard.service';
import {
  mockDashboardStats,
  mockTodayPickups,
  mockUpcomingPickups,
  mockNotifications,
  mockWards,
  generateMockNotifications,
} from '../../services/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { useState, useMemo } from 'react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Use mock data for stats
  const stats = mockDashboardStats;
  const todayPickups = mockTodayPickups;
  const upcomingPickups = mockUpcomingPickups;

  // Fetch recent notifications (can fallback to mock)
  const { data: recentNotifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: () => dashboardService.getRecentNotifications(5),
  });

  // Use mock notifications as fallback
  const displayNotifications = recentNotifications || generateMockNotifications(5).map(n => ({
    id: n.id,
    wardNumber: n.wardNumber,
    scheduledDate: n.scheduledDate,
    status: n.status,
    yesCount: n.responseStats.yesCount,
    noCount: n.responseStats.noCount,
  }));

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding days at the start
    const startPadding = start.getDay();
    const paddedDays = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      const day = new Date(start);
      day.setDate(day.getDate() - (i + 1));
      paddedDays.push({ date: day, isCurrentMonth: false });
    }

    days.forEach(day => {
      paddedDays.push({ date: day, isCurrentMonth: true });
    });

    return paddedDays;
  }, [currentMonth]);

  // Check if a day has pickups
  const hasPickup = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return upcomingPickups[dateStr]?.length > 0;
  };

  const getPickupCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return upcomingPickups[dateStr]?.length || 0;
  };

  return (
    <div>
      <Header
        title={t('dashboard.title')}
        description={t('dashboard.welcome')}
        actions={
          <Link to="/notifications/create">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              {t('dashboard.newNotification')}
            </Button>
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        {/* Stats Grid - 4 key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={t('dashboard.totalCustomers')}
            value={stats.totalCustomers.toLocaleString()}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title={t('dashboard.activeWards')}
            value={`${stats.activeWards}/32`}
            icon={MapPin}
            color="green"
          />
          <StatsCard
            title={t('dashboard.upcomingPickups')}
            value={stats.upcomingPickups}
            subtitle="7 days"
            icon={Calendar}
            color="purple"
          />
          <StatsCard
            title={t('dashboard.responseRate')}
            value={`${stats.responseRate}%`}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Today's Pickups Table & Calendar Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Pickups by Ward Table */}
          <Card className="lg:col-span-2">
            <CardHeader
              title={t('dashboard.todayPickupsByWard')}
              description={`${todayPickups.length} pickups scheduled`}
              action={
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {t('dashboard.viewAll')}
                  </Button>
                </Link>
              }
            />
            {todayPickups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ward
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Responses
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayPickups.map((pickup, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-bold text-sm">
                                {pickup.wardNumber}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {pickup.wardName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {pickup.scheduledTime}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {pickup.totalCustomers}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-success-500 h-2 rounded-full"
                                style={{
                                  width: `${(pickup.responded / pickup.totalCustomers) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {pickup.responded}/{pickup.totalCustomers}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant={pickup.status === 'in_progress' ? 'success' : 'warning'}
                          >
                            {pickup.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t('dashboard.noPickupsToday')}</p>
              </div>
            )}
          </Card>

          {/* Mini Calendar Preview */}
          <Card>
            <CardHeader
              title={t('dashboard.pickupCalendar')}
              description={format(currentMonth, 'MMMM yyyy')}
              action={
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              }
            />
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div
                  key={idx}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                const hasPickupOnDay = hasPickup(date);
                const pickupCount = getPickupCount(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={idx}
                    className={`
                      relative text-center py-2 text-sm rounded-lg cursor-pointer
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                      ${isTodayDate ? 'bg-primary-100 text-primary-700 font-bold' : ''}
                      ${hasPickupOnDay && !isTodayDate ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}
                    `}
                    title={hasPickupOnDay ? `${pickupCount} pickups` : undefined}
                  >
                    {format(date, 'd')}
                    {hasPickupOnDay && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend & View Full Calendar Link */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary-100 border border-primary-300" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                  <span>Scheduled</span>
                </div>
              </div>
              <Link to="/calendar">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Full Calendar
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Response Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Distribution Pie Chart */}
          <Card>
            <CardHeader
              title="Response Overview"
              description="Aggregate YES/NO/Pending across all notifications"
            />
            <ResponsePieChart notifications={mockNotifications} />
          </Card>

          {/* Ward Response Rates Bar Chart */}
          <Card>
            <CardHeader
              title="Response Rate by Ward"
              description="Top 10 wards by response rate"
            />
            <WardResponseBarChart wards={mockWards} />
          </Card>
        </div>

        {/* Recent Notifications & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <Card>
            <CardHeader
              title={t('dashboard.recentNotifications')}
              description="Latest pickup notifications sent"
              action={
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {t('dashboard.viewAll')}
                  </Button>
                </Link>
              }
            />
            {notificationsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : displayNotifications && displayNotifications.length > 0 ? (
              <div className="space-y-4">
                {displayNotifications.slice(0, 5).map((notification) => (
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
                      <StatusBadge status={notification.status as 'scheduled' | 'sent' | 'completed' | 'cancelled'} />
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
              title={t('dashboard.quickActions')}
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

// ============================================
// Stats Card Component
// ============================================
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}

function StatsCard({ title, value, subtitle, icon: Icon, color, loading }: StatsCardProps) {
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
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <span className="text-xs text-gray-400">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============================================
// Quick Action Card Component
// ============================================
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

// ============================================
// Response Pie Chart Component
// ============================================

const PIE_COLORS = ['#22c55e', '#ef4444', '#94a3b8'];

interface MockNotification {
  responseStats: {
    totalCustomers: number;
    yesCount: number;
    noCount: number;
  };
}

function ResponsePieChart({ notifications }: { notifications: MockNotification[] }) {
  const data = useMemo(() => {
    const totals = notifications.reduce(
      (acc, n) => ({
        yes: acc.yes + n.responseStats.yesCount,
        no: acc.no + n.responseStats.noCount,
        pending:
          acc.pending +
          (n.responseStats.totalCustomers - n.responseStats.yesCount - n.responseStats.noCount),
      }),
      { yes: 0, no: 0, pending: 0 }
    );

    return [
      { name: 'Yes', value: totals.yes },
      { name: 'No', value: totals.no },
      { name: 'Pending', value: totals.pending },
    ];
  }, [notifications]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Ward Response Rate Bar Chart Component
// ============================================

interface MockWard {
  wardNumber: number;
  name: string;
  responseRate: number;
  customerCount: number;
}

function WardResponseBarChart({ wards }: { wards: MockWard[] }) {
  const data = useMemo(() => {
    return [...wards]
      .sort((a, b) => b.responseRate - a.responseRate)
      .slice(0, 10)
      .map((w) => ({
        ward: `W${w.wardNumber}`,
        name: w.name,
        rate: w.responseRate,
        customers: w.customerCount,
      }));
  }, [wards]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="ward" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Response Rate']}
          />
          <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
