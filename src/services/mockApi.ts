import type {
  User,
  Device,
  PickupRequest,
  SupplyChainEvent,
  ImpactMetrics,
  DashboardStats,
  ActivityItem,
  Notification,
  DealerJob,
  RecyclerBatch,
  ValuationResult,
} from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'demo@e-waste.com',
    name: 'Alex Chen',
    role: 'user',
    company: 'GreenTech Solutions',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'u2',
    email: 'dealer@scrap.com',
    name: 'Maria Rodriguez',
    role: 'dealer',
    company: 'Bay Area Collectors',
    location: 'Oakland, CA',
    phone: '+1 (555) 234-5678',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u3',
    email: 'recycler@green.com',
    name: 'James Park',
    role: 'recycler',
    company: 'EcoRecycle Inc.',
    location: 'San Jose, CA',
    phone: '+1 (555) 345-6789',
    createdAt: '2024-01-20T09:00:00Z',
  },
];

const MOCK_DEVICES: Device[] = [
  {
    id: 'd1',
    userId: 'u1',
    type: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    condition: 'good',
    ageYears: 1.5,
    estimatedValue: 420,
    status: 'valued',
    serialNumber: 'F17KL9X2MNOP',
    specifications: { storage: '256GB', color: 'Deep Purple', batteryHealth: '87%' },
    createdAt: '2024-03-10T14:00:00Z',
  },
  {
    id: 'd2',
    userId: 'u1',
    type: 'laptop',
    brand: 'Dell',
    model: 'XPS 15 9520',
    condition: 'fair',
    ageYears: 2.5,
    estimatedValue: 380,
    status: 'pickup_scheduled',
    serialNumber: 'DELLXPS9520ABC',
    specifications: { ram: '16GB', storage: '512GB SSD', processor: 'i7-12700H' },
    createdAt: '2024-03-12T10:30:00Z',
  },
  {
    id: 'd3',
    userId: 'u1',
    type: 'tablet',
    brand: 'Samsung',
    model: 'Galaxy Tab S8',
    condition: 'excellent',
    ageYears: 0.8,
    estimatedValue: 290,
    status: 'pending',
    serialNumber: 'SMTABS8XYZ123',
    specifications: { storage: '128GB', color: 'Graphite', screenSize: '11"' },
    createdAt: '2024-03-15T16:45:00Z',
  },
  {
    id: 'd4',
    userId: 'u1',
    type: 'desktop',
    brand: 'HP',
    model: 'EliteDesk 800 G9',
    condition: 'good',
    ageYears: 1.2,
    estimatedValue: 550,
    status: 'collected',
    serialNumber: 'HPELITE800G9',
    specifications: { ram: '32GB', storage: '1TB NVMe', processor: 'i9-12900' },
    createdAt: '2024-03-08T09:00:00Z',
  },
  {
    id: 'd5',
    userId: 'u1',
    type: 'smartphone',
    brand: 'Google',
    model: 'Pixel 7 Pro',
    condition: 'poor',
    ageYears: 2.1,
    estimatedValue: 95,
    status: 'recycled',
    serialNumber: 'PIX7PRO456DEF',
    specifications: { storage: '128GB', color: 'Obsidian', batteryHealth: '62%' },
    createdAt: '2024-02-20T11:00:00Z',
  },
];

const MOCK_PICKUPS: PickupRequest[] = [
  {
    id: 'p1',
    deviceId: 'd2',
    userId: 'u1',
    status: 'confirmed',
    pickupDate: '2024-03-20T10:00:00Z',
    pickupAddress: '123 Market St, San Francisco, CA 94105',
    contactPhone: '+1 (555) 123-4567',
    notes: 'Please ring the buzzer for Suite 400',
    assignedDealerId: 'u2',
    createdAt: '2024-03-12T10:35:00Z',
  },
  {
    id: 'p2',
    deviceId: 'd4',
    userId: 'u1',
    status: 'completed',
    pickupDate: '2024-03-10T14:00:00Z',
    pickupAddress: '123 Market St, San Francisco, CA 94105',
    contactPhone: '+1 (555) 123-4567',
    assignedDealerId: 'u2',
    createdAt: '2024-03-08T09:05:00Z',
    completedAt: '2024-03-10T15:30:00Z',
  },
];

