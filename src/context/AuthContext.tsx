import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CustomerProfile,
  GuestLoginInput,
  MemberLoginInput,
  SignUpInput,
} from '../types/auth';
import { DEFAULT_NOTIFICATION_PREFS } from '../types/auth';
import {
  composeFullName,
  isValidEmail,
  isValidNamePart,
  isValidPhone,
  isValidRequiredText,
} from '../utils/name';

const SESSION_KEY = '@dasportz/customer_session';
const ACCOUNTS_KEY = '@dasportz/customer_accounts';

type AuthContextValue = {
  user: CustomerProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (input: SignUpInput) => Promise<CustomerProfile>;
  guestLogin: (input: GuestLoginInput) => Promise<CustomerProfile>;
  memberLogin: (input: MemberLoginInput) => Promise<CustomerProfile>;
  updateProfile: (partial: Partial<CustomerProfile>) => Promise<CustomerProfile>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '').slice(-10);
}

async function loadAccounts(): Promise<CustomerProfile[]> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CustomerProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAccounts(accounts: CustomerProfile[]) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function upsertAccount(profile: CustomerProfile) {
  const accounts = await loadAccounts();
  const index = accounts.findIndex((a) => a.phone === profile.phone);
  if (index >= 0) accounts[index] = profile;
  else accounts.push(profile);
  await saveAccounts(accounts);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        // Migrate legacy single-profile key if present.
        const legacy = await AsyncStorage.getItem('@dasportz/customer_profile');
        if (legacy) {
          const profile = JSON.parse(legacy) as CustomerProfile;
          await upsertAccount(profile);
          await AsyncStorage.setItem(SESSION_KEY, legacy);
          await AsyncStorage.removeItem('@dasportz/customer_profile');
        }

        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          const profile = JSON.parse(raw) as CustomerProfile;
          setUser({
            ...profile,
            notificationPrefs: {
              ...DEFAULT_NOTIFICATION_PREFS,
              ...profile.notificationPrefs,
            },
            savedAddresses: profile.savedAddresses ?? [],
          });
        }
      } catch {
        // ignore corrupt storage
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (profile: CustomerProfile | null) => {
    if (profile) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      if (profile.mode === 'member') {
        await upsertAccount(profile);
      }
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
    setUser(profile);
  }, []);

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const phone = normalizePhone(input.phone);
      const firstErr = isValidNamePart(input.firstName, { required: true });
      const middleErr = isValidNamePart(input.middleName ?? '', { required: false });
      const lastErr = isValidNamePart(input.lastName ?? '', { required: false });
      const phoneErr = isValidPhone(phone);
      const emailErr = isValidEmail(input.email);
      const cityErr = isValidRequiredText(input.city, 'City');
      const countryErr = isValidRequiredText(input.country, 'Country');

      if (firstErr) throw new Error(firstErr);
      if (middleErr) throw new Error(middleErr);
      if (lastErr) throw new Error(lastErr);
      if (phoneErr) throw new Error(phoneErr);
      if (emailErr) throw new Error(emailErr);
      if (cityErr) throw new Error(cityErr);
      if (countryErr) throw new Error(countryErr);

      const firstName = input.firstName.trim();
      const middleName = input.middleName?.trim() || undefined;
      const lastName = input.lastName?.trim() || undefined;
      const fullName = composeFullName(firstName, middleName, lastName);

      const accounts = await loadAccounts();
      const existing = accounts.find((a) => a.phone === phone && a.mode === 'member');
      if (existing) {
        throw new Error('An account with this mobile number already exists. Please log in.');
      }

      const profile: CustomerProfile = {
        id: createId('mem'),
        mode: 'member',
        fullName,
        firstName,
        middleName,
        lastName,
        phone,
        email: input.email.trim().toLowerCase(),
        city: input.city.trim(),
        country: input.country.trim(),
        countryCode: input.countryCode,
        preferredStoreId: input.preferredStoreId,
        photoUri: input.photoUri,
        createdAt: new Date().toISOString(),
        notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
        savedAddresses: [],
      };
      await persistSession(profile);
      return profile;
    },
    [persistSession],
  );

  const memberLogin = useCallback(
    async (input: MemberLoginInput) => {
      const phone = normalizePhone(input.phone);
      if (phone.length !== 10) throw new Error('Enter a valid 10-digit mobile number');

      const accounts = await loadAccounts();
      const existing = accounts.find((a) => a.phone === phone && a.mode === 'member');
      if (!existing) {
        throw new Error('No account found for this number. Please sign up first.');
      }

      await persistSession(existing);
      return existing;
    },
    [persistSession],
  );

  const guestLogin = useCallback(
    async (input: GuestLoginInput) => {
      const phone = normalizePhone(input.phone);
      if (phone.length !== 10) throw new Error('Enter a valid 10-digit mobile number');

      const accounts = await loadAccounts();
      const member = accounts.find((a) => a.phone === phone && a.mode === 'member');
      if (member) {
        await persistSession(member);
        return member;
      }

      const profile: CustomerProfile = {
        id: createId('gst'),
        mode: 'guest',
        fullName: input.fullName?.trim() || 'Guest',
        phone,
        email: `${phone}@guest.dasportz.com`,
        city: 'Greater Noida West',
        createdAt: new Date().toISOString(),
        notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
        savedAddresses: [],
      };
      await persistSession(profile);
      return profile;
    },
    [persistSession],
  );

  const updateProfile = useCallback(
    async (partial: Partial<CustomerProfile>) => {
      if (!user) throw new Error('Not logged in');
      const merged: CustomerProfile = {
        ...user,
        ...partial,
        id: user.id,
        mode: user.mode,
        phone: partial.phone ? normalizePhone(partial.phone) : user.phone,
        createdAt: user.createdAt,
      };
      const firstName = merged.firstName?.trim();
      const middleName = merged.middleName?.trim();
      const lastName = merged.lastName?.trim();
      if (firstName || lastName) {
        merged.firstName = firstName || merged.firstName;
        merged.middleName = middleName || undefined;
        merged.lastName = lastName || merged.lastName;
        merged.fullName = composeFullName(
          merged.firstName ?? '',
          merged.middleName,
          merged.lastName ?? '',
        );
      }
      await persistSession(merged);
      return merged;
    },
    [persistSession, user],
  );

  const logout = useCallback(async () => {
    await persistSession(null);
  }, [persistSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      signUp,
      guestLogin,
      memberLogin,
      updateProfile,
      logout,
    }),
    [user, loading, signUp, guestLogin, memberLogin, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
