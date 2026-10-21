/* Zenith Fit: "Save this to your phone" box under every tool result.
   Add to a page with: <script src="zf-save.js?v=1" data-targets="#result" defer></script>
   It watches the result area, and once a result shows it adds the box underneath:
   steps for the phone they're on (iPhone, Android or computer) plus a Copy it button. */
(function(){
  var me=document.currentScript||document.querySelector('script[src*="zf-save.js"]');
  var SEL=(me&&me.getAttribute('data-targets'))||'#result,#results';
  var ua=navigator.userAgent||'';
  var IOS=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
  var AND=/Android/i.test(ua);
  var DEV=IOS?'ios':(AND?'and':'pc');

  var css='.zfs{margin-top:22px;border-radius:18px;padding:16px 18px;font:400 14.5px/1.5 "Inter Tight","DM Sans",system-ui,sans-serif;text-align:left;background:#F4F6F5;color:#4A4F4D;border:1px solid #E3E8E6}'+
  '.zfs.dk{background:rgba(255,255,255,.06);color:#BFC6C3;border-color:rgba(255,255,255,.12)}'+
  '.zfs-h{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}'+
  '.zfs-t{font-weight:700;font-size:15.5px;color:#111111;display:flex;align-items:center;gap:8px;margin:0}'+
  '.zfs.dk .zfs-t{color:#FFFFFF}'+
  '.zfs-copy{border:0;cursor:pointer;background:#00A86B;color:#FFFFFF;font:600 14px "Inter Tight","DM Sans",system-ui,sans-serif;padding:9px 16px;border-radius:999px;display:inline-flex;align-items:center;gap:7px}'+
  '.zfs-copy:hover{background:#008755}.zfs.dk .zfs-copy{background:#3FD494;color:#0C0F11}'+
  '.zfs-copy:focus-visible,.zfs-sw button:focus-visible{outline:3px solid #3FD494;outline-offset:2px}'+
  '.zfs ol{margin:12px 0 0;padding-left:20px}.zfs li{margin:5px 0}.zfs li b{color:#111111}.zfs.dk li b{color:#FFFFFF}'+
  '.zfs-note{margin:10px 0 0;font-size:13.5px}'+
  '.zfs-sw{margin-top:10px;font-size:13px}.zfs-sw button{background:none;border:0;padding:0;margin-right:14px;color:#00A86B;font:600 13px inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'+
  '.zfs.dk .zfs-sw button{color:#3FD494}'+
  '@media print{.zfs{display:none!important}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var STEPS={
    ios:{name:'iPhone',ol:['Press the <b>side button and volume up</b> together to take a screenshot.','Tap the little preview that pops up in the corner.','Tap <b>Full Page</b> at the top. That grabs the whole thing, not just what&rsquo;s on screen.','Tap <b>Done</b>, then <b>Save PDF to Files</b>.'],note:'Don&rsquo;t see Full Page? Don&rsquo;t panic, just take a few screenshots as you scroll.'},
    and:{name:'Android',ol:['Press <b>power and volume down</b> together.','Tap <b>Capture more</b> (it might be a down arrow).','Keep tapping till you&rsquo;ve got the lot, then save.'],note:''},
    pc:{name:'computer',ol:['Press <b>Ctrl + P</b> (or <b>Cmd + P</b> on a Mac).','Change the printer to <b>Save as PDF</b>.','Click <b>Save</b>.'],note:''}
  };
  function body(dev){
    var s=STEPS[dev];
    return '<ol>'+s.ol.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>'+(s.note?'<p class="zfs-note">'+s.note+'</p>':'')+
      '<p class="zfs-note">Or just tap <b>Copy it</b> and paste it into your Notes. Nice and straightforward.</p>';
  }
  function others(dev){
    return ['ios','and','pc'].filter(function(d){return d!==dev;}).map(function(d){return '<button type="button" data-d="'+d+'">On '+(d==='pc'?'a computer':(d==='ios'?'an iPhone':'Android'))+'?</button>';}).join('');
  }
  function isDark(el){
    var c=getComputedStyle(el).color.match(/\d+/g);if(!c)return false;
    return (0.299*c[0]+0.587*c[1]+0.114*c[2])>160;
  }
  function textOf(el){
    var clone=el.cloneNode(true);
    [].forEach.call(clone.querySelectorAll('.zfs,button,script,style,input,textarea,select'),function(n){n.remove();});
    var t=(clone.innerText||clone.textContent||'').replace(/\n{3,}/g,'\n\n').trim();
    return t+'\n\nZenith Fit';
  }
  function copy(text,btn){
    function ok(){btn.innerHTML='<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied';setTimeout(function(){btn.textContent='Copy it';},2200);}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(ok,fallback);}else fallback();
    function fallback(){var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){btn.textContent='Press and hold to copy';}ta.remove();}
  }
  function add(el){
    if(el.querySelector(':scope > .zfs'))return;
    var box=document.createElement('div');box.className='zfs'+(isDark(el)?' dk':'');
    box.setAttribute('role','region');box.setAttribute('aria-label','Save this to your phone');
    box.innerHTML='<div class="zfs-h"><p class="zfs-t"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>Save this to your '+(DEV==='pc'?'computer':'phone')+'</p><button type="button" class="zfs-copy">Copy it</button></div><div class="zfs-b">'+body(DEV)+'</div><div class="zfs-sw">'+others(DEV)+'</div>';
    box.querySelector('.zfs-copy').addEventListener('click',function(){copy(textOf(el),this);});
    box.querySelector('.zfs-sw').addEventListener('click',function(e){
      var d=e.target.getAttribute&&e.target.getAttribute('data-d');if(!d)return;
      box.querySelector('.zfs-b').innerHTML=body(d);this.innerHTML=others(d);
      box.querySelector('.zfs-t').lastChild.textContent='Save this to your '+(d==='pc'?'computer':'phone');
    });
    el.appendChild(box);
  }
  function visible(el){return !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length)&&getComputedStyle(el).visibility!=='hidden';}
  function scan(){
    [].forEach.call(document.querySelectorAll(SEL),function(el){
      var has=el.querySelector(':scope > .zfs');
      var len=(el.textContent||'').length-(has?has.textContent.length:0);
      if(visible(el)&&len>60&&!has)add(el);
    });
  }
  var t=null;function soon(){clearTimeout(t);t=setTimeout(scan,250);}
  function start(){
    scan();
    try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var n=ms[i].target;if(n.closest&&n.closest('.zfs'))continue;soon();return;}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});}catch(e){setInterval(scan,1500);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
