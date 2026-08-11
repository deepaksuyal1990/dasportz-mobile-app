export type StringOption = {
  id: string;
  name: string;
  price: number;
  durability: number;
  power: number;
  control: number;
};

export const stringOptions: StringOption[] = [
  { id: 'bg-65', name: 'BG 65', price: 550, durability: 4, power: 3, control: 4 },
  { id: 'bg-65-titanium', name: 'BG 65 Titanium', price: 600, durability: 4, power: 3, control: 4 },
  { id: 'bg-80', name: 'BG 80', price: 700, durability: 3, power: 4, control: 4 },
  { id: 'bg-80-power', name: 'BG 80 Power', price: 900, durability: 3, power: 5, control: 3 },
  { id: 'bg-66-ultimax', name: 'BG 66 Ultimax', price: 900, durability: 2, power: 5, control: 3 },
  { id: 'nanogy-95', name: 'Nanogy 95', price: 800, durability: 4, power: 3, control: 4 },
  { id: 'aerobite', name: 'AEROBITE', price: 900, durability: 3, power: 4, control: 4 },
  { id: 'aerobite-boost', name: 'AeroBite Boost', price: 1100, durability: 3, power: 5, control: 3 },
  { id: 'bg6', name: 'BG6', price: 450, durability: 5, power: 2, control: 4 },
  { id: 'lining-no1', name: 'Li-Ning No.1', price: 550, durability: 4, power: 3, control: 4 },
  { id: 'lining-no1-boost', name: 'Li-Ning No.1 Boost', price: 900, durability: 3, power: 5, control: 3 },
  { id: 'lining-no7', name: 'Li-Ning No.7', price: 500, durability: 4, power: 3, control: 4 },
  { id: 'lining-no7-boost', name: 'Li-Ning No.7 Boost', price: 750, durability: 3, power: 4, control: 4 },
  { id: 'lining-ns95', name: 'Li-Ning NS95', price: 850, durability: 4, power: 3, control: 4 },
  { id: 'lining-ns50', name: 'Li-Ning NS50 (680)', price: 680, durability: 4, power: 3, control: 4 },
  { id: 'hundred-power', name: 'Hundred Power', price: 400, durability: 3, power: 4, control: 3 },
  { id: 'hundred-control', name: 'Hundred Control', price: 450, durability: 4, power: 3, control: 4 },
  { id: 'hundred-pro', name: 'Hundred Pro', price: 480, durability: 4, power: 3, control: 4 },
  { id: 'hundred-jp65', name: 'Hundred JP 65', price: 900, durability: 3, power: 4, control: 4 },
  { id: 'hundred-jp65-magnite', name: 'Hundred JP 65 Magnite', price: 750, durability: 4, power: 3, control: 4 },
  { id: 'hundred-66x-boost', name: 'Hundred 66X Boost', price: 670, durability: 3, power: 4, control: 3 },
  { id: 'hundred-70x-boost', name: 'Hundred 70X Boost', price: 600, durability: 3, power: 4, control: 3 },
  { id: 'hundred-z63', name: 'Hundred Z63', price: 700, durability: 3, power: 4, control: 4 },
  { id: 'kizuna-d66', name: 'KIZUNA D66 Lusty', price: 450, durability: 4, power: 3, control: 3 },
  { id: 'head-master-300', name: 'Head Master 300', price: 300, durability: 4, power: 2, control: 4 },
  { id: 'gravity-gr65', name: 'Gravity-GR 65', price: 300, durability: 4, power: 2, control: 4 },
  { id: 'babolat-rpm-blast', name: 'Babolat RPM Blast', price: 1100, durability: 4, power: 4, control: 4 },
  { id: 'head-sonic-pro', name: 'Head Sonic Pro', price: 1200, durability: 3, power: 4, control: 4 },
  { id: 'tennis-string', name: 'Tennis String', price: 300, durability: 4, power: 3, control: 3 },
  { id: 'badminton-string', name: 'Badminton String', price: 200, durability: 3, power: 2, control: 3 },
];

export const storeLocations = [
  { id: 'gaur-city-1', name: 'Gaur City 1, Noida Extension' },
  { id: 'gaur-city-2', name: 'Gaur City 2, Noida Extension' },
  { id: 'sector-48', name: 'Sector 48, Noida' },
];

export const EXPRESS_FEE_PER_RACKET = 20;

/** Test coupon for racket stringing — ₹549 off. */
export const STRINGING_TEST_COUPON_CODE = 'DAS549';
export const STRINGING_TEST_COUPON_DISCOUNT = 549;

export const formSteps = ['Rackets', 'Details', 'Checkout'] as const;

export type FormStep = (typeof formSteps)[number];

export type RacketFormEntry = {
  id: string;
  model: string;
  stringId: string;
  quantity: number;
  tension: string;
};

export type PaymentMethod = 'upi' | 'cash';

export function createEmptyRacket(): RacketFormEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    model: '',
    stringId: '',
    quantity: 1,
    tension: '',
  };
}

export function getStringById(id: string) {
  return stringOptions.find((s) => s.id === id);
}

export function formatPrice(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function calculateOrderTotal(
  rackets: RacketFormEntry[],
  express: boolean,
  couponDiscount = 0,
): {
  subtotal: number;
  expressFee: number;
  discount: number;
  total: number;
  racketCount: number;
} {
  const subtotal = rackets.reduce((sum, racket) => {
    const stringOption = getStringById(racket.stringId);
    if (!stringOption) return sum;
    return sum + stringOption.price * racket.quantity;
  }, 0);

  const racketCount = rackets.reduce((sum, r) => sum + r.quantity, 0);
  const expressFee = express ? racketCount * EXPRESS_FEE_PER_RACKET : 0;
  const beforeDiscount = subtotal + expressFee;
  const discount = Math.min(Math.max(0, couponDiscount), beforeDiscount);

  return {
    subtotal,
    expressFee,
    discount,
    total: beforeDiscount - discount,
    racketCount,
  };
}

export function resolveStringingCoupon(code: string): number {
  const normalized = code.trim().toUpperCase();
  if (normalized === STRINGING_TEST_COUPON_CODE) {
    return STRINGING_TEST_COUPON_DISCOUNT;
  }
  return 0;
}
