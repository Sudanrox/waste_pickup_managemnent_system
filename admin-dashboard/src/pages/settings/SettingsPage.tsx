import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User, Shield, Bell, LogOut, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div>
      <Header
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="p-8 max-w-4xl space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader
            title="Profile Information"
            description="Your account details"
            icon={<User className="w-5 h-5" />}
          />

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Display Name"
                defaultValue={user?.displayName || 'Admin User'}
                disabled
              />
              <Input
                label="Email Address"
                type="email"
                defaultValue={user?.email || ''}
                disabled
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.displayName || 'Admin User'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader
            title="Security"
            description="Password and authentication settings"
            icon={<Shield className="w-5 h-5" />}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Last changed: Unknown</p>
              </div>
              <Button variant="secondary" size="sm">
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <Button variant="secondary" size="sm">
                Enable 2FA
              </Button>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader
            title="Notifications"
            description="Configure notification preferences"
            icon={<Bell className="w-5 h-5" />}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email updates about system activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Daily Summary</p>
                <p className="text-sm text-gray-500">Receive a daily summary of pickups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-error-200">
          <CardHeader
            title="Danger Zone"
            description="Irreversible actions"
          />

          <div className="flex items-center justify-between p-4 bg-error-50 rounded-lg">
            <div>
              <p className="font-medium text-error-700">Sign Out</p>
              <p className="text-sm text-error-600">Sign out of your account</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
