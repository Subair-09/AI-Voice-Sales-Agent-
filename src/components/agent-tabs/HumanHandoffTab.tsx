import React, { useState } from 'react';
import { UserCheck, PhoneForwarded, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIAgentConfig } from '../../types/agent';

interface HumanHandoffTabProps {
  config: AIAgentConfig;
  onUpdateHandoff: (handoff: AIAgentConfig['humanHandoff']) => Promise<void>;
}

export const HumanHandoffTab: React.FC<HumanHandoffTabProps> = ({
  config,
  onUpdateHandoff,
}) => {
  const [enabled, setEnabled] = useState(config.humanHandoff.enabled);
  const [phoneNumber, setPhoneNumber] = useState(config.humanHandoff.phoneNumber);
  const [triggers, setTriggers] = useState<string[]>(config.humanHandoff.triggers);
  const [message, setMessage] = useState(config.humanHandoff.message);
  const [maxWaitTime, setMaxWaitTime] = useState(config.humanHandoff.maxWaitTime);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableTriggers = [
    'Customer requests a human',
    'AI cannot answer the request',
    'Payment problem',
    'Customer is upset',
    'Order issue',
    'VIP corporate enquiry',
  ];

  const handleToggleTrigger = (trigger: string) => {
    if (triggers.includes(trigger)) {
      setTriggers(triggers.filter((t) => t !== trigger));
    } else {
      setTriggers([...triggers, trigger]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateHandoff({
        enabled,
        phoneNumber,
        triggers,
        message,
        maxWaitTime,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update human handoff:', err);
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
              <PhoneForwarded className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">Human Handoff & Escalation</h3>
              <p className="text-xs text-[#6B7280]">
                Seamlessly transfer calls to bakery staff when complex situations arise.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              enabled ? 'bg-[#15966B]' : 'bg-[#D1D5DB]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Transfer Phone */}
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Escalation Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
              placeholder="+234 800 000 0000"
            />
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Bakery floor or manager line where the live call will be patched.
            </p>
          </div>

          {/* Max Wait Time */}
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Max Wait Time for Transfer (seconds)
            </label>
            <input
              type="number"
              value={maxWaitTime}
              onChange={(e) => setMaxWaitTime(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] font-mono focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
            />
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              If staff doesn't pick up within this time, agent offers a callback message.
            </p>
          </div>

          {/* Transfer Triggers */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#17243A] mb-2">
              Automated Escalation Triggers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableTriggers.map((t) => {
                const isChecked = triggers.includes(t);
                return (
                  <label
                    key={t}
                    onClick={() => handleToggleTrigger(t)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-[#FAF7F0] border-[#F9B91A] text-[#17243A]'
                        : 'bg-white border-[#E6E7EB] text-[#6B7280] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded-md accent-[#F9B91A] cursor-pointer"
                    />
                    <span>{t}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Spoken Transfer Message */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Spoken Transfer Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
            />
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Spoken to caller right before dialing the escalation line.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-[#15966B] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Handoff rules saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-xs text-[#17243A] flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Handoff Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