const MOCK_SUPPLY_CHAIN: SupplyChainEvent[] = [
  {
    id: 'sc1',
    deviceId: 'd4',
    eventType: 'registered',
    actor: 'Alex Chen',
    actorRole: 'User',
    location: 'San Francisco, CA',
    timestamp: '2024-03-08T09:00:00Z',
    verified: true,
  },
  {
    id: 'sc2',
    deviceId: 'd4',
    eventType: 'valued',
    actor: 'E-Waste Engine',
    actorRole: 'System',
    location: 'San Francisco, CA',
    timestamp: '2024-03-08T09:02:00Z',
    metadata: { estimatedValue: 550 },
    verified: true,
  },
  {
    id: 'sc3',
    deviceId: 'd4',
    eventType: 'pickup_scheduled',
    actor: 'Alex Chen',
    actorRole: 'User',
    location: 'San Francisco, CA',
    timestamp: '2024-03-08T09:05:00Z',
    metadata: { pickupDate: '2024-03-10T14:00:00Z' },
    verified: true,
  },
  {
    id: 'sc4',
    deviceId: 'd4',
    eventType: 'collected',
    actor: 'Maria Rodriguez',
    actorRole: 'Scrap Dealer',
    location: 'San Francisco, CA',
    timestamp: '2024-03-10T15:30:00Z',
    verified: true,
  },
  {
    id: 'sc5',
    deviceId: 'd4',
    eventType: 'transport',
    actor: 'EcoRecycle Logistics',
    actorRole: 'Logistics',
    location: 'I-880 South, CA',
    timestamp: '2024-03-10T16:00:00Z',
    metadata: { destination: 'San Jose Recycling Facility' },
    verified: true,
  },
  {
    id: 'sc6',
    deviceId: 'd4',
    eventType: 'received',
    actor: 'James Park',
    actorRole: 'Recycler',
    location: 'San Jose, CA',
    timestamp: '2024-03-11T09:00:00Z',
    verified: true,
  },
];

const MOCK_IMPACT: ImpactMetrics = {
  co2SavedKg: 2847,
  rawMaterialsRecoveredKg: 1563,
  waterSavedLiters: 45200,
  energySavedKwh: 8930,
  devicesRecycled: 42,
  devicesRefurbished: 18,
  landfillDivertedKg: 2100,
  period: '2024-Q1',
};

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    type: 'device_added',
    title: 'Device Valued',
    description: 'Samsung Galaxy Tab S8 valued at $290',
    timestamp: '2024-03-15T16:45:00Z',
  },
  {
    id: 'a2',
    type: 'pickup_scheduled',
    title: 'Pickup Scheduled',
    description: 'Dell XPS 15 pickup scheduled for Mar 20',
    timestamp: '2024-03-12T10:35:00Z',
  },
  {
    id: 'a3',
    type: 'pickup_completed',
    title: 'Pickup Completed',
    description: 'HP EliteDesk 800 collected by Maria Rodriguez',
    timestamp: '2024-03-10T15:30:00Z',
    amount: 550,
  },
  {
    id: 'a4',
    type: 'device_recycled',
    title: 'Device Recycled',
    description: 'Google Pixel 7 Pro processed at EcoRecycle',
    timestamp: '2024-03-05T11:00:00Z',
  },
  {
    id: 'a5',
    type: 'payment_received',
    title: 'Payment Received',
    description: 'Credit for HP EliteDesk 800 processed',
    timestamp: '2024-03-10T16:00:00Z',
    amount: 550,
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Pickup Confirmed',
    message: 'Your Dell XPS 15 pickup has been confirmed for March 20 at 10:00 AM.',
    type: 'success',
    read: false,
    createdAt: '2024-03-12T10:40:00Z',
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Value Update',
    message: 'Market adjustment: Your iPhone 14 Pro value increased by $25.',
    type: 'info',
    read: false,
    createdAt: '2024-03-14T09:00:00Z',
  },
  {
    id: 'n3',
    userId: 'u1',
    title: 'New Feature',
    message: 'Supply chain tracking is now available for all your devices.',
    type: 'info',
    read: true,
    createdAt: '2024-03-01T08:00:00Z',
  },
];

const MOCK_DEALER_JOBS: DealerJob[] = [
  {
    id: 'j1',
    pickupRequestId: 'p1',
    deviceId: 'd2',
    customerName: 'Alex Chen',
    pickupAddress: '123 Market St, San Francisco, CA 94105',
    pickupDate: '2024-03-20T10:00:00Z',
    status: 'assigned',
    estimatedEarnings: 45,
    deviceType: 'laptop',
    deviceCondition: 'fair',
  },
  {
    id: 'j2',
    pickupRequestId: 'p2',
    deviceId: 'd4',
    customerName: 'Alex Chen',
    pickupAddress: '123 Market St, San Francisco, CA 94105',
    pickupDate: '2024-03-10T14:00:00Z',
    status: 'completed',
    estimatedEarnings: 55,
    deviceType: 'desktop',
    deviceCondition: 'good',
  },
];

