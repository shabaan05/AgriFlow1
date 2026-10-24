// ─── KPI Data ──────────────────────────────────────────────────────────────
export const farmerKPIs = [
  {
    id:    'crops',
    label: 'Total Crops',
    value: '12',
    unit:  '',
    icon:  'crops',
    trend: '+2 this month',
    color: 'green',
  },
  {
    id:    'bookings',
    label: 'Active Bookings',
    value: '5',
    unit:  '',
    icon:  'bookings',
    trend: '1 new today',
    color: 'blue',
  },
  {
    id:    'orders',
    label: 'Pending Orders',
    value: '2',
    unit:  '',
    icon:  'orders',
    trend: 'Awaiting dispatch',
    color: 'amber',
  },
  {
    id:    'earnings',
    label: 'Total Earnings',
    value: '₹42,500',
    unit:  '',
    icon:  'earnings',
    trend: '+₹3,200 this week',
    color: 'emerald',
  },
]

// ─── Crop Cards ────────────────────────────────────────────────────────────
export const farmerCrops = [
  {
    id:     'crop-001',
    name:   'Tomato',
    qty:    '800 kg',
    grade:  'Grade A',
    price:  '₹25/kg',
    status: 'Pre-Harvest',
    color:  'red',
  },
  {
    id:     'crop-002',
    name:   'Onion',
    qty:    '500 kg',
    grade:  'Grade A',
    price:  '₹22/kg',
    status: 'Harvest Ready',
    color:  'purple',
  },
  {
    id:     'crop-003',
    name:   'Wheat',
    qty:    '1200 kg',
    grade:  'Grade B',
    price:  '₹18/kg',
    status: 'Stored',
    color:  'yellow',
  },
]

// ─── Upcoming Activities ───────────────────────────────────────────────────
export const upcomingActivities = [
  { id: 'act-1', title: 'Tomato harvest',    date: '25 Oct', type: 'harvest' },
  { id: 'act-2', title: 'FreshMart pickup',  date: '26 Oct', type: 'pickup'  },
  { id: 'act-3', title: 'Onion booking',     date: '27 Oct', type: 'booking' },
]

// ─── Recent Orders ─────────────────────────────────────────────────────────
export const recentOrders = [
  {
    id:     'ORD-2401',
    buyer:  'FreshMart Pvt Ltd',
    crop:   'Tomato',
    amount: '₹12,000',
    status: 'Confirmed',
  },
  {
    id:     'ORD-2402',
    buyer:  'GreenBasket Co.',
    crop:   'Onion',
    amount: '₹8,500',
    status: 'In Transit',
  },
  {
    id:     'ORD-2403',
    buyer:  'NatureFresh Ltd',
    crop:   'Wheat',
    amount: '₹6,200',
    status: 'Pending',
  },
]

// ─── AI Agents ─────────────────────────────────────────────────────────────
export const aiAgents = [
  {
    id:          'buyer-match',
    name:        'Buyer Match Agent',
    description: 'Find and rank the most suitable buyers based on your crop type, quantity, grade, and location.',
    icon:        'match',
    status:      'coming-soon',
  },
  {
    id:          'harvest-booking',
    name:        'Harvest & Booking Agent',
    description: 'Assist farmers with demand-linked harvesting schedules and smart booking recommendations.',
    icon:        'harvest',
    status:      'coming-soon',
  },
  {
    id:          'shelf-life',
    name:        'Shelf-Life Agent',
    description: 'Monitor crop freshness, storage conditions, and spoilage risk in real time.',
    icon:        'shelf',
    status:      'coming-soon',
  },
  {
    id:          'wastage-prevention',
    name:        'Wastage Prevention Agent',
    description: 'Recommend actions to reduce crop wastage through predictive analytics and alerts.',
    icon:        'wastage',
    status:      'coming-soon',
  },
]
