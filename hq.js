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
