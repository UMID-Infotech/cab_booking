import {useEffect,useRef,useState} from 'react';
import {Navigation,LocateFixed,LoaderCircle} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
export default function TripMap({pickup,drop,route,pinTarget,onPin,onError}){
 const host=useRef(null),map=useRef(null),Lref=useRef(null),markers=useRef([]),line=useRef(null),tiles=useRef(null),errors=useRef(0);
 const latest=useRef({pinTarget,onPin,onError});latest.current={pinTarget,onPin,onError};
 const [ready,setReady]=useState(false),[tileWarning,setTileWarning]=useState(false);
 useEffect(()=>{
  let disposed=false;
  import('leaflet').then(module=>{
   if(disposed)return;
   const L=module.default||module;Lref.current=L;
   const m=L.map(host.current,{zoomControl:false,scrollWheelZoom:false}).setView([28.6139,77.209],11);map.current=m;
   L.control.zoom({position:'bottomright'}).addTo(m);
   const layer=L.tileLayer(import.meta.env.VITE_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(m);tiles.current=layer;
   layer.on('tileerror',()=>{errors.current++;if(errors.current>=3)setTileWarning(true);});
   layer.on('tileload',()=>{errors.current=0;setTileWarning(false);});
   m.on('click',e=>{if(latest.current.pinTarget)latest.current.onPin(latest.current.pinTarget,{lat:e.latlng.lat,lng:e.latlng.lng});});
   setReady(true);m.invalidateSize();
  }).catch(e=>{if(!disposed)latest.current.onError(`Could not initialize the map: ${e.message}`);});
  const resize=()=>map.current?.invalidateSize();window.addEventListener('resize',resize);
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(host.current)observer?.observe(host.current);
  return ()=>{disposed=true;window.removeEventListener('resize',resize);observer?.disconnect();map.current?.remove();map.current=null;};
 },[]);
 useEffect(()=>{
  if(!ready||!map.current)return;
  const L=Lref.current,m=map.current;
  markers.current.forEach(marker=>marker.remove());markers.current=[];line.current?.remove();line.current=null;
  const points=[];
  [pickup,drop].forEach((p,index)=>{
   if(!p)return;
   const icon=L.divIcon({className:'route-pin-icon',html:`<div class="route-pin ${index?'end':''}"><span>${index?'B':'A'}</span></div>`,iconSize:[38,38],iconAnchor:[19,38]});
   const marker=L.marker([p.coords.lat,p.coords.lng],{icon,draggable:true,title:index?'Drop location — drag to move':'Pickup location — drag to move'}).addTo(m);
   marker.on('dragend',()=>{const pos=marker.getLatLng();latest.current.onPin(index?'drop':'pickup',{lat:pos.lat,lng:pos.lng});});
   markers.current.push(marker);points.push([p.coords.lat,p.coords.lng]);
  });
  if(route?.path?.length){const path=route.path.map(p=>[p.lat,p.lng]);line.current=L.polyline(path,{color:'#176b57',weight:6,opacity:.9}).addTo(m);m.fitBounds(line.current.getBounds(),{padding:[55,65]});}
  else if(points.length===2)m.fitBounds(L.latLngBounds(points),{padding:[65,75],maxZoom:16});
  else if(points.length===1)m.setView(points[0],15);
 },[ready,pickup,drop,route]);
 const fit=()=>{
  if(line.current)map.current.fitBounds(line.current.getBounds(),{padding:[55,65]});
  else if(pickup||drop){const c=(pickup||drop).coords;map.current.setView([c.lat,c.lng],15);}
  else map.current?.setView([28.6139,77.209],11);
 };
 return <div className={`map-shell ${pinTarget?'selecting':''}`}>
  <div className="leaflet-host" ref={host} aria-label="Interactive OpenStreetMap pickup and drop map"/>
  {!ready&&<div className="map-loading"><LoaderCircle size={26} className="spin"/><strong>Preparing your map</strong><span>No API key needed.</span></div>}
  <div className="map-top-label"><span className="status-dot"/>{pinTarget?`Click map to set ${pinTarget}`:'Live OpenStreetMap'}</div>
  {tileWarning&&<div className="tile-warning" role="status">Map tiles are loading slowly. Check your connection.<button onClick={()=>{errors.current=0;setTileWarning(false);tiles.current?.redraw();}}>Retry</button></div>}
  <button className="map-fit" onClick={fit} aria-label="Fit map to route"><LocateFixed size={18}/></button>
  {!pinTarget&&<div className="map-bottom-label"><Navigation size={18}/><div><strong>{route?`${route.km.toFixed(1)} km · actual driving route`:'Select your pickup and drop'}</strong><span>Choose a point on the map or search an address.</span></div></div>}
 </div>;
}
