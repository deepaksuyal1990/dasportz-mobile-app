import { Platform } from 'react-native';

/** PlayNex / DA SPORTZ Lambda (Zoho + Twilio). */
export const PLAYNEX_API_ORIGIN =
  'https://kg7kg65ok2hvfox6l4gtniqhsi0ckmox.lambda-url.ap-south-1.on.aws';

/** Local CORS proxy used only for Expo web on localhost. */
export const WEB_DEV_PROXY_ORIGIN = 'http://localhost:8787';

/**
 * API base URL.
 * - Native (iOS/Android): call Lambda directly (no CORS).
 * - Web localhost: use local proxy (`npm run proxy`) to avoid browser CORS.
 * - Override anytime with EXPO_PUBLIC_API_BASE.
 */
export function getApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (Platform.OS === 'web' && typeof __DEV__ !== 'undefined' && __DEV__) {
    return WEB_DEV_PROXY_ORIGIN;
  }

  return PLAYNEX_API_ORIGIN;
}

/** @deprecated Prefer getApiBase() so web can switch at runtime. */
export const API_BASE = getApiBase();
