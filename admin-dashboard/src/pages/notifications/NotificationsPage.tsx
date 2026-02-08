/**
 * Notifications Page
 * Lists all pickup notifications with filters, status labels, and response stats
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Calendar,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { notificationService } from '../../services/notification.service';
import { wardService } from '../../services/ward.service';
import { NotificationStatus } from '../../types';
import { mockNotifications, mockWards } from '../../services/mockData';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [wardFilter, setWardFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch notifications (with mock fallback)
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', wardFilter, statusFilter],
    queryFn: () =>
      notificationService.getNotifications({
        wardNumber: wardFilter ? parseInt(wardFilter) : undefined,
        status: statusFilter as NotificationStatus | undefined,
      }),
  });

  // Fetch wards for filter dropdown
  const { data: wards } = useQuery({
    queryKey: ['wards'],
    queryFn: wardService.getWards,
  });

  // Use mock data as fallback
  const notificationsList = notifications || mockNotifications;
  const wardsList = wards || mockWards;

  // Filter mock notifications if using fallback
  const filteredNotifications = notificationsList.filter((n) => {
    const matchesWard = wardFilter ? n.wardNumber === parseInt(wardFilter) : true;
    const matchesStatus = statusFilter ? n.status === statusFilter : true;
    return matchesWard && matchesStatus;
  });

  // Ward options (1-32)
  const wardOptions = [
    { value: '', label: t('common.all') + ' Wards' },
    ...wardsList.map((w) => ({
      value: String(w.wardNumber),
      label: `Ward ${w.wardNumber}`,
    })),
  ];

  // Status options with translations
  const statusOptions = [
    { value: '', label: t('common.all') + ' Status' },
    { value: 'scheduled', label: t('notifications.scheduled') },
    { value: 'sent', label: t('notifications.sent') },
    { value: 'completed', label: t('notifications.completed') },
    { value: 'cancelled', label: t('notifications.cancelled') },
  ];

  return (
    <div>
      <Header
        title={t('notifications.title')}
        description={t('notifications.description')}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/calendar">
              <Button variant="ghost" leftIcon={<Calendar className="w-4 h-4" />}>
                Calendar View
              </Button>
            </Link>
            <Link to="/notifications/create">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                {t('notifications.create')}
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-8">
        <Card padding="none">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">{t('common.filter')}:</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {/* Ward Filter (1-32) */}
                <div className="w-48">
                  <Select
                    options={wardOptions}
                    value={wardFilter}
                    onChange={(e) => setWardFilter(e.target.value)}
                    placeholder="Filter by ward"
                  />
                </div>
                {/* Status Filter */}
                <div className="w-48">
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    placeholder="Filter by status"
                  />
                </div>
              </div>

              {/* Status Labels Legend */}
              <div className="ml-auto hidden lg:flex items-center gap-2">
                <span className="text-xs text-gray-400">Status:</span>
                <Badge variant="warning">{t('notifications.scheduled')}</Badge>
                <Badge variant="primary">{t('notifications.sent')}</Badge>
                <Badge variant="success">{t('notifications.completed')}</Badge>
                <Badge variant="danger">{t('notifications.cancelled')}</Badge>
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.scheduledDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.responses')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reminders
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      {/* Ward */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-bold text-sm">
                              {notification.wardNumber}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">
                            Ward {notification.wardNumber}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {typeof notification.scheduledDate === 'object' && 'toDate' in notification.scheduledDate
                            ? format(notification.scheduledDate.toDate(), 'MMM d, yyyy')
                            : format(new Date(notification.scheduledDate as string), 'MMM d, yyyy')}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {notification.scheduledTime}
                        </div>
                      </td>

                      {/* Messages (EN/NE) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary">EN</Badge>
                          <Badge variant="secondary">NE</Badge>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={notification.status as 'scheduled' | 'sent' | 'completed' | 'cancelled'} />
                      </td>

                      {/* Responses */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1 text-success-600">
                            <CheckCircle className="w-4 h-4" />
                            {notification.responseStats?.yesCount || 0}
                          </span>
                          <span className="flex items-center gap-1 text-error-600">
                            <XCircle className="w-4 h-4" />
                            {notification.responseStats?.noCount || 0}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            {(notification.responseStats?.totalCustomers || 0) -
                              (notification.responseStats?.yesCount || 0) -
                              (notification.responseStats?.noCount || 0)}
                          </span>
                        </div>
                      </td>

                      {/* Reminders */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {(notification as any).reminders?.oneDayBefore && (
                            <Badge variant="secondary" className="text-xs">
                              24h
                            </Badge>
                          )}
                          {(notification as any).reminders?.sameDay && (
                            <Badge variant="secondary" className="text-xs">
                              2h
                            </Badge>
                          )}
                          {!(notification as any).reminders?.oneDayBefore &&
                            !(notification as any).reminders?.sameDay && (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link to={`/notifications/${notification.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            {t('common.view')}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">{t('notifications.noNotifications')}</p>
              <Link to="/notifications/create">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  {t('notifications.createFirst')}
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
