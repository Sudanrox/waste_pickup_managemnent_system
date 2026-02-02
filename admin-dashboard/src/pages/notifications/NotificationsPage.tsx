import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { notificationService } from '../../services/notification.service';
import { wardService } from '../../services/ward.service';
import { NotificationStatus } from '../../types';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const [wardFilter, setWardFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', wardFilter, statusFilter],
    queryFn: () =>
      notificationService.getNotifications({
        wardNumber: wardFilter ? parseInt(wardFilter) : undefined,
        status: statusFilter as NotificationStatus | undefined,
      }),
  });

  const { data: wards } = useQuery({
    queryKey: ['wards'],
    queryFn: wardService.getWards,
  });

  const wardOptions = [
    { value: '', label: 'All Wards' },
    ...(wards?.map((w) => ({ value: String(w.wardNumber), label: `Ward ${w.wardNumber}` })) || []),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'sent', label: 'Sent' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      <Header
        title="Notifications"
        description="Manage pickup notifications for all wards"
        actions={
          <Link to="/notifications/create">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Create Notification
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        <Card padding="none">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="w-48">
              <Select
                options={wardOptions}
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                placeholder="Filter by ward"
              />
            </div>
            <div className="w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="Filter by status"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="primary">Ward {notification.wardNumber}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(notification.scheduledDate.toDate(), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.scheduledTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={notification.status} />
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(notification.createdAt.toDate(), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link to={`/notifications/${notification.id}`}>
                          <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                            View
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
              <p className="text-gray-500 mb-4">No notifications found</p>
              <Link to="/notifications/create">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Create First Notification
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
