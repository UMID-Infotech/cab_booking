import {createJsonClient} from './http.js';
const env=import.meta.env || {};
const PHOTON=(env.VITE_PHOTON_URL || 'https://photon.komoot.io').replace(/\/+$/,'');
const OSRM=(env.VITE_ROUTING_URL || 'https://router.project-osrm.org').replace(/\/+$/,'');
const geocodeRequest=createJsonClient(),routeRequest=createJsonClient({maxEntries:30});
export function isValidCoordinates(coords) {
 return !!coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng) && Math.abs(coords.lat)<=90 && Math.abs(coords.lng)<=180;
}
export function photonPoint(feature,coordsOverride) {
 const p=feature?.properties || {},[lng,lat]=feature?.geometry?.coordinates || [];
 const coords=coordsOverride || {lat,lng};
 if(!isValidCoordinates(coords))return null;
 const parts=[p.name,p.housenumber,p.street,p.district,p.city,p.state,p.postcode,p.country].filter(Boolean);
 const address=[...new Set(parts)].join(', ') || `Map point ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
 const city=p.city || ((p.osm_value==='city' || p.osm_value==='town' || p.type==='city') ? p.name : '');
 const components=[];
 if(city)components.push({long_name:city,types:['locality']});
 if(p.countrycode)components.push({short_name:p.countrycode.toUpperCase(),types:['country']});
 return {coords,address,components,provider:'OpenStreetMap / Photon',id:`${p.osm_type || ''}:${p.osm_id || ''}:${lat}:${lng}`};
}
export async function searchLocations(query,{signal,bias}={}) {
 if(query.trim().length<3)return [];
 const params=new URLSearchParams({q:query.trim(),limit:'6',lang:'en',countrycode:'IN',bbox:'68,6,98,38'});
 if(isValidCoordinates(bias)){params.set('lat',String(bias.lat));params.set('lon',String(bias.lng));}
 const data=await geocodeRequest(`${PHOTON}/api/?${params}`,{signal});
 return (data.features || []).filter(f=>!f.properties?.countrycode || f.properties.countrycode.toUpperCase()==='IN').map(f=>photonPoint(f)).filter(Boolean);
}
export async function pointFromCoordinates(coords,{signal}={}) {
 if(!isValidCoordinates(coords))throw new Error('Select a valid map position.');
 try {
  const params=new URLSearchParams({lat:String(coords.lat),lon:String(coords.lng),limit:'1',lang:'en',radius:'1'});
  const data=await geocodeRequest(`${PHOTON}/reverse?${params}`,{signal});
  const point=photonPoint(data.features?.[0],coords);
  if(point)return point;
  return {coords,address:`Map point ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,components:[],lookupWarning:'No address was found here. Check the pin and confirm your pickup city if needed.'};
 }catch(e){
  if(e.name==='AbortError')throw e;
  // GPS/map coordinates are still valid when reverse lookup fails. Preserve both map controls.
  return {coords,address:`Map point ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,components:[],lookupWarning:`${e.message} Your pin is saved; confirm the pickup city if needed.`};
 }
}
export async function drivingRoute(pickup,drop,{signal}={}) {
 if(!isValidCoordinates(pickup?.coords)||!isValidCoordinates(drop?.coords))throw new Error('Select valid pickup and drop locations.');
 const a=pickup.coords,b=drop.coords;
 const url=`${OSRM}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson&steps=false`;
 const data=await routeRequest(url,{signal});
 if(data.code!=='Ok'||!data.routes?.length)throw new Error('No driving route found. Choose points closer to accessible roads and retry.');
 const route=data.routes[0];
 if(!Number.isFinite(route.distance)||route.distance<=0)throw new Error('The routing service returned no valid road distance.');
 return {distanceMeters:route.distance,durationMillis:Number.isFinite(route.duration)?route.duration*1000:null,path:(route.geometry?.coordinates || []).map(([lng,lat])=>({lat,lng})),provider:'OSRM / OpenStreetMap'};
}
export function deviceLocation() {
 return new Promise((resolve,reject)=>{
  if(!window.isSecureContext)return reject(new Error('Location needs HTTPS or localhost. You can still enter your address manually.'));
  if(!navigator.geolocation)return reject(new Error('Location is unavailable in this browser. Enter your pickup manually.'));
  navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude}),e=>reject(new Error({1:'Location permission was denied. Allow location access in browser settings or enter your pickup manually.',2:'Your device could not find your current location. Retry or enter your pickup manually.',3:'Location detection timed out. Retry or enter your pickup manually.'}[e.code]||'Location detection failed. Enter your pickup manually.')),{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
 });
}
