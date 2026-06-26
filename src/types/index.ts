export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'dealer' | 'recycler' | 'admin';
  avatar?: string;
  company?: string;
  location?: string;
  phone?: string;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  type: 'smartphone' | 'laptop' | 'tablet' | 'desktop' | 'server' | 'other';
  brand: string;
  model: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  ageYears: number;
  estimatedValue: number;
  status: 'pending' | 'valued' | 'pickup_scheduled' | 'collected' | 'recycled';
  serialNumber?: string;
  specifications?: Record<string, string>;
  images?: string[];
  createdAt: string;
}

export interface PickupRequest {
  id: string;
  deviceId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'in_transit' | 'completed' | 'cancelled';
  pickupDate: string;
  pickupAddress: string;
  contactPhone: string;
  notes?: string;
  assignedDealerId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SupplyChainEvent {
  id: string;
  deviceId: string;
  eventType: 'registered' | 'valued' | 'pickup_scheduled' | 'collected' | 'transport' | 'received' | 'processed' | 'recycled' | 'resold';
  actor: string;
  actorRole: string;
  location: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  verified: boolean;
}

export interface ImpactMetrics {
  co2SavedKg: number;
  rawMaterialsRecoveredKg: number;
  waterSavedLiters: number;
  energySavedKwh: number;
  devicesRecycled: number;
  devicesRefurbished: number;
  landfillDivertedKg: number;
  period: string;
}

export interface DashboardStats {
  totalDevices: number;
  totalValue: number;
  pendingPickups: number;
  completedPickups: number;
  impactMetrics: ImpactMetrics;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'device_added' | 'pickup_scheduled' | 'pickup_completed' | 'device_recycled' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface DealerJob {
  id: string;
  pickupRequestId: string;
  deviceId: string;
  customerName: string;
  pickupAddress: string;
  pickupDate: string;
  status: 'assigned' | 'in_progress' | 'completed';
  estimatedEarnings: number;
  deviceType: string;
  deviceCondition: string;
}

export interface RecyclerBatch {
  id: string;
  recyclerId: string;
  deviceIds: string[];
  status: 'received' | 'processing' | 'completed';
  receivedDate: string;
  completedDate?: string;
  totalWeightKg: number;
  materialsRecovered: Record<string, number>;
  processingLocation: string;
}

export interface ValuationResult {
  deviceId: string;
  estimatedValue: number;
  confidence: number;
  breakdown: {
    baseValue: number;
    conditionMultiplier: number;
    ageDepreciation: number;
    marketDemandAdjustment: number;
  };
  comparableSales: {
    model: string;
    price: number;
    date: string;
  }[];
}
