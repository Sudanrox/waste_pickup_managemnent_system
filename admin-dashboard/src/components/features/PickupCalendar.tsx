/**
 * PickupCalendar Component — Redesigned
 *
 * Features:
 * - Vibrant ward-based color coding
 * - Truck icons on pickup events
 * - Hover tooltips with pickup details
 * - Bold day headers with weekend color differentiation
 * - Ward search filter
 * - Prominent month/year navigation
 * - Click event to quick-edit (navigate to detail/create)
 * - Compact and full view modes
 */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  X,
  Search,
  Truck,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
  isWeekend,
} from 'date-fns';
import { StatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { mockNotifications, mockWards, wardNames } from '../../services/mockData';

// ============================================
// Vibrant ward color palette (32 distinct colors)
// ============================================
const WARD_COLORS: string[] = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#fb7185', '#fdba74', '#fcd34d',
  '#bef264', '#4ade80', '#34d399', '#2dd4bf',
  '#22d3ee', '#38bdf8', '#818cf8', '#a78bfa',
  '#c084fc', '#e879f9', '#f472b6', '#fb923c',
];

function getWardColor(wardNumber: number): string {
  return WARD_COLORS[(wardNumber - 1) % WARD_COLORS.length];
}

// ============================================
// Types
// ============================================

export interface CalendarPickup {
  id: string;
  wardNumber: number;
  wardName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'sent' | 'completed' | 'cancelled';
  responseStats?: {
    totalCustomers: number;
    yesCount: number;
    noCount: number;
  };
}

interface PickupCalendarProps {
  mode?: 'compact' | 'full';
  onDateClick?: (date: Date, pickups: CalendarPickup[]) => void;
  showFilters?: boolean;
  className?: string;
}

// ============================================
// Helpers
// ============================================

function getPickupsForDate(date: Date, pickups: CalendarPickup[]): CalendarPickup[] {
  return pickups.filter((p) => isSameDay(new Date(p.scheduledDate), date));
}

function getCalendarDays(currentMonth: Date) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const startPadding = getDay(start);
  const padded: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - (i + 1));
    padded.push({ date: d, isCurrentMonth: false });
  }
  days.forEach((d) => padded.push({ date: d, isCurrentMonth: true }));
  const remaining = 42 - padded.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(end);
    d.setDate(d.getDate() + i);
    padded.push({ date: d, isCurrentMonth: false });
  }
  return padded;
}

// ============================================
// Main Component
// ============================================

