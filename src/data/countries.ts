export const COUNTRY_OPTIONS = [
  { id: 'IN', label: 'India' },
  { id: 'AE', label: 'United Arab Emirates' },
  { id: 'AU', label: 'Australia' },
  { id: 'CA', label: 'Canada' },
  { id: 'GB', label: 'United Kingdom' },
  { id: 'NP', label: 'Nepal' },
  { id: 'SG', label: 'Singapore' },
  { id: 'US', label: 'United States' },
  { id: 'OTHER', label: 'Other' },
] as const;

export type CountryId = (typeof COUNTRY_OPTIONS)[number]['id'];

export const DEFAULT_COUNTRY_ID: CountryId = 'IN';

export function countryLabel(id?: string): string {
  return COUNTRY_OPTIONS.find((c) => c.id === id)?.label ?? id ?? '—';
}
