/* =========================================================
   interactions.js
   Clickable "love-letter" tiles: tap a title and the message
   writes itself out (fast + skippable), finishes with a petal
   burst, and the cards tilt toward the cursor. Pure progressive
   enhancement — if this never loads, everything still shows.
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canTilt = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce;

  var PETAL_SVG =
    '<svg viewBox="0 0 32 32"><path d="M16 2 C22 8 26 14 16 30 C6 14 10 8 16 2 Z" fill="FILL"/></svg>';
  var PETAL_COLORS = ['#e79bab', '#f2c1cb', '#f7d7bd'];
  var CHARS_PER_FRAME = 2;   // typing speed — higher = faster

  document.querySelectorAll('.observations').forEach(function (list, listIndex) {
    var items = Array.prototype.slice.call(list.querySelectorAll('li'));
    if (!items.length) return;

    list.classList.add('is-enhanced');

    var hint = document.createElement('p');
    hint.className = 'tiles-hint';
    hint.textContent = 'tap each one to open \uD83C\uDF38';
    list.parentNode.insertBefore(hint, list);

    items.forEach(function (li, i) {
      var title = li.querySelector('.t');
      var desc = li.querySelector('.d');
      if (!title || !desc) return;

      var descId = 'obs-' + listIndex + '-' + i;
      desc.id = descId;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-controls', descId);

      var state = { typing: false, typed: false, skip: false, fullHTML: desc.innerHTML };

      var startOpen = li.classList.contains('span');
      setOpen(li, startOpen);
      if (startOpen) {
        if (reduce) { state.typed = true; }
        else { requestAnimationFrame(function () { typeWrite(li, desc, state); }); }
      }

      li.addEventListener('click', function () { activate(li, desc, state); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          activate(li, desc, state);
        }
      });

      if (canTilt) attachTilt(li);

      if (!reduce) {
        li.classList.add('reveal');
        li.style.transitionDelay = Math.min(i, 6) * 55 + 'ms';
      }
    });
  });

  /* --- open / type / skip / close --- */
  function activate(li, desc, state) {
    // mid-typing tap = skip to full text
    if (state.typing) { state.skip = true; return; }

    var isOpen = li.classList.contains('open');
    if (isOpen) { setOpen(li, false); return; }

    setOpen(li, true);
    if (state.typed || reduce) {
      desc.innerHTML = state.fullHTML;      // already written — show instantly
    } else {
      typeWrite(li, desc, state);
    }
  }

  function setOpen(li, open) {
    li.classList.toggle('open', open);
    li.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* --- the typewriter itself (preserves <em> styling & entities) --- */
  function typeWrite(li, desc, state) {
    if (reduce) { desc.innerHTML = state.fullHTML; state.typed = true; return; }

    // collect every text node in reading order, then blank them out
    var walker = document.createTreeWalker(desc, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [], n;
    while ((n = walker.nextNode())) { nodes.push({ node: n, full: n.nodeValue }); n.nodeValue = ''; }

    var cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    desc.appendChild(cursor);

    state.typing = true; state.skip = false;
    var ti = 0, ci = 0;

    function finish() {
      desc.innerHTML = state.fullHTML;
      state.typing = false;
      state.typed = true;
      petalBurst(li);
    }

    function tick() {
      if (state.skip) { finish(); return; }
      var budget = CHARS_PER_FRAME;
      while (budget-- > 0 && ti < nodes.length) {
        var t = nodes[ti];
        if (ci < t.full.length) { t.node.nodeValue += t.full.charAt(ci); ci++; }
        else { ti++; ci = 0; }
      }
      if (ti >= nodes.length) { finish(); }
      else { requestAnimationFrame(tick); }
    }
    requestAnimationFrame(tick);
  }

  /* --- petals drifting up when a card finishes --- */
  function petalBurst(li) {
    if (reduce) return;
    for (var k = 0; k < 6; k++) {
      var p = document.createElement('span');
      p.className = 'burst-petal';
      p.innerHTML = PETAL_SVG.replace('FILL', PETAL_COLORS[k % PETAL_COLORS.length]);
      p.style.left = (18 + Math.random() * 64) + '%';
      p.style.setProperty('--dx', (Math.random() * 44 - 22).toFixed(0) + 'px');
      p.style.setProperty('--dy', (-55 - Math.random() * 55).toFixed(0) + 'px');
      p.style.setProperty('--dr', (Math.random() * 260 - 130).toFixed(0) + 'deg');
      li.appendChild(p);
      (function (el) { setTimeout(function () { el.remove(); }, 1200); })(p);
    }
  }

  /* --- subtle cursor tilt (mouse only) --- */
  function attachTilt(li) {
    li.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = li.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      li.style.transition = 'transform 0s';
      li.style.transform =
        'perspective(820px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' +
        (px * 6).toFixed(2) + 'deg) translateY(-3px)';
    });
    li.addEventListener('pointerleave', function () {
      li.style.transition = 'transform .4s ease, box-shadow .25s ease, border-color .25s ease';
      li.style.transform = '';
    });
  }

  /* --- reveal tiles on scroll --- */
  var revealables = document.querySelectorAll('.reveal');
  if (!revealables.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealables.forEach(function (el) { io.observe(el); });
})();
