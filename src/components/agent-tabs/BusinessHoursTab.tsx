import React, { useState } from 'react';
import { Clock, Calendar, Save, CheckCircle2, Moon } from 'lucide-react';
import { AIAgentConfig, BusinessHoursItem } from '../../types/agent';

interface BusinessHoursTabProps {
  config: AIAgentConfig;
  onUpdateBusinessHours: (
    hours: BusinessHoursItem[],
    alwaysAvailable: boolean,
    outsideAction: AIAgentConfig['outsideHoursAction']
  ) => Promise<void>;
}

export const BusinessHoursTab: React.FC<BusinessHoursTabProps> = ({
  config,
  onUpdateBusinessHours,
}) => {
  const [hours, setHours] = useState<BusinessHoursItem[]>(config.businessHours);
  const [alwaysAvailable, setAlwaysAvailable] = useState(config.alwaysAvailable);
  const [outsideHoursAction, setOutsideHoursAction] = useState(config.outsideHoursAction);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleDay = (day: string) => {
    setHours(
      hours.map((h) => {
        if (h.day === day) {
          return { ...h, isOpen: !h.isOpen };
        }
        return h;
      })
    );
  };

  const handleTimeChange = (day: string, field: 'openTime' | 'closeTime', val: string) => {
    setHours(
      hours.map((h) => {
        if (h.day === day) {
          return { ...h, [field]: val };
        }
        return h;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateBusinessHours(hours, alwaysAvailable, outsideHoursAction);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update business hours:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">Operating Schedule & Business Hours</h3>
              <p className="text-xs text-[#6B7280]">
                Define when the bakery is baking and taking deliveries.
              </p>
            </div>
          </div>
        </div>

        {/* 24/7 Always Available Switch */}
        <div className="mt-5 p-4 rounded-xl bg-[#FAF7F0] border border-[#F1EADA] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#17243A]">24/7 Agent Availability</p>
            <p className="text-[11px] text-[#6B7280]">
              Allow AI to answer late night calls and queue orders for the morning bake batch.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={alwaysAvailable}
            onClick={() => setAlwaysAvailable(!alwaysAvailable)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              alwaysAvailable ? 'bg-[#15966B]' : 'bg-[#D1D5DB]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                alwaysAvailable ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Days Table */}
        <div className="mt-5 divide-y divide-[#F3F4F6]">
          {hours.map((item) => (
            <div
              key={item.day}
              className="py-3 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3 w-32">
                <button
                  type="button"
                  onClick={() => handleToggleDay(item.day)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer ${
                    item.isOpen
                      ? 'bg-[#15966B] border-[#15966B] text-white'
                      : 'border-[#D1D5DB] bg-white'
                  }`}
                >
                  {item.isOpen && <span className="text-[10px]">✓</span>}
                </button>
                <span className={`font-semibold ${item.isOpen ? 'text-[#17243A]' : 'text-[#9CA3AF]'}`}>
                  {item.day}
                </span>
              </div>

              {item.isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.openTime}
                    onChange={(e) => handleTimeChange(item.day, 'openTime', e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-[#E6E7EB] bg-[#FAF7F0] w-24 text-center font-mono font-medium"
                  />
                  <span className="text-[#9CA3AF]">to</span>
                  <input
                    type="text"
                    value={item.closeTime}
                    onChange={(e) => handleTimeChange(item.day, 'closeTime', e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-[#E6E7EB] bg-[#FAF7F0] w-24 text-center font-mono font-medium"
                  />
                </div>
              ) : (
                <span className="text-xs font-semibold text-[#DC2626] bg-[#FEE2E2] px-3 py-0.5 rounded-full">
                  Closed
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Outside Hours Policy */}
        <div className="mt-6 pt-5 border-t border-[#F3F4F6]">
          <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
            Outside Business Hours Behavior
          </label>
          <select
            value={outsideHoursAction}
            onChange={(e) =>
              setOutsideHoursAction(e.target.value as AIAgentConfig['outsideHoursAction'])
            }
            className="w-full sm:w-80 px-3 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer"
          >
            <option value="ai">AI answers and accepts advance orders</option>
            <option value="closed_message">Play store closed greeting</option>
            <option value="human">Forward calls to bakery manager phone</option>
          </select>
        </div>

        {/* Save button */}
        <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-[#15966B] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Schedule updated!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-xs text-[#17243A] flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
