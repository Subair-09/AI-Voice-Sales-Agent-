import React, { useState } from 'react';
import { Phone, CheckCircle2, Mic, Volume2, ShieldCheck, Play, Pause, Save } from 'lucide-react';
import { AIAgentConfig } from '../../types/agent';

interface VoicePhoneTabProps {
  config: AIAgentConfig;
  onUpdateConfig: (updates: Partial<AIAgentConfig>) => Promise<void>;
  onTestCall: () => void;
}

export const VoicePhoneTab: React.FC<VoicePhoneTabProps> = ({
  config,
  onUpdateConfig,
  onTestCall,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(config.phoneNumber);
  const [callerId, setCallerId] = useState(config.callerId);
  const [voice, setVoice] = useState(config.voice);
  const [language, setLanguage] = useState(config.language);
  const [recordCalls, setRecordCalls] = useState(config.settings.callRecording);
  const [transcription, setTranscription] = useState(config.settings.transcription);
  const [bargeIn, setBargeIn] = useState(config.settings.bargeIn);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const voiceOptions = [
    'Friendly Female (English)',
    'Warm Female (Lagos Accented)',
    'Professional Female (British)',
    'Friendly Male (English)',
    'Warm Male (Nigerian)',
  ];

  const languageOptions = [
    'English (US)',
    'English (UK)',
    'English (Nigerian)',
    'English (Global)',
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateConfig({
        phoneNumber,
        callerId,
        voice,
        language,
        settings: {
          ...config.settings,
          callRecording: recordCalls,
          transcription,
          bargeIn,
        },
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to update voice & phone:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Phone Number & Telephony Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
          <div>
            <h3 className="text-base font-bold text-[#17243A]">Phone Number & Telephony</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              The phone line your AI Voice Sales Agent operates on.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E8F7EF] text-[#15966B] rounded-full text-xs font-bold border border-[#A7F3D0]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Configured Phone Number
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setHasChanges(true);
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
              />
              <button
                type="button"
                onClick={onTestCall}
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E6E7EB] text-xs font-bold text-[#17243A] transition-colors cursor-pointer"
              >
                Test Number
              </button>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Calls to this number route directly to the AI agent.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Outbound Caller ID
            </label>
            <input
              type="text"
              value={callerId}
              onChange={(e) => {
                setCallerId(e.target.value);
                setHasChanges(true);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A]"
            />
            <p className="text-[11px] text-[#9CA3AF] mt-1">
              Verified business caller ID displayed to customers.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Vapi Voice Platform & Telephony Engine Card */}
      <div className="bg-[#FAF7F0] rounded-2xl p-6 border border-[#F1EADA] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F9B91A] text-[#17243A] flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#17243A]">Vapi Voice Platform</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                  WebRTC + Telephony
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Real-time conversational voice agent powered by Vapi, Cartesia &amp; Deepgram Nova-2.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onTestCall}
            className="px-4 py-2 rounded-xl bg-[#17243A] hover:bg-[#2A3B56] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            Launch Voice Call
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          <div className="p-3.5 bg-white rounded-xl border border-[#E6E7EB]">
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Voice Synthesis</p>
            <p className="text-xs font-bold text-[#17243A] mt-1">Cartesia Sonic (240ms)</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Human-realistic natural cadence</p>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#E6E7EB]">
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Transcriber</p>
            <p className="text-xs font-bold text-[#17243A] mt-1">Deepgram Nova-2</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Noise-canceling speech-to-text</p>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#E6E7EB]">
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Server Webhook</p>
            <p className="text-xs font-mono font-bold text-[#15966B] mt-1">/api/vapi/webhook</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Automated tool calls &amp; order capture</p>
          </div>
        </div>
      </div>

      {/* 2. Voice & Synthesis Provider Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <h3 className="text-base font-bold text-[#17243A]">Voice & Language Selection</h3>
        <p className="text-xs text-[#6B7280] mt-0.5 mb-5">
          Select natural sounding voices tuned for conversational sales and customer service.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Voice Model
            </label>
            <select
              value={voice}
              onChange={(e) => {
                setVoice(e.target.value);
                setHasChanges(true);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer"
            >
              {voiceOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17243A] mb-1.5">
              Spoken Language & Dialect
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setHasChanges(true);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] text-[#17243A] cursor-pointer"
            >
              {languageOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Call Audio Controls Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <h3 className="text-base font-bold text-[#17243A]">Call Controls & Interactivity</h3>
        <p className="text-xs text-[#6B7280] mt-0.5 mb-5">
          Configure real-time behavior for recording, speech recognition, and customer interruptions.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div>
              <p className="text-xs font-bold text-[#17243A]">Record Calls</p>
              <p className="text-[11px] text-[#6B7280]">
                Store secure encrypted audio recordings for quality assurance and training.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRecordCalls(!recordCalls);
                setHasChanges(true);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                recordCalls ? 'bg-[#15966B]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  recordCalls ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div>
              <p className="text-xs font-bold text-[#17243A]">Enable Call Transcription</p>
              <p className="text-[11px] text-[#6B7280]">
                Automatically generate verbatim text transcripts of calls in real-time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTranscription(!transcription);
                setHasChanges(true);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                transcription ? 'bg-[#15966B]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  transcription ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0] border border-[#F1EADA]">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#17243A]">
                  Allow Customer Interruptions (Barge-in)
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F7EF] text-[#15966B] font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                The agent immediately pauses speaking whenever the customer begins talking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBargeIn(!bargeIn);
                setHasChanges(true);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                bargeIn ? 'bg-[#15966B]' : 'bg-[#D1D5DB]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  bargeIn ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save bar if dirty */}
      {hasChanges && (
        <div className="sticky bottom-6 bg-[#17243A] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200">
          <p className="text-xs font-semibold">You have unsaved changes in Voice & Phone settings.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPhoneNumber(config.phoneNumber);
                setCallerId(config.callerId);
                setVoice(config.voice);
                setLanguage(config.language);
                setRecordCalls(config.settings.callRecording);
                setTranscription(config.settings.transcription);
                setBargeIn(config.settings.bargeIn);
                setHasChanges(false);
              }}
              className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] text-xs font-bold text-[#17243A] flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
