export type PaintBrand = 'Asian Paints' | 'Berger Paints' | 'Birla Opus' | 'Nerolac' | 'Dulux' | 'Hardware & Tools' | 'Dr. Fixit' | 'Nikhil Pro Hardware';

export type BrandType = PaintBrand | 'all' | 'All';

export type PaintCategory = 
  | 'Interior Emulsion'
  | 'Exterior Emulsion'
  | 'Waterproofing'
  | 'Primers & Putty'
  | 'Wood & Metal Enamel'
  | 'Brushes & Tools';

export type CategoryType = PaintCategory | 'all' | 'All';

export type FinishType = 'Matt' | 'Sheen' | 'High Gloss' | 'Soft Sheen' | 'Eggshell' | 'Rough Texture';

export interface ShadeItem {
  code: string;
  name: string;
  brand: 'Asian Paints' | 'Berger Paints' | 'Birla Opus' | 'RAL' | 'Universal';
  hex: string;
  rgb: [number, number, number];
  family: 'Whites & Off-Whites' | 'Warm Creams & Beiges' | 'Yellows & Golds' | 'Reds & Terracotta' | 'Blues & Teals' | 'Greens & Olives' | 'Purples & Violets' | 'Greys & Charcoals';
  fandeck?: string;
  popularity?: number; // 1-100
  recommendedPairs?: string[]; // shade codes
  description?: string;
}

export interface PackOption {
  size: string; // e.g. '1 Litre', '4 Litres', '10 Litres', '20 Litres', '500 ml'
  volumeLiters: number;
  price: number;
  originalPrice: number;
  inStock: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: PaintBrand;
  category: PaintCategory;
  tagline: string;
  rating: number;
  reviewsCount: number;
  deliveryMinutes: number; // e.g., 35 mins in Jamshedpur
  features: string[];
  coveragePerLiter: string; // e.g., "120 - 140 sq.ft / 2 coats"
  warrantyYears?: number;
  finish: FinishType;
  washability: 'Low' | 'Medium' | 'High' | 'Best-in-Class (10,000+ scrubs)';
  image: string;
  packs: PackOption[];
  requiresShade: boolean;
  defaultShadeCode?: string;
  badge?: string; // e.g. "Bestseller", "New Launch", "Monsoon Pick"
}

export interface CartItem {
  id: string; // unique cart item id (product + pack + shade)
  productId: string;
  productName: string;
  brand: PaintBrand;
  category: PaintCategory;
  image: string;
  pack: PackOption;
  quantity: number;
  selectedShade?: ShadeItem;
  tintingCharge: number;
}

export type OrderStatus = 
  | 'Order Placed'
  | 'Machine Tinting & Mixing'
  | 'Quality Checked & Packed'
  | 'Rider Out for Delivery'
  | 'Delivered';

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  area: string; // Bistupur, Sakchi, Kadma, Sonari, Telco, Mango, Golmuri, Jugsalai, Adityapur, etc.
  streetAddress: string;
  landmark?: string;
  pincode: string;
  city: string; // Jamshedpur
}

export interface OrderRecord {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tintingCharges: number;
  deliveryFee: number;
  loyaltyDiscount: number;
  tax: number;
  total: number;
  deliverySlot: string;
  address: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Cash On Delivery';
  status: OrderStatus;
  estimatedDeliveryTime: string;
  trackingStepIndex: number; // 0 to 4
  riderInfo?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    rating: number;
    currentLatOffset: number;
    currentLngOffset: number;
  };
  batchFormulaId?: string;
}

export interface PaintingProject {
  id: string;
  name: string; // e.g., "Sakchi 3BHK Living Room & Balcony"
  status: 'Planning' | 'In Progress' | 'Completed';
  location: string;
  startDate: string;
  targetCompletionDate: string;
  budget: number;
  spent: number;
  rooms: {
    roomName: string;
    wallAreaSqFt: number;
    selectedShade?: ShadeItem;
    paintProduct?: string;
    litersRequired: number;
    litersOrdered: number;
    coatsDone: number;
    coatsTarget: number;
  }[];
  contractorName?: string;
  contractorPhone?: string;
  notes: string;
}

export interface LoyaltyProfile {
  tier: 'Silver Painter' | 'Gold Pro' | 'Platinum Master';
  rangCoins: number; // 1 Coin = ₹0.50 discount
  lifetimeCoinsEarned: number;
  totalOrdersCount: number;
  totalLitresPurchased: number;
  nextTierProgress: number; // 0 to 100%
  unlockedPerks: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'offer' | 'order' | 'loyalty' | 'monsoon' | 'tip' | 'flash_deal' | 'monsoon_offer' | 'shade_launch';
  read: boolean;
  actionUrl?: string;
  discountCode?: string;
}

export type PushAlert = AppNotification;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'consultant' | 'system';
  text: string;
  timestamp: string;
  suggestedShades?: ShadeItem[];
  suggestedProducts?: string[];
  calculationResult?: {
    totalSqFt: number;
    primerLiters: number;
    puttyKg: number;
    paintLiters: number;
    estimatedCost: number;
  };
}
