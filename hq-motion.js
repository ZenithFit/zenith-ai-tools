/* Zenith HQ motion (Nov 2026): iPhone style press on tap, and a gentle one-time fade up as sections come into view. */
(function(){
  // lets :active fire on iPhone so taps can squish
  document.addEventListener('touchstart',function(){},{passive:true});
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver' in window))return;
  var SEL='.zc-card,.card,.rows,.vid-card,.pdf,.zt-tile,.zt-rows,.zt-feat,.std-card,.tool-card,.ms-link,.tour-open,.section-lbl,.zt-lbl,.opt,.strip,.hello,.q,.field,.block';
  var io=new IntersectionObserver(function(en){
    en.forEach(function(x){if(x.isIntersecting){var e=x.target;e.classList.add('zf-in');io.unobserve(e);setTimeout(function(){e.classList.remove('zf-rv','zf-in')},700);}});
  },{threshold:.08,rootMargin:'0px 0px -6% 0px'});
  function scan(){
    var vh=window.innerHeight||800;
    document.querySelectorAll(SEL).forEach(function(e){
      if(e.dataset.zfm)return; e.dataset.zfm='1';
      if(e.closest('.vmod,.modal,[role=dialog]'))return;
      var r=e.getBoundingClientRect();
      if(r.height===0||r.top<vh*0.92)return; // already on screen: leave it alone
      e.classList.add('zf-rv'); io.observe(e);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
  window.addEventListener('load',function(){setTimeout(scan,300)});
  setTimeout(scan,1200);
})();

/* Auto refresh (Nov 2026): when a new version of HQ goes up, phones pick it up on their own.
   Each time HQ is opened or brought back to the screen, it checks version.txt (never cached).
   If the number has changed since this phone last loaded, it reloads once with a fresh copy. */
(function(){
  try{
    var KEY='zf_hq_ver';
    function check(){
      fetch('version.txt?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.text():null;}).then(function(v){
        if(!v)return; v=v.trim();
        var have=localStorage.getItem(KEY);
        if(!have){localStorage.setItem(KEY,v);return;}
        if(have!==v){
          localStorage.setItem(KEY,v);
          var u=new URL(location.href);u.searchParams.set('v',v);
          location.replace(u.toString());
        }
      }).catch(function(){});
    }
    check();
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check();});
  }catch(e){}
})();
