import {cityRates} from '../data/cityRates.js';
export const RATES_STORAGE_KEY='cityride.rates.v2';
export const RATES_EVENT='cityride-rates-updated';
export function defaultRates(){return cityRates.map(c=>({...c,aliases:[...c.aliases],enabled:true}));}
export function normalizeRates(records) {
 if(!Array.isArray(records)||records.length!==cityRates.length)throw new Error('Import must contain all 10 configured cities.');
 const ids=new Set(records.map(r=>r.id));
 if(ids.size!==cityRates.length)throw new Error('City IDs must be unique.');
 return cityRates.map(base=>{
  const record=records.find(r=>r.id===base.id);
  if(!record)throw new Error(`Missing city ${base.city}.`);
  if(typeof record.ratePerKm!=='number'||!Number.isFinite(record.ratePerKm)||record.ratePerKm<0.01||record.ratePerKm>10000)throw new Error(`Enter a valid rate for ${base.city} between 0.01 and 10000.`);
  return {...base,ratePerKm:Math.round(record.ratePerKm*100)/100,enabled:record.enabled!==false};
 });
}
export function readRates(storage=window.localStorage) {
 try{const value=storage.getItem(RATES_STORAGE_KEY);return value?normalizeRates(JSON.parse(value)):defaultRates();}catch{return defaultRates();}
}
export function saveRates(records,storage=window.localStorage) {
 const clean=normalizeRates(records);
 try{storage.setItem(RATES_STORAGE_KEY,JSON.stringify(clean));}catch{throw new Error('Browser storage is unavailable. Enable local storage to save demo rates.');}
 window.dispatchEvent(new CustomEvent(RATES_EVENT));return clean;
}
