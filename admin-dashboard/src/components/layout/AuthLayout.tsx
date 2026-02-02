import { Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Truck className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">KWPM</h1>
          <p className="text-xl text-white/90 mb-2">
            Kathmandu Waste Pickup Management
          </p>
          <p className="text-white/70">Admin Dashboard</p>
          <p className="text-sm text-white/50 mt-8">Since 2026</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
