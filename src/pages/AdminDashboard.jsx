import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Save,Search,Download,Upload,RotateCcw,MapPin,Check,X,IndianRupee,Activity} from 'lucide-react';
import {defaultRates,normalizeRates,saveRates} from '../lib/rates.js';
import {money} from '../lib/pricing.js';
export default function AdminDashboard({rates}){
 const [draft,setDraft]=useState(()=>rates.map(c=>({...c}))),[filter,setFilter]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState('');
 const importInput=useRef(null);
 useEffect(()=>{setDraft(rates.map(c=>({...c})));},[rates]);
 const dirty=JSON.stringify(draft.map(c=>[c.id,c.ratePerKm,c.enabled]))!==JSON.stringify(rates.map(c=>[c.id,c.ratePerKm,c.enabled]));
 const filtered=draft.filter(c=>c.city.toLowerCase().includes(filter.trim().toLowerCase()));
 const active=draft.filter(c=>c.enabled!==false),prices=active.map(c=>Number(c.ratePerKm)).filter(Number.isFinite);
 const edit=(id,changes)=>{setDraft(d=>d.map(c=>c.id===id?{...c,...changes}:c));setMessage('');setError('');};
 const save=()=>{
  try{const records=draft.map(c=>({...c,ratePerKm:typeof c.ratePerKm==='string'&&c.ratePerKm.trim()===''?NaN:Number(c.ratePerKm)}));saveRates(records);setMessage('City rates saved. The calculator now uses these rates in this browser.');setError('');}
  catch(e){setError(e.message);setMessage('');}
 };
 const download=()=>{
  try{
   const clean=normalizeRates(draft.map(c=>({...c,ratePerKm:typeof c.ratePerKm==='string'&&c.ratePerKm.trim()===''?NaN:Number(c.ratePerKm)})));
   const payload=clean.map(({id,ratePerKm,enabled})=>({id,ratePerKm,enabled}));
   const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='cityride-rates.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setError(e.message);}
 };
 const importFile=async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{if(file.size>100000)throw new Error('Choose a rate JSON file smaller than 100 KB.');const records=normalizeRates(JSON.parse(await file.text()));setDraft(records);setMessage('Rates imported into the editor. Click Save changes to apply them.');setError('');}
  catch(e){setError(`Could not import rates: ${e.message}`);setMessage('');}finally{event.target.value='';}
 };
 return <main className="admin-main container">
  <div className="admin-heading"><div><p className="eyebrow">CITYRIDE DEMO ADMIN</p><h1>City pricing dashboard</h1><p>Set the per-kilometre price for each pickup city.</p></div><a className="secondary-button" href="/"><ArrowLeft size={16}/>Open calculator</a></div>
  <div className="admin-scope"><strong>Browser-local demo settings</strong><p>Changes apply to the calculator in this browser and on this website origin. They are not shared across devices. This demo dashboard has no login.</p></div>
  <section className="admin-stats" aria-label="Pricing overview"><article><MapPin size={20}/><span>Total cities</span><strong>{draft.length}</strong></article><article><Activity size={20}/><span>Active pickup cities</span><strong>{active.length}</strong></article><article><IndianRupee size={20}/><span>Active rate range</span><strong>{prices.length?`${money(Math.min(...prices))} – ${money(Math.max(...prices))}`:'No active cities'}</strong></article></section>
  <section className="admin-card"><div className="admin-toolbar"><div><h2>Pickup city rates</h2><p>Only the pickup city determines the trip’s rate.</p></div><div className="city-search"><Search size={15}/><input aria-label="Search admin cities" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search cities"/></div></div>
   <div className="table-scroll"><table className="rates-table"><thead><tr><th>City</th><th>State or region</th><th>Rate per km</th><th>Status</th></tr></thead><tbody>{filtered.map(c=><tr key={c.id}><td><span className="table-city"><MapPin size={16}/>{c.city}</span></td><td>{c.state}</td><td><div className="rate-input"><span>₹</span><input aria-label={`${c.city} rate per km`} type="number" min="0.01" max="10000" step="0.01" value={c.ratePerKm} onChange={e=>edit(c.id,{ratePerKm:e.target.value})}/><small>/km</small></div></td><td><button className={`toggle-status ${c.enabled!==false?'on':''}`} role="switch" aria-checked={c.enabled!==false} aria-label={`${c.city} pickup service`} onClick={()=>edit(c.id,{enabled:c.enabled===false})}><span/>{c.enabled!==false?'Active':'Disabled'}</button></td></tr>)}</tbody></table>{!filtered.length&&<p className="no-results">No matching city.</p>}</div>
   <div className="admin-actions"><span>{dirty?'You have unsaved changes.':'All changes saved.'}</span><button className="secondary-button" onClick={()=>{setDraft(defaultRates());setError('');setMessage('Default rates loaded. Click Save changes to apply them.');}}><RotateCcw size={15}/>Restore defaults</button><button className="primary-button" onClick={save}><Save size={16}/>Save changes</button></div>
  </section>
  {error&&<div className="feedback error" role="alert">{error}</div>}{message&&<div className="feedback success" role="status"><Check size={16}/>{message}</div>}
  <div className="admin-transfer"><div><strong>Move your demo rates to another browser</strong><p>Export JSON, then import and save it on the other browser. The built-in defaults remain in src/data/cityRates.js.</p></div><button className="secondary-button" onClick={download}><Download size={15}/>Export JSON</button><button className="secondary-button" onClick={()=>importInput.current.click()}><Upload size={15}/>Import JSON</button><input ref={importInput} type="file" accept="application/json,.json" hidden onChange={importFile} aria-label="Import city rates JSON"/></div>
 </main>;
}
