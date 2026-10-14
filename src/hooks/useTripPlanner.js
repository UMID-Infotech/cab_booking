import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createRequestGate,pickupStatus,quoteFromRoute,validateTrip} from '../lib/trips.js';
import {deviceLocation,drivingRoute,pointFromCoordinates} from '../lib/maps.js';
export default function useTripPlanner(rates){
 const [pickup,setPickup]=useState(null),[drop,setDrop]=useState(null),[confirmedCity,setConfirmedCity]=useState('');
 const [quote,setQuote]=useState(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[pinTarget,setPinTarget]=useState(null),[revision,setRevision]=useState(0);
 const gate=useRef(createRequestGate()),pointGates=useRef({pickup:createRequestGate(),drop:createRequestGate()}),controllers=useRef({}),mounted=useRef(true),pickupRef=useRef(pickup),touched=useRef(false);
 pickupRef.current=pickup;
 const status=useMemo(()=>pickupStatus(pickup,rates),[pickup,rates]);
 const city=status.city||(status.kind==='ambiguous'?rates.find(c=>c.id===confirmedCity&&c.enabled!==false):null);
 const clear=useCallback(()=>{gate.current.invalidate();controllers.current.route?.abort();setQuote(null);setBusy('');setError('');setNotice('');},[]);
 const changePoint=useCallback((kind,point)=>{
  pointGates.current[kind].invalidate();controllers.current[kind]?.abort();clear();
  if(kind==='pickup'){touched.current=true;pickupRef.current=point;setPickup(point);setConfirmedCity('');}else setDrop(point);
  setPinTarget(null);
 },[clear]);
 const lookup=useCallback(async(kind,coords,token)=>{
  const controller=new AbortController();controllers.current[kind]?.abort();controllers.current[kind]=controller;
  const point=await pointFromCoordinates(coords,{signal:controller.signal});
  if(!mounted.current||!pointGates.current[kind].isCurrent(token))return;
  changePoint(kind,point);
  if(point.lookupWarning)setNotice(point.lookupWarning);
 },[changePoint]);
 const locate=useCallback(async(automatic=false)=>{
  if(automatic&&(pickupRef.current||touched.current))return;
  const token=pointGates.current.pickup.next();clear();setBusy('locating');
  try{
   const coords=await deviceLocation();
   if(!mounted.current||!pointGates.current.pickup.isCurrent(token))return;
   await lookup('pickup',coords,token);
   if(mounted.current&&!controllers.current.pickup?.signal.aborted)setNotice(n=>n||'Your location is set as pickup. Check the pin or enter a different address.');
  }catch(e){if(mounted.current&&pointGates.current.pickup.isCurrent(token)&&e.name!=='AbortError'){setError(e.message);setBusy('');}}
 },[clear,lookup]);
 useEffect(()=>{
  mounted.current=true;return ()=>{mounted.current=false;gate.current.invalidate();Object.values(pointGates.current).forEach(g=>g.invalidate());Object.values(controllers.current).forEach(c=>c.abort());};
 },[]);
 useEffect(()=>{
  let disposed=false;
  // First load requests browser permission; manual input wins if the user types meanwhile.
  const timer=setTimeout(()=>{if(!disposed&&!touched.current&&!pickupRef.current)locate(true);},650);
  return ()=>{disposed=true;clearTimeout(timer);};
 },[locate]);
 useEffect(()=>{clear();},[rates,clear]);
 const pin=useCallback(async(kind,coords)=>{
  const token=pointGates.current[kind].next();clear();
  if(kind==='pickup'){touched.current=true;setPickup(null);pickupRef.current=null;setConfirmedCity('');}else setDrop(null);
  setBusy(`pin-${kind}`);
  try{await lookup(kind,coords,token);}catch(e){if(mounted.current&&pointGates.current[kind].isCurrent(token)&&e.name!=='AbortError'){setError(e.message);setBusy('');}}
 },[clear,lookup]);
 const calculate=async()=>{
  const token=gate.current.next();setQuote(null);setError('');setNotice('');setBusy('route');
  const controller=new AbortController();controllers.current.route?.abort();controllers.current.route=controller;
  try{
   validateTrip(pickup,drop,city);
   const result=quoteFromRoute(await drivingRoute(pickup,drop,{signal:controller.signal}),city);
   if(!mounted.current||!gate.current.isCurrent(token))return;
   setQuote(result);setBusy('');
  }catch(e){if(mounted.current&&gate.current.isCurrent(token)&&e.name!=='AbortError'){setError(e.message);setBusy('');}}
 };
 const cancelPoints=()=>{Object.values(pointGates.current).forEach(g=>g.invalidate());controllers.current.pickup?.abort();controllers.current.drop?.abort();};
 const swap=()=>{cancelPoints();clear();touched.current=true;setPickup(drop);pickupRef.current=drop;setDrop(pickup);setConfirmedCity('');setPinTarget(null);setRevision(r=>r+1);};
 const reset=()=>{cancelPoints();clear();touched.current=true;setPickup(null);pickupRef.current=null;setDrop(null);setConfirmedCity('');setPinTarget(null);setRevision(r=>r+1);};
 const confirm=id=>{clear();setConfirmedCity(id);};
 return {pickup,drop,city,status,confirmedCity,quote,busy,error,notice,pinTarget,revision,changePoint,reportError:setError,locate,pin,calculate,swap,confirm,reset,setPinTarget};
}
