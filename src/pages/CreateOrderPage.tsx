import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateOrderForm } from '../components/orders/CreateOrderForm';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Top Header with Breadcrumb and Back Button */}
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
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Create New Order
            </h2>
            <Badge variant="secondary" className="font-semibold text-brand-700 bg-brand-50 border-brand-200">
              Direct Fulfillment
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch supplier verified inventory directly to your end customer with real-time margin tracking.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          className="self-start sm:self-auto gap-2 rounded-xl text-xs font-semibold shadow-xs"
        >
          <ShoppingBag className="w-4 h-4 text-slate-400" />
          <span>View All Orders</span>
        </Button>
      </div>

      {/* Main Order Form */}
      <CreateOrderForm />
    </div>
  );
};

export default CreateOrderPage;
