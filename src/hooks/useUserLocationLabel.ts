import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export type UserLocationState = {
  label: string;
  loading: boolean;
  denied: boolean;
  refresh: () => void;
};

function formatPlace(place: Location.LocationGeocodedAddress): string {
  const locality = place.district || place.city || place.subregion || place.region;
  const area = place.name || place.street || place.district;
  if (area && locality && area !== locality) return `${area}, ${locality}`;
  if (locality) return locality;
  if (area) return area;
  if (place.postalCode) return place.postalCode;
  return 'Current location';
}

async function resolveLabel(): Promise<{ label: string; denied: boolean }> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    return { label: 'Location off', denied: true };
  }

  const current = await Location.getForegroundPermissionsAsync();
  let status = current.status;
  if (status !== Location.PermissionStatus.GRANTED) {
    const asked = await Location.requestForegroundPermissionsAsync();
    status = asked.status;
  }

  if (status !== Location.PermissionStatus.GRANTED) {
    return { label: 'Enable location', denied: true };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const places = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  const place = places[0];
  if (!place) {
    return {
      label: `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`,
      denied: false,
    };
  }

  return { label: formatPlace(place), denied: false };
}

/** Resolve a short human-readable label for the device's current location. */
export function useUserLocationLabel(): UserLocationState {
  const [label, setLabel] = useState('Locating…');
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  const refresh = useCallback(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await resolveLabel();
        if (cancelled) return;
        setLabel(result.label);
        setDenied(result.denied);
      } catch {
        if (!cancelled) {
          setLabel('Location unavailable');
          setDenied(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = refresh();
    return cancel;
  }, [refresh]);

  return {
    label: loading && label === 'Locating…' ? 'Locating…' : label,
    loading,
    denied,
    refresh: () => {
      if (denied && Platform.OS !== 'web') {
        void Linking.openSettings();
      }
      refresh();
    },
  };
}
