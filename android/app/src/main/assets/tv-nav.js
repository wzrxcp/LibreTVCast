(function () {
  if (window.__tvNavInstalled) return;
  window.__tvNavInstalled = true;

  var FOCUS_CLASS = '__tv_focus';
  var current = null;

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    var s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return false;
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  }

  function candidates() {
    var sel = 'a,button,input,select,textarea,[role="button"],[tabindex],.cursor-pointer,[onclick]';
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    return els.filter(isVisible);
  }

  function setFocus(el) {
    if (!el) return;
    if (current && current !== el) current.classList.remove(FOCUS_CLASS);
    current = el;
    el.classList.add(FOCUS_CLASS);
    try { el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); } catch (e) {}
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (_) {} }
  }

  function center(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function findNext(dir) {
    var list = candidates();
    if (!list.length) return null;
    if (!current || !isVisible(current)) return list[0];
    var c = center(current);
    var best = null, bestDist = Infinity;
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el === current) continue;
      var p = center(el);
      var dx = p.x - c.x, dy = p.y - c.y;
      var ok = false, primary = 0, secondary = 0;
      if (dir === 'right') { ok = dx > 1; primary = Math.abs(dx); secondary = Math.abs(dy); }
      else if (dir === 'left') { ok = dx < -1; primary = Math.abs(dx); secondary = Math.abs(dy); }
      else if (dir === 'down') { ok = dy > 1; primary = Math.abs(dy); secondary = Math.abs(dx); }
      else if (dir === 'up') { ok = dy < -1; primary = Math.abs(dy); secondary = Math.abs(dx); }
      if (!ok) continue;
      if (secondary > Math.max(primary * 1.5, 80)) continue;
      var dist = primary + secondary * 0.3;
      if (dist < bestDist) { bestDist = dist; best = el; }
    }
    return best;
  }

  function onKey(e) {
    var k = e.key;
    var dir = null;
    if (k === 'ArrowUp' || k === 'Up') dir = 'up';
    else if (k === 'ArrowDown' || k === 'Down') dir = 'down';
    else if (k === 'ArrowLeft' || k === 'Left') dir = 'left';
    else if (k === 'ArrowRight' || k === 'Right') dir = 'right';

    if (dir) {
      // let text inputs handle left/right cursor movement
      if (current && (current.tagName === 'INPUT' || current.tagName === 'TEXTAREA') && (dir === 'left' || dir === 'right')) {
        return;
      }
      e.preventDefault();
      var n = findNext(dir);
      if (n) setFocus(n);
      return;
    }

    if (k === 'Enter' || k === ' ' || k === 'Select' || k === 'Go') {
      if (current) { e.preventDefault(); try { current.click(); } catch (_) {} }
      return;
    }

    if (k === 'Backspace' || k === 'Escape') {
      e.preventDefault();
      history.back();
      return;
    }
  }

  document.addEventListener('keydown', onKey, true);

  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document) {
      if (t.classList && t.classList.contains(FOCUS_CLASS)) { current = t; break; }
      t = t.parentElement;
    }
  }, true);

  var st = document.createElement('style');
  st.textContent = '.' + FOCUS_CLASS +
    '{outline:3px solid #2dd4bf !important; outline-offset:2px !important;' +
    'box-shadow:0 0 0 2px #2dd4bf, 0 0 12px 2px rgba(45,212,191,.6) !important;' +
    'transition:outline .08s, box-shadow .08s;}';
  document.head.appendChild(st);

  function initFocus() {
    if (!current) { var l = candidates(); if (l.length) setFocus(l[0]); }
  }
  setTimeout(initFocus, 800);
  window.addEventListener('load', function () { setTimeout(initFocus, 800); });
})();
