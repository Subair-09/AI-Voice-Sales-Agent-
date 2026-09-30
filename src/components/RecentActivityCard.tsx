import React from 'react';
import { Users, User, HelpCircle, CheckCircle2, ArrowRight, Activity } from 'lucide-react';
import { AgentActivityItem } from '../types/agent';

interface RecentActivityCardProps {
  activities?: AgentActivityItem[];
  onViewAll?: () => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities = [],
  onViewAll,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'order_created':
        return <Users className="w-4 h-4 stroke-[2]" />;
      case 'payment_sent':
        return <User className="w-4 h-4 stroke-[2]" />;
      case 'customer_enquiry':
        return <HelpCircle className="w-4 h-4 stroke-[2]" />;
      case 'order_completed':
      default:
        return <CheckCircle2 className="w-4 h-4 stroke-[2]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#17243A]">Recent Activity</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#6B7280] hover:text-[#17243A] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      <div className="space-y-3.5">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B7280] flex flex-col items-center justify-center gap-1.5">
            <Activity className="w-6 h-6 text-stone-300 stroke-[1.5]" />
            <p className="font-medium text-stone-600">No agent activity yet</p>
            <p className="text-[11px] text-stone-400">Live call events and sales actions will show here in real time.</p>
          </div>
        ) : (
          activities.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl ${item.iconBg || 'bg-[#E8F7EF]'} ${item.iconColor || 'text-[#15966B]'} flex items-center justify-center shrink-0`}
                >
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#17243A] truncate">{item.title}</p>
                  <p className="text-[11px] text-[#6B7280] truncate font-mono">
                    {item.phoneNumber}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-[#9CA3AF] shrink-0">
                {item.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
