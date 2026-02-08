/**
 * Offline Indicator Component
 * Shows network status and last sync time
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setLastSynced(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update last synced time periodically when online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        setLastSynced(new Date());
      }
    }, 60000); // Update every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Online/Offline Status */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
          isOnline
            ? 'bg-success-50 text-success-700'
            : 'bg-error-50 text-error-700'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.online')}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>{t('common.offline')}</span>
          </>
        )}
      </div>

      {/* Last Synced Time */}
      <div className="hidden md:flex items-center gap-1.5 text-gray-500">
        <RefreshCw className="w-3.5 h-3.5" />
        <span>
          {t('common.lastSynced')}: {format(lastSynced, 'h:mm a')}
        </span>
      </div>
    </div>
  );
}
