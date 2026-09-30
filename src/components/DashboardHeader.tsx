import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, LogOut, Settings as SettingsIcon, Shield, CheckCircle2, Layers, Cloud, Mail } from 'lucide-react';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileMenu: () => void;
  onOpenIntegrations?: () => void;
  onOpenEmailTemplate?: () => void;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
  onViewLogin?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onOpenIntegrations,
  onOpenEmailTemplate,
  onOpenSettings,
  onSignOut,
  onViewLogin,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F0] border-b border-[#E6E7EB] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Menu Button + Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-[#475569] hover:bg-white border border-[#E6E7EB] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders, customers, products, or phone numbers..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#E6E7EB] rounded-xl text-xs sm:text-sm text-[#17243A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9B91A] focus:ring-2 focus:ring-[#F9B91A]/20 transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Notifications & Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 relative">
        {/* Cloud Integrations Button */}
        {onOpenIntegrations && (
          <button
            onClick={onOpenIntegrations}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E6E7EB] hover:bg-[#FAF7F0] text-xs font-bold text-[#17243A] transition-all cursor-pointer shadow-2xs group"
            title="Manage MongoDB, Cloudinary & Resend"
          >
            <div className="w-2 h-2 rounded-full bg-[#15966B] animate-pulse"></div>
            <span className="text-[11px] text-[#64748B] group-hover:text-[#17243A]">Stack:</span>
            <span className="font-semibold text-xs">Cloud Integrations</span>
          </button>
        )}

        {/* Transactional Email Template Preview Button */}
        {onOpenEmailTemplate && (
          <button
            onClick={onOpenEmailTemplate}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF7F0] border border-[#F1EADA] hover:bg-[#FEF3C7] text-xs font-bold text-[#17243A] transition-all cursor-pointer shadow-2xs group"
            title="View Baked by Doja Transactional Email Template"
          >
            <Mail className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="font-semibold text-xs">Email Template</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-xl bg-white border border-[#E6E7EB] flex items-center justify-center text-[#475569] hover:text-[#17243A] hover:bg-stone-50 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF7F0] shadow-xs">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E6E7EB] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#17243A]">Notifications</span>
                  {notifications.length > 0 && (
                    <span className="text-[10px] bg-[#EF4444] text-white px-1.5 py-0.2 rounded-full font-bold">
                      {notifications.length} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications([]);
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-[#15966B] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-[#FAF7F0] rounded-lg transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#17243A]">{n.title}</span>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Lockup */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-xl bg-white border border-[#E6E7EB] hover:bg-stone-50 transition-colors cursor-pointer select-none"
          >
            {/* Avatar Headshot */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E6E7EB] bg-stone-200 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Admin Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'%3E%3Cpath d='M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z'/%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-[#17243A] leading-tight">
                Admin
              </div>
              <div className="text-[11px] text-[#6B7280] leading-tight">
                Baked by Doja
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] stroke-[2]" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E6E7EB] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <div className="text-xs font-bold text-[#17243A]">Admin Portal</div>
                <div className="text-[11px] text-gray-500">admin@bakedbydoja.com</div>
              </div>

              {onOpenSettings && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#17243A] hover:bg-[#FAF7F0] rounded-lg transition-colors cursor-pointer"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Store & System Settings</span>
                </button>
              )}

              {onViewLogin && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onViewLogin();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#17243A] hover:bg-[#FAF7F0] rounded-lg transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#F9B91A]" />
                  <span>View Admin Login Screen</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onSignOut) onSignOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
