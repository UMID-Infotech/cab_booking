import {calculateFare,matchPickupCity} from './pricing.js';
export function sameLocation(a,b){return !!(a&&b&&Math.abs(a.coords.lat-b.coords.lat)<.000001&&Math.abs(a.coords.lng-b.coords.lng)<.000001);}
export function pickupStatus(point,rates){
 if(!point)return {kind:'empty',city:null};
 const city=matchPickupCity(point.components,rates);
 if(city)return {kind:city.enabled===false?'disabled':'supported',city};
 const country=point.components?.find(c=>c.types?.includes('country'));
 if(country&&(country.shortText||country.short_name)?.toUpperCase()!=='IN')return {kind:'unsupported',city:null};
 const named=point.components?.some(c=>c.types?.some(t=>['locality','postal_town','administrative_area_level_3'].includes(t)));
 return {kind:named?'unsupported':'ambiguous',city:null};
}
export function validateTrip(pickup,drop,city){
 if(!pickup||!drop)throw new Error('Select both pickup and drop locations.');
 if(sameLocation(pickup,drop))throw new Error('Pickup and drop must be different locations.');
 if(!city||city.enabled===false)throw new Error('Choose an enabled pickup city before calculating the fare.');
}
export function quoteFromRoute(raw,city){
 if(!raw||!Number.isFinite(raw.distanceMeters)||raw.distanceMeters<=0)throw new Error('No valid driving route was found.');
 return {distanceMeters:raw.distanceMeters,km:raw.distanceMeters/1000,minutes:Number.isFinite(raw.durationMillis)?raw.durationMillis/60000:null,path:raw.path||[],fare:calculateFare(raw.distanceMeters,city.ratePerKm),city,provider:raw.provider||'OSRM / OpenStreetMap'};
}
export function createRequestGate(){let version=0;return {next:()=>++version,invalidate:()=>++version,isCurrent:token=>token===version};}