export default function PickupCalendar({
  mode = 'full',
  onDateClick,
  showFilters = true,
  className = '',
}: PickupCalendarProps) {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [wardSearch, setWardSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const allPickups: CalendarPickup[] = useMemo(
    () =>
      mockNotifications.map((n) => ({
        id: n.id,
        wardNumber: n.wardNumber,
        wardName: n.wardName,
        scheduledDate: n.scheduledDate,
        scheduledTime: n.scheduledTime,
        status: n.status as CalendarPickup['status'],
        responseStats: n.responseStats,
      })),
    []
  );

  const filteredPickups = useMemo(() => {
    if (!selectedWard) return allPickups;
    return allPickups.filter((p) => p.wardNumber === selectedWard);
  }, [allPickups, selectedWard]);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  // Ward list filtered by search
  const filteredWardList = useMemo(() => {
    if (!wardSearch) return mockWards;
    const q = wardSearch.toLowerCase();
    return mockWards.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.nameNe.includes(wardSearch) ||
        String(w.wardNumber).includes(q)
    );
  }, [wardSearch]);

  const handlePrevMonth = useCallback(() => setCurrentMonth((p) => subMonths(p, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentMonth((p) => addMonths(p, 1)), []);
  const handleToday = useCallback(() => setCurrentMonth(new Date()), []);

  const handleDateClick = useCallback(
    (date: Date) => {
      const dayPickups = getPickupsForDate(date, filteredPickups);
      setSelectedDate(date);
      if (dayPickups.length > 0) {
        setShowDetailPanel(true);
        onDateClick?.(date, dayPickups);
      }
    },
    [filteredPickups, onDateClick]
  );

  const selectedDatePickups = useMemo(() => {
    if (!selectedDate) return [];
    return getPickupsForDate(selectedDate, filteredPickups);
  }, [selectedDate, filteredPickups]);

  const dayNames =
    mode === 'compact'
      ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className={`relative ${className}`}>
      <Card padding={mode === 'compact' ? 'sm' : 'md'}>
        {/* ===== Prominent Date Navigation ===== */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-gray-900 ${mode === 'compact' ? 'text-base' : 'text-xl'}`}>
                {format(currentMonth, 'MMMM')}
              </h2>
              <p className="text-sm text-gray-400 font-medium">{format(currentMonth, 'yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'full' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToday}
                className="font-semibold"
              >
                Today
              </Button>
            )}
            <div className="flex items-center bg-gray-100 rounded-lg">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* ===== Ward Search Filter (full mode) ===== */}
        {mode === 'full' && showFilters && (
          <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wards by name or number..."
                value={wardSearch}
                onChange={(e) => setWardSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>

            {/* Ward chips */}
            <div className="flex flex-wrap gap-1.5 max-w-[600px]">
              <button
                onClick={() => setSelectedWard(null)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  !selectedWard
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {filteredWardList.slice(0, 16).map((w) => (
                <button
                  key={w.wardNumber}
                  onClick={() => setSelectedWard(selectedWard === w.wardNumber ? null : w.wardNumber)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor:
                      selectedWard === w.wardNumber ? getWardColor(w.wardNumber) : undefined,
                    color: selectedWard === w.wardNumber ? '#fff' : getWardColor(w.wardNumber),
                    border: `2px solid ${getWardColor(w.wardNumber)}`,
                  }}
                >
                  W{w.wardNumber}
                </button>
              ))}
              {filteredWardList.length > 16 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{filteredWardList.length - 16} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* ===== Day Headers with color-coded weekends ===== */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((day, idx) => {
            const weekend = idx === 0 || idx === 6;
            return (
              <div
                key={idx}
                className={`text-center py-2 font-bold tracking-wide uppercase ${
                  mode === 'compact' ? 'text-xs' : 'text-xs'
                } ${weekend ? 'text-rose-500' : 'text-gray-500'}`}
              >
                {mode === 'compact' ? day : day.slice(0, 3)}
              </div>
            );
          })}
        </div>

        {/* ===== Calendar Grid ===== */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, idx) => {
            const dayPickups = getPickupsForDate(date, filteredPickups);
            const hasPickups = dayPickups.length > 0;
            const isTodayDate = isToday(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const weekendDay = isWeekend(date);
            const dayKey = date.toISOString();
            const isHovered = hoveredDay === dayKey;

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDay(dayKey)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`
                  relative p-1.5 rounded-xl cursor-pointer transition-all duration-200
                  ${mode === 'full' ? 'min-h-[90px]' : 'min-h-[36px]'}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isTodayDate ? 'bg-indigo-50 ring-2 ring-indigo-300 shadow-sm' : ''}
                  ${isSelected ? 'bg-indigo-100 ring-2 ring-indigo-500 shadow-md' : ''}
                  ${hasPickups && !isTodayDate && !isSelected ? 'bg-gradient-to-b from-white to-emerald-50/60 hover:to-emerald-100/80' : ''}
                  ${!hasPickups && !isTodayDate && !isSelected ? 'hover:bg-gray-50' : ''}
                  ${isHovered && hasPickups ? 'scale-[1.03] shadow-lg z-10' : ''}
                `}
              >
                {/* Date Number */}
                <div
                  className={`
                    ${mode === 'compact' ? 'text-center text-sm' : 'text-right text-sm'}
                    font-semibold
                    ${isTodayDate ? 'text-indigo-700' : weekendDay ? 'text-rose-400' : 'text-gray-700'}
                  `}
                >
                  {isTodayDate && mode === 'full' && (
                    <span className="inline-block w-6 h-6 leading-6 text-center bg-indigo-600 text-white rounded-full text-xs font-bold mr-0.5">
                      {format(date, 'd')}
                    </span>
                  )}
                  {(!isTodayDate || mode === 'compact') && format(date, 'd')}
                </div>

                {/* Pickup Events */}
                {hasPickups &&
                  (mode === 'compact' ? (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayPickups.slice(0, 3).map((p, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getWardColor(p.wardNumber) }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 space-y-0.5">
                      {dayPickups.slice(0, 3).map((pickup, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-1 text-xs rounded-md px-1.5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: getWardColor(pickup.wardNumber) + '20',
                            borderLeft: `3px solid ${getWardColor(pickup.wardNumber)}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDateClick(date);
                          }}
                        >
                          <Truck
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: getWardColor(pickup.wardNumber) }}
                          />
                          <span
                            className="font-bold"
                            style={{ color: getWardColor(pickup.wardNumber) }}
                          >
                            W{pickup.wardNumber}
                          </span>
                          <span className="text-gray-500 truncate">
                            {pickup.scheduledTime.replace(':00', '')}
                          </span>
                        </div>
                      ))}
                      {dayPickups.length > 3 && (
                        <div className="text-xs text-gray-400 pl-1 font-medium">
                          +{dayPickups.length - 3} more
                        </div>
                      )}
                    </div>
                  ))}

                {/* Hover Tooltip (full mode) */}
                {mode === 'full' && isHovered && hasPickups && !isSelected && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-900 text-white rounded-xl shadow-xl p-3 z-50 pointer-events-none">
                    <p className="font-bold text-sm mb-1.5">
                      {format(date, 'EEE, MMM d')} &mdash; {dayPickups.length} pickup
                      {dayPickups.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1.5">
                      {dayPickups.slice(0, 4).map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getWardColor(p.wardNumber) }}
                          />
                          <span className="font-semibold">Ward {p.wardNumber}</span>
                          <span className="text-gray-400">{p.scheduledTime}</span>
                          {p.responseStats && (
                            <span className="ml-auto text-gray-400">
                              {p.responseStats.totalCustomers} ppl
                            </span>
                          )}
                        </div>
                      ))}
                      {dayPickups.length > 4 && (
                        <p className="text-gray-400 text-xs">+{dayPickups.length - 4} more</p>
                      )}
                    </div>
                    {/* tooltip arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 bg-gray-900 rotate-45 -mt-1.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ===== Legend ===== */}
        {mode === 'full' && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-5 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">3</span>
              </div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>Pickup scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-500 font-bold">Sat/Sun</span>
              <span>Weekend</span>
            </div>
            <div className="flex items-center gap-2 ml-auto text-gray-400">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Click event to view details</span>
            </div>
          </div>
        )}
      </Card>

      {/* ===== Detail Side Panel with Backdrop ===== */}
      {mode === 'full' && showDetailPanel && selectedDate && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => {
              setShowDetailPanel(false);
              setSelectedDate(null);
            }}
          />
          <CalendarDetailPanel
            date={selectedDate}
            pickups={selectedDatePickups}
            onClose={() => {
              setShowDetailPanel(false);
              setSelectedDate(null);
            }}
            onEditPickup={(id) => navigate(`/notifications/${id}`)}
            onCreatePickup={() =>
              navigate(`/notifications/create?date=${format(selectedDate, 'yyyy-MM-dd')}`)
            }
          />
        </>
      )}
    </div>
  );
}