const MOCK_RECYCLER_BATCHES: RecyclerBatch[] = [
  {
    id: 'b1',
    recyclerId: 'u3',
    deviceIds: ['d4', 'd5'],
    status: 'processing',
    receivedDate: '2024-03-11T09:00:00Z',
    totalWeightKg: 8.4,
    materialsRecovered: { aluminum: 1.2, copper: 0.8, plastic: 2.1, glass: 1.5, rareEarth: 0.3 },
    processingLocation: 'San Jose Facility A',
  },
  {
    id: 'b2',
    recyclerId: 'u3',
    deviceIds: ['d1'],
    status: 'completed',
    receivedDate: '2024-02-15T10:00:00Z',
    completedDate: '2024-02-18T14:00:00Z',
    totalWeightKg: 0.2,
    materialsRecovered: { aluminum: 0.05, copper: 0.03, plastic: 0.08, glass: 0.02, rareEarth: 0.01 },
    processingLocation: 'San Jose Facility A',
  },
];

const deviceValueMap: Record<string, number> = {
  'Apple-iPhone 14 Pro': 600,
  'Apple-iPhone 13': 380,
  'Samsung-Galaxy S23': 450,
  'Samsung-Galaxy Tab S8': 350,
  'Dell-XPS 15 9520': 520,
  'Dell-Latitude 7430': 340,
  'HP-EliteDesk 800 G9': 680,
  'HP-EliteBook 840': 290,
  'Google-Pixel 7 Pro': 180,
  'Google-Pixel 6a': 95,
  'Lenovo-ThinkPad X1': 410,
  'Microsoft-Surface Pro 9': 380,
};

const conditionMultipliers: Record<string, number> = {
  excellent: 1.0,
  good: 0.85,
  fair: 0.65,
  poor: 0.35,
  broken: 0.1,
};

function calculateValuation(device: Partial<Device>): ValuationResult {
  const key = `${device.brand}-${device.model}`;
  const baseValue = deviceValueMap[key] || 250;
  const conditionMult = conditionMultipliers[device.condition || 'fair'] || 0.5;
  const ageDepreciation = Math.min((device.ageYears || 1) * 0.08, 0.6);
  const marketDemand = (Math.random() - 0.5) * 0.1;

  const conditionAdjustment = baseValue * conditionMult;
  const ageAdjustment = -(baseValue * ageDepreciation);
  const marketAdjustment = baseValue * marketDemand;
  const estimatedValue = Math.round(Math.max(10, conditionAdjustment + ageAdjustment + marketAdjustment));

  return {
    deviceId: device.id || 'new',
    estimatedValue,
    confidence: 0.85 + Math.random() * 0.12,
    breakdown: {
      baseValue,
      conditionMultiplier: conditionMult,
      ageDepreciation: ageDepreciation,
      marketDemandAdjustment: marketDemand,
    },
    comparableSales: [
      { model: `${device.brand} ${device.model} (Good)`, price: Math.round(baseValue * 0.85), date: '2024-03-01' },
      { model: `${device.brand} ${device.model} (Fair)`, price: Math.round(baseValue * 0.65), date: '2024-02-15' },
      { model: `${device.brand} ${device.model} (Excellent)`, price: Math.round(baseValue * 1.0), date: '2024-03-10' },
    ],
  };
}

