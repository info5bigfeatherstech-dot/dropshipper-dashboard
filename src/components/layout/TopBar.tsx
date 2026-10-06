import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Search,
  Bell,
  CheckCheck,
  Package,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Sparkles,
  Truck
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ServiceabilityCheckerModal } from '../shipping/ServiceabilityCheckerModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { dropshipperAuthService } from '../../services/dropshipperAuthService';
import { getDropshipperUser } from '../../lib/api';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    products,
    orders,
    setSelectedProductForModal,
    setSelectedOrderForDetail,
    setActiveOrderTab
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showServiceabilityModal, setShowServiceabilityModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(() => getDropshipperUser());

  useEffect(() => {
    dropshipperAuthService
      .me()
      .then((data) => {
        if (data?.dropshipper || data?.user) {
          setUserProfile(data.dropshipper || data.user);
        }
      })
      .catch(() => {});
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current page title
  const isProducts = location.pathname.startsWith('/products');
  const isServiceability = location.pathname === '/orders/serviceability';
  const isCreateOrder = location.pathname === '/orders/create';

  const pageTitle = isProducts
    ? 'Product Catalog'
    : isServiceability
      ? 'Route Serviceability & Rates'
      : isCreateOrder
        ? 'Create New Order'
        : 'Orders & Fulfillment';

  const pageSubtitle = isProducts
    ? 'Browse verified supplier inventory with locked wholesale dropship prices'
    : isServiceability
      ? 'Verify carrier delivery availability, calculate exact freight costs & compare Prepaid vs COD'
      : isCreateOrder
        ? 'Dispatch supplier verified inventory directly to your end customer'
        : 'Track customer orders, review approval status, and submit new shipments';

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter global search results
  const q = searchQuery.toLowerCase().trim();
  const matchedProducts = q
    ? products
        .filter(
          (p) => {
            const catName = typeof p.category === 'object' && p.category !== null ? (p.category as any)?.name || '' : (p.category || '');
            return (
              (p.name || '').toLowerCase().includes(q) ||
              (p.sku || '').toLowerCase().includes(q) ||
              catName.toLowerCase().includes(q)
            );
          }
        )
        .slice(0, 3)
    : [];

  const matchedOrders = q
    ? orders
        .filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer.name.toLowerCase().includes(q) ||
            o.item.productName.toLowerCase().includes(q)
        )
        .slice(0, 3)
    : [];

  const hasSearchResults = matchedProducts.length > 0 || matchedOrders.length > 0;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Page Title & Breadcrumb */}
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
          {pageTitle}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block truncate max-w-lg">
          {pageSubtitle}
        </p>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div ref={searchRef} className="relative hidden sm:block w-48 md:w-72 lg:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Instant Search Popover Results */}
          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg p-3 z-50 text-xs">
              {!hasSearchResults ? (
                <p className="text-center py-4 text-slate-400">
                  No matching products or orders found
                </p>
              ) : (
                <div className="space-y-3">
                  {matchedProducts.length > 0 && (
                    <div>
                      <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5 px-2">
                        Products ({matchedProducts.length})
                      </p>
                      <div className="space-y-1">
                        {matchedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              navigate(`/products/${p.id}`);
                              setSearchFocused(false);
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                          >
                            <img
                              src={p.thumbnail}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                {p.name}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {formatCurrency(p.dropshipPrice)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedOrders.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5 px-2">
                        Orders ({matchedOrders.length})
                      </p>
                      <div className="space-y-1">
                        {matchedOrders.map((o) => (
                          <div
                            key={o.id}
                            onClick={() => {
                              setSelectedOrderForDetail(o);
                              setSearchFocused(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                                {o.orderNumber}
                              </p>
                              <p className="text-slate-500 text-[11px]">
                                {o.customer.name}
                              </p>
                            </div>
                            <span className="text-slate-400 text-[10px] uppercase">
                              {o.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>


        {/* Quick Route Serviceability Check Button */}
        <button
          type="button"
          onClick={() => setShowServiceabilityModal(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          title="Check Delivery Serviceability"
        >
          <Truck className="w-3.5 h-3.5 text-brand-600" />
          <span>Check Delivery</span>
        </button>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft-lg p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 rounded-xl transition-colors cursor-pointer text-xs ${
                        !n.read
                          ? 'bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100/80 dark:border-brand-900/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile using shadcn DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs uppercase">
                {userProfile?.fullName ? userProfile.fullName.slice(0, 2) : 'DS'}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {userProfile?.fullName || 'Dropshipper'}
                </p>
                <p className="text-[10px] text-slate-400 leading-none">Verified Seller</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-soft-lg">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="font-bold text-slate-800 dark:text-white text-xs truncate">
                {userProfile?.fullName || 'Active Dropshipper'}
              </p>
              <p className="text-slate-400 text-[11px] truncate">
                {userProfile?.email || userProfile?.phone || 'portal@offerwalebaba.com'}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <Shield className="w-3 h-3" /> 1-Year Active Subscription
              </div>
            </div>

            <DropdownMenuItem onClick={() => navigate('/products')}>
              <Package className="w-4 h-4 text-brand-600" />
              <span>Sourcing Catalog</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/orders')}>
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span>All Orders</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/orders/create')}>
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Quick Order Entry</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={async () => {
                try {
                  await dropshipperAuthService.logout();
                } catch {
                  // ignore
                }
                navigate('/login', { replace: true });
              }}
              className="text-rose-600 hover:text-rose-700 focus:text-rose-700 focus:bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Standalone Route Serviceability Modal */}
      <ServiceabilityCheckerModal
        isOpen={showServiceabilityModal}
        onClose={() => setShowServiceabilityModal(false)}
      />
    </header>
  );
};
