import type { RiskyPlace } from "document-models/quit-journey/v1";
import type { LatLng } from "./types.js";

const EARTH_RADIUS_M = 6_371_008.8;
const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle (haversine) distance in metres. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Risky places whose radius contains the position, nearest first. */
export function placesNear(places: RiskyPlace[], pos: LatLng): RiskyPlace[] {
  return places
    .map((place) => ({ place, d: distanceMeters(pos, place) }))
    .filter((x) => x.d <= x.place.radiusM)
    .sort((x, y) => x.d - y.d)
    .map((x) => x.place);
}
