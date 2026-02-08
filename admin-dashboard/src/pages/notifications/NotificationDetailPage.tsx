import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { notificationService } from '../../services/notification.service';
import { format } from 'date-fns';

// Helper: convert Firestore Timestamp or ISO string to Date
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDate(value: any): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  if (value?.toDate) return value.toDate();
  return new Date(value);
}

const rescheduleSchema = z.object({
  newDate: z.string().min(1, 'Please select a date'),
  newTime: z.string().min(1, 'Please select a time'),
  reason: z.string().min(5, 'Please provide a reason'),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showReschedule, setShowReschedule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: notification, isLoading } = useQuery({
    queryKey: ['notification', id],
    queryFn: () => notificationService.getNotification(id!),
    enabled: !!id,
  });

  const { data: responses, isLoading: responsesLoading } = useQuery({
    queryKey: ['responses', id],
    queryFn: () => notificationService.getResponses(id!),
    enabled: !!id,
  });

  const rescheduleMutation = useMutation({
    mutationFn: notificationService.reschedulePickup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification', id] });
      navigate(`/notifications/${data.newNotificationId}`);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
  });

  const timeOptions = [
    { value: '6:00 AM', label: '6:00 AM' },
    { value: '7:00 AM', label: '7:00 AM' },
    { value: '8:00 AM', label: '8:00 AM' },
    { value: '9:00 AM', label: '9:00 AM' },
    { value: '10:00 AM', label: '10:00 AM' },
    { value: '11:00 AM', label: '11:00 AM' },
    { value: '12:00 PM', label: '12:00 PM' },
    { value: '1:00 PM', label: '1:00 PM' },
    { value: '2:00 PM', label: '2:00 PM' },
    { value: '3:00 PM', label: '3:00 PM' },
    { value: '4:00 PM', label: '4:00 PM' },
    { value: '5:00 PM', label: '5:00 PM' },
  ];

  const onReschedule = (data: RescheduleFormData) => {
    if (!id) return;
    setError(null);
    rescheduleMutation.mutate({
      notificationId: id,
      newDate: data.newDate,
      newTime: data.newTime,
      reason: data.reason,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Notification not found</p>
            <Button onClick={() => navigate('/notifications')}>
              Back to Notifications
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const stats = notification.responseStats || {
    totalCustomers: 0,
    yesCount: 0,
    noCount: 0,
  };
  const pendingCount = stats.totalCustomers - stats.yesCount - stats.noCount;
  const responseRate =
    stats.totalCustomers > 0
      ? Math.round(((stats.yesCount + stats.noCount) / stats.totalCustomers) * 100)
      : 0;

  return (
    <div>
      <Header
        title={`Notification - Ward ${notification.wardNumber}`}
        description={`Scheduled for ${format(toDate(notification.scheduledDate), 'MMMM d, yyyy')}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/notifications')}
            >
              Back
            </Button>
            {notification.status === 'scheduled' && (
              <Button
                variant="secondary"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => setShowReschedule(!showReschedule)}
              >
                Reschedule
              </Button>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Status Banner */}
        <Card className={`border-l-4 ${
          notification.status === 'completed' ? 'border-l-success-500' :
          notification.status === 'cancelled' ? 'border-l-error-500' :
          notification.status === 'sent' ? 'border-l-primary-500' :
          'border-l-warning-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusBadge status={notification.status} />
              <span className="text-gray-600">
                {notification.status === 'scheduled' && 'Notification is scheduled to be sent'}
                {notification.status === 'sent' && 'Notification has been sent to customers'}
                {notification.status === 'completed' && 'Pickup has been completed'}
                {notification.status === 'cancelled' && 'This pickup has been cancelled'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Created {format(toDate(notification.createdAt), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </Card>

        {/* Reschedule Form */}
        {showReschedule && notification.status === 'scheduled' && (
          <Card>
            <CardHeader
              title="Reschedule Pickup"
              description="Create a new notification with updated schedule"
            />

            {error && (
              <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-sm text-error-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onReschedule)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="New Date"
                  type="date"
                  error={errors.newDate?.message}
                  min={new Date().toISOString().split('T')[0]}
                  {...register('newDate')}
                />
                <Select
                  label="New Time"
                  options={timeOptions}
                  placeholder="Select time"
                  error={errors.newTime?.message}
                  {...register('newTime')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason for Rescheduling
                </label>
                <textarea
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., Weather conditions, holiday, etc."
                  {...register('reason')}
                />
                {errors.reason && (
                  <p className="mt-1.5 text-sm text-error-500">{errors.reason.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowReschedule(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={rescheduleMutation.isPending}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send Reschedule
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <Card className="lg:col-span-2">
            <CardHeader title="Notification Details" />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ward</p>
                    <p className="font-medium">Ward {notification.wardNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-500">Recipients</p>
                    <p className="font-medium">{stats.totalCustomers} customers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-500">Scheduled Date</p>
                    <p className="font-medium">
                      {format(toDate(notification.scheduledDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-500">Scheduled Time</p>
                    <p className="font-medium">{notification.scheduledTime}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Message (English)</h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {notification.messageText}
                </p>
              </div>

              {notification.messageTextNe && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message (Nepali)</h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {notification.messageTextNe}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Response Stats */}
          <Card>
            <CardHeader title="Response Statistics" />

            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-4xl font-bold text-gray-900">{responseRate}%</p>
                <p className="text-sm text-gray-500">Response Rate</p>
              </div>

              {/* Pie Chart */}
              {stats.totalCustomers > 0 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Yes', value: stats.yesCount },
                          { name: 'No', value: stats.noCount },
                          { name: 'Pending', value: pendingCount },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#94a3b8" />
                      </Pie>
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="text-success-700">Yes</span>
                  </div>
                  <span className="font-semibold text-success-700">{stats.yesCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-error-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-error-600" />
                    <span className="text-error-700">No</span>
                  </div>
                  <span className="font-semibold text-error-700">{stats.noCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">Pending</span>
                  </div>
                  <span className="font-semibold text-gray-600">{pendingCount}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-success-500 h-full"
                    style={{ width: `${stats.totalCustomers > 0 ? (stats.yesCount / stats.totalCustomers) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-error-500 h-full"
                    style={{ width: `${stats.totalCustomers > 0 ? (stats.noCount / stats.totalCustomers) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Yes: {stats.totalCustomers > 0 ? Math.round((stats.yesCount / stats.totalCustomers) * 100) : 0}%</span>
                  <span>No: {stats.totalCustomers > 0 ? Math.round((stats.noCount / stats.totalCustomers) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Responses List */}
        <Card>
          <CardHeader
            title="Customer Responses"
            description={`${responses?.length || 0} responses received`}
          />

          {responsesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : responses && responses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {responses.map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {response.customerName || 'Customer'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {response.customerPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {response.response === 'yes' ? (
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" /> Yes
                          </Badge>
                        ) : (
                          <Badge variant="error">
                            <XCircle className="w-3 h-3 mr-1" /> No
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(toDate(response.respondedAt), 'MMM d, yyyy h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No responses yet
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
