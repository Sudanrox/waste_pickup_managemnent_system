/**
 * Mock Data Service for KWPM Admin Dashboard
 * Provides realistic test data for development and demos
 */

// Ward names for all 32 wards in Kathmandu
export const wardNames: Record<number, { en: string; ne: string }> = {
  1: { en: 'Budhanilkantha', ne: 'बुढानीलकण्ठ' },
  2: { en: 'Nagarjun', ne: 'नागार्जुन' },
  3: { en: 'Tarakeshwar', ne: 'तारकेश्वर' },
  4: { en: 'Chandragiri', ne: 'चन्द्रागिरी' },
  5: { en: 'Dakshinkali', ne: 'दक्षिणकाली' },
  6: { en: 'Kirtipur', ne: 'कीर्तिपुर' },
  7: { en: 'Shankharapur', ne: 'शंखरापुर' },
  8: { en: 'Tokha', ne: 'टोखा' },
  9: { en: 'Gokarneshwar', ne: 'गोकर्णेश्वर' },
  10: { en: 'Kageshwari-Manohara', ne: 'कागेश्वरी-मनोहरा' },
  11: { en: 'Tarkeshwar', ne: 'तार्केश्वर' },
  12: { en: 'Kapan', ne: 'कपन' },
  13: { en: 'Baneshwor', ne: 'बानेश्वर' },
  14: { en: 'Shantinagar', ne: 'शान्तिनगर' },
  15: { en: 'Gaushala', ne: 'गौशाला' },
  16: { en: 'Battisputali', ne: 'बत्तीसपुतली' },
  17: { en: 'Koteshwor', ne: 'कोटेश्वर' },
  18: { en: 'Tinkune', ne: 'टिंकुने' },
  19: { en: 'New Baneshwor', ne: 'नयाँ बानेश्वर' },
  20: { en: 'Minbhawan', ne: 'मिनभवन' },
  21: { en: 'Baluwatar', ne: 'बालुवाटार' },
  22: { en: 'Maharajgunj', ne: 'महाराजगंज' },
  23: { en: 'Basundhara', ne: 'बसुन्धरा' },
  24: { en: 'Samakhusi', ne: 'सामाखुसी' },
  25: { en: 'Gongabu', ne: 'गोंगबु' },
  26: { en: 'Swayambhu', ne: 'स्वयम्भू' },
  27: { en: 'Kalimati', ne: 'कालीमाटी' },
  28: { en: 'Kalanki', ne: 'कलंकी' },
  29: { en: 'Kuleshwor', ne: 'कुलेश्वर' },
  30: { en: 'Balkhu', ne: 'बल्खु' },
  31: { en: 'Satdobato', ne: 'सातदोबाटो' },
  32: { en: 'Lagankhel', ne: 'लगनखेल' },
};

// Generate mock ward data
export function generateMockWards() {
  return Array.from({ length: 32 }, (_, i) => {
    const wardNumber = i + 1;
    const customerCount = Math.floor(Math.random() * 800) + 100;
    const responseRate = Math.floor(Math.random() * 40) + 55; // 55-95%
    const isActive = Math.random() > 0.1; // 90% active

    return {
      id: `ward_${wardNumber}`,
      wardNumber,
      name: wardNames[wardNumber]?.en || `Ward ${wardNumber}`,
      nameNe: wardNames[wardNumber]?.ne || `वडा ${wardNumber}`,
      customerCount,
      responseRate,
      isActive,
      lastPickupDate: isActive ? getRandomPastDate(7) : null,
      nextPickupDate: isActive ? getRandomFutureDate(7) : null,
      totalNotifications: Math.floor(Math.random() * 50) + 10,
    };
  });
}

// Generate mock notifications
// Creates notifications spanning past 30 days to next 30 days for better calendar coverage
export function generateMockNotifications(count: number = 50) {
  const notifications = [];

  for (let i = 0; i < count; i++) {
    const wardNumber = Math.floor(Math.random() * 32) + 1;
    const totalCustomers = Math.floor(Math.random() * 500) + 50;
    const yesCount = Math.floor(totalCustomers * (Math.random() * 0.6 + 0.2));
    const noCount = Math.floor((totalCustomers - yesCount) * Math.random() * 0.5);

    // Generate dates spanning -30 to +30 days for calendar view
    const dayOffset = Math.floor(Math.random() * 61) - 30;
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
    scheduledDate.setHours(0, 0, 0, 0);

    // Determine status based on date
    let status: string;
    if (dayOffset < -7) {
      status = Math.random() > 0.1 ? 'completed' : 'cancelled';
    } else if (dayOffset < 0) {
      status = Math.random() > 0.2 ? 'completed' : 'sent';
    } else if (dayOffset === 0) {
      status = Math.random() > 0.5 ? 'sent' : 'scheduled';
    } else {
      status = 'scheduled';
    }

    notifications.push({
      id: `notif_${i + 1}`,
      wardNumber,
      wardName: wardNames[wardNumber]?.en || `Ward ${wardNumber}`,
      scheduledDate: scheduledDate.toISOString(),
      scheduledTime: getRandomTime(),
      messageText: `Waste pickup scheduled for Ward ${wardNumber}. Please keep your waste ready at the collection point.`,
      messageTextNe: `वडा ${wardNumber} को लागि फोहोर संकलन तालिका। कृपया संकलन स्थानमा आफ्नो फोहोर तयार राख्नुहोस्।`,
      status,
      createdAt: getRandomPastDate(30),
      responseStats: {
        totalCustomers,
        yesCount,
        noCount,
      },
      reminders: {
        oneDayBefore: Math.random() > 0.3,
        sameDay: Math.random() > 0.5,
      },
      smsEnabled: Math.random() > 0.7,
    });
  }

  return notifications.sort((a, b) =>
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );
}

