import React, { useState, useEffect } from 'react';
import {
  Store,
  Bot,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Database,
  Save,
  RotateCcw,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  DollarSign,
  Package,
} from 'lucide-react';
import { safeFetchJson } from '../../utils/api';

interface BakerySettings {
  store: {
    name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    address: string;
    city: string;
    state: string;
    country: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    openingHours: {
      weekday: string;
      weekend: string;
      bakingDays: string;
      leadTimeHours: number;
    };
  };
  agent: {
    agentName: string;
    voiceId: string;
    voiceName: string;
    language: string;
    greeting: string;
    voiceSpeed: number;
    silenceTimeout: number;
    maxCallDuration: number;
    responseDelay: number;
    bargeIn: boolean;
    autoHandling: boolean;
    callRecording: boolean;
    transcription: boolean;
    humanEscalationPhone: string;
    enableFallbackTransfer: boolean;
  };
  payments: {
    currency: string;
    allowBankTransfer: boolean;
    allowPaystack: boolean;
    allowMonnify: boolean;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankInstructions: string;
    paystackPublicKey: string;
    monnifyApiKey: string;
    taxRatePercentage: number;
  };
  delivery: {
    pickupAvailable: boolean;
    pickupLocation: string;
    islandDeliveryFee: number;
    mainlandDeliveryFee: number;
    freeDeliveryThreshold: number;
    estimatedDeliveryTime: string;
    deliveryNotes: string;
    minimumOrderAmount: number;
  };
  notifications: {
    emailAlertsEnabled: boolean;
    smsAlertsEnabled: boolean;
    whatsappAlertsEnabled: boolean;
    adminNotificationEmail: string;
    adminNotificationPhone: string;
    notifyOnNewOrder: boolean;
    notifyOnPaymentConfirmed: boolean;
    notifyOnLowStock: boolean;
    lowStockAlertThreshold: number;
    dailySummaryEmail: boolean;
  };
  security: {
    adminName: string;
    adminEmail: string;
    sessionTimeoutMinutes: number;
    twoFactorEnabled: boolean;
    enforcePasswordExpiry: boolean;
    auditLogging: boolean;
  };
  updatedAt?: string;
}

interface SettingsViewProps {
  onOpenIntegrations?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenIntegrations,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'store' | 'agent' | 'payments' | 'delivery' | 'notifications' | 'security' | 'database'
  >('store');

