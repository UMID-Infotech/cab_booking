import {useEffect,useId,useRef,useState} from 'react';
import {Search,LoaderCircle,X,MapPin} from 'lucide-react';
import {searchLocations} from '../lib/maps.js';
export default function LocationSearch({kind,point,onChange,bias}){
 const [text,setText]=useState(point?.address||''),[results,setResults]=useState([]),[open,setOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[active,setActive]=useState(-1);
 const host=useRef(null),id=useId(),controller=useRef(null),typing=useRef(false);
 useEffect(()=>{
  if(!point&&typing.current){typing.current=false;return;}
  setText(point?.address||'');setResults([]);setOpen(false);setError('');setLoading(false);controller.current?.abort();
 },[point]);
 useEffect(()=>{
  if(!open||text.trim().length<3)return;
  const c=new AbortController();controller.current?.abort();controller.current=c;
  const timer=setTimeout(async()=>{
   setLoading(true);setError('');
   try{const matches=await searchLocations(text,{signal:c.signal,bias});if(!c.signal.aborted){setResults(matches);setActive(-1);}}
   catch(e){if(e.name!=='AbortError'&&!c.signal.aborted){setError(e.message);setResults([]);}}
   finally{if(!c.signal.aborted)setLoading(false);}
  },700);
  return ()=>{clearTimeout(timer);c.abort();};
 },[text,open,bias?.lat,bias?.lng]);
 useEffect(()=>{
  const close=e=>{if(!host.current?.contains(e.target)){setOpen(false);setActive(-1);}};
  document.addEventListener('pointerdown',close);return ()=>document.removeEventListener('pointerdown',close);
 },[]);
 const choose=result=>{controller.current?.abort();onChange(result);setText(result.address);setOpen(false);setResults([]);setError('');};
 const edit=value=>{
  typing.current=true;controller.current?.abort();onChange(null);setText(value);setOpen(true);setResults([]);setActive(-1);setError('');setLoading(false);
 };
 // point === null stays stable during typing; the effect above never replaces entered text.
 return <div className="address-search" ref={host}>
  <div className="address-input"><Search size={16}/><input id={`${kind}-location`} role="combobox" aria-label={`${kind} address search`} aria-autocomplete="list" aria-expanded={open&&text.trim().length>=3} aria-controls={`${id}-results`} aria-activedescendant={active>=0?`${id}-result-${active}`:undefined} autoComplete="off" placeholder={kind==='pickup'?'Search pickup address or landmark':'Search drop address or landmark'} value={text} onChange={e=>edit(e.target.value)} onFocus={()=>{if(!point)setOpen(true);}} onKeyDown={e=>{
   if(e.key==='ArrowDown'){e.preventDefault();setActive(a=>Math.min(a+1,results.length-1));}
   if(e.key==='ArrowUp'){e.preventDefault();setActive(a=>Math.max(a-1,0));}
   if(e.key==='Enter'&&open){e.preventDefault();if(results[active])choose(results[active]);}
   if(e.key==='Escape')setOpen(false);
  }}/>{loading?<LoaderCircle size={16} className="spin"/>:text&&<button type="button" aria-label={`Clear ${kind} address`} onClick={()=>edit('')}><X size={15}/></button>}</div>
  {open&&text.trim().length>=3&&<div className="address-results" id={`${id}-results`} role="listbox" aria-label={`${kind} address suggestions`}>
   {loading?<p className="search-message">Searching addresses…</p>:error?<p className="search-message search-error" role="alert">{error} You can also choose a point on the map.</p>:results.length?results.map((r,i)=><button type="button" id={`${id}-result-${i}`} role="option" aria-selected={i===active} key={r.id||i} className={i===active?'active':''} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(r)}><MapPin size={15}/><span>{r.address}</span></button>):<p className="search-message">No results yet. Try a city, sector or well-known landmark.</p>}
   <small>Search © OpenStreetMap contributors · Photon</small>
  </div>}
 </div>;
}