// Generate today's pickups by ward
export function generateTodayPickups() {
  const todayPickups = [];
  const numPickups = Math.floor(Math.random() * 8) + 3; // 3-10 pickups today
  const usedWards = new Set<number>();

  for (let i = 0; i < numPickups; i++) {
    let wardNumber;
    do {
      wardNumber = Math.floor(Math.random() * 32) + 1;
    } while (usedWards.has(wardNumber));
    usedWards.add(wardNumber);

    const totalCustomers = Math.floor(Math.random() * 300) + 50;
    const responded = Math.floor(totalCustomers * (Math.random() * 0.5 + 0.3));

    todayPickups.push({
      wardNumber,
      wardName: wardNames[wardNumber]?.en || `Ward ${wardNumber}`,
      wardNameNe: wardNames[wardNumber]?.ne || `वडा ${wardNumber}`,
      scheduledTime: getRandomTime(),
      totalCustomers,
      responded,
      status: Math.random() > 0.3 ? 'in_progress' : 'pending',
    });
  }

  return todayPickups.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

// Generate upcoming pickups for calendar (next 7 days)
export function generateUpcomingPickups() {
  const pickups: Record<string, number[]> = {};

  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    // Random wards for each day (3-8 wards)
    const numWards = Math.floor(Math.random() * 6) + 3;
    const wards: number[] = [];
    const usedWards = new Set<number>();

    for (let i = 0; i < numWards; i++) {
      let wardNumber;
      do {
        wardNumber = Math.floor(Math.random() * 32) + 1;
      } while (usedWards.has(wardNumber));
      usedWards.add(wardNumber);
      wards.push(wardNumber);
    }

    pickups[dateStr] = wards.sort((a, b) => a - b);
  }

  return pickups;
}

// Generate dashboard stats
export function generateDashboardStats() {
  const wards = generateMockWards();
  const activeWards = wards.filter(w => w.isActive).length;
  const totalCustomers = wards.reduce((sum, w) => sum + w.customerCount, 0);
  const avgResponseRate = Math.round(
    wards.reduce((sum, w) => sum + w.responseRate, 0) / wards.length
  );

  return {
    totalCustomers,
    totalWards: 32,
    activeWards,
    todayPickups: generateTodayPickups().length,
    upcomingPickups: Object.values(generateUpcomingPickups()).flat().length,
    responseRate: avgResponseRate,
    pendingNotifications: Math.floor(Math.random() * 10) + 2,
  };
}

// Helper functions
function getRandomPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

function getRandomFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date.toISOString();
}

function getRandomTime(): string {
  const hours = Math.floor(Math.random() * 6) + 6; // 6 AM to 12 PM
  return `${hours}:00 AM`;
}

// Export singleton mock data (regenerates on page refresh)
export const mockWards = generateMockWards();
export const mockNotifications: ReturnType<typeof generateMockNotifications> = generateMockNotifications();
export const mockTodayPickups = generateTodayPickups();
export const mockUpcomingPickups = generateUpcomingPickups();
export const mockDashboardStats = generateDashboardStats();

/**
 * Get a single notification from the mock store by ID.
 */
export function getMockNotification(id: string) {
  return mockNotifications.find((n) => n.id === id) ?? null;
}

/**
 * Add a notification to the mock store so it appears in lists immediately.
 * Returns the new notification's ID.
 */
export function addMockNotification(input: {
  wardNumber: number;
  scheduledDate: string;
  scheduledTime: string;
  messageText: string;
  messageTextNe?: string;
}): string {
  const id = `notif_${Date.now()}`;
  const ward = wardNames[input.wardNumber];
  const customerCount = mockWards.find(w => w.wardNumber === input.wardNumber)?.customerCount ?? 200;

  mockNotifications.unshift({
    id,
    wardNumber: input.wardNumber,
    wardName: ward?.en || `Ward ${input.wardNumber}`,
    scheduledDate: new Date(input.scheduledDate).toISOString(),
    scheduledTime: input.scheduledTime,
    messageText: input.messageText,
    messageTextNe: input.messageTextNe || '',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    responseStats: {
      totalCustomers: customerCount,
      yesCount: 0,
      noCount: 0,
    },
    reminders: { oneDayBefore: true, sameDay: true },
    smsEnabled: false,
  });

  return id;
}
