export const business = {
  name: 'DA SPORTZ',
  tagline: '100% Genuine Sports Equipment & Official Gear',
  description:
    'Premium sports equipment and expert services — everything you need to train, compete, and win.',
  about:
    'At DA SPORTZ, we are passionate about sports and dedicated to providing the best equipment and services to our community. Whether you are a professional athlete or just starting your journey, we have exactly what you need to succeed.',
  poweredBy: 'Playnex',
  legalEntity: 'DA SPORTZ',
  website: 'https://dasportz.com',
};

export const contact = {
  address: 'Gaur City Sports Complex, Gaur City 1, Greater Noida West',
  phone: '+918800505769',
  phoneDisplay: '+91 88005 05769',
  email: 'contact@dasportz.com',
  hours: 'Mon–Sun, 9am – 9pm',
  emailReply: 'We reply within 24 hours',
  mapsQuery: 'Gaur City Sports Complex, Gaur City 1, Greater Noida West',
};

export const highlights = [
  { icon: 'flash' as const, title: 'Express 25-Min Stringing', subtitle: 'Quick turnaround' },
  { icon: 'car' as const, title: 'Free 2km Pickup', subtitle: 'Doorstep service' },
  { icon: 'people' as const, title: '10,000+ Serviced', subtitle: 'Trusted locally' },
  { icon: 'shield-checkmark' as const, title: '100% Quality Checked', subtitle: 'Every job verified' },
];

export type ProductCategory = {
  id: string;
  title: string;
  description: string;
  icon: 'baseball' | 'trophy' | 'speedometer';
  gradient: [string, string];
  image: number;
  items: ProductItem[];
};

export type ProductItem = {
  id: string;
  name: string;
  brand?: string;
  description: string;
  priceNote: string;
};

export const productCategories: ProductCategory[] = [
  {
    id: 'cricket-bats-gear',
    title: 'Cricket Bats & Gear',
    description:
      'Official SG, SS & DSC English Willow bats, match balls, and protective equipment.',
    icon: 'baseball',
    gradient: ['#14532D', '#22C55E'],
    image: require('../../assets/quick-access/shop.jpg'),
    items: [
      {
        id: 'sg-bat',
        name: 'SG English Willow Cricket Bat',
        brand: 'SG',
        description: 'Premium English willow bat for match play with balanced pick-up.',
        priceNote: 'Contact for pricing',
      },
      {
        id: 'dsc-thumpa-bat',
        name: 'DSC Thumpa English Willow Bat',
        brand: 'DSC',
        description: 'Professional-grade English willow with excellent balance and power.',
        priceNote: 'Contact for pricing',
      },
      {
        id: 'ss-bat',
        name: 'SS English Willow Bat',
        brand: 'SS',
        description: 'Professional-grade bat trusted by club and tournament players.',
        priceNote: 'Contact for pricing',
      },
      {
        id: 'dsc-bat',
        name: 'DSC English Willow Bat',
        brand: 'DSC',
        description: 'Robust construction with sweet spot optimized for power hitting.',
        priceNote: 'Contact for pricing',
      },
      {
        id: 'match-balls',
        name: 'Match Cricket Balls',
        description: 'Official match balls for practice sessions and tournaments.',
        priceNote: 'Contact for pricing',
      },
      {
        id: 'protective-gear',
        name: 'Protective Equipment',
        description: 'Helmets, pads, gloves, and guards from leading cricket brands.',
        priceNote: 'Contact for pricing',
      },
    ],
  },
  {
    id: 'trophies-awards',
    title: 'Trophies & Awards',
    description: 'Premium trophies for tournaments and events.',
    icon: 'trophy',
    gradient: ['#78350F', '#F59E0B'],
    image: require('../../assets/quick-access/store.jpg'),
    items: [
      {
        id: 'tournament-trophy',
        name: 'Tournament Trophy',
        description: 'Elegant trophies for cricket leagues, school events, and corporate matches.',
        priceNote: 'Custom quotes available',
      },
      {
        id: 'medals',
        name: 'Medals & Awards',
        description: 'Gold, silver, and bronze medals with customizable engraving.',
        priceNote: 'Bulk orders welcome',
      },
      {
        id: 'corporate-awards',
        name: 'Corporate Awards',
        description: 'Premium awards for sports day events and annual ceremonies.',
        priceNote: 'Contact for pricing',
      },
    ],
  },
  {
    id: 'freebowler',
    title: 'Freebowler Bowling Machine',
    description:
      'Professional cricket bowling machines for training and practice. All three variants available.',
    icon: 'speedometer',
    gradient: ['#1E3A8A', '#3B82F6'],
    image: require('../../assets/quick-access/bowling-machine.jpg'),
    items: [
      {
        id: 'freebowler-standard',
        name: 'Freebowler Standard',
        description: 'Reliable bowling machine for consistent pace and line practice.',
        priceNote: 'Contact for pricing',
      },
      {
        id: 'freebowler-pro',
        name: 'Freebowler Pro',
        description: 'Advanced variant with enhanced speed control and swing simulation.',
        priceNote: 'Contact for pricing',
      },
      {
        id: 'freebowler-elite',
        name: 'Freebowler Elite',
        description: 'Top-tier machine for academies and professional training setups.',
        priceNote: 'Contact for pricing',
      },
    ],
  },
];

