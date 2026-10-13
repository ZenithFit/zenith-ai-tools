function zfEverfit(e){
  if(/Android/i.test(navigator.userAgent)){
    e.preventDefault();
    window.location.href='intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.everfit;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.everfit;end';
    return false;
  }
  return true;
}
// Zenith HQ shared gate + helpers. Runs before paint so logged out visitors never see the page.
const API='https://zenith-fit.mark-5a5.workers.dev';
(function(){
  let t='';try{t=localStorage.getItem('zenith_token')||'';}catch(e){}
  if(!t){
    const here=location.pathname.split('/').pop()||'hq.html';
    location.replace('login.html?next='+encodeURIComponent(here));
    return;
  }
  window.ZENITH={token:t,name:'',programme:''};
  try{
    window.ZENITH.name=localStorage.getItem('zenith_name')||'';
    window.ZENITH.programme=localStorage.getItem('zenith_programme')||'';
  }catch(e){}
  function paint(){
    const first=(window.ZENITH.name||'there').split(' ')[0];
    document.querySelectorAll('[data-first-name]').forEach(el=>{el.textContent=first;});
    const d=new Date();
    document.querySelectorAll('[data-today]').forEach(el=>{el.textContent=d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',paint);}else{paint();}
  // Quiet check with the Worker. Dead token means back to the login, fresh name means we use it.
  fetch(API+'/auth/me',{headers:{'Authorization':'Bearer '+t}}).then(function(r){
    if(r.status===401){zenithLogout(true);return null;}
    return r.ok?r.json():null;
  }).then(function(d){
    if(!d||!d.name)return;
    window.ZENITH.name=d.name;window.ZENITH.programme=d.programme||'';
    try{localStorage.setItem('zenith_name',d.name);localStorage.setItem('zenith_programme',d.programme||'');}catch(e){}
    paint();
  }).catch(function(){});
})();
function zenithLogout(silent){
  let t='';try{t=localStorage.getItem('zenith_token')||'';}catch(e){}
  const done=function(){
    try{
      localStorage.removeItem('zenith_token');
      localStorage.removeItem('zenith_name');
      localStorage.removeItem('zenith_programme');
    }catch(e){}
    location.replace('login.html');
  };
  if(silent||!t){done();return;}
  fetch(API+'/auth/logout',{method:'POST',headers:{'Authorization':'Bearer '+t}}).catch(function(){}).finally(done);
}

// v25 sidebar: Rate Your Day streak ring + Start Here progress (desktop only)
(function(){
  function run(){
    if(!document.getElementById('sx-ring'))return;
    if(!window.matchMedia||!window.matchMedia('(min-width:900px)').matches)return;
    let t='';try{t=localStorage.getItem('zenith_token')||'';}catch(e){}
    if(!t)return;
    const H={headers:{'Authorization':'Bearer '+t}};
    const key=function(dt){const p=n=>String(n).padStart(2,'0');return dt.getFullYear()+'-'+p(dt.getMonth()+1)+'-'+p(dt.getDate());};
    fetch(API+'/entries?tool='+encodeURIComponent('Daily Review')+'&limit=120',H).then(r=>r.ok?r.json():null).then(function(d){
      if(!d||!Array.isArray(d.entries))return;
      const by={};d.entries.forEach(function(e){if(e.tool==='Daily Review'&&e.data&&e.data.date)by[e.data.date]=1;});
      const now=new Date();let s=0;const st=by[key(now)]?0:1;
      for(let i=st;i<400;i++){const dt=new Date(now);dt.setDate(now.getDate()-i);if(by[key(dt)])s++;else break;}
      const done=!!by[key(now)];
      const goal=s>=30?100:s>=14?30:s>=7?14:7;
      document.getElementById('sx-num').textContent=s;
      document.getElementById('sx-arc').setAttribute('stroke-dashoffset',(119.4*(1-Math.min(s,goal)/goal)).toFixed(1));
      document.getElementById('sx-t').textContent=s===0?'Rate Your Day':(s===1?'1 day streak':s+' day streak');
      document.getElementById('sx-s').textContent=done?'Today\u2019s rated. Nice.':(s>0?'Rate today before bed':'Start your streak tonight');
    }).catch(function(){});
    fetch(API+'/entries?tool='+encodeURIComponent('Start Checklist')+'&limit=100',H).then(r=>r.ok?r.json():null).then(function(d){
      if(!d||!Array.isArray(d.entries))return;
      const req=['app','forms','appvids','goal','imin'];const st={};
      d.entries.forEach(function(e){if(!e.data||!e.data.item)return;const w=e.data.when||0;if(!(e.data.item in st)||w>=st[e.data.item].w)st[e.data.item]={w:w,on:e.data.action!=='untick'};});
      const n=req.filter(k=>st[k]&&st[k].on).length;
      document.getElementById('sx-start').textContent=n>=req.length?'\u2713':n+'/'+req.length;
    }).catch(function(){});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
})();
