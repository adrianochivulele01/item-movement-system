// Authentication/data transport only. The module's HTML, styles and rendering stay native.
(() => {
 if(new URL(location.href).searchParams.get('tcms')!=='1'){location.replace('https://fernandocossa-bot.github.io/tcms-portal/module-launch.html');return;}
 const origin='https://fernandocossa-bot.github.io', parent=window.opener;
 const channel='tcms-item-movement-v1', waiting=new Map(), listeners=new Set();
 let session=null,stopped=false;
 const request=(method,params={})=>new Promise((resolve,reject)=>{
  if(!parent||parent.closed||stopped)return reject(Error('Return to the TCMS Portal to open this module.'));
  const id=crypto.randomUUID();const timer=setTimeout(()=>{waiting.delete(id);reject(Error('Portal connection unavailable. Reopen the module from TCMS.'));},30000);
  waiting.set(id,{resolve,reject,timer});parent.postMessage({channel,id,method,params},origin);
 });
 function signedOut(){session=null;for(const fn of listeners)Promise.resolve(fn('SIGNED_OUT',null)).catch(console.error);}
 window.addEventListener('message',e=>{
  if(e.origin!==origin||e.source!==parent||e.data?.channel!==channel)return;
  const call=waiting.get(e.data.id);if(!call)return;waiting.delete(e.data.id);clearTimeout(call.timer);
  if(e.data.error){if(e.data.denied)signedOut();call.reject(Error(e.data.error));}else call.resolve(e.data.data);
 });
 window.TCMSOriginalClient={
  rpc:async(name,params={})=>{try{return {data:await request('rpc',{name,args:params}),error:null};}catch(error){return {data:null,error};}},
  auth:{
   onAuthStateChange(fn){listeners.add(fn);request('session').then(data=>{if(stopped)return;session=data;return fn('SIGNED_IN',session);}).catch(error=>{const m=document.getElementById('auth-message');if(m)m.textContent=error.message;});return {data:{subscription:{unsubscribe:()=>listeners.delete(fn)}}};},
   async signOut(){stopped=true;signedOut();location.replace('https://fernandocossa-bot.github.io/tcms-portal/logistics.html');return {error:null};},
   async signInWithPassword(){return {error:Error('Sign in at the TCMS Portal, then open this module again.')};}
  }
 };
})();
