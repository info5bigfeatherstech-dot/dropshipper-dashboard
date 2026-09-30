import React, { useState } from 'react';
import { Order } from '../../types';
import { Drawer } from '../common/Drawer';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  downloadOrderPDF,
  downloadOrderCSV,
  downloadProductImage
} from '../../utils/exportUtils';
import { useStore } from '../../store/useStore';
import {
  FileText,
  Download,
  Image as ImageIcon,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ExternalLink,
  ZoomIn,
  AlertOctagon,
  Copy,
  Check
} from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose
}) => {
  const { addToast } = useStore();
  const [copiedId, setCopiedId] = useState(false);
  const [isZoomingImage, setIsZoomingImage] = useState(false);

  if (!order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedId(true);
    addToast({
      type: 'info',
      title: 'Order ID Copied',
      message: `${order.orderNumber} copied to clipboard.`
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      downloadOrderPDF(order);
      addToast({
        type: 'success',
        title: 'PDF Export Ready',
        message: `Saved ${order.orderNumber}_Details.pdf to your device.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not generate PDF. Please try again.'
      });
    }
  };

  const handleDownloadCSV = () => {
    try {
      downloadOrderCSV(order);
      addToast({
        type: 'success',
        title: 'CSV Export Ready',
        message: `Saved ${order.orderNumber}_export.csv to your device.`
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not generate CSV file.'
      });
    }
  };

  const handleDownloadImage = async () => {
    addToast({
      type: 'info',
      title: 'Downloading Image',
      message: `Fetching full-res asset for ${order.item.productName}...`
    });
    const ok = await downloadProductImage(
      order.item.image,
      `${order.orderNumber}_${order.item.sku}`
    );
    if (ok) {
      addToast({
        type: 'success',
        title: 'Image Downloaded',
        message: 'Product thumbnail saved to your downloads.'
      });
    }
  };

  // Stepper timeline definition
  const steps = [
    { key: 'created', label: 'Created', icon: Clock },
    { key: 'pending', label: 'Pending Approval', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: PackageCheck }
  ];

  const statusOrderIndex: Record<string, number> = {
    pending: 1,
    approved: 2,
    shipped: 3,
    delivered: 4,
    rejected: -1
  };

  const currentStepIdx = statusOrderIndex[order.status] ?? 1;
  const isRejected = order.status === 'rejected';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
      subtitle={`Submitted on ${formatDateTime(order.createdAt)}`}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top Status & Quick Copy Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono font-bold">
              {order.orderNumber}
            </span>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Copy ID"
            >
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Status Stepper / Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Fulfillment Progress
          </h4>

          {isRejected ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs">
              <AlertOctagon className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Order Rejected by Admin</p>
                <p className="mt-1 leading-relaxed">
                  Reason: {order.rejectionReason || order.adminNote || 'Item allocation declined by supplier.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Stepper horizontal dots */}
              <div className="grid grid-cols-5 gap-1 text-center relative z-10">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950'
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] mt-2 font-medium leading-tight max-w-[65px] ${
                          isCurrent
                            ? 'text-brand-600 dark:text-brand-400 font-bold'
                            : isDone
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Connecting progress line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(Math.min(currentStepIdx, 4) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Stepper Timeline Logs */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
              Activity History
            </span>
            {order.timeline.map((event, i) => (
              <div key={i} className="flex items-start justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {event.label}
                  </span>
                  {event.note && (
                    <span className="text-slate-400 hidden sm:inline">— {event.note}</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Card with Image Preview and Zoom */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ordered Product
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadImage}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                <span>Download Image</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Thumbnail with zoom trigger */}
            <div
              onClick={() => setIsZoomingImage(!isZoomingImage)}
              className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer group shrink-0"
              title="Click to zoom image"
            >
              <img
                src={order.item.image}
                alt={order.item.productName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>

            {/* Product Meta */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono text-slate-400">{order.item.sku}</span>
              <h5 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                {order.item.productName}
              </h5>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  Dropship Price:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {formatCurrency(order.item.dropshipPrice)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Quantity:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {order.item.quantity}
                  </strong>
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto">
              <span className="text-[11px] font-medium text-slate-400 uppercase">
                Line Total
              </span>
              <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                {formatCurrency(order.item.total)}
              </p>
            </div>
          </div>

          {/* Expanded Image Zoom Modal / Box */}
          {isZoomingImage && (
            <div
              onClick={() => setIsZoomingImage(false)}
              className="mt-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden group cursor-zoom-out"
            >
              <img
                src={order.item.image}
                alt={order.item.productName}
                className="w-full h-64 object-contain rounded-lg"
              />
              <p className="text-center text-xs text-slate-400 mt-1">
                Click anywhere to close preview
              </p>
            </div>
          )}
        </div>

        {/* Customer & Shipping 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" />
              Customer Information
            </h4>
            <div className="space-y-1.5 text-xs">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {order.customer.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Email: {order.customer.email}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Phone: {order.customer.phone}
              </p>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              Shipping Destination
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {order.shippingAddress.line1}
              </p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p className="font-medium text-slate-500">
                {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking & Admin Notes */}
        {(order.adminNote || order.notes || order.trackingNumber) && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Logistics & Remarks
            </h4>

            {order.trackingNumber && (
              <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Tracking Code:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {order.trackingNumber} ({order.shippingCarrier || 'Ground'})
                </span>
              </div>
            )}

            {order.adminNote && (
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Admin Note:
                </span>{' '}
                <span className="text-slate-500 dark:text-slate-400">
                  {order.adminNote}
                </span>
              </div>
            )}

            {order.notes && (
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Seller Instructions:
                </span>{' '}
                <span className="text-slate-500 dark:text-slate-400">
                  {order.notes}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Download Actions */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold shadow-soft flex items-center justify-center gap-2 text-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Details</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold flex items-center justify-center gap-2 text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
};
