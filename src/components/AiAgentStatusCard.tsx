import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, ArrowRight, Radio } from 'lucide-react';
import { safeFetchJson } from '../utils/api';

interface AiAgentStatusCardProps {
  onViewCallLogs?: () => void;
}

export const AiAgentStatusCard: React.FC<AiAgentStatusCardProps> = ({ onViewCallLogs }) => {
  const [stats, setStats] = useState({
    handledCallsToday: 0,
    successfulOrders: 0,
    isOnline: true,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          safeFetchJson('/api/admin/stats'),
          safeFetchJson('/api/admin/orders?limit=1'),
        ]);

        if (!isMounted) return;

        setStats((prev) => ({
          handledCallsToday: statsData?.aiVoiceAgent?.handledCallsToday ?? statsData?.totalOrdersToday ?? prev.handledCallsToday,
          successfulOrders: ordersData?.metrics?.completedOrders ?? prev.successfulOrders,
          isOnline: true,
        }));
      } catch {
        // Silently preserve current status during transient reload
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Waveform bars height variation for audio visualizer
  const waveHeights = [8, 14, 20, 12, 16, 22, 14, 18, 24, 12, 20, 16, 10, 14, 18, 10, 16, 20, 12, 16, 22, 10, 8];

  return (
    <div className="bg-[#F4FBF7] rounded-2xl p-5 border border-[#D5EFE1] shadow-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#15966B]/15 text-[#15966B] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <h3 className="text-sm font-bold text-[#17243A]">
            AI Agent Status
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#15966B]">
          <span className="w-2 h-2 rounded-full bg-[#15966B] animate-pulse" />
          <span>Online</span>
        </div>
      </div>

      <p className="text-xs text-[#6B7280] leading-snug mb-4">
        Your AI voice sales agent is active and handling customer calls.
      </p>

      {/* Agent Channel Status Module */}
      <div className="bg-white rounded-xl p-3.5 border border-[#D5EFE1] shadow-xs mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8F7EF] text-[#15966B] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#15966B] uppercase tracking-wide leading-tight">
                Voice Line
              </div>
              <div className="text-xs font-bold text-[#17243A] leading-tight">
                Ready & Listening
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-[#15966B] bg-[#E8F7EF] px-2 py-0.5 rounded-full">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Standby</span>
          </div>
        </div>

        {/* Audio Waveform Visualization */}
        <div className="h-7 bg-[#F4FBF7] rounded-lg px-3 flex items-center justify-between gap-1 overflow-hidden">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className="w-1 bg-[#15966B] rounded-full transition-all duration-300"
              style={{
                height: `${h}px`,
                opacity: 0.6 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>
      </div>

      {/* Two Metric Blocks */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/80 rounded-xl p-2.5 border border-[#E6E7EB]/60">
          <div className="text-[11px] text-[#6B7280]">Calls Today</div>
          <div className="text-xl font-bold text-[#17243A] mt-0.5">{stats.handledCallsToday}</div>
        </div>
        <div className="bg-white/80 rounded-xl p-2.5 border border-[#E6E7EB]/60">
          <div className="text-[11px] text-[#6B7280]">Successful Orders</div>
          <div className="text-xl font-bold text-[#17243A] mt-0.5">{stats.successfulOrders}</div>
        </div>
      </div>

      {/* View Call Logs CTA */}
      <button
        onClick={onViewCallLogs}
        className="w-full h-10 bg-white hover:bg-stone-50 active:scale-[0.99] border border-[#D5EFE1] text-[#17243A] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
      >
        <span>View Call Logs</span>
        <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
      </button>
    </div>
  );
};
