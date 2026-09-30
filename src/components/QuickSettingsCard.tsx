import React from 'react';
import { Settings } from 'lucide-react';
import { AIAgentConfig } from '../types/agent';

interface QuickSettingsCardProps {
  settings: AIAgentConfig['settings'];
  onToggleSetting: (key: keyof AIAgentConfig['settings'], value: boolean) => void;
}

export const QuickSettingsCard: React.FC<QuickSettingsCardProps> = ({
  settings,
  onToggleSetting,
}) => {
  const toggleItems: {
    key: keyof AIAgentConfig['settings'];
    title: string;
    description: string;
  }[] = [
    {
      key: 'autoHandling',
      title: 'Auto handling',
      description: 'Automatically handle common requests',
    },
    {
      key: 'orderConfirmation',
      title: 'Order confirmation',
      description: 'Confirm order details before processing',
    },
    {
      key: 'paymentLinkGeneration',
      title: 'Payment link generation',
      description: 'Automatically send Paystack payment links',
    },
    {
      key: 'emailNotifications',
      title: 'Email notifications',
      description: 'Send order confirmations to customers',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
            <Settings className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h4 className="text-sm font-bold text-[#17243A]">Quick Settings</h4>
        </div>

        <div className="space-y-4">
          {toggleItems.map((item) => {
            const isChecked = Boolean(settings[item.key]);

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-[#17243A]">{item.title}</p>
                  <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  onClick={() => onToggleSetting(item.key, !isChecked)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isChecked ? 'bg-[#15966B]' : 'bg-[#E5E7EB]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isChecked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