  const [settings, setSettings] = useState<BakerySettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<BakerySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isMongoConnected, setIsMongoConnected] = useState(false);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Backup state
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Show Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await safeFetchJson('/api/admin/settings');
      if (data && data.success && data.settings) {
        setSettings(data.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(data.settings)));
        setIsMongoConnected(data.isMongoConnected || false);
      }
    } catch {
      // Silently retain current settings during server reload
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Track Unsaved Changes
  useEffect(() => {
    if (settings && originalSettings) {
      const isDiff = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasUnsavedChanges(isDiff);
    }
  }, [settings, originalSettings]);

  // Save Settings
  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(data.settings)));
        setHasUnsavedChanges(false);
        showToast('Settings saved successfully and synced to persistent database!', 'success');
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Error connecting to settings server', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const handleResetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to factory defaults?')) {
      return;
    }
    try {
      setIsResetting(true);
      const res = await fetch('/api/admin/settings/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(data.settings)));
        setHasUnsavedChanges(false);
        showToast('Settings restored to default configurations.', 'info');
      }
    } catch (err) {
      console.error('Error resetting settings:', err);
      showToast('Error resetting settings', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Export Full System Backup
  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/admin/settings/export-backup');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `baked-by-doja-system-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Full system backup downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to export backup:', err);
      showToast('Failed to download system backup', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please provide your current admin password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      // Admin password simulation / persistence
      localStorage.setItem('bbd_admin_custom_pass', newPassword);
      setPasswordSuccess('Password successfully updated! Use your new password for your next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Admin password changed successfully.', 'success');
    } catch (err) {
      setPasswordError('Failed to update password.');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="w-8 h-8 text-[#D97706] animate-spin" />
        <p className="text-sm font-medium text-[#475569]">Loading system settings...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'store', label: 'Bakery Profile', icon: Store },
    { id: 'agent', label: 'AI Voice Concierge', icon: Bot },
    { id: 'payments', label: 'Payments & Banking', icon: CreditCard },
    { id: 'delivery', label: 'Delivery & Logistics', icon: Truck },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'security', label: 'Admin Security', icon: Shield },
    { id: 'database', label: 'Database & Backup', icon: Database },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 transition-all animate-in slide-in-from-top duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-[#E8F7EF] border-[#A7F3D0] text-[#15966B]'
              : toastMessage.type === 'error'
              ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
              : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E6E7EB] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15966B] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#17243A]">
              Store & System Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Configure bakery operations, voice sales agent parameters, payment gateways, delivery logistics, and administrative controls.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleResetSettings}
            disabled={isResetting || saving}
            className="px-3.5 py-2.5 rounded-xl border border-[#E6E7EB] bg-white hover:bg-stone-50 text-xs font-semibold text-[#475569] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Reset to factory settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-[#F9B91A] hover:bg-[#ECAE0E] text-[#17243A] ring-2 ring-[#F9B91A]/40 animate-pulse'
                : 'bg-[#17243A] hover:bg-[#20314E] text-white'
            } disabled:opacity-50`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save All Settings'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-[#E6E7EB] p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF7F0] text-[#17243A] shadow-xs border border-[#E6E7EB]'
                    : 'text-[#64748B] hover:text-[#17243A] hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D97706]' : 'text-[#94A3B8]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. BAKERY PROFILE TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'store' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
              <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                <Store className="w-4 h-4 text-[#D97706]" />
                <span>Bakery Brand & Identity</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Public bakery details shown across invoice emails, receipts, and spoken by the AI sales agent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Bakery Store Name</label>
                <input
                  type="text"
                  value={settings.store.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, name: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                  placeholder="e.g. Baked by Doja"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Tagline & Signature Pitch</label>
                <input
                  type="text"
                  value={settings.store.tagline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, tagline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                  placeholder="e.g. Artisanal Handcrafted Banana Loaves & Gourmet Bakes"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Brand Description</label>
                <textarea
                  rows={2}
                  value={settings.store.description}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, description: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                  placeholder="Brief story of your bakery..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Primary Contact Email</label>
                <input
                  type="email"
                  value={settings.store.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, email: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Customer Phone Number</label>
                <input
                  type="text"
                  value={settings.store.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, phone: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">WhatsApp Order Line</label>
                <input
                  type="text"
                  value={settings.store.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, whatsapp: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Instagram Handle</label>
                <input
                  type="text"
                  value={settings.store.instagram}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, instagram: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Kitchen Address & Operating Schedule */}
          <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
              <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D97706]" />
                <span>Bakery Kitchen Location & Baking Schedule</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Informs the AI voice agent when batches come out of the oven and when orders can be dispatched.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Kitchen / Pickup Address</label>
                <input
                  type="text"
                  value={settings.store.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, address: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                  placeholder="e.g. 14B Admiralty Way, Lekki Phase 1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">City & State</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.store.city}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, city: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={settings.store.state}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, state: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Operating Currency</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.store.currency}
                    disabled
                    className="w-full px-3 py-2.5 bg-stone-100 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#64748B]"
                  />
                  <input
                    type="text"
                    value={settings.store.currencySymbol}
                    disabled
                    className="w-full px-3 py-2.5 bg-stone-100 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#64748B]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Weekday Hours</label>
                <input
                  type="text"
                  value={settings.store.openingHours.weekday}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        openingHours: {
                          ...settings.store.openingHours,
                          weekday: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Weekend Hours</label>
                <input
                  type="text"
                  value={settings.store.openingHours.weekend}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        openingHours: {
                          ...settings.store.openingHours,
                          weekend: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Fresh Baking Days</label>
                <input
                  type="text"
                  value={settings.store.openingHours.bakingDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        openingHours: {
                          ...settings.store.openingHours,
                          bakingDays: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Standard Baking Lead Time (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={settings.store.openingHours.leadTimeHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: {
                        ...settings.store,
                        openingHours: {
                          ...settings.store.openingHours,
                          leadTimeHours: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. AI VOICE CONCIERGE TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'agent' && (
        <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#D97706]" />
                <span>Voice Agent Behavior & Speech Tuning</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Controls telephony pacing, voice personality, caller interruptions, and human supervisor escalation.
              </p>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('agent')}
                className="text-xs font-semibold text-[#D97706] hover:text-[#B45309] flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Full AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Agent Persona Name</label>
              <input
                type="text"
                value={settings.agent.agentName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    agent: { ...settings.agent, agentName: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Voice Preset & Dialect</label>
              <select
                value={settings.agent.voiceId}
                onChange={(e) => {
                  const val = e.target.value;
                  const nameMap: Record<string, string> = {
                    'amina-lagos': 'Amina (Lagos Warm & Friendly)',
                    'chidi-lagos': 'Chidi (Calm Professional)',
                    'folake-island': 'Folake (Polite Sales Host)',
                  };
                  setSettings({
                    ...settings,
                    agent: {
                      ...settings.agent,
                      voiceId: val,
                      voiceName: nameMap[val] || val,
                    },
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
              >
                <option value="amina-lagos">Amina (Lagos Warm & Friendly)</option>
                <option value="chidi-lagos">Chidi (Calm Professional)</option>
                <option value="folake-island">Folake (Polite Sales Host)</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Opening Spoken Greeting</label>
              <textarea
                rows={2}
                value={settings.agent.greeting}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    agent: { ...settings.agent, greeting: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
              />
            </div>

            {/* Voice Speed Slider */}
            <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#17243A]">Speech Speed</label>
                <span className="text-xs font-bold text-[#D97706]">{settings.agent.voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={settings.agent.voiceSpeed}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    agent: { ...settings.agent, voiceSpeed: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#F9B91A] cursor-pointer"
              />
              <p className="text-[11px] text-[#64748B]">1.0x is natural Nigerian conversational pacing.</p>
            </div>

            {/* Silence Timeout */}
            <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#17243A]">Silence Timeout</label>
                <span className="text-xs font-bold text-[#D97706]">{settings.agent.silenceTimeout}s</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={settings.agent.silenceTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    agent: { ...settings.agent, silenceTimeout: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-[#F9B91A] cursor-pointer"
              />
              <p className="text-[11px] text-[#64748B]">Seconds of caller silence before asking if they're still there.</p>
            </div>

            {/* Human Supervisor Transfer Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Human Manager Escalation Line</label>
              <input
                type="text"
                value={settings.agent.humanEscalationPhone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    agent: { ...settings.agent, humanEscalationPhone: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                placeholder="+234 803 123 4567"
              />
              <p className="text-[11px] text-[#64748B]">Incoming calls are forwarded here if caller insists on speaking to a human.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#17243A]">Voice Telephony Toggles</label>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.agent.bargeIn}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        agent: { ...settings.agent, bargeIn: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#D97706] focus:ring-[#F9B91A]"
                  />
                  <span>Allow Caller Barge-In (AI pauses speaking when caller interrupts)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.agent.callRecording}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        agent: { ...settings.agent, callRecording: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#D97706] focus:ring-[#F9B91A]"
                  />
                  <span>Audio Call Recording & Telephony Logs</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.agent.enableFallbackTransfer}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        agent: { ...settings.agent, enableFallbackTransfer: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#D97706] focus:ring-[#F9B91A]"
                  />
                  <span>Enable Warm Transfer to Human Supervisor</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PAYMENTS & BANKING TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
              <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D97706]" />
                <span>Bank Transfer Account Details</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                These bank details are recited by the AI voice agent and displayed on checkout for direct transfers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Bank Name</label>
                <input
                  type="text"
                  value={settings.payments.bankName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, bankName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                  placeholder="e.g. Guaranty Trust Bank"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Account Number</label>
                <input
                  type="text"
                  value={settings.payments.accountNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, accountNumber: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white font-mono"
                  placeholder="10-digit NUBAN"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Account Name</label>
                <input
                  type="text"
                  value={settings.payments.accountName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, accountName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                  placeholder="e.g. Baked by Doja Confectionery Ltd"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Customer Payment Instructions</label>
                <textarea
                  rows={2}
                  value={settings.payments.bankInstructions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, bankInstructions: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                  placeholder="Instructions for customer reference..."
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways & Tax */}
          <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
              <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#D97706]" />
                <span>Online Gateways & Taxes</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#17243A]">Paystack Payment Gateway</label>
                  <input
                    type="checkbox"
                    checked={settings.payments.allowPaystack}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: { ...settings.payments, allowPaystack: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#D97706] rounded"
                  />
                </div>
                <input
                  type="text"
                  value={settings.payments.paystackPublicKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, paystackPublicKey: e.target.value },
                    })
                  }
                  placeholder="pk_live_xxxx or pk_test_xxxx"
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#17243A]"
                />
                <p className="text-[11px] text-[#64748B]">Enables Card, USSD, Apple Pay and QR payments.</p>
              </div>

              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#17243A]">Monnify Direct Debit</label>
                  <input
                    type="checkbox"
                    checked={settings.payments.allowMonnify}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: { ...settings.payments, allowMonnify: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#D97706] rounded"
                  />
                </div>
                <input
                  type="text"
                  value={settings.payments.monnifyApiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, monnifyApiKey: e.target.value },
                    })
                  }
                  placeholder="Monnify API Key"
                  className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#17243A]"
                />
                <p className="text-[11px] text-[#64748B]">Automated reserved bank virtual accounts.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">VAT / Consumption Tax (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.payments.taxRatePercentage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, taxRatePercentage: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
                <p className="text-[11px] text-[#64748B]">Default 7.5% Nigerian statutory VAT on commercial goods.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DELIVERY & LOGISTICS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'delivery' && (
        <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D97706]" />
              <span>Lagos Delivery Rates & Dispatch Rules</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Standardized courier shipping fees calculated automatically when AI agent or customer places an order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Lagos Island Delivery Fee (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94A3B8]">₦</span>
                <input
                  type="number"
                  step="500"
                  value={settings.delivery.islandDeliveryFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      delivery: { ...settings.delivery, islandDeliveryFee: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-[#64748B]">Covers VI, Lekki Phase 1, Ikoyi, Chevron, Ajah.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Lagos Mainland Delivery Fee (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94A3B8]">₦</span>
                <input
                  type="number"
                  step="500"
                  value={settings.delivery.mainlandDeliveryFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      delivery: { ...settings.delivery, mainlandDeliveryFee: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-[#64748B]">Covers Ikeja, Surulere, Yaba, Gbagada, Magodo.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Free Delivery Minimum Order (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94A3B8]">₦</span>
                <input
                  type="number"
                  step="1000"
                  value={settings.delivery.freeDeliveryThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      delivery: { ...settings.delivery, freeDeliveryThreshold: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-[#64748B]">Orders above this subtotal qualify for complimentary dispatch.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Estimated Delivery Window</label>
              <input
                type="text"
                value={settings.delivery.estimatedDeliveryTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: { ...settings.delivery, estimatedDeliveryTime: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                placeholder="e.g. 45 – 90 minutes across Lagos"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Packaging & Courier Notes</label>
              <textarea
                rows={2}
                value={settings.delivery.deliveryNotes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: { ...settings.delivery, deliveryNotes: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. NOTIFICATIONS & ALERTS TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D97706]" />
              <span>Real-time Alerts & Admin Dispatch</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Choose how you and your kitchen staff are alerted when calls are completed and loaves run low.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Kitchen Staff Notification Email</label>
              <input
                type="email"
                value={settings.notifications.adminNotificationEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      adminNotificationEmail: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Staff SMS / WhatsApp Notification Phone</label>
              <input
                type="text"
                value={settings.notifications.adminNotificationPhone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      adminNotificationPhone: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17243A]">Low-Stock Warning Threshold (Loaves)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.notifications.lowStockAlertThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      lowStockAlertThreshold: parseInt(e.target.value) || 5,
                    },
                  })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
              />
              <p className="text-[11px] text-[#64748B]">Triggers low inventory badge and alert when remaining inventory dips below this.</p>
            </div>

            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-[#E2E8F0]">
              <label className="text-xs font-semibold text-[#17243A]">Automated Event Alerts</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notifyOnNewOrder}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, notifyOnNewOrder: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#D97706] rounded"
                  />
                  <span>Email instant alert on every new order</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notifyOnPaymentConfirmed}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, notifyOnPaymentConfirmed: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#D97706] rounded"
                  />
                  <span>Dispatch automated payment receipt to customer</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.notifyOnLowStock}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, notifyOnLowStock: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#D97706] rounded"
                  />
                  <span>Send urgent notification when any flavor runs low</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.dailySummaryEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, dailySummaryEmail: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#D97706] rounded"
                  />
                  <span>Send morning daily bakery performance digest</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ADMIN SECURITY TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4">
              <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D97706]" />
                <span>Admin Profile & Access Credentials</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Manage credentials used to log into the Baked by Doja administrative portal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Admin Name</label>
                <input
                  type="text"
                  value={settings.security.adminName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, adminName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Admin Login Email</label>
                <input
                  type="email"
                  value={settings.security.adminEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, adminEmail: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17243A]">Session Inactivity Timeout (Minutes)</label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={settings.security.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        sessionTimeoutMinutes: parseInt(e.target.value) || 60,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/70 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-[#E2E8F0]">
                <label className="text-xs font-semibold text-[#17243A]">Security Hardening</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-[#17243A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.auditLogging}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: { ...settings.security, auditLogging: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-[#D97706] rounded"
                    />
                    <span>Log all staff order modifications and deletions</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Change Admin Password Card */}
          <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-4">
            <div className="border-b border-[#F1F5F9] pb-3">
              <h3 className="text-sm font-bold text-[#17243A] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D97706]" />
                <span>Change Administrator Password</span>
              </h3>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-[#E8F7EF] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#15966B] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-xs font-semibold text-[#DC2626] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#475569]">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#475569]">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#475569]">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#F9B91A] focus:bg-white"
                />
              </div>

              <div className="md:col-span-3 flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#64748B] hover:text-[#17243A] flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide characters' : 'Show characters'}</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#17243A] hover:bg-[#20314E] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. DATABASE & BACKUP TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6E7EB] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#F1F5F9] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#17243A] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#D97706]" />
                  <span>Database Health & Cloud Sync</span>
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Verify MongoDB persistent connection and manage complete system snapshots.
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isMongoConnected
                    ? 'bg-[#E8F7EF] text-[#15966B] border-[#A7F3D0]'
                    : 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isMongoConnected ? 'bg-[#15966B]' : 'bg-[#D97706]'}`} />
                <span>{isMongoConnected ? 'MongoDB Connected' : 'Resilient Disk Mode'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E6E7EB] space-y-3">
                <h4 className="text-xs font-bold text-[#17243A] flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#D97706]" />
                  <span>Full System Backup Export</span>
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Download a comprehensive JSON archive containing all orders, handcrafted products, customer directories, call transcripts, payments, and system configurations.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-[#17243A] hover:bg-[#20314E] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Archive...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Complete System Backup (.json)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-bold text-[#17243A] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#D97706]" />
                  <span>Cloud Integrations & Third-Party APIs</span>
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Inspect live credentials and API connectivity for Cloudinary Image Hosting, Resend Transactional Email, and Vapi Voice Telephony.
                </p>
                {onOpenIntegrations && (
                  <button
                    type="button"
                    onClick={onOpenIntegrations}
                    className="px-4 py-2.5 bg-white hover:bg-stone-100 text-[#17243A] border border-[#E2E8F0] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>View Cloud Integrations Modal</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
