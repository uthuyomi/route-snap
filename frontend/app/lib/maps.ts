export type Coordinates = {
  latitude: number;
  longitude: number;
};

const GEOLOCATION_TIMEOUT_MS = 5000;

function encodeAddress(address: string) {
  return encodeURIComponent(address.trim());
}

function encodeOrigin(origin?: Coordinates) {
  if (!origin) return "";
  return `${origin.latitude},${origin.longitude}`;
}

export function buildSingleMapsUrl(address: string, origin?: Coordinates) {
  const destination = encodeAddress(address);
  const originPart = origin ? `&origin=${encodeOrigin(origin)}` : "";
  return `https://www.google.com/maps/dir/?api=1${originPart}&destination=${destination}&travelmode=driving`;
}

export function buildRouteMapsUrl(addresses: string[], origin?: Coordinates) {
  const cleaned = addresses.map((address) => address.trim()).filter(Boolean);
  if (!cleaned.length) return "";

  if (cleaned.length === 1) {
    return buildSingleMapsUrl(cleaned[0], origin);
  }

  const routeOrigin = origin ? encodeOrigin(origin) : encodeAddress(cleaned[0]);
  const destination = encodeAddress(cleaned[cleaned.length - 1]);
  const waypointAddresses = origin ? cleaned.slice(0, -1) : cleaned.slice(1, -1);
  const waypoints = waypointAddresses.map(encodeAddress).join("|");
  const waypointPart = waypoints ? `&waypoints=${waypoints}` : "";

  return `https://www.google.com/maps/dir/?api=1&origin=${routeOrigin}&destination=${destination}${waypointPart}&travelmode=driving`;
}

export function getCurrentPosition() {
  return new Promise<Coordinates | null>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: GEOLOCATION_TIMEOUT_MS
      }
    );
  });
}
