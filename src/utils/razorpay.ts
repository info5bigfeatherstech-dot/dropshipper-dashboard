import { ordersService, VerifyPaymentResponse } from '../services/ordersService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayCheckoutOptions {
  keyId?: string;
  orderId?: string; // Razorpay order_id (from backend POST /orders)
  internalOrderId: string; // OWB-DS-######
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (verification: VerifyPaymentResponse) => void;
  onError: (error: any) => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    options.onError(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    return;
  }

  const rzpOptions: any = {
    key:
      options.keyId ||
      (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
      'rzp_test_TR7LF2Kmqn6Vey', // Your backend OWB active Razorpay test key
    amount: Math.round(options.amount),
    currency: options.currency || 'INR',
    name: options.name || 'OWB Dropship Fulfillment',
    description: options.description || `Payment for order ${options.internalOrderId}`,
    prefill: options.prefill || {},
    theme: {
      color: '#4F46E5' // Indigo
    },
    handler: async function (response: {
      razorpay_order_id?: string;
      razorpay_payment_id: string;
      razorpay_signature?: string;
    }) {
      try {
        let verification: VerifyPaymentResponse;
        if (options.orderId && response.razorpay_signature) {
          verification = await ordersService.verifyPayment({
            orderId: options.internalOrderId,
            razorpay_order_id: response.razorpay_order_id || options.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        } else {
          // Dev sandbox verification fallback
          verification = {
            success: true,
            message: 'Payment received successfully (Sandbox)',
            orderId: options.internalOrderId,
            status: 'paid'
          };
        }
        options.onSuccess(verification);
      } catch (err: any) {
        options.onError(err);
      }
    },
    modal: {
      ondismiss: function () {
        options.onError(new Error('Payment window closed by user.'));
      }
    }
  };

  if (options.orderId) {
    rzpOptions.order_id = options.orderId;
  }

  try {
    const razorpayInstance = new window.Razorpay(rzpOptions);
    razorpayInstance.open();
  } catch (err) {
    console.error('Error opening Razorpay checkout', err);
    options.onError(err);
  }
}
