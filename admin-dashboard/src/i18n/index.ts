/**
 * i18n Configuration for KWPM Admin Dashboard
 * Supports English (en) and Nepali (ne) languages
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  // Common
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    active: 'Active',
    inactive: 'Inactive',
    yes: 'Yes',
    no: 'No',
    pending: 'Pending',
    lastSynced: 'Last synced',
    offline: 'You are offline',
    online: 'Online',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    notifications: 'Notifications',
    calendar: 'Calendar',
    wards: 'Wards',
    settings: 'Settings',
    logout: 'Sign Out',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back! Here\'s an overview of your system.',
    totalCustomers: 'Total Customers',
    activeWards: 'Active Wards',
    todayPickups: "Today's Pickups",
    responseRate: 'Response Rate',
    upcomingPickups: 'Upcoming Pickups (7 days)',
    recentNotifications: 'Recent Notifications',
    todayPickupsByWard: "Today's Pickups by Ward",
    quickActions: 'Quick Actions',
    newNotification: 'New Notification',
    viewAll: 'View All',
    noPickupsToday: 'No pickups scheduled for today',
    pickupCalendar: 'Pickup Calendar',
  },

  // Notifications
  notifications: {
    title: 'Notifications',
    description: 'Manage pickup notifications for all wards',
    create: 'Create Notification',
    createTitle: 'Create Notification',
    createDescription: 'Send a pickup notification to a ward',
    selectWard: 'Select Ward',
    scheduledDate: 'Scheduled Date',
    scheduledTime: 'Scheduled Time',
    messageEnglish: 'Message (English)',
    messageNepali: 'Message (Nepali)',
    status: 'Status',
    responses: 'Responses',
    created: 'Created',
    actions: 'Actions',
    sendNotification: 'Send Notification',
    scheduled: 'Scheduled',
    sent: 'Sent',
    completed: 'Completed',
    cancelled: 'Cancelled',
    reminder1Day: 'Reminder: 1 day before',
    reminderSameDay: 'Reminder: Same day',
    enableReminders: 'Enable Reminders',
    smsOption: 'Send SMS (UI Preview)',
    noNotifications: 'No notifications found',
    createFirst: 'Create First Notification',
    customersWillReceive: 'customers will receive this notification',
  },

  // Calendar
  calendar: {
    title: 'Pickup Calendar',
    description: 'View scheduled waste pickups across all wards',
    listView: 'List View',
    newPickup: 'New Pickup',
    today: 'Today',
    allWards: 'All Wards',
    hasPickups: 'Has pickups',
    selected: 'Selected',
    pickupsScheduled: 'pickups scheduled',
    noPickups: 'No pickups scheduled for this date',
    responseStats: 'Response Statistics',
    total: 'total',
    fullCalendar: 'Full Calendar',
  },

  // Wards
  wards: {
    title: 'Wards',
    description: 'Overview of all 32 wards in Kathmandu Metropolitan City',
    totalWards: 'Total Wards',
    totalCustomers: 'Total Customers',
    activeWards: 'Active Wards',
    avgResponseRate: 'Avg Response Rate',
    ward: 'Ward',
    customers: 'Customers',
    response: 'Response',
    sendNotification: 'Send Notification',
    toggleActive: 'Toggle Active',
    mapPlaceholder: 'Map View (Coming Soon)',
    wardStats: 'Ward Statistics',
    lastPickup: 'Last Pickup',
    nextPickup: 'Next Pickup',
    notScheduled: 'Not scheduled',
  },

  // Settings
  settings: {
    title: 'Settings',
    description: 'Manage your account and preferences',
    profile: 'Profile Information',
    security: 'Security',
    notifications: 'Notifications',
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    nepali: 'नेपाली (Nepali)',
  },
};

// Nepali translations
const neTranslations = {
  // Common
  common: {
    loading: 'लोड हुँदैछ...',
    save: 'सुरक्षित गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    delete: 'मेटाउनुहोस्',
    edit: 'सम्पादन गर्नुहोस्',
    view: 'हेर्नुहोस्',
    search: 'खोज्नुहोस्',
    filter: 'फिल्टर',
    all: 'सबै',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    yes: 'हो',
    no: 'होइन',
    pending: 'पेन्डिङ',
    lastSynced: 'अन्तिम सिंक',
    offline: 'तपाईं अफलाइन हुनुहुन्छ',
    online: 'अनलाइन',
  },

  // Navigation
  nav: {
    dashboard: 'ड्यासबोर्ड',
    notifications: 'सूचनाहरू',
    calendar: 'क्यालेन्डर',
    wards: 'वडाहरू',
    settings: 'सेटिङहरू',
    logout: 'साइन आउट',
  },

  // Dashboard
  dashboard: {
    title: 'ड्यासबोर्ड',
    welcome: 'स्वागत छ! यहाँ तपाईंको प्रणालीको अवलोकन छ।',
    totalCustomers: 'कुल ग्राहकहरू',
    activeWards: 'सक्रिय वडाहरू',
    todayPickups: 'आजको पिकअप',
    responseRate: 'प्रतिक्रिया दर',
    upcomingPickups: 'आगामी पिकअप (७ दिन)',
    recentNotifications: 'हालैका सूचनाहरू',
    todayPickupsByWard: 'आजको वडा अनुसार पिकअप',
    quickActions: 'द्रुत कार्यहरू',
    newNotification: 'नयाँ सूचना',
    viewAll: 'सबै हेर्नुहोस्',
    noPickupsToday: 'आजको लागि पिकअप निर्धारित छैन',
    pickupCalendar: 'पिकअप क्यालेन्डर',
  },

  // Notifications
  notifications: {
    title: 'सूचनाहरू',
    description: 'सबै वडाहरूको लागि पिकअप सूचनाहरू व्यवस्थापन गर्नुहोस्',
    create: 'सूचना सिर्जना गर्नुहोस्',
    createTitle: 'सूचना सिर्जना गर्नुहोस्',
    createDescription: 'वडामा पिकअप सूचना पठाउनुहोस्',
    selectWard: 'वडा छान्नुहोस्',
    scheduledDate: 'निर्धारित मिति',
    scheduledTime: 'निर्धारित समय',
    messageEnglish: 'सन्देश (अंग्रेजी)',
    messageNepali: 'सन्देश (नेपाली)',
    status: 'स्थिति',
    responses: 'प्रतिक्रियाहरू',
    created: 'सिर्जना गरिएको',
    actions: 'कार्यहरू',
    sendNotification: 'सूचना पठाउनुहोस्',
    scheduled: 'निर्धारित',
    sent: 'पठाइएको',
    completed: 'सम्पन्न',
    cancelled: 'रद्द गरिएको',
    reminder1Day: 'रिमाइन्डर: १ दिन अघि',
    reminderSameDay: 'रिमाइन्डर: उही दिन',
    enableReminders: 'रिमाइन्डरहरू सक्षम गर्नुहोस्',
    smsOption: 'SMS पठाउनुहोस् (UI पूर्वावलोकन)',
    noNotifications: 'कुनै सूचना फेला परेन',
    createFirst: 'पहिलो सूचना सिर्जना गर्नुहोस्',
    customersWillReceive: 'ग्राहकहरूले यो सूचना प्राप्त गर्नेछन्',
  },

  // Calendar
  calendar: {
    title: 'पिकअप क्यालेन्डर',
    description: 'सबै वडाहरूमा निर्धारित फोहोर संकलन हेर्नुहोस्',
    listView: 'सूची दृश्य',
    newPickup: 'नयाँ पिकअप',
    today: 'आज',
    allWards: 'सबै वडाहरू',
    hasPickups: 'पिकअप छ',
    selected: 'चयन गरिएको',
    pickupsScheduled: 'पिकअप निर्धारित',
    noPickups: 'यो मितिको लागि पिकअप निर्धारित छैन',
    responseStats: 'प्रतिक्रिया तथ्याङ्क',
    total: 'कुल',
    fullCalendar: 'पूर्ण क्यालेन्डर',
  },

  // Wards
  wards: {
    title: 'वडाहरू',
    description: 'काठमाडौं महानगरपालिकाका सबै ३२ वडाहरूको अवलोकन',
    totalWards: 'कुल वडाहरू',
    totalCustomers: 'कुल ग्राहकहरू',
    activeWards: 'सक्रिय वडाहरू',
    avgResponseRate: 'औसत प्रतिक्रिया दर',
    ward: 'वडा',
    customers: 'ग्राहकहरू',
    response: 'प्रतिक्रिया',
    sendNotification: 'सूचना पठाउनुहोस्',
    toggleActive: 'सक्रिय टगल गर्नुहोस्',
    mapPlaceholder: 'नक्सा दृश्य (चाँडै आउँदैछ)',
    wardStats: 'वडा तथ्याङ्क',
    lastPickup: 'अन्तिम पिकअप',
    nextPickup: 'अर्को पिकअप',
    notScheduled: 'निर्धारित छैन',
  },

  // Settings
  settings: {
    title: 'सेटिङहरू',
    description: 'आफ्नो खाता र प्राथमिकताहरू व्यवस्थापन गर्नुहोस्',
    profile: 'प्रोफाइल जानकारी',
    security: 'सुरक्षा',
    notifications: 'सूचनाहरू',
    language: 'भाषा',
    selectLanguage: 'भाषा छान्नुहोस्',
    english: 'English (अंग्रेजी)',
    nepali: 'नेपाली',
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ne: { translation: neTranslations },
    },
    lng: localStorage.getItem('kwpm-language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
