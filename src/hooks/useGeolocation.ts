import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(autoTrack = false) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });
  const watchId = useRef<number | null>(null);

  const getPosition = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number; accuracy: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
        (err) => reject(new Error(err.message)),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  const requestLocation = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const pos = await getPosition();
      setState({ ...pos, error: null, loading: false });
      return pos;
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Unknown error', loading: false }));
      return null;
    }
  }, [getPosition]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoTrack) startTracking();
    return () => stopTracking();
  }, [autoTrack, startTracking, stopTracking]);

  return { ...state, requestLocation, startTracking, stopTracking };
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculatePickupFee(distanceKm: number): number {
  if (distanceKm <= 5) return 0;
  return Math.round((distanceKm - 5) * 10);
}
