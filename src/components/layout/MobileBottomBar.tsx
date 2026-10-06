import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, ShoppingBag, PlusCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const MobileBottomBar: React.FC = () => {
  const { setActiveOrderTab, totalOrdersCount, orders } = useStore();
  const orderCount = totalOrdersCount > 0 ? totalOrdersCount : orders.length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 text-xs font-semibold ${
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/orders"
          onClick={() => setActiveOrderTab('create')}
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-soft-indigo hover:scale-105 active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 mt-1">
            New Order
          </span>
        </NavLink>

        <NavLink
          to="/orders"
          onClick={() => setActiveOrderTab('all')}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 text-xs font-semibold ${
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {orderCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {orderCount}
              </span>
            )}
          </div>
          <span>Orders</span>
        </NavLink>
      </div>
    </div>
  );
};
