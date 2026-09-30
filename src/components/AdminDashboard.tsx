import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MainWelcomeHeader } from './MainWelcomeHeader';
import { KpiCards } from './KpiCards';
import { SalesOverviewChart } from './SalesOverviewChart';
import { ProductCard } from './ProductCard';
import { AiAgentStatusCard } from './AiAgentStatusCard';
import { RecentActivityCard } from './RecentActivityCard';
import { KnowledgeBaseCard } from './KnowledgeBaseCard';
import { RecentOrdersTable } from './RecentOrdersTable';
import { BottomCtaCards } from './BottomCtaCards';
import { UploadDocModal } from './UploadDocModal';
import { CallLogsModal } from './CallLogsModal';
import { CallsView } from './CallsView';
import { OrdersView } from './OrdersView';
import { CustomersView } from './CustomersView';
import { ProductsView } from './ProductsView';
import { PaymentsView } from './PaymentsView';
import { AIAgentView } from './AIAgentView';
import { KnowledgeBaseView } from './knowledge/KnowledgeBaseView';
import { SettingsView } from './settings/SettingsView';
import { CloudIntegrationsModal } from './integrations/CloudIntegrationsModal';
import { EmailTemplatePreviewModal } from './EmailTemplatePreviewModal';

interface AdminDashboardProps {
  onSignOut?: () => void;
  onViewLogin?: () => void;
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSignOut,
  onViewLogin,
  initialTab = 'agent', // AI Agent tab selected by default as in reference image
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCallLogsOpen, setIsCallLogsOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isEmailTemplateOpen, setIsEmailTemplateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex font-sans-ui text-[#17243A]">
      {/* 1. LEFT SIDEBAR */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAgentDetails={() => setActiveTab('agent')}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Search & Profile Header */}
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenIntegrations={() => setIsIntegrationsOpen(true)}
          onOpenEmailTemplate={() => setIsEmailTemplateOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
          onSignOut={onSignOut}
          onViewLogin={onViewLogin}
        />

        {/* Dynamic Workspace Container */}
        <main className="p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1600px] w-full mx-auto">
          {activeTab === 'agent' ? (
            /* AI Voice Sales Agent Section (Primary View) */
            <AIAgentView onNavigateTab={setActiveTab} />
          ) : activeTab === 'payments' ? (
            /* Payments Section */
            <PaymentsView
              onAgentSettings={() => setActiveTab('agent')}
              onViewOrders={(_orderId) => setActiveTab('orders')}
            />
          ) : activeTab === 'products' ? (
            /* Products Section */
            <ProductsView
              onAgentSettings={() => setActiveTab('agent')}
              onViewOrders={() => setActiveTab('orders')}
            />
          ) : activeTab === 'customers' ? (
            /* Customers Section */
            <CustomersView
              onAgentSettings={() => setActiveTab('agent')}
              onManageProducts={() => setActiveTab('products')}
              onViewOrders={() => setActiveTab('orders')}
            />
          ) : activeTab === 'orders' ? (
            /* Orders Section */
            <OrdersView
              onAgentSettings={() => setActiveTab('agent')}
              onManageProducts={() => setActiveTab('products')}
            />
          ) : activeTab === 'calls' ? (
            /* Calls Section */
            <CallsView />
          ) : activeTab === 'knowledge' ? (
            /* Knowledge Base Section */
            <KnowledgeBaseView />
          ) : activeTab === 'settings' ? (
            /* Settings Section */
            <SettingsView
              onOpenIntegrations={() => setIsIntegrationsOpen(true)}
              onNavigateTab={setActiveTab}
            />
          ) : (
            /* General Dashboard Overview */
            <>
              <MainWelcomeHeader />
              <KpiCards />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                <div className="xl:col-span-8 space-y-5">
                  <div className="flex flex-col lg:flex-row gap-5 items-stretch">
                    <SalesOverviewChart />
                    <ProductCard onViewProducts={() => setActiveTab('products')} />
                  </div>

                  <RecentOrdersTable
                    searchFilter={searchQuery}
                    onViewAll={() => setActiveTab('orders')}
                  />

                  <BottomCtaCards
                    onAgentSettings={() => setActiveTab('agent')}
                    onManageProducts={() => setActiveTab('products')}
                  />
                </div>

                <div className="xl:col-span-4 space-y-5">
                  <AiAgentStatusCard onViewCallLogs={() => setIsCallLogsOpen(true)} />
                  <RecentActivityCard onViewAll={() => setActiveTab('calls')} />
                  <KnowledgeBaseCard
                    onUploadClick={() => setIsUploadModalOpen(true)}
                    onViewAll={() => setActiveTab('knowledge')}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <UploadDocModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <CallLogsModal
        isOpen={isCallLogsOpen}
        onClose={() => setIsCallLogsOpen(false)}
      />

      <CloudIntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      <EmailTemplatePreviewModal
        isOpen={isEmailTemplateOpen}
        onClose={() => setIsEmailTemplateOpen(false)}
      />
    </div>
  );
};
