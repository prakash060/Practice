/**
 * Curated pool used ONLY by routes/adminSeed.js (POST /agents).
 * Isolated so the demo-agent feature can be removed without touching
 * production onboarding code.
 */

const DEMO_AGENT_PASSCODE = '1234';

const AGENT_POOL = [
  {
    name: 'Arjun Mehta',
    phone: '9876501001',
    email: 'arjun.mehta.demo@example.com',
    vehicleType: 'Bike',
    vehicleNumber: 'KA01AB1234',
    licenseNumber: 'DL0420190001',
    address: '12 MG Road, Koramangala, Bengaluru 560034',
    notes: 'Demo rider — fast inner-city deliveries.',
  },
  {
    name: 'Priya Sharma',
    phone: '9876501002',
    email: 'priya.sharma.demo@example.com',
    vehicleType: 'Scooter',
    vehicleNumber: 'MH12CD5678',
    licenseNumber: 'MH0920180042',
    address: '45 Linking Road, Bandra West, Mumbai 400050',
    notes: 'Demo rider — evening shift specialist.',
  },
  {
    name: 'Rahul Verma',
    phone: '9876501003',
    email: 'rahul.verma.demo@example.com',
    vehicleType: 'Bike',
    vehicleNumber: 'DL01EF9012',
    licenseNumber: 'DL1120170088',
    address: '88 Connaught Place, New Delhi 110001',
    notes: 'Demo rider — covers central Delhi zones.',
  },
  {
    name: 'Sneha Reddy',
    phone: '9876501004',
    email: 'sneha.reddy.demo@example.com',
    vehicleType: 'Scooter',
    vehicleNumber: 'TS09GH3456',
    licenseNumber: 'TS0820200015',
    address: '22 Jubilee Hills Road, Hyderabad 500033',
    notes: 'Demo rider — reliable lunch-hour runs.',
  },
  {
    name: 'Vikram Singh',
    phone: '9876501005',
    email: 'vikram.singh.demo@example.com',
    vehicleType: 'Bike',
    vehicleNumber: 'RJ14IJ7890',
    licenseNumber: 'RJ0520190033',
    address: '7 MI Road, C Scheme, Jaipur 302001',
    notes: 'Demo rider — long-distance suburban routes.',
  },
  {
    name: 'Ananya Iyer',
    phone: '9876501006',
    email: 'ananya.iyer.demo@example.com',
    vehicleType: 'Bicycle',
    vehicleNumber: 'TN07KL2468',
    licenseNumber: '',
    address: '19 Besant Nagar Beach Road, Chennai 600090',
    notes: 'Demo rider — eco-friendly short deliveries.',
  },
  {
    name: 'Karan Patel',
    phone: '9876501007',
    email: 'karan.patel.demo@example.com',
    vehicleType: 'Bike',
    vehicleNumber: 'GJ01MN1357',
    licenseNumber: 'GJ0320180077',
    address: '3 CG Road, Navrangpura, Ahmedabad 380009',
    notes: 'Demo rider — weekend peak coverage.',
  },
  {
    name: 'Meera Nair',
    phone: '9876501008',
    email: 'meera.nair.demo@example.com',
    vehicleType: 'Scooter',
    vehicleNumber: 'KL07OP8024',
    licenseNumber: 'KL0620190021',
    address: '56 Marine Drive, Ernakulam, Kochi 682031',
    notes: 'Demo rider — coastal area specialist.',
  },
  {
    name: 'Imran Khan',
    phone: '9876501009',
    email: 'imran.khan.demo@example.com',
    vehicleType: 'Car',
    vehicleNumber: 'WB06QR4680',
    licenseNumber: 'WB1420170066',
    address: '31 Park Street, Kolkata 700016',
    notes: 'Demo rider — bulk / catering orders.',
  },
  {
    name: 'Divya Joshi',
    phone: '9876501010',
    email: 'divya.joshi.demo@example.com',
    vehicleType: 'Bike',
    vehicleNumber: 'MP09ST5791',
    licenseNumber: 'MP0820200044',
    address: '14 TT Nagar, Bhopal 462003',
    notes: 'Demo rider — new joiner onboarding sample.',
  },
];

module.exports = { AGENT_POOL, DEMO_AGENT_PASSCODE, NUM_AGENTS_TO_SEED: 5 };
