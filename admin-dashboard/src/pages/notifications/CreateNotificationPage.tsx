/**
 * Create Notification Page
 * Form for creating ward-based pickup notifications with bilingual messages,
 * date/time scheduling, reminders, and SMS options
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Send,
  Bell,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Smartphone,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { notificationService } from '../../services/notification.service';
import { wardService } from '../../services/ward.service';
import { mockWards, addMockNotification } from '../../services/mockData';

// ============================================
// Validation Schema
// ============================================
const notificationSchema = z.object({
  wardNumber: z.string().min(1, 'Please select a ward'),
  scheduledDate: z.string().min(1, 'Please select a date'),
  scheduledTime: z.string().min(1, 'Please enter a time'),
  messageText: z.string().min(10, 'Message must be at least 10 characters'),
  messageTextNe: z.string().min(10, 'Nepali message must be at least 10 characters'),
  // Reminder options
  enableReminders: z.boolean().default(true),
  reminder1Day: z.boolean().default(true),
  reminderSameDay: z.boolean().default(true),
  // SMS option (UI only)
  sendSms: z.boolean().default(false),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function CreateNotificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Pre-select ward from URL params (from wards page)
  const preselectedWard = searchParams.get('ward') || '';

  // Fetch wards (with mock fallback)
  const { data: wards } = useQuery({
    queryKey: ['wards'],
    queryFn: wardService.getWards,
  });

  const wardsList = wards || mockWards;

  // Create notification mutation (falls back to mock store when Firebase is unavailable)
  const createMutation = useMutation({
    mutationFn: async (input: { wardNumber: number; scheduledDate: string; scheduledTime: string; messageText: string; messageTextNe?: string }) => {
      try {
        const result = await notificationService.createNotification(input);
        return result;
      } catch {
        // Firebase unavailable — save to local mock store
        const id = addMockNotification(input);
        return { notificationId: id };
      }
    },
    onSuccess: () => {
      navigate('/notifications');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      wardNumber: preselectedWard,
      messageText:
        'Waste pickup scheduled for your ward. Please keep your waste ready at the collection point.',
      messageTextNe:
        'तपाईंको वडाको लागि फोहोर संकलन तालिका बनाइएको छ। कृपया आफ्नो फोहोर संकलन स्थानमा तयार राख्नुहोस्।',
      enableReminders: true,
      reminder1Day: true,
      reminderSameDay: true,
      sendSms: false,
    },
  });

  // Watch form values for preview
  const selectedWard = watch('wardNumber');
  const messageText = watch('messageText');
  const messageTextNe = watch('messageTextNe');
  const scheduledDate = watch('scheduledDate');
  const scheduledTime = watch('scheduledTime');
  const enableReminders = watch('enableReminders');
  const reminder1Day = watch('reminder1Day');
  const reminderSameDay = watch('reminderSameDay');
  const sendSms = watch('sendSms');

  // Find selected ward data
  const selectedWardData = wardsList?.find(
    (w) => w.wardNumber === parseInt(selectedWard)
  );

  // Ward options (1-32)
  const wardOptions = wardsList?.map((w) => ({
    value: String(w.wardNumber),
    label: `Ward ${w.wardNumber} - ${w.name}`,
  })) || [];

  // Time options
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

  // Form submission
  const onSubmit = (data: NotificationFormData) => {
    setError(null);
    createMutation.mutate({
      wardNumber: parseInt(data.wardNumber),
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      messageText: data.messageText,
      messageTextNe: data.messageTextNe,
    });
  };

  return (
    <div>
      <Header
        title={t('notifications.createTitle')}
        description={t('notifications.createDescription')}
        actions={
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/notifications')}
          >
            Back
          </Button>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Notification Details"
                description="Fill in the details for the pickup notification"
              />

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-error-500" />
                  <p className="text-sm text-error-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Ward Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('notifications.selectWard')} (1-32)
                  </label>
                  <Select
                    options={wardOptions}
                    placeholder="Choose a ward"
                    error={errors.wardNumber?.message}
                    {...register('wardNumber')}
                  />
                </div>

                {/* Ward Info Badge */}
                {selectedWardData && (
                  <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-bold">
                            {selectedWardData.wardNumber}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-primary-900">
                            {selectedWardData.name}
                          </p>
                          <p className="text-sm text-primary-600">
                            {selectedWardData.nameNe}
                          </p>
                        </div>
                      </div>
                      <Badge variant="primary">
                        {selectedWardData.customerCount} {t('notifications.customersWillReceive')}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t('notifications.scheduledDate')}
                    </label>
                    <Input
                      type="date"
                      error={errors.scheduledDate?.message}
                      min={new Date().toISOString().split('T')[0]}
                      {...register('scheduledDate')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {t('notifications.scheduledTime')}
                    </label>
                    <Select
                      options={timeOptions}
                      placeholder="Select time"
                      error={errors.scheduledTime?.message}
                      {...register('scheduledTime')}
                    />
                  </div>
                </div>

                {/* Bilingual Messages */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Bilingual Messages (EN/NE)
                  </h3>

                  {/* English Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('notifications.messageEnglish')}
                      <Badge variant="secondary" className="ml-2">EN</Badge>
                    </label>
                    <textarea
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={3}
                      {...register('messageText')}
                    />
                    {errors.messageText && (
                      <p className="mt-1.5 text-sm text-error-500">
                        {errors.messageText.message}
                      </p>
                    )}
                  </div>

                  {/* Nepali Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('notifications.messageNepali')}
                      <Badge variant="secondary" className="ml-2">NE</Badge>
                    </label>
                    <textarea
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={3}
                      dir="auto"
                      {...register('messageTextNe')}
                    />
                    {errors.messageTextNe && (
                      <p className="mt-1.5 text-sm text-error-500">
                        {errors.messageTextNe.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reminders Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {t('notifications.enableReminders')}
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register('enableReminders')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {enableReminders && (
                    <div className="space-y-3 pl-6 border-l-2 border-primary-200">
                      {/* 1 Day Before Reminder */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                          {...register('reminder1Day')}
                        />
                        <span className="text-sm text-gray-700">
                          {t('notifications.reminder1Day')}
                        </span>
                        <Badge variant="secondary">24h</Badge>
                      </label>

                      {/* Same Day Reminder */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                          {...register('reminderSameDay')}
                        />
                        <span className="text-sm text-gray-700">
                          {t('notifications.reminderSameDay')}
                        </span>
                        <Badge variant="secondary">2h</Badge>
                      </label>
                    </div>
                  )}
                </div>

                {/* SMS Option (UI Preview Only) */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {t('notifications.smsOption')}
                        </span>
                        <p className="text-xs text-gray-500">
                          Send SMS to customers without app installed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">UI Only</Badge>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          {...register('sendSms')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/notifications')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createMutation.isPending}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    {t('notifications.sendNotification')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader
                title="Notification Preview"
                description="How customers will see this"
              />

              {/* Status Labels Preview */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Status Labels:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="warning">Scheduled</Badge>
                  <Badge variant="primary">Sent</Badge>
                  <Badge variant="success">Completed</Badge>
                  <Badge variant="danger">Cancelled</Badge>
                </div>
              </div>

              {/* Message Preview */}
              <div className="space-y-4">
                {/* English Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">EN</Badge>
                    <span className="text-xs text-gray-500">English</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {messageText || 'Your message will appear here...'}
                  </p>
                </div>

                {/* Nepali Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">NE</Badge>
                    <span className="text-xs text-gray-500">नेपाली</span>
                  </div>
                  <p className="text-sm text-gray-700" dir="auto">
                    {messageTextNe || 'तपाईंको सन्देश यहाँ देखिनेछ...'}
                  </p>
                </div>

                {/* Schedule Info */}
                {(scheduledDate || scheduledTime) && (
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <p className="text-xs text-primary-600 mb-1">Scheduled For:</p>
                    <p className="text-sm font-medium text-primary-900">
                      {scheduledDate
                        ? new Date(scheduledDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Select date'}
                      {scheduledTime && ` at ${scheduledTime}`}
                    </p>
                  </div>
                )}

                {/* Reminders Summary */}
                {enableReminders && (reminder1Day || reminderSameDay) && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-600 mb-2">Reminders:</p>
                    <div className="space-y-1">
                      {reminder1Day && (
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <CheckCircle className="w-4 h-4" />
                          <span>1 day before pickup</span>
                        </div>
                      )}
                      {reminderSameDay && (
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <CheckCircle className="w-4 h-4" />
                          <span>Same day (2h before)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SMS Indicator */}
                {sendSms && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Smartphone className="w-4 h-4" />
                      <span>SMS will be sent (UI preview only)</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
