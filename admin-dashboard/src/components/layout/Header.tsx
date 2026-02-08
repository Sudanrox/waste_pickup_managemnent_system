/**
 * Header Component
 * Page header with title, search, notifications, language toggle, and offline indicator
 */
import { Bell, Search } from 'lucide-react';
import LanguageToggle from '../ui/LanguageToggle';
import OfflineIndicator from '../ui/OfflineIndicator';
import DarkModeToggle from '../ui/DarkModeToggle';

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Offline Indicator & Last Synced */}
          <OfflineIndicator />

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-colors duration-200"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
          </button>

          {/* Custom actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}
