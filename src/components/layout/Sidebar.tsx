import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Package,
  ShoppingBag,
  PlusCircle,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Truck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, orders, totalOrdersCount, fetchOrders } = useStore();

  const isProductsActive = location.pathname.startsWith('/products');
  const isOrdersActive = location.pathname.startsWith('/orders');
  const isCreateOrderActive = location.pathname === '/orders/create';
  const isServiceabilityActive = location.pathname === '/orders/serviceability';
  const isAllOrdersActive = location.pathname === '/orders';

  const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(true);

  // Fetch orders from API on mount and whenever navigating back to orders
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, location.pathname]);

  // Keep dropdown open when user navigates to any order route
  useEffect(() => {
    if (isOrdersActive) {
      setOrdersDropdownOpen(true);
    }
  }, [location.pathname, isOrdersActive]);

  const orderCount = totalOrdersCount > 0 ? totalOrdersCount : orders.length;

  return (
    <aside
      className={`hidden md:flex flex-col h-full min-h-0 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 z-30 select-none ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/products')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-soft-indigo shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                DropFlow
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                  Seller
                </span>
              </span>
              <p className="text-[11px] text-slate-400 truncate">Sourcing & Fulfillment</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 min-h-0 py-5 px-3 space-y-2 overflow-y-auto overscroll-contain">
        {!sidebarCollapsed && (
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
        )}

        {/* 1. Products */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
              isActive || isProductsActive
                ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
          }
          title={sidebarCollapsed ? 'Products' : undefined}
        >
          <Package className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
          {!sidebarCollapsed && (
            <span className="flex-1">Products</span>
          )}
        </NavLink>

        {/* 2. Orders with Collapsible / Sliding Sub-tabs Dropdown */}
        <div className="space-y-1">
          {/* Orders Parent Tab Header with Dropdown toggle */}
          <div
            onClick={() => {
              if (sidebarCollapsed) {
                toggleSidebar();
                setOrdersDropdownOpen(true);
              } else {
                setOrdersDropdownOpen(!ordersDropdownOpen);
              }
            }}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer group select-none ${
              isOrdersActive
                ? 'bg-brand-50/70 text-brand-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            title={sidebarCollapsed ? 'Orders' : undefined}
          >
            <ShoppingBag className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 font-bold text-slate-800">Orders</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-normal">
                  {orderCount}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    ordersDropdownOpen ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </>
            )}
          </div>

          {/* Sub-tabs Dropdown: Slides in/out smoothly */}
          {!sidebarCollapsed && (
            <AnimatePresence initial={false}>
              {ordersDropdownOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 pl-3 border-l-2 border-brand-200/80 space-y-1 pt-1 pb-1">
                    {/* Sub-tab 1: All Orders */}
                    <NavLink
                      to="/orders"
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive || isAllOrdersActive
                            ? 'bg-brand-600 text-white font-bold shadow-soft'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <ListOrdered className="w-4 h-4 shrink-0" />
                      <span className="flex-1">All Orders</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-all ${
                          isAllOrdersActive
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {orderCount}
                      </span>
                    </NavLink>

                    {/* Sub-tab 2: Create Order */}
                    <NavLink
                      to="/orders/create"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive || isCreateOrderActive
                            ? 'bg-brand-600 text-white font-bold shadow-soft'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <PlusCircle className="w-4 h-4 shrink-0" />
                      <span className="flex-1">Create Order</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          isCreateOrderActive
                            ? 'bg-brand-500 text-white'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        New
                      </span>
                    </NavLink>

                    {/* Sub-tab 3: Check Serviceability */}
                    <NavLink
                      to="/orders/serviceability"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive || isServiceabilityActive
                            ? 'bg-brand-600 text-white font-bold shadow-soft'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <Truck className="w-4 h-4 shrink-0" />
                      <span className="flex-1">Serviceability</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          isServiceabilityActive
                            ? 'bg-brand-500 text-white'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        Check
                      </span>
                    </NavLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer Info Box */}
      {!sidebarCollapsed && (
        <div className="p-4 m-3 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Supplier Network Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            All dropship items reflect verified real-time factory pricing.
          </p>
        </div>
      )}
    </aside>
  );
};
