/**
 * Wards Page
 * Lists all 32 wards with stats, active/inactive toggle, and map placeholder
 */
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Users,
  Bell,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  Search,
  Grid,
  List,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import KathmanduWardMap from '../../components/features/KathmanduWardMap';
import { wardService } from '../../services/ward.service';
import { mockWards } from '../../services/mockData';

export default function WardsPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [localWardStatus, setLocalWardStatus] = useState<Record<number, boolean>>({});
  const [selectedMapWard, setSelectedMapWard] = useState<number | null>(null);

  // Fetch wards (with mock fallback)
  const { data: wards, isLoading } = useQuery({
    queryKey: ['wards'],
    queryFn: wardService.getWards,
  });

  const { data: wardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['ward-stats'],
    queryFn: wardService.getWardStats,
  });

  // Use mock data as fallback
  const wardsList = wards || mockWards;

  // Combine ward data with stats and local status overrides
  const wardsWithStats = useMemo(() => {
    return wardsList?.map((ward) => {
      const stats = wardStats?.find((s) => s.wardNumber === ward.wardNumber);
      const localStatus = localWardStatus[ward.wardNumber];
      return {
        ...ward,
        ...stats,
        isActive: localStatus !== undefined ? localStatus : ward.isActive,
      };
    });
  }, [wardsList, wardStats, localWardStatus]);

  // Filter wards based on search and active filter
  const filteredWards = useMemo(() => {
    return wardsWithStats?.filter((ward) => {
      const matchesSearch =
        ward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ward.nameNe.includes(searchQuery) ||
        String(ward.wardNumber).includes(searchQuery);
      const matchesActive = showActiveOnly ? ward.isActive : true;
      return matchesSearch && matchesActive;
    });
  }, [wardsWithStats, searchQuery, showActiveOnly]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!wardsWithStats) return null;
    return {
      totalWards: 32,
      totalCustomers: wardsWithStats.reduce((sum, w) => sum + (w.customerCount || 0), 0),
      activeWards: wardsWithStats.filter((w) => w.isActive).length,
      avgResponseRate: Math.round(
        wardsWithStats.reduce((sum, w) => sum + (w.responseRate || 0), 0) /
          (wardsWithStats.filter((w) => (w.responseRate || 0) > 0).length || 1)
      ),
    };
  }, [wardsWithStats]);

  // Toggle ward active status (local state only - mock)
  const toggleWardStatus = (wardNumber: number, currentStatus: boolean) => {
    setLocalWardStatus((prev) => ({
      ...prev,
      [wardNumber]: !currentStatus,
    }));
  };

  // Handle ward selection from map
  const handleMapWardSelect = useCallback((wardNum: number) => {
    setSelectedMapWard((prev) => {
      const isDeselecting = prev === wardNum;
      setSearchQuery(isDeselecting ? '' : String(wardNum));
      return isDeselecting ? null : wardNum;
    });
  }, []);

  return (
    <div>
      <Header
        title={t('wards.title')}
        description={t('wards.description')}
      />

      <div className="p-8 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('wards.totalWards')}</p>
                <p className="text-2xl font-bold text-gray-900">32</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('wards.totalCustomers')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats?.totalCustomers.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('wards.activeWards')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats?.activeWards || 0}/32
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('wards.avgResponseRate')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats?.avgResponseRate || 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Map Placeholder & Wards Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ward Map */}
          <Card className="lg:col-span-1">
            <CardHeader
              title="Ward Map"
              description="Kathmandu Metropolitan City - 32 Wards"
            />
            <KathmanduWardMap
              wards={wardsWithStats || []}
              selectedWard={selectedMapWard}
              onWardSelect={handleMapWardSelect}
            />
          </Card>

          {/* Wards List/Grid */}
          <div className="lg:col-span-2">
            <Card padding="none">
              {/* Filters Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search wards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Filters & View Toggle */}
                  <div className="flex items-center gap-3">
                    {/* Active Only Filter */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showActiveOnly}
                        onChange={(e) => setShowActiveOnly(e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">Active only</span>
                    </label>

                    {/* View Toggle */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${
                          viewMode === 'grid'
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${
                          viewMode === 'list'
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wards Content */}
              {isLoading || statsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredWards?.map((ward) => (
                    <WardCard
                      key={ward.id}
                      ward={ward}
                      onToggleStatus={() => toggleWardStatus(ward.wardNumber, ward.isActive)}
                    />
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ward
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Customers
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Response Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Pickup
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredWards?.map((ward) => (
                        <tr key={ward.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-700 font-bold text-sm">
                                  {ward.wardNumber}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{ward.name}</p>
                                <p className="text-xs text-gray-500">{ward.nameNe}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {ward.customerCount || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-500 h-2 rounded-full"
                                  style={{ width: `${ward.responseRate || 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">
                                {ward.responseRate || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {ward.lastPickupDate
                              ? new Date(ward.lastPickupDate).toLocaleDateString()
                              : t('wards.notScheduled')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => toggleWardStatus(ward.wardNumber, ward.isActive)}
                              className="flex items-center gap-2"
                            >
                              {ward.isActive ? (
                                <>
                                  <ToggleRight className="w-6 h-6 text-success-500" />
                                  <Badge variant="success">Active</Badge>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                                  <Badge variant="secondary">Inactive</Badge>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Link to={`/notifications/create?ward=${ward.wardNumber}`}>
                              <Button variant="ghost" size="sm">
                                <Bell className="w-4 h-4 mr-1" />
                                Notify
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty State */}
              {filteredWards?.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No wards match your search</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Ward Card Component (Grid View)
// ============================================
interface WardCardProps {
  ward: {
    id: string;
    wardNumber: number;
    name: string;
    nameNe: string;
    customerCount: number;
    responseRate?: number;
    isActive: boolean;
    lastPickupDate?: string | null;
    nextPickupDate?: string | null;
  };
  onToggleStatus: () => void;
}

function WardCard({ ward, onToggleStatus }: WardCardProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:shadow-sm transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold">{ward.wardNumber}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Ward {ward.wardNumber}</h3>
              <p className="text-sm text-gray-500">{ward.name}</p>
            </div>
          </div>
          {/* Toggle Button */}
          <button
            onClick={onToggleStatus}
            className="flex items-center"
            title={t('wards.toggleActive')}
          >
            {ward.isActive ? (
              <ToggleRight className="w-8 h-8 text-success-500" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-300" />
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">{t('wards.customers')}</p>
            <p className="font-semibold text-gray-900">{ward.customerCount || 0}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">{t('wards.response')}</p>
            <p className="font-semibold text-gray-900">{ward.responseRate || 0}%</p>
          </div>
        </div>

        {/* Pickup Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>
              {t('wards.lastPickup')}:{' '}
              {ward.lastPickupDate
                ? new Date(ward.lastPickupDate).toLocaleDateString()
                : t('wards.notScheduled')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>
              {t('wards.nextPickup')}:{' '}
              {ward.nextPickupDate
                ? new Date(ward.nextPickupDate).toLocaleDateString()
                : t('wards.notScheduled')}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2 border-t border-gray-100">
          <Link to={`/notifications/create?ward=${ward.wardNumber}`}>
            <Button variant="ghost" size="sm" className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              {t('wards.sendNotification')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
