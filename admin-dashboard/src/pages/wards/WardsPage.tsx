import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Users, Bell, TrendingUp, Eye } from 'lucide-react';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { wardService } from '../../services/ward.service';

export default function WardsPage() {
  const { data: wards, isLoading } = useQuery({
    queryKey: ['wards'],
    queryFn: wardService.getWards,
  });

  const { data: wardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['ward-stats'],
    queryFn: wardService.getWardStats,
  });

  // Combine ward data with stats
  const wardsWithStats = wards?.map((ward) => {
    const stats = wardStats?.find((s) => s.wardNumber === ward.wardNumber);
    return {
      ...ward,
      ...stats,
    };
  });

  return (
    <div>
      <Header
        title="Wards"
        description="Overview of all 32 wards in Kathmandu Metropolitan City"
      />

      <div className="p-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Wards</p>
                <p className="text-2xl font-bold text-gray-900">{wards?.length || 32}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wardsWithStats?.reduce((sum, w) => sum + (w.customerCount || 0), 0) || 0}
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
                <p className="text-sm text-gray-500">Active Wards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wardsWithStats?.filter((w) => (w.customerCount || 0) > 0).length || 0}
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
                <p className="text-sm text-gray-500">Avg Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {wardStats
                    ? Math.round(
                        wardStats.reduce((sum, w) => sum + (w.responseRate || 0), 0) /
                          (wardStats.filter((w) => (w.responseRate || 0) > 0).length || 1)
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Wards Grid */}
        {isLoading || statsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wardsWithStats?.map((ward) => (
              <Card key={ward.id} hover>
                <div className="space-y-4">
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
                    {(ward.customerCount || 0) > 0 ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-500">Customers</p>
                      <p className="font-semibold text-gray-900">{ward.customerCount || 0}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-500">Response</p>
                      <p className="font-semibold text-gray-900">{ward.responseRate || 0}%</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <Link to={`/notifications/create?ward=${ward.wardNumber}`}>
                      <Button variant="ghost" size="sm" className="w-full">
                        <Bell className="w-4 h-4 mr-2" />
                        Send Notification
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
