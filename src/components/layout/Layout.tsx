import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomBar } from './MobileBottomBar';
import { ToastContainer } from '../common/ToastContainer';
import { ProductDetailModal } from '../products/ProductDetailModal';
import { OrderDetailDrawer } from '../orders/OrderDetailDrawer';
import { useStore } from '../../store/useStore';
import { Product } from '../../types';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    selectedOrderForDetail,
    setSelectedOrderForDetail,
    setSelectedProductForCreate,
    setActiveOrderTab
  } = useStore();

  const handleCreateOrderFromProduct = (product: Product) => {
    setSelectedProductForCreate(product);
    setActiveOrderTab('create');
    navigate('/orders/create');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Bar */}
        <TopBar />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomBar />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Product Detail Drawer / Slide-Over */}
      <ProductDetailModal
        product={selectedProductForModal}
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
        onCreateOrder={handleCreateOrderFromProduct}
      />

      {/* Global Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrderForDetail}
        isOpen={Boolean(selectedOrderForDetail)}
        onClose={() => setSelectedOrderForDetail(null)}
      />
    </div>
  );
};
