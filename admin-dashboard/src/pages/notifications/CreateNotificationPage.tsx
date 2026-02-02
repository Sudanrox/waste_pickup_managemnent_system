import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Send } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { notificationService } from '../../services/notification.service';
import { wardService } from '../../services/ward.service';

const notificationSchema = z.object({
  wardNumber: z.string().min(1, 'Please select a ward'),
  scheduledDate: z.string().min(1, 'Please select a date'),
  scheduledTime: z.string().min(1, 'Please enter a time'),
  messageText: z.string().min(10, 'Message must be at least 10 characters'),
  messageTextNe: z.string().optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function CreateNotificationPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: wards } = useQuery({
    queryKey: ['wards'],
    queryFn: wardService.getWards,
  });

  const createMutation = useMutation({
    mutationFn: notificationService.createNotification,
    onSuccess: (data) => {
      navigate(`/notifications/${data.notificationId}`);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      messageText: 'Waste pickup scheduled for your ward. Please keep your waste ready at the collection point.',
      messageTextNe: 'तपाईंको वडाको लागि फोहोर संकलन तालिका बनाइएको छ। कृपया आफ्नो फोहोर संकलन स्थानमा तयार राख्नुहोस्।',
    },
  });

  const selectedWard = watch('wardNumber');
  const selectedWardData = wards?.find((w) => w.wardNumber === parseInt(selectedWard));

  const wardOptions = wards?.map((w) => ({
    value: String(w.wardNumber),
    label: `Ward ${w.wardNumber} - ${w.name}`,
  })) || [];

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
        title="Create Notification"
        description="Send a pickup notification to a ward"
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

      <div className="p-8 max-w-3xl">
        <Card>
          <CardHeader
            title="Notification Details"
            description="Fill in the details for the pickup notification"
          />

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Ward Selection */}
            <Select
              label="Select Ward"
              options={wardOptions}
              placeholder="Choose a ward"
              error={errors.wardNumber?.message}
              {...register('wardNumber')}
            />

            {selectedWardData && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  <strong>{selectedWardData.customerCount}</strong> customers will receive this notification
                </p>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Scheduled Date"
                type="date"
                error={errors.scheduledDate?.message}
                min={new Date().toISOString().split('T')[0]}
                {...register('scheduledDate')}
              />

              <Select
                label="Scheduled Time"
                options={timeOptions}
                placeholder="Select time"
                error={errors.scheduledTime?.message}
                {...register('scheduledTime')}
              />
            </div>

            {/* Message - English */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message (English)
              </label>
              <textarea
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                {...register('messageText')}
              />
              {errors.messageText && (
                <p className="mt-1.5 text-sm text-error-500">{errors.messageText.message}</p>
              )}
            </div>

            {/* Message - Nepali */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message (Nepali) - Optional
              </label>
              <textarea
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                {...register('messageTextNe')}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/notifications')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createMutation.isPending}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send Notification
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
