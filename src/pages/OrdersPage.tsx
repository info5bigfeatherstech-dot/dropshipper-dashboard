import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { downloadOrderPDF, downloadOrderCSV } from '../utils/exportUtils';
import { Tabs, TabItem } from '../components/common/Tabs';
import { AddressServiceabilityChecker } from '../components/shipping/AddressServiceabilityChecker';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Search,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  MoreHorizontal,
  Download,
  Copy,
  ChevronDown
} from 'lucide-react';

export interface OrdersPageProps {
  initialTab?: 'orders' | 'serviceability';
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    orders,
    setSelectedOrderForDetail,
    addToast
  } = useStore();

  // Search & Filter state for All Orders table
  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'serviceability'>(() => {
    if (initialTab) return initialTab;
    if (location.pathname === '/orders/serviceability') return 'serviceability';
    return 'orders';
  });

  // Keep state in sync with URL
  React.useEffect(() => {
    if (location.pathname === '/orders/serviceability') {
      setActiveMainTab('serviceability');
    } else if (location.pathname === '/orders') {
      setActiveMainTab('orders');
    }
  }, [location.pathname]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Stat calculations
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const approvedCount = orders.filter((o) => o.status === 'approved').length;
  const shippedOrDeliveredCount = orders.filter(
    (o) => o.status === 'shipped' || o.status === 'delivered'
  ).length;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.item.productName.toLowerCase().includes(q) ||
          o.item.sku.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (dateRange !== 'all') {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (dateRange === 'today') {
        result = result.filter(
          (o) => now - new Date(o.createdAt).getTime() <= oneDay
        );
      } else if (dateRange === '7days') {
        result = result.filter(
          (o) => now - new Date(o.createdAt).getTime() <= 7 * oneDay
        );
      } else if (dateRange === '30days') {
        result = result.filter(
          (o) => now - new Date(o.createdAt).getTime() <= 30 * oneDay
        );
      }
    }

    return result;
  }, [orders, search, statusFilter, dateRange]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const handleQuickDownloadPDF = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    try {
      downloadOrderPDF(order);
      addToast({
        type: 'success',
        title: 'PDF Export Ready',
        message: `Saved ${order.orderNumber}_Details.pdf`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not export PDF.'
      });
    }
  };

  const handleQuickDownloadCSV = (order: Order) => {
    try {
      downloadOrderCSV(order);
      addToast({
        type: 'success',
        title: 'CSV Export Ready',
        message: `Saved ${order.orderNumber}_export.csv`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not export CSV.'
      });
    }
  };

  const handleCopyId = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    addToast({
      type: 'info',
      title: 'Order Number Copied',
      message: `${orderNumber} copied to clipboard.`
    });
  };

  const statusChips: Array<{ key: OrderStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'approved', label: 'Approved' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with shadcn Button and Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              All Orders
            </h2>
            <Badge variant="secondary" className="font-semibold text-brand-700 bg-brand-50 border-brand-200">
              {totalOrdersCount} Total
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time fulfillment tracking, admin verification states, and on-demand dropship dispatch.
          </p>
        </div>

        {/* Action Buttons via shadcn DropdownMenu & Button */}
        <div className="flex items-center gap-2.5">
          {/* shadcn DropdownMenu for Batch Actions & Exports */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl shadow-xs gap-1.5 text-xs font-semibold text-slate-700">
                <Download className="w-3.5 h-3.5 text-brand-600" />
                <span>Export & Actions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-soft-lg">
              <DropdownMenuLabel>Data Exports</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (filteredOrders.length > 0) {
                    handleQuickDownloadCSV(filteredOrders[0]);
                  }
                }}
              >
                <FileText className="w-4 h-4 text-brand-600 mr-2" />
                <span>Export CSV Data</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  if (filteredOrders.length > 0) {
                    handleQuickDownloadPDF(e, filteredOrders[0]);
                  }
                }}
              >
                <Download className="w-4 h-4 text-brand-600 mr-2" />
                <span>Download Sample PDF</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Batch Utilities</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  const ids = filteredOrders.map((o) => o.orderNumber).join(', ');
                  navigator.clipboard.writeText(ids);
                  addToast({
                    type: 'info',
                    title: 'Copied Batch IDs',
                    message: `${filteredOrders.length} order IDs copied to clipboard.`
                  });
                }}
              >
                <Copy className="w-4 h-4 text-slate-500 mr-2" />
                <span>Copy Visible IDs</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => navigate('/orders/create')}
            className="rounded-xl shadow-soft"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Create Order</span>
          </Button>
        </div>
      </div>

      {/* Primary Section Tabs */}
      <div className="flex items-center">
        <Tabs
          tabs={[
            {
              id: 'orders',
              label: 'All Orders',
              count: totalOrdersCount,
              icon: <ShoppingBag className="w-4 h-4" />
            },
            {
              id: 'serviceability',
              label: 'Check Serviceability & Rates',
              icon: <Truck className="w-4 h-4" />
            }
          ]}
          activeTab={activeMainTab}
          onChange={(tabId) => {
            const next = tabId as 'orders' | 'serviceability';
            setActiveMainTab(next);
            navigate(next === 'serviceability' ? '/orders/serviceability' : '/orders');
          }}
        />
      </div>

      {activeMainTab === 'serviceability' ? (
        <AddressServiceabilityChecker />
      ) : (
        <>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={totalOrdersCount}
          subtext="All customer bookings"
          icon={<ShoppingBag className="w-5 h-5" />}
          accent="indigo"
          isActive={statusFilter === 'all'}
          onClick={() => {
            setStatusFilter('all');
            setCurrentPage(1);
          }}
        />

        <StatCard
          label="Pending Approval"
          value={pendingCount}
          subtext="Waiting for admin hold"
          icon={<Clock className="w-5 h-5" />}
          accent="amber"
          isActive={statusFilter === 'pending'}
          onClick={() => {
            setStatusFilter('pending');
            setCurrentPage(1);
          }}
        />

        <StatCard
          label="Approved"
          value={approvedCount}
          subtext="Dispatched to warehouse"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="emerald"
          isActive={statusFilter === 'approved'}
          onClick={() => {
            setStatusFilter('approved');
            setCurrentPage(1);
          }}
        />

        <StatCard
          label="Shipped / Delivered"
          value={shippedOrDeliveredCount}
          subtext="In transit or finished"
          icon={<Truck className="w-5 h-5" />}
          accent="blue"
          isActive={statusFilter === 'shipped' || statusFilter === 'delivered'}
          onClick={() => {
            setStatusFilter('shipped');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Filter & Search Bar via shadcn Card, Input, and Select */}
      <Card className="p-4 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input using shadcn Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by order #, customer, email or product SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter using shadcn Select */}
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as any);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter using official shadcn Select component */}
          <div className="w-full sm:w-40">
            <Select
              value={dateRange}
              onValueChange={(val) => {
                setDateRange(val as any);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Status:
          </span>
          {statusChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => {
                setStatusFilter(chip.key);
                setCurrentPage(1);
              }}
              className={`text-xs px-3 py-1 rounded-lg shrink-0 transition-colors ${
                statusFilter === chip.key
                  ? 'bg-brand-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Orders Data Table using shadcn Table, Card, and DropdownMenu */}
      <Card className="shadow-soft overflow-hidden">
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            description="We couldn't find any orders matching your search or filters. You can create a new order anytime."
            actionLabel="Create New Order"
            onAction={() => navigate('/orders/create')}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3.5 px-4 sm:px-6">Order ID</TableHead>
                  <TableHead className="py-3.5 px-4">Product Details</TableHead>
                  <TableHead className="py-3.5 px-4 hidden md:table-cell">Customer</TableHead>
                  <TableHead className="py-3.5 px-4 hidden sm:table-cell">Date</TableHead>
                  <TableHead className="py-3.5 px-4">Amount</TableHead>
                  <TableHead className="py-3.5 px-4">Status</TableHead>
                  <TableHead className="py-3.5 px-4 sm:px-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="cursor-pointer group"
                  >
                    {/* Order ID */}
                    <TableCell className="font-mono font-bold text-brand-600 whitespace-nowrap px-4 sm:px-6">
                      {order.orderNumber}
                    </TableCell>

                    {/* Product Info */}
                    <TableCell className="px-4">
                      {(() => {
                        const items = order.items && order.items.length > 0 ? order.items : [order.item];
                        const hasMultiple = items.length > 1;
                        const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);

                        return (
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="relative shrink-0">
                              <img
                                src={order.item.image}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                              />
                              {hasMultiple && (
                                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">
                                  +{items.length - 1}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                                {order.item.productName}
                                {hasMultiple && (
                                  <span className="ml-1.5 text-xs font-normal text-brand-600">
                                    (+{items.length - 1} more)
                                  </span>
                                )}
                              </p>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {hasMultiple ? `${totalQty} units across ${items.length} items` : `Qty: ${order.item.quantity} • ${order.item.sku}`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="px-4 hidden md:table-cell">
                      <div>
                        <p className="font-medium text-slate-800">
                          {order.customer.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {order.customer.email}
                        </p>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-4 hidden sm:table-cell text-slate-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(
                        order.items && order.items.length > 0
                          ? order.items.reduce((acc, it) => acc + it.total, 0)
                          : order.item.total
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 whitespace-nowrap">
                      <StatusBadge status={order.status} size="sm" />
                    </TableCell>

                    {/* Actions with shadcn DropdownMenu */}
                    <TableCell className="px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrderForDetail(order)}
                          className="h-8 w-8 text-slate-400 hover:text-brand-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-800"
                              title="Order Options"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Order {order.orderNumber}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedOrderForDetail(order)}>
                              <Eye className="w-4 h-4 text-brand-600" />
                              <span>View Drawer</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleQuickDownloadPDF(e, order)}>
                              <FileText className="w-4 h-4 text-brand-600" />
                              <span>Download PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickDownloadCSV(order)}>
                              <Download className="w-4 h-4 text-brand-600" />
                              <span>Export CSV</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCopyId(order.orderNumber)}>
                              <Copy className="w-4 h-4 text-slate-500" />
                              <span>Copy Order ID</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/50 text-xs text-slate-500">
              <div>
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    (currentPage - 1) * pageSize + 1,
                    filteredOrders.length
                  )}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * pageSize, filteredOrders.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-700">
                  {filteredOrders.length}
                </span>{' '}
                orders
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-semibold px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
