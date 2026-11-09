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
