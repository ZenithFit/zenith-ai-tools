/* Zenith Fit health data consent (GDPR).
   ZFC.gate()          full screen consent card for logged in HQ pages
   ZFC.tick(button, o) required tick above a tool's submit button
   ZFC.stamp(message)  adds the consent version to a Sheet message
   ZFC.signupBox(el)   the tick on signup.html                          */
(function () {
  var API = 'https://zenith-fit.mark-5a5.workers.dev';
  var SHEETS = 'https://script.google.com/macros/s/AKfycbxt7ov_pKLeyjg8p-VnFXE4ewsAH7U8HKm8RVnXU3WBbJuaUU3zssefBmlUjProH1HO/exec';
  var VERSION = 'v1 Oct 2026';
  var KEY = 'zf_consent';
  var PRIVACY = 'https://www.zenithfit.co.uk/privacy';
  var LINK = '<a href="' + PRIVACY + '" target="_blank" rel="noopener">Privacy Notice</a>';
  var LONG = 'I agree to Zenith Fit storing and using the health and wellbeing information I share (such as my weight, measurements, food, training, sleep, mood and any health conditions) so Mark can coach me. I understand it&rsquo;s stored securely with the services listed in the ' + LINK + ', and I can withdraw my consent at any time by messaging Mark.';
  var SHORT = 'I agree to Zenith Fit storing what I enter here to support my coaching, as explained in the ' + LINK + '.';

  function token() { try { return localStorage.getItem('zenith_token') || ''; } catch (e) { return ''; } }
  function remembered() { try { return localStorage.getItem(KEY) === VERSION; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, VERSION); } catch (e) {} }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }

  var meCall = null;
  function me() {
    if (!meCall) {
      var t = token();
      meCall = !t ? Promise.resolve(null) :
        fetch(API + '/auth/me', { headers: { 'Authorization': 'Bearer ' + t } })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
    }
    return meCall;
  }

  function logSheet(name, where) {
    var when = new Date().toISOString();
    fetch(SHEETS, {
      method: 'POST', mode: 'no-cors',
      body: JSON.stringify({
        tool: 'Health Consent',
        message: 'Consent given ' + when + ' via ' + where + ' (' + VERSION + ')',
        field1_label: 'Name', field1_value: name || '',
        field2_label: 'Version', field2_value: VERSION,
        field3_label: 'Where', field3_value: where,
        field4_label: 'Timestamp', field4_value: when
      })
    }).catch(function () {});
  }

  var cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true;
    var s = document.createElement('style');
    s.textContent =
      '.zc{display:flex;gap:12px;align-items:flex-start;background:#20272B;border:1px solid #333C41;border-radius:14px;padding:14px 16px;margin:18px 0 14px;cursor:pointer;text-align:left;transition:border-color .15s,box-shadow .15s}' +
      '.zc input{-webkit-appearance:none;appearance:none;width:22px;height:22px;min-width:22px;border:2px solid #4C555B;border-radius:6px;margin:2px 0 0;background:#1B2126;cursor:pointer;position:relative;padding:0}' +
      '.zc input:checked{background:#3FD494;border-color:#3FD494}' +
      '.zc input:checked:after{content:"";position:absolute;left:6px;top:2px;width:6px;height:11px;border:solid #0C0F11;border-width:0 2.5px 2.5px 0;transform:rotate(45deg)}' +
      '.zc span{font-family:"DM Sans",system-ui,sans-serif;font-size:15px;line-height:1.55;color:#BFC6C3;font-weight:500;letter-spacing:0;text-transform:none}' +
      '.zc a{color:#3FD494;font-weight:700;text-decoration:underline;text-underline-offset:2px}' +
      '.zc.on{border-color:rgba(63,212,148,.45)}' +
      '.zc.nudge{border-color:#E5776A;box-shadow:0 0 0 3px rgba(229,119,106,.18)}' +
      '.zc-l{background:#FFFFFF;border-color:#E2E5E3}.zc-l span{color:#4A4F4D}.zc-l a{color:#00A86B}' +
      '.zc-l input{background:#FFFFFF;border-color:#B9BFBC}.zc-l input:checked{background:#00A86B;border-color:#00A86B}.zc-l input:checked:after{border-color:#FFFFFF}' +
      '.zc-l.on{border-color:rgba(0,168,107,.45)}' +
      '.zc-msg{display:none;font-family:"DM Sans",system-ui,sans-serif;font-size:15px;font-weight:700;color:#E5776A;margin:-6px 0 12px}' +
      '.zc-l+.zc-msg{color:#C0432F}' +
      '.zg{position:fixed;inset:0;z-index:2147483000;background:rgba(12,15,17,.96);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}' +
      '.zg-card{width:100%;max-width:520px;margin:auto;background:#242B30;border:1px solid #333C41;border-radius:22px;padding:26px 22px 22px;box-shadow:0 30px 80px rgba(0,0,0,.5);font-family:"DM Sans",system-ui,sans-serif}' +
      '.zg-k{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#3FD494;margin-bottom:10px}' +
      '.zg h2{font-family:"Oswald",Impact,sans-serif;font-weight:600;text-transform:uppercase;font-size:30px;line-height:1.05;color:#FFFFFF;margin:0}' +
      '.zg p{font-size:15px;line-height:1.55;color:#BFC6C3;margin:12px 0 0}' +
      '.zg-btn{display:block;width:100%;margin-top:4px;border:0;border-radius:999px;padding:16px;font-size:16px;font-weight:800;background:#00A86B;color:#FFFFFF;font-family:"DM Sans",system-ui,sans-serif;cursor:pointer}' +
      '.zg-btn:hover{background:#008755}' +
      '.zg-btn[disabled]{background:#333C41;color:#8A938F;cursor:default}' +
      '.zg-err{display:none;color:#E5776A;font-size:15px;font-weight:700;margin-top:12px;text-align:center}' +
      '.zg-f{text-align:center;font-size:13px;color:#8A938F;margin-top:14px}' +
      'html.zg-wait body{visibility:hidden}';
    (document.head || document.documentElement).appendChild(s);
  }

  function makeBox(text, light) {
    css();
    var label = document.createElement('label');
    label.className = 'zc' + (light ? ' zc-l' : '');
    var input = document.createElement('input');
    input.type = 'checkbox';
    var span = document.createElement('span');
    span.innerHTML = text;
    label.appendChild(input);
    label.appendChild(span);
    input.addEventListener('change', function () { label.classList.toggle('on', input.checked); label.classList.remove('nudge'); });
    span.querySelector('a').addEventListener('click', function (e) { e.stopPropagation(); });
    return { label: label, input: input };
  }

  // ---------- HQ gate ----------
  function gate() {
    if (!token()) return;
    css();
    // Hide the page until we know, unless this phone already has consent on record.
    var waiting = !remembered();
    if (waiting) {
      document.documentElement.classList.add('zg-wait');
      setTimeout(function () { document.documentElement.classList.remove('zg-wait'); }, 4000);
    }
    me().then(function (d) {
      document.documentElement.classList.remove('zg-wait');
      if (!d || !d.consent) return; // not logged in, or older Worker: let the page carry on
      if (d.consent.given) { remember(); return; }
      forget();
      if (document.body) showGate(d.name);
      else document.addEventListener('DOMContentLoaded', function () { showGate(d.name); });
    });
  }

  function showGate(name) {
    var wrap = document.createElement('div');
    wrap.className = 'zg';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML =
      '<div class="zg-card"><div class="zg-k">Before you go in</div><h2>One quick thing.</h2>' +
      '<p>To coach you properly I need your OK to store the health stuff you share with me. Have a read, tick the box, and you&rsquo;re in.</p>' +
      '<div class="zg-slot"></div>' +
      '<button type="button" class="zg-btn" disabled>I agree</button>' +
      '<div class="zg-err"></div>' +
      '<div class="zg-f">Not sure about something? Message Mark.</div></div>';
    var box = makeBox(LONG, false);
    wrap.querySelector('.zg-slot').appendChild(box.label);
    var btn = wrap.querySelector('.zg-btn');
    var err = wrap.querySelector('.zg-err');
    box.input.addEventListener('change', function () { btn.disabled = !box.input.checked; });
    btn.addEventListener('click', function () {
      if (!box.input.checked) return;
      btn.disabled = true; btn.textContent = 'Saving...'; err.style.display = 'none';
      fetch(API + '/auth/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        body: JSON.stringify({ agree: true })
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || !res.j.consent || !res.j.consent.given) throw new Error((res.j && res.j.error) || 'fail');
          remember();
          logSheet(res.j.name || name, 'HQ');
          wrap.remove();
          document.documentElement.style.overflow = '';
          try { window.dispatchEvent(new Event('zf-consent')); } catch (e) {}
        })
        .catch(function () {
          err.textContent = 'That didn\u2019t save. Check your signal and tap I agree again.';
          err.style.display = 'block';
          btn.disabled = false; btn.textContent = 'I agree';
        });
    });
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(wrap);
  }

  // ---------- tool tick ----------
  function tick(button, opts) {
    if (!button) return;
    opts = opts || {};
    var box = makeBox(SHORT, opts.light !== false);
    var msg = document.createElement('div');
    msg.className = 'zc-msg';
    msg.textContent = 'Tick the box above first.';
    var anchor = opts.before || button;
    anchor.parentNode.insertBefore(box.label, anchor);
    anchor.parentNode.insertBefore(msg, anchor);
    var ok = false;
    function setOk(v) {
      ok = v;
      box.label.style.display = v ? 'none' : '';
      if (v) msg.style.display = 'none';
    }
    if (remembered()) setOk(true);
    box.input.addEventListener('change', function () {
      if (box.input.checked) { remember(); ok = true; msg.style.display = 'none'; }
      else { forget(); ok = false; }
    });
    // Logged into HQ: their account decides, same as the name field.
    me().then(function (d) {
      if (!d || !d.consent) return;
      if (d.consent.given) { remember(); setOk(true); }
      else { forget(); box.input.checked = false; box.label.classList.remove('on'); setOk(false); }
    });
    button.addEventListener('click', function (e) {
      if (ok) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      box.label.classList.add('nudge');
      msg.style.display = 'block';
      box.label.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, true);
  }

  function stamp(message) {
    return (message || '') + '\n\nConsent: ' + VERSION;
  }

  function signupBox(beforeEl) {
    var box = makeBox(LONG, false);
    beforeEl.parentNode.insertBefore(box.label, beforeEl);
    return box.input;
  }

  window.ZFC = {
    VERSION: VERSION, gate: gate, tick: tick, stamp: stamp,
    signupBox: signupBox, logSheet: logSheet, remember: remember, forget: forget
  };
})();
