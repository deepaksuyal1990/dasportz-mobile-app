/** Shared name helpers for signup / profile. */

const NAME_PART_RE = /^[A-Za-z][A-Za-z .'-]{0,39}$/;

export function composeFullName(
  firstName: string,
  middleName?: string,
  lastName?: string,
): string {
  return [firstName, middleName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}

export function splitFullName(fullName: string): {
  firstName: string;
  middleName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', middleName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], middleName: '', lastName: '' };
  if (parts.length === 2) return { firstName: parts[0], middleName: '', lastName: parts[1] };
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

export function isValidNamePart(value: string, { required }: { required: boolean }): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'This field is required' : null;
  if (trimmed.length < 2) return 'Enter at least 2 characters';
  if (!NAME_PART_RE.test(trimmed)) return 'Use letters only (spaces, - and \' allowed)';
  return null;
}

export function isValidEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required';
  // Practical email check (not full RFC)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return 'Enter a valid email address';
  return null;
}

export function isValidPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return 'Enter a valid 10-digit mobile number';
  if (!/^[6-9]\d{9}$/.test(digits)) return 'Enter a valid Indian mobile number';
  return null;
}

export function isValidRequiredText(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  if (value.trim().length < 2) return `${label} is too short`;
  return null;
}
