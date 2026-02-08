/**
 * Badge Component
 * Display status labels and tags with various color variants
 */
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'gray' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'gray',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  const variants = {
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    danger: 'bg-error-50 text-error-600', // Alias for error
    gray: 'bg-gray-100 text-gray-600',
    secondary: 'bg-gray-100 text-gray-600', // Alias for gray
    primary: 'bg-primary-50 text-primary-600',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status Badge specifically for notification status
interface StatusBadgeProps {
  status: 'scheduled' | 'sent' | 'completed' | 'cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    scheduled: { variant: 'warning' as const, label: 'Scheduled' },
    sent: { variant: 'primary' as const, label: 'Sent' },
    completed: { variant: 'success' as const, label: 'Completed' },
    cancelled: { variant: 'error' as const, label: 'Cancelled' },
  };

  const { variant, label } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}
