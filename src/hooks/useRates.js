import {useEffect,useState} from 'react';
import {readRates,RATES_STORAGE_KEY,RATES_EVENT} from '../lib/rates.js';
export default function useRates(){
 const [rates,setRates]=useState(()=>readRates());
 useEffect(()=>{
  const refresh=()=>setRates(readRates());
  const storage=e=>{if(!e.key||e.key===RATES_STORAGE_KEY)refresh();};
  window.addEventListener(RATES_EVENT,refresh);window.addEventListener('storage',storage);
  return ()=>{window.removeEventListener(RATES_EVENT,refresh);window.removeEventListener('storage',storage);};
 },[]);
 return rates;
}
