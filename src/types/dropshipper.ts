export interface ServiceabilityPackage {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ServiceabilityQuote {
  isDeliverable: boolean;
  deliveryCharges: number;
  freightInr: number;
  codFeeInr: number;
  estimatedDays: string;
  courierName?: string;
  courierCompanyId?: string;
  codAvailable?: boolean;
  message?: string;
  code?: string | null;
  mock?: boolean;
  shippingProvider?: string;
}

export interface ServiceabilityCheckQuotes {
  prepaid?: ServiceabilityQuote;
  cod?: ServiceabilityQuote;
}

export interface ServiceabilityCheckRequest {
  customerPincode: string;
  warehousePincode: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  paymentMode?: 'prepaid' | 'cod' | 'both';
  orderAmount?: number;
  storefront?: 'ecomm' | 'wholesale';
}

export interface ServiceabilityCheckResponse {
  success: boolean;
  message: string;
  customerPincode: string;
  warehousePincode: string;
  package: ServiceabilityPackage;
  paymentMode: 'prepaid' | 'cod' | 'both';
  orderAmount?: number;
  storefront?: 'ecomm' | 'wholesale';
  isDeliverable: boolean;
  estimatedDays: string;
  deliveryCharges: number;
  shippingProvider: string;
  quotes: ServiceabilityCheckQuotes;
}

export type SelectedShippingPaymentMode = 'prepaid' | 'cod';
