const C="moka-cart-v10";
self.addEventListener("push",e=>{
  let d={};try{d=e.data?e.data.json():{};}catch(_){}
  e.waitUntil(self.registration.showNotification(d.title||"MOKA",{body:d.body||"New bill added",tag:d.tag||"moka-bill",data:{url:"./"}}));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{for(const c of l){if("focus" in c)return c.focus();}return clients.openWindow("./");}));
});
const PRECACHE=["./","./index.html","./sw.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.hostname.indexOf("supabase")>=0){return;} // never cache live data / realtime
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res;}).catch(()=>caches.match("./index.html"))));
});
