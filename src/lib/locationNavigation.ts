import type { NavigateFunction } from "react-router";

type StoredLocation = {
  latitude: number;
  longitude: number;
  capturedAt: string;
};

const LOCATION_KEY = "gp-user-location";

function withLocationParams(path: string, location: StoredLocation) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("lat", location.latitude.toFixed(6));
  params.set("lng", location.longitude.toFixed(6));
  return `${pathname}?${params.toString()}`;
}

export async function navigateWithLocalLocation(
  navigate: NavigateFunction,
  path: string,
) {
  navigate(path);

  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location: StoredLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        capturedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
      window.history.replaceState(null, "", withLocationParams(path, location));
    },
    () => {
      // Location is optional; navigation should still work without it.
    },
    {
      enableHighAccuracy: false,
      maximumAge: 10 * 60 * 1000,
      timeout: 5000,
    },
  );
}

export function getStoredLocalLocation() {
  const raw = localStorage.getItem(LOCATION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredLocation;
  } catch {
    return null;
  }
}
