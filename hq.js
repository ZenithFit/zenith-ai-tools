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
    window.ZENITH.me=JSON.parse(localStorage.getItem('zf_me')||'null');
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
    window.ZENITH.name=d.name;window.ZENITH.programme=d.programme||'';window.ZENITH.me=d;
    try{localStorage.setItem('zenith_name',d.name);localStorage.setItem('zenith_programme',d.programme||'');localStorage.setItem('zf_me',JSON.stringify({hq_programme:d.hq_programme||'',start_date:d.start_date||'',message:d.message||''}));}catch(e){}
    paint();
    try{document.dispatchEvent(new CustomEvent('zf-me',{detail:d}));}catch(e){}
  }).catch(function(){});
})();
function zenithLogout(silent){
  let t='';try{t=localStorage.getItem('zenith_token')||'';}catch(e){}
  const done=function(){
    try{
      localStorage.removeItem('zenith_token');
      localStorage.removeItem('zenith_name');
      localStorage.removeItem('zenith_programme');
      localStorage.removeItem('zf_me');
    }catch(e){}
    location.replace('login.html');
  };
  if(silent||!t){done();return;}
  fetch(API+'/auth/logout',{method:'POST',headers:{'Authorization':'Bearer '+t}}).catch(function(){}).finally(done);
}

// Videos for the welcome card and the How to use HQ page. Paste the Vimeo or YouTube links in here when they're filmed.
window.ZF_VIDEOS={
  welcome:'https://vimeo.com/1238369519/914e6c1645',
  tour:''
};

// Health data consent gate (GDPR): nobody gets into HQ without it.
if(window.ZFC)ZFC.gate();
