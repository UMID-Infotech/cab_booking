import { cityRates } from '../data/cityRates.js';
const normalized = text => String(text || '').trim().toLowerCase().replace(/\s+/g,' ');
export function matchPickupCity(components=[],rates=cityRates) {
  // Match locality first; do not price an entire district as its central city.
  const country=components.find(c=>c.types?.includes('country'));
  if (country && normalized(country.shortText || country.short_name)!=='in') return null;
  for (const type of ['locality','postal_town','administrative_area_level_3']) {
    const component=components.find(c=>c.types?.includes(type));
    if (!component) continue;
    const name=normalized(component.longText || component.long_name);
    return rates.find(city=>city.aliases.includes(name)) || null;
  }
  return null;
}
export function calculateFare(distanceMeters,ratePerKm) {
  if (!Number.isFinite(distanceMeters) || distanceMeters<=0 || !Number.isFinite(ratePerKm) || ratePerKm<=0) throw new Error('A valid distance and city rate are required.');
  return Math.round((distanceMeters/1000)*ratePerKm*100)/100;
}
export const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value);
export function durationLabel(minutes) {
  const m=Math.round(minutes); return m>=60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m} min`;
}
