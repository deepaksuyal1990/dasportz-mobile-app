import type { CustomerProfile, SavedAddress } from '../types/auth';
import { composeFullName, splitFullName } from './name';
import { DEFAULT_COUNTRY_ID, countryLabel } from '../data/countries';

export type ProfileFormPrefill = {
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  countryCode: string;
  preferredStoreId?: string;
};

function formatSavedAddress(addr: SavedAddress): string {
  return [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ');
}

function resolveAddress(user: CustomerProfile): string {
  const saved =
    user.savedAddresses?.find((a) => a.isDefault) ?? user.savedAddresses?.[0];
  if (saved) return formatSavedAddress(saved);
  if (user.address?.trim()) return user.address.trim();
  return '';
}

function resolveEmail(user: CustomerProfile): string {
  if (!user.email?.trim()) return '';
  if (user.email.endsWith('@guest.dasportz.com')) return '';
  return user.email.trim();
}

/** Map a logged-in profile into common checkout / booking form fields. */
export function getProfileFormPrefill(user: CustomerProfile | null | undefined): ProfileFormPrefill | null {
  if (!user) return null;
  const split = splitFullName(user.fullName ?? '');
  const firstName = user.firstName?.trim() || split.firstName;
  const middleName = user.middleName?.trim() || split.middleName;
  const lastName = user.lastName?.trim() || split.lastName;
  const fullName =
    composeFullName(firstName, middleName, lastName) || user.fullName?.trim() || '';
  const countryCode = user.countryCode || DEFAULT_COUNTRY_ID;
  return {
    fullName,
    firstName,
    middleName,
    lastName,
    phone: user.phone.replace(/\D/g, '').slice(-10),
    email: resolveEmail(user),
    address: resolveAddress(user),
    city: user.city?.trim() || '',
    country: user.country?.trim() || countryLabel(countryCode),
    countryCode,
    preferredStoreId: user.preferredStoreId,
  };
}
