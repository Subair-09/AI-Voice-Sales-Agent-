import React, { useState, useEffect } from 'react';
import {
  Home,
  Phone,
  Package,
  Users,
  ShoppingBag,
  CreditCard,
  Sparkles,
  BookOpen,
  BarChart2,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { BananaLogo } from './BananaLogo';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAgentDetails: () => void;
  onOpenIntegrations?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  callsCount?: number;
  ordersCount?: number;
}

export const BreadIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 11c0-4 3.5-7 8-7s8 3 8 7c0 4.5-2 8-8 8s-8-3.5-8-8z" />
    <path d="M8 8c.5 1.5 1 3 1.5 4.5" />
    <path d="M12 7c.5 2 1 3.5 1.5 5.5" />
    <path d="M16 8c-.5 1.5-1 3-1.5 4.5" />
  </svg>
);

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenAgentDetails,
  onOpenIntegrations,
  isMobileOpen = false,
  onCloseMobile,
  callsCount: propCallsCount,
  ordersCount: propOrdersCount,
}) => {
  const [counts, setCounts] = useState({
    calls: 0,
    orders: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCounts = async () => {
      try {
        const [callsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/calls?limit=1'),
          fetch('/api/admin/orders?limit=1'),
        ]);

        const callsData = await callsRes.json();
        const ordersData = await ordersRes.json();

        if (isMounted) {
          setCounts({
            calls: callsData.metrics?.totalCalls ?? callsData.totalCount ?? 0,
            orders: ordersData.metrics?.totalOrders ?? ordersData.totalCount ?? 0,
          });
        }
      } catch (err) {
        // Quietly maintain existing count on network fluctuation
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    const handleRefresh = () => fetchCounts();
    window.addEventListener('bbd_refresh_stats', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('bbd_refresh_stats', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, []);

  const effectiveCallsCount = propCallsCount !== undefined ? propCallsCount : counts.calls;
  const effectiveOrdersCount = propOrdersCount !== undefined ? propOrdersCount : counts.orders;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    {
      id: 'calls',
      label: 'Calls',
      icon: Phone,
      badge: effectiveCallsCount > 0 ? String(effectiveCallsCount) : undefined,
      badgeColor: 'bg-[#EF4444] text-white',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      badge: effectiveOrdersCount > 0 ? String(effectiveOrdersCount) : undefined,
      badgeColor: 'bg-[#EF4444] text-white',
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'agent', label: 'AI Agent', icon: Sparkles },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'RAG', badgeColor: 'bg-[#E8F7EF] text-[#15966B] font-bold border border-[#A7F3D0]' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#FAF7F0] border-r border-[#E6E7EB] flex flex-col justify-between p-4 overflow-y-auto transition-transform duration-300 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Brand Logo */}
          <div className="pt-2 pb-5 px-2">
            <BananaLogo size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F9B91A] text-[#17243A] shadow-xs'
                      : 'text-[#475569] hover:bg-[#F3EFE6] hover:text-[#17243A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-[#17243A]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${item.badgeColor} leading-none font-bold`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 space-y-4">
          {/* AI Sales Agent Status Card */}
          <div className="bg-[#FFF8EC] border border-[#FEEBC8] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFE39A] text-[#854D0E] flex items-center justify-center">
                <BreadIcon size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2B1B12] leading-tight">
                  Baked by Doja
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  AI Voice Sales Agent
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-800">
                Live & Working
              </span>
            </div>

            <p className="text-[11px] text-[#6B7280] leading-relaxed mb-3">
              Your AI voice agent is handling calls, taking orders and processing payments.
            </p>

            <button
              onClick={onOpenAgentDetails}
              className="text-xs font-semibold text-[#17243A] hover:text-[#F9B91A] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cloud Integrations Pill */}
          {onOpenIntegrations && (
            <button
              onClick={onOpenIntegrations}
              className="w-full mt-2.5 px-3 py-2 rounded-xl bg-white border border-[#E6E7EB] hover:bg-[#FAF7F0] flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs group"
              title="MongoDB, Cloudinary & Resend Integrations"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#15966B] animate-pulse" />
                <span className="text-xs font-bold text-[#17243A] group-hover:text-[#D97706]">Cloud Stack</span>
              </div>
              <span className="text-[10px] text-[#64748B] font-semibold bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E6E7EB]">
                Mongo • Resend
              </span>
            </button>
          )}

          {/* Bottom Left Signature & Heart Doodle */}
          <div className="px-2 pt-1 pb-2">
            <div className="font-script text-[#3A2418] text-lg font-bold leading-tight">
              Same great taste.
              <br />
              Now with smart tools.
            </div>
            {/* Small Yellow Heart Doodle */}
            <div className="mt-1 text-[#F9B91A]">
              <svg
                width="28"
                height="22"
                viewBox="0 0 48 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 20C6 14 6 6 15 4C21 2.5 24 9 24 9C24 9 27 2.5 33 4C42 6 42 14 36 20C30 26 24 33 24 33C24 33 18 26 12 20Z"
                  stroke="#F9B91A"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M39 10L43 8"
                  stroke="#F9B91A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
