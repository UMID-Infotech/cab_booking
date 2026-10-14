// Public demo services are shared infrastructure. Queue requests and cache successes.
export function createJsonClient({gapMs=1100,timeoutMs=18000,maxEntries=100}={}) {
  let queue=Promise.resolve(),lastStart=0;
  const cache=new Map();
  const abortError=()=>new DOMException('Request cancelled','AbortError');
  const wait=(ms,signal)=>new Promise((resolve,reject)=>{
    if(signal?.aborted)return reject(abortError());
    const done=()=>{signal?.removeEventListener('abort',cancel);resolve();};
    const timer=setTimeout(done,ms);
    const cancel=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);reject(abortError());};
    signal?.addEventListener('abort',cancel,{once:true});
  });
  return function getJson(url,{signal,ttl=300000}={}) {
    if(signal?.aborted)return Promise.reject(abortError());
    const cached=cache.get(url);
    if(cached && cached.expires>Date.now())return Promise.resolve(cached.data);
    const task=queue.catch(()=>{}).then(async()=>{
      if(signal?.aborted)throw abortError();
      const cached=cache.get(url);if(cached && cached.expires>Date.now())return cached.data;
      await wait(Math.max(0,gapMs-(Date.now()-lastStart)),signal);
      lastStart=Date.now();
      const controller=new AbortController();
      const cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});
      if(signal?.aborted)controller.abort();
      const timer=setTimeout(()=>controller.abort(),timeoutMs);
      try {
        const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
        if(!response.ok)throw new Error(response.status===429?'The public demo service is busy. Wait a moment and try again.':`Map service returned HTTP ${response.status}. Please retry.`);
        const data=await response.json();
        cache.set(url,{data,expires:Date.now()+ttl});if(cache.size>maxEntries)cache.delete(cache.keys().next().value);
        return data;
      }catch(e){
        if(signal?.aborted)throw abortError();
        if(e.name==='AbortError')throw new Error('The map service timed out. Check your connection and retry.');
        if(e instanceof TypeError)throw new Error('Could not reach the open-source map service. Check your internet connection and retry.');
        throw e;
      }finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
    });
    queue=task.catch(()=>{});return task;
  };
}
