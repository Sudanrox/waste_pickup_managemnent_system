/**
 * Calendar Page
 * Full calendar view for viewing scheduled waste pickups
 *
 * Features:
 * - Monthly calendar with pickup highlights
 * - Ward filtering (single ward or all wards)
 * - Click date to see pickup details in side panel
 * - Navigation between months
 */
import { Link } from 'react-router-dom';
import { Plus, List } from 'lucide-react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import PickupCalendar from '../../components/features/PickupCalendar';

export default function CalendarPage() {

  return (
    <div>
      <Header
        title="Pickup Calendar"
        description="View scheduled waste pickups across all wards"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/notifications">
              <Button variant="ghost" leftIcon={<List className="w-4 h-4" />}>
                List View
              </Button>
            </Link>
            <Link to="/notifications/create">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                New Pickup
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-8">
        {/* Full Calendar View */}
        <PickupCalendar
          mode="full"
          showFilters={true}
        />
      </div>
    </div>
  );
}
