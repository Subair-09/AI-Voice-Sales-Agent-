import React from 'react';
import { Wrench, Shield, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';
import { AgentTool } from '../../types/agent';

interface ToolsActionsTabProps {
  tools: AgentTool[];
  onToggleTool: (toolId: string, enabled: boolean) => Promise<void>;
}

export const ToolsActionsTab: React.FC<ToolsActionsTabProps> = ({
  tools,
  onToggleTool,
}) => {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-[#E6E7EB] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#17243A]">
              <Wrench className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243A]">AI Actions & Tool Integrations</h3>
              <p className="text-xs text-[#6B7280]">
                Authorize and configure which backend capabilities the voice agent can invoke.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="font-bold text-[#15966B]">
              {tools.filter((t) => t.enabled).length} Active
            </span>
            <span>/</span>
            <span>{tools.length} Registered</span>
          </div>
        </div>

        {/* Security Notice Box */}
        <div className="mt-4 p-3.5 bg-[#FAF7F0] border border-[#F1EADA] rounded-xl flex items-start gap-3">
          <Shield className="w-4 h-4 text-[#15966B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#475569] leading-relaxed">
            <strong className="text-[#17243A]">Server-Side Verification:</strong> All actions execute strictly through protected backend proxy routes. Orders, amounts, and Paystack receipts are checked before confirmation.
          </p>
        </div>

        {/* Tools Table / Grid */}
        <div className="mt-5 divide-y divide-[#F3F4F6]">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#17243A] text-sm">{tool.displayName}</h4>
                  <span className="font-mono text-[11px] text-[#64748B] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#E6E7EB]">
                    {tool.name}()
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tool.enabled
                        ? 'bg-[#E8F7EF] text-[#15966B]'
                        : 'bg-[#F3F4F6] text-[#9CA3AF]'
                    }`}
                  >
                    {tool.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-[#64748B]">
                  <span className="flex items-center gap-1 font-mono">
                    <ArrowUpRight className="w-3 h-3 text-[#9CA3AF]" />
                    {tool.endpoint}
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#9CA3AF]" />
                    Scope: <strong className="text-[#17243A]">{tool.permission}</strong>
                  </span>
                  <span className="px-2 py-0.2 rounded-md bg-[#FAF7F0] font-medium text-[#17243A]">
                    {tool.category}
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center sm:self-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={tool.enabled}
                  onClick={() => onToggleTool(tool.id, !tool.enabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    tool.enabled ? 'bg-[#15966B]' : 'bg-[#E5E7EB]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      tool.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