// ============================================
// Detail Panel
// ============================================

interface CalendarDetailPanelProps {
  date: Date;
  pickups: CalendarPickup[];
  onClose: () => void;
  onEditPickup: (id: string) => void;
  onCreatePickup: () => void;
}

function CalendarDetailPanel({
  date,
  pickups,
  onClose,
  onEditPickup,
  onCreatePickup,
}: CalendarDetailPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl border-l border-gray-200 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            {format(date, 'EEEE')}
          </h3>
          <p className="text-sm text-gray-500">{format(date, 'MMMM d, yyyy')}</p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            {pickups.length} pickup{pickups.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/80 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pickups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No pickups on this date</p>
          </div>
        ) : (
          pickups.map((pickup) => (
            <PickupDetailCard
              key={pickup.id}
              pickup={pickup}
              onEdit={() => onEditPickup(pickup.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
        <Button className="w-full" onClick={onCreatePickup}>
          <Truck className="w-4 h-4 mr-2" />
          Schedule Pickup for {format(date, 'MMM d')}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Pickup Detail Card (in side panel)
// ============================================

function PickupDetailCard({
  pickup,
  onEdit,
}: {
  pickup: CalendarPickup;
  onEdit: () => void;
}) {
  const wardInfo = wardNames[pickup.wardNumber];
  const color = getWardColor(pickup.wardNumber);

  return (
    <div
      className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <Truck className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <p className="font-bold text-gray-900">Ward {pickup.wardNumber}</p>
            <p className="text-xs text-gray-500">{wardInfo?.en || pickup.wardName}</p>
          </div>
        </div>
        <StatusBadge status={pickup.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{pickup.scheduledTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{wardInfo?.ne || `वडा ${pickup.wardNumber}`}</span>
        </div>
      </div>

      {pickup.responseStats && (
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">{pickup.responseStats.yesCount}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-500">
            <XCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">{pickup.responseStats.noCount}</span>
          </div>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${(pickup.responseStats.yesCount / pickup.responseStats.totalCustomers) * 100}%`,
              }}
            />
          </div>
          <span className="text-gray-400">{pickup.responseStats.totalCustomers} total</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 text-xs text-indigo-500 font-medium">
        <ExternalLink className="w-3 h-3" />
        Click to view/edit
      </div>
    </div>
  );
}

// ============================================
// Compact Calendar Widget Export
// ============================================

export function CalendarWidget({ className = '' }: { className?: string }) {
  return <PickupCalendar mode="compact" showFilters={false} className={className} />;
}