class MockApiService {
  private currentUser: User | null = null;

  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay(800);
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    this.currentUser = user;
    return { user, token: `mock_token_${user.id}` };
  }

  async register(email: string, name: string, _password: string, role: User['role']): Promise<{ user: User; token: string }> {
    await delay(1000);
    const newUser: User = {
      id: `u${Date.now()}`,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    this.currentUser = newUser;
    return { user: newUser, token: `mock_token_${newUser.id}` };
  }

  async getCurrentUser(): Promise<User | null> {
    await delay(300);
    return this.currentUser;
  }

  async logout(): Promise<void> {
    await delay(200);
    this.currentUser = null;
  }

  async getDevices(userId?: string): Promise<Device[]> {
    await delay(400);
    if (userId) return MOCK_DEVICES.filter((d) => d.userId === userId);
    return MOCK_DEVICES;
  }

  async getDevice(id: string): Promise<Device | null> {
    await delay(300);
    return MOCK_DEVICES.find((d) => d.id === id) || null;
  }

  async createDevice(device: Omit<Device, 'id' | 'createdAt' | 'estimatedValue' | 'status'>): Promise<Device> {
    await delay(600);
    const valuation = calculateValuation(device);
    const newDevice: Device = {
      ...device,
      id: `d${Date.now()}`,
      estimatedValue: valuation.estimatedValue,
      status: 'valued',
      createdAt: new Date().toISOString(),
    };
    MOCK_DEVICES.push(newDevice);
    return newDevice;
  }

  async valueDevice(device: Partial<Device>): Promise<ValuationResult> {
    await delay(700);
    return calculateValuation(device);
  }

  async getPickupRequests(userId?: string): Promise<PickupRequest[]> {
    await delay(400);
    if (userId) return MOCK_PICKUPS.filter((p) => p.userId === userId);
    return MOCK_PICKUPS;
  }

  async createPickupRequest(pickup: Omit<PickupRequest, 'id' | 'createdAt' | 'status'>): Promise<PickupRequest> {
    await delay(600);
    const newPickup: PickupRequest = {
      ...pickup,
      id: `p${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    MOCK_PICKUPS.push(newPickup);
    return newPickup;
  }

  async updatePickupStatus(id: string, status: PickupRequest['status']): Promise<PickupRequest> {
    await delay(400);
    const pickup = MOCK_PICKUPS.find((p) => p.id === id);
    if (!pickup) throw new Error('Pickup not found');
    pickup.status = status;
    if (status === 'completed') pickup.completedAt = new Date().toISOString();
    return pickup;
  }

  async getSupplyChain(deviceId: string): Promise<SupplyChainEvent[]> {
    await delay(500);
    return MOCK_SUPPLY_CHAIN.filter((sc) => sc.deviceId === deviceId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async getImpactMetrics(userId?: string): Promise<ImpactMetrics> {
    await delay(400);
    if (userId) {
      const userDevices = MOCK_DEVICES.filter((d) => d.userId === userId);
      const factor = userDevices.length / MOCK_DEVICES.length;
      return {
        co2SavedKg: Math.round(MOCK_IMPACT.co2SavedKg * factor),
        rawMaterialsRecoveredKg: Math.round(MOCK_IMPACT.rawMaterialsRecoveredKg * factor),
        waterSavedLiters: Math.round(MOCK_IMPACT.waterSavedLiters * factor),
        energySavedKwh: Math.round(MOCK_IMPACT.energySavedKwh * factor),
        devicesRecycled: userDevices.filter((d) => d.status === 'recycled').length,
        devicesRefurbished: Math.round(MOCK_IMPACT.devicesRefurbished * factor),
        landfillDivertedKg: Math.round(MOCK_IMPACT.landfillDivertedKg * factor),
        period: MOCK_IMPACT.period,
      };
    }
    return MOCK_IMPACT;
  }

  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    await delay(500);
    const devices = userId ? MOCK_DEVICES.filter((d) => d.userId === userId) : MOCK_DEVICES;
    const pickups = userId ? MOCK_PICKUPS.filter((p) => p.userId === userId) : MOCK_PICKUPS;
    const impact = await this.getImpactMetrics(userId);
    return {
      totalDevices: devices.length,
      totalValue: devices.reduce((sum, d) => sum + d.estimatedValue, 0),
      pendingPickups: pickups.filter((p) => p.status === 'pending' || p.status === 'confirmed').length,
      completedPickups: pickups.filter((p) => p.status === 'completed').length,
      impactMetrics: impact,
      recentActivity: MOCK_ACTIVITIES.slice(0, 5),
    };
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(300);
    return MOCK_NOTIFICATIONS.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markNotificationRead(id: string): Promise<void> {
    await delay(200);
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  async getDealerJobs(dealerId: string): Promise<DealerJob[]> {
    await delay(400);
    return MOCK_DEALER_JOBS.filter((j) => {
      const pickup = MOCK_PICKUPS.find((p) => p.id === j.pickupRequestId);
      return pickup?.assignedDealerId === dealerId;
    });
  }

  async getRecyclerBatches(recyclerId: string): Promise<RecyclerBatch[]> {
    await delay(400);
    return MOCK_RECYCLER_BATCHES.filter((b) => b.recyclerId === recyclerId);
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(500);
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    if (this.currentUser?.id === userId) this.currentUser = { ...this.currentUser, ...updates };
    return user;
  }
}

export const mockApi = new MockApiService();
