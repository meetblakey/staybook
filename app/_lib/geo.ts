export type Coordinates = {
  lat: number;
  lng: number;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function isValidCoordinates(value: Coordinates | null | undefined): value is Coordinates {
  if (!value) return false;
  return Number.isFinite(value.lat) && Number.isFinite(value.lng);
}

export function parseBounds(bounds: string | null | undefined): MapBounds | null {
  if (!bounds) return null;
  const parts = bounds.split(",").map((part) => Number.parseFloat(part.trim()));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }
  const [north, east, south, west] = parts;
  return { north, east, south, west };
}

export function toPostgisPolygon(bounds: MapBounds) {
  const { north, east, south, west } = bounds;
  return `POLYGON((${west} ${south}, ${west} ${north}, ${east} ${north}, ${east} ${south}, ${west} ${south}))`;
}

export function toPostgisPoint(coordinates: Coordinates) {
  return `POINT(${coordinates.lng} ${coordinates.lat})`;
}

const EARTH_RADIUS_KM = 6371;

export function calculateHaversineDistanceKm(a: Coordinates, b: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const haversine = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}
