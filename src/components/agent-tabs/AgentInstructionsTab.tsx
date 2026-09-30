import React, { useState } from 'react';
import { FileText, Save, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { AIAgentConfig } from '../../types/agent';

interface AgentInstructionsTabProps {
  config: AIAgentConfig;
  onSaveInstructions: (instructions: string) => Promise<void>;
}

export const AgentInstructionsTab: React.FC<AgentInstructionsTabProps> = ({
  config,
  onSaveInstructions,
}) => {
  const [instructions, setInstructions] = useState(config.instructions);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setInstructions(config.instructions);
  }, [config.instructions]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveInstructions(instructions);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save instructions:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setInstructions(`You are the AI sales assistant for Baked by Doja.

Your job is to help customers discover products, answer questions, take orders and assist with payments.

Always speak naturally and keep responses concise.

Ask one question at a time.

Never invent product information.

Always check the product database for current prices and availability.

Before creating an order, confirm:
- Product
- Quantity
- Customer name
- Phone number
- Delivery address
- Total amount

Never claim a payment has been received unless the backend confirms it.

If you cannot complete a request, explain the situation and offer human assistance.`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Main Prompt Editor (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17243A]">Agent Instructions</h3>
                  <p className="text-xs text-[#6B7280]">
                    The core system prompt guiding your AI sales assistant's voice behavior.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-[#E6E7EB] hover:bg-[#FAF7F0] text-xs font-semibold text-[#6B7280] transition-colors cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#17243A] mb-2">
                System Prompt
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={16}
                className="w-full text-xs font-mono p-4 rounded-xl border border-[#E6E7EB] bg-[#FAF7F0] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#F9B91A] text-[#17243A] leading-relaxed transition-all"
                placeholder="Enter AI agent instructions..."
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
            <div className="text-xs text-[#6B7280]">
              {instructions.length} characters • {instructions.split(/\s+/).filter(Boolean).length} words
            </div>

            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-xs font-bold text-[#15966B] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Instructions saved!
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#F9B91A] hover:bg-[#E5A812] active:scale-[0.99] font-bold text-xs text-[#17243A] flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Instructions'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Golden Rules & Safety Safeguards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FAF7F0] rounded-2xl p-5 border border-[#F1EADA]">
            <div className="flex items-center gap-2 mb-2 text-[#15966B]">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#17243A]">
                Strict Safety Boundaries
              </h4>
            </div>
            <ul className="text-xs text-[#475569] space-y-2 mt-3 list-disc pl-4 leading-relaxed">
              <li>
                <strong className="text-[#17243A]">Zero Payment Hallucinations:</strong> The agent never states a payment has cleared unless backend API verification succeeds.
              </li>
              <li>
                <strong className="text-[#17243A]">Order Verification:</strong> Must confirm item name, quantity, customer contact, and delivery location before creating order.
              </li>
              <li>
                <strong className="text-[#17243A]">Real-Time Inventory:</strong> Checks live bakery stock before confirming availability to callers.
              </li>
              <li>
                <strong className="text-[#17243A]">Concise Telephony Responses:</strong> Keeps replies under 2-3 sentences to feel like a real conversational call.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E6E7EB] shadow-xs">
            <h4 className="text-xs font-bold text-[#17243A] uppercase tracking-wider mb-2">
              Baked by Doja Prompt Variables
            </h4>
            <div className="text-xs space-y-2">
              <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#F1EADA] font-mono text-[11px]">
                <code>&#123;&#123;customer_name&#125;&#125;</code> - Caller contact name
              </div>
              <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#F1EADA] font-mono text-[11px]">
                <code>&#123;&#123;store_hours&#125;&#125;</code> - Current day operating hours
              </div>
              <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#F1EADA] font-mono text-[11px]">
                <code>&#123;&#123;product_catalogue&#125;&#125;</code> - Active menu items & pricing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