export type ServiceIcon =
  | { set: 'material'; name: 'badminton' | 'cricket' | 'boxing-glove' | 'baseball-bat' }
  | { set: 'ionicons'; name: 'baseball' | 'tennisball' | 'construct' | 'hand-left' };

export type Service = {
  id: string;
  title: string;
  badge: string;
  turnaround: string;
  pickup: boolean;
  description: string;
  features: string[];
  icon: ServiceIcon;
  image: number;
  gradient: [string, string];
};

export const services: Service[] = [
  {
    id: 'badminton-stringing',
    title: 'Badminton Stringing',
    badge: 'Popular Service',
    turnaround: 'Ready in 25–30 mins',
    pickup: true,
    description:
      'Professional stringing service with precision electronic tensioning for peak performance.',
    features: ['Precision Tensioning', 'Original Yonex Strings'],
    icon: { set: 'material', name: 'badminton' },
    image: require('../../assets/quick-access/stringing.jpg'),
    gradient: ['#065F46', '#10B981'],
  },
  {
    id: 'cricket-bat-knocking',
    title: 'Cricket Bat Knocking',
    badge: 'Match Ready',
    turnaround: 'Ready in 1–2 hours',
    pickup: true,
    description:
      '10,000+ stroke oiled machine knocking to make your cricket bat match-ready.',
    features: ['10,000+ Strokes', 'Linseed Oil Treatment'],
    icon: { set: 'material', name: 'cricket' },
    image: require('../../assets/quick-access/shop.jpg'),
    gradient: ['#7C2D12', '#EA580C'],
  },
  {
    id: 'gloves-repair',
    title: 'Gloves Repair',
    badge: 'Value Saver',
    turnaround: 'Ready in 3–4 days',
    pickup: true,
    description:
      'Restore your batting gloves with fresh leather palms, padding, and heavy-duty stitching.',
    features: ['Premium Leather Palm', 'Reinforced Stitching', 'Refreshed Padding'],
    icon: { set: 'material', name: 'boxing-glove' },
    image: require('../../assets/quick-access/repairs.jpg'),
    gradient: ['#581C87', '#A855F7'],
  },
  {
    id: 'cricket-bat-repair',
    title: 'Cricket Bat Repair',
    badge: 'Master Craftsmanship',
    turnaround: 'Ready in 2–3 days',
    pickup: true,
    description:
      'Fix handle cracks, toe splinters, face splits, and complete bat refurbishment.',
    features: ['Handle Replacement', 'Crack Binding', 'Full Sand & Polish'],
    icon: { set: 'material', name: 'baseball-bat' },
    image: require('../../assets/quick-access/store.jpg'),
    gradient: ['#1E3A8A', '#6366F1'],
  },
];

export const navItems = [
  { name: 'Home', icon: 'home' as const },
  { name: 'Products', icon: 'grid' as const },
  { name: 'Services', icon: 'construct' as const },
  { name: 'Contact', icon: 'call' as const },
];
