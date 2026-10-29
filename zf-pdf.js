// Zenith HQ PDF viewer (29 Oct 2026).
// Every PDF in HQ (guides, worksheets) opens inside HQ with a Back button and a Save button,
// so nobody gets stranded in a PDF with no way back, and saving works on phones.
(function(){
  var LIB='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  var libP=null, ov=null, blob=null, cur=null, pushed=false, job=0;

  function loadLib(){
    if(libP)return libP;
    libP=new Promise(function(res,rej){
      var s=document.createElement('script');s.src=LIB+'pdf.min.js';
      s.onload=function(){try{window.pdfjsLib.GlobalWorkerOptions.workerSrc=LIB+'pdf.worker.min.js';res(window.pdfjsLib);}catch(e){rej(e);}};
      s.onerror=rej;document.head.appendChild(s);
    });
    return libP;
  }

  function nice(file){
    var n=decodeURIComponent(file.split('/').pop().replace(/\.pdf$/i,'')).replace(/[-_]+/g,' ').trim();
    var ws=/^worksheet /i.test(n);
    if(ws)n=n.replace(/^worksheet /i,'')+' worksheet';
    return n;
  }

  function build(){
    if(ov)return ov;
    var st=document.createElement('style');
    st.textContent=
      '.zfp{position:fixed;inset:0;z-index:9999;background:#F4F6F5;display:none;flex-direction:column}'+
      '.zfp.on{display:flex}'+
      '.zfp-bar{flex:none;background:#000000;color:#FFFFFF;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;display:flex;align-items:center;gap:10px}'+
      '.zfp-t{flex:1;min-width:0;font:600 15px "Inter Tight",system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}'+
      '.zfp-b{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.28);background:transparent;color:#FFFFFF;border-radius:999px;padding:9px 14px;font:600 15px "Inter Tight",system-ui,sans-serif;cursor:pointer}'+
      '.zfp-b svg{width:16px;height:16px}'+
      '.zfp-s{background:#3FD494;border-color:#3FD494;color:#0C0F11;box-shadow:0 0 20px -4px rgba(63,212,148,.7)}'+
      '.zfp-b:focus-visible{outline:3px solid #3FD494;outline-offset:2px}'+
      '.zfp-body{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 10px calc(env(safe-area-inset-bottom,0px) + 24px)}'+
      '.zfp-body canvas{display:block;width:100%;max-width:820px;height:auto;margin:0 auto 12px;background:#FFFFFF;border-radius:6px;box-shadow:0 1px 0 rgba(0,0,0,.06)}'+
      '.zfp-msg{max-width:520px;margin:40px auto;text-align:center;color:#4A4F4D;font:16px/1.5 "Inter Tight",system-ui,sans-serif}'+
      '.zfp-tip{display:none;max-width:820px;margin:0 auto 12px;background:#0C0F11;color:#FFFFFF;border-radius:14px;padding:14px 16px;font:15px/1.45 "Inter Tight",system-ui,sans-serif}'+
      '.zfp-tip b{color:#3FD494}'+
      '.zfp-tip.on{display:block}';
    document.head.appendChild(st);
    ov=document.createElement('div');ov.className='zfp';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
    ov.innerHTML=
      '<div class="zfp-bar">'+
        '<button type="button" class="zfp-b" data-x="back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Back</button>'+
        '<div class="zfp-t"></div>'+
        '<button type="button" class="zfp-b zfp-s" data-x="save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>Save</button>'+
      '</div>'+
      '<div class="zfp-body"><div class="zfp-tip"></div><div class="zfp-pages"></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('[data-x="back"]').addEventListener('click',function(){ if(pushed){history.back();}else{close();} });
    ov.querySelector('[data-x="save"]').addEventListener('click',save);
    window.addEventListener('popstate',function(){ if(ov.classList.contains('on')){pushed=false;close();} });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&ov.classList.contains('on')){ if(pushed)history.back();else close(); } });
    return ov;
  }

  function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}

  function tip(html){var t=ov.querySelector('.zfp-tip');t.innerHTML=html;t.classList.add('on');}

  function save(){
    if(!cur)return;
    var name='Zenith Fit '+cur.title+'.pdf';
    // Phones: the share sheet is the reliable way. It gives Save to Files, Books, WhatsApp, email.
    if(blob&&navigator.canShare){
      try{
        var f=new File([blob],name,{type:'application/pdf'});
        if(navigator.canShare({files:[f]})){
          navigator.share({files:[f],title:cur.title}).catch(function(e){ if(e&&e.name!=='AbortError')download(name); });
          return;
        }
      }catch(e){}
    }
    download(name);
    if(isIOS())tip('<b>Not saving?</b> Some apps block downloads. Tap the &bull;&bull;&bull; or share icon at the top or bottom of your screen, choose <b>Open in Safari</b>, then tap Save again.');
  }

  function download(name){
    var a=document.createElement('a');
    a.href=blob?URL.createObjectURL(blob):cur.url;a.download=name;a.rel='noopener';
    document.body.appendChild(a);a.click();
    setTimeout(function(){ if(blob)URL.revokeObjectURL(a.href); a.remove(); },4000);
  }

  function close(){
    if(!ov)return;
    job++;ov.classList.remove('on');
    ov.querySelector('.zfp-pages').innerHTML='';ov.querySelector('.zfp-tip').classList.remove('on');
    document.documentElement.style.overflow='';document.body.style.overflow='';
    var from=cur&&cur.from;blob=null;cur=null;
    if(from)try{from.focus();}catch(e){}
  }

  function open(url,title,from){
    build();var my=++job;
    cur={url:url,title:title,from:from};blob=null;
    ov.querySelector('.zfp-t').textContent=title;
    var pages=ov.querySelector('.zfp-pages');
    pages.innerHTML='<p class="zfp-msg">Opening your guide...</p>';
    ov.querySelector('.zfp-tip').classList.remove('on');
    ov.classList.add('on');ov.querySelector('.zfp-body').scrollTop=0;
    document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
    try{history.pushState({zfpdf:1},'');pushed=true;}catch(e){pushed=false;}
    ov.querySelector('[data-x="back"]').focus();
    Promise.all([loadLib(),fetch(url).then(function(r){if(!r.ok)throw new Error('missing');return r.arrayBuffer();})]).then(function(x){
      if(my!==job)return;
      var lib=x[0],buf=x[1];
      blob=new Blob([buf],{type:'application/pdf'});
      return lib.getDocument({data:new Uint8Array(buf.slice(0))}).promise.then(function(doc){
        if(my!==job)return;
        pages.innerHTML='';
        var w=Math.min(pages.clientWidth||window.innerWidth,820),dpr=Math.min(window.devicePixelRatio||1,2);
        var n=0;
        function next(){
          if(my!==job||n>=doc.numPages)return;
          n++;
          return doc.getPage(n).then(function(pg){
            var v1=pg.getViewport({scale:1}),scale=Math.min((w*dpr)/v1.width,1600/v1.width),vp=pg.getViewport({scale:scale});
            var c=document.createElement('canvas');c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);
            c.setAttribute('aria-label',title+', page '+n);
            pages.appendChild(c);
            return pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
          }).then(next);
        }
        return next();
      });
    }).catch(function(){
      if(my!==job)return;
      pages.innerHTML='<p class="zfp-msg">That one didn&rsquo;t open. Tap Save to get it onto your phone, or message me and I&rsquo;ll send it over.</p>';
    });
  }

  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a)return;
    var href=a.getAttribute('href')||'';
    if(!/\.pdf(\?|#|$)/i.test(href)||/^https?:/i.test(href)&&a.host!==location.host)return;
    if(e.metaKey||e.ctrlKey||e.shiftKey)return;
    e.preventDefault();
    var label=(a.getAttribute('aria-label')||'').replace(/^View\s+/i,'').trim();
    var card=a.closest('.pdf'),pt=card&&card.querySelector('.pt');
    var title=label||(pt&&pt.textContent.trim())||nice(href);
    open(a.href,title,a);
  });
})();
