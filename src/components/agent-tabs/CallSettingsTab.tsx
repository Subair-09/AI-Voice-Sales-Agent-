import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Clock, Volume2, FastForward } from 'lucide-react';
import { AIAgentConfig } from '../../types/agent';

interface CallSettingsTabProps {
  config: AIAgentConfig;
  onUpdateSettings: (settings: AIAgentConfig['settings']) => Promise<void>;
}

export const CallSettingsTab: React.FC<CallSettingsTabProps> = ({
  config,
  onUpdateSettings,
}) => {
  const [settings, setSettings] = useState(config.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setSettings(config.settings);
  }, [config.settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update call settings:', err);
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
              <Sliders className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">Call Timing & Synthesis Parameters</h3>
              <p className="text-xs text-[#6B7280]">
                Calibrate duration limits, speech speed, and latency for optimal caller experiences.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          {/* Max Call Duration */}
          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[#17243A]">Max Call Duration</span>
              <span className="font-mono font-bold text-[#15966B]">
                {settings.maxCallDuration} minutes
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={settings.maxCallDuration}
              onChange={(e) =>
                setSettings({ ...settings, maxCallDuration: Number(e.target.value) })
              }
              className="w-full accent-[#F9B91A] cursor-pointer"
            />
            <p className="text-[11px] text-[#6B7280] mt-1.5">
              Limits excessive call lengths and gracefully wraps up ordering.
            </p>
          </div>

          {/* Silence Timeout */}
          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[#17243A]">Silence Detection Timeout</span>
              <span className="font-mono font-bold text-[#15966B]">
                {settings.silenceTimeout} seconds
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={settings.silenceTimeout}
              onChange={(e) =>
                setSettings({ ...settings, silenceTimeout: Number(e.target.value) })
              }
              className="w-full accent-[#F9B91A] cursor-pointer"
            />
            <p className="text-[11px] text-[#6B7280] mt-1.5">
              Time to wait in silence before gently prompting: "Are you still with me?"
            </p>
          </div>

          {/* Voice Speed */}
          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[#17243A]">Voice Speaking Speed</span>
              <span className="font-mono font-bold text-[#15966B]">
                {settings.voiceSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={0.8}
              max={1.3}
              step={0.05}
              value={settings.voiceSpeed}
              onChange={(e) =>
                setSettings({ ...settings, voiceSpeed: Number(e.target.value) })
              }
              className="w-full accent-[#F9B91A] cursor-pointer"
            />
            <p className="text-[11px] text-[#6B7280] mt-1.5">
              1.0x is natural pace. 0.9x is slightly slower for clarity.
            </p>
          </div>

          {/* Response Delay */}
          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-[#17243A]">Response Delay (Latency)</span>
              <span className="font-mono font-bold text-[#15966B]">
                {settings.responseDelay} ms
              </span>
            </div>
            <input
              type="range"
              min={150}
              max={800}
              step={50}
              value={settings.responseDelay}
              onChange={(e) =>
                setSettings({ ...settings, responseDelay: Number(e.target.value) })
              }
              className="w-full accent-[#F9B91A] cursor-pointer"
            />
            <p className="text-[11px] text-[#6B7280] mt-1.5">
              Prevents the AI from sounding robotic by pausing naturally before answering.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-[#15966B] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-xs text-[#17243A] flex items-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Call Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
