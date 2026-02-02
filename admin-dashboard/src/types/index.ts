import { Timestamp } from 'firebase/firestore';

// ============================================
// User & Auth Types
// ============================================
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  createdAt: Timestamp;
  isActive: boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'admin' | 'super_admin';
}

// ============================================
// Ward Types
// ============================================
export interface Ward {
  id: string;
  wardNumber: number;
  name: string;
  nameNe: string;
  customerCount: number;
  isActive: boolean;
}

export interface WardStats extends Ward {
  recentNotifications: number;
  responseRate: number;
  averageResponseRate: number;
  lastPickupDate: string | null;
}

// ============================================
// Customer Types
// ============================================
export interface Customer {
  id: string;
  phoneNumber: string;
  name: string;
  wardId: string;
  wardNumber: number;
  fcmToken?: string;
  language: 'en' | 'ne';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// ============================================
// Notification Types
// ============================================
export type NotificationStatus = 'scheduled' | 'sent' | 'completed' | 'cancelled';

export interface ResponseStats {
  yesCount: number;
  noCount: number;
  totalCustomers: number;
}

export interface PickupNotification {
  id: string;
  wardId: string;
  wardNumber: number;
  scheduledDate: Timestamp;
  scheduledTime: string;
  messageText: string;
  messageTextNe: string;
  status: NotificationStatus;
  createdBy: string;
  createdAt: Timestamp;
  sentAt?: Timestamp;
  parentNotificationId?: string;
  responseStats: ResponseStats;
  isRescheduled: boolean;
}

export interface CreateNotificationInput {
  wardNumber: number;
  scheduledDate: string;
  scheduledTime: string;
  messageText: string;
  messageTextNe?: string;
}

export interface RescheduleInput {
  notificationId: string;
  newDate: string;
  newTime: string;
  reason: string;
}

// ============================================
// Response Types
// ============================================
export type ResponseType = 'yes' | 'no';

export interface PickupResponse {
  id: string;
  notificationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  wardId: string;
  wardNumber: number;
  response: ResponseType;
  respondedAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  totalCustomers: number;
  totalWards: number;
  activeWards: number;
  totalNotifications: number;
  pendingNotifications: number;
  todayPickups: number;
  overallResponseRate: number;
}

export interface RecentNotification {
  id: string;
  wardNumber: number;
  scheduledDate: string;
  status: NotificationStatus;
  yesCount: number;
  noCount: number;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// Table/List Types
// ============================================
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  wardNumber?: number;
  status?: NotificationStatus;
  dateFrom?: string;
  dateTo?: string;
}
