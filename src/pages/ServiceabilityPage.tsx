import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressServiceabilityChecker } from '../components/shipping/AddressServiceabilityChecker';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ShoppingBag, PlusCircle, Truck } from 'lucide-react';

export const ServiceabilityPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Top Header with Breadcrumb and Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Serviceability & Rates
            </h2>
            <Badge variant="secondary" className="font-semibold text-indigo-700 bg-indigo-50 border-indigo-200">
              Live Carrier Network
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Check real-time pincode courier coverage, transit TAT, and compare Prepaid vs COD freight charges before placing orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            className="gap-2 rounded-xl text-xs font-semibold shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-slate-400" />
            <span>All Orders</span>
          </Button>

          <Button
            onClick={() => navigate('/orders/create')}
            className="gap-1.5 rounded-xl text-xs font-semibold shadow-soft"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Order</span>
          </Button>
        </div>
      </div>

      {/* Main Serviceability Checker Component */}
      <AddressServiceabilityChecker />
    </div>
  );
};

export default ServiceabilityPage;
