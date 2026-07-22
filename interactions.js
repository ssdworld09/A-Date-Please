/* =========================================================
   interactions.js
   Clickable "love-letter" tiles: tap a title and the message
   blooms in word by word (fast + skippable), finishes with a
   petal burst, and the cards tilt toward the cursor.
   Pure progressive enhancement — if this never loads, the page
   still shows everything.
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canTilt = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce;

  var PETAL_SVG =
    '<svg viewBox="0 0 32 32"><path d="M16 2 C22 8 26 14 16 30 C6 14 10 8 16 2 Z" fill="FILL"/></svg>';
  var PETAL_COLORS = ['#e79bab', '#f2c1cb', '#f7d7bd', '#dd8aa0'];
  var WORD_STAGGER = 40;   // ms between words — lower = faster
  var WORD_DUR = 500;      // must match .wd transition duration in CSS

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

      var state = { animating: false, shown: false, fullHTML: desc.innerHTML, finish: null };

      var startOpen = li.classList.contains('span');
      setOpen(li, startOpen);
      if (startOpen) {
        if (reduce) { state.shown = true; }
        else { requestAnimationFrame(function () { bloom(li, desc, state); }); }
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

  /* --- open / bloom / skip / close --- */
  function activate(li, desc, state) {
    if (state.animating) { if (state.finish) state.finish(); return; }  // skip to full

    var isOpen = li.classList.contains('open');
    if (isOpen) { setOpen(li, false); return; }

    setOpen(li, true);
    if (state.shown || reduce) { desc.innerHTML = state.fullHTML; }
    else { bloom(li, desc, state); }
  }

  function setOpen(li, open) {
    li.classList.toggle('open', open);
    li.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  /* --- word-by-word bloom (keeps <em> italics & entities intact) --- */
  function bloom(li, desc, state) {
    if (reduce) { desc.innerHTML = state.fullHTML; state.shown = true; return; }

    var words = tokenize(desc);
    if (!words.length) { state.shown = true; return; }

    state.animating = true;
    words.forEach(function (w, i) { w.style.transitionDelay = (i * WORD_STAGGER) + 'ms'; });

    // trigger on next frame so the initial hidden state is committed
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        for (var i = 0; i < words.length; i++) words[i].classList.add('on');
      });
    });

    var total = words.length * WORD_STAGGER + WORD_DUR;
    var timer = setTimeout(function () { finish(); }, total);

    function finish() {
      if (!state.animating) return;
      clearTimeout(timer);
      for (var i = 0; i < words.length; i++) {
        words[i].style.transitionDelay = '0ms';
        words[i].classList.add('on');
      }
      state.animating = false;
      state.shown = true;
      petalBurst(li);
    }
    state.finish = finish;
  }

  // replace each text node with word spans + whitespace, preserving structure
  function tokenize(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var texts = [], n;
    while ((n = walker.nextNode())) texts.push(n);
    texts.forEach(function (tn) {
      var parts = tn.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (part === '') return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); }
        else {
          var s = document.createElement('span');
          s.className = 'wd';
          s.textContent = part;
          frag.appendChild(s);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    return root.querySelectorAll('.wd');
  }

  /* --- a generous petal burst --- */
  function petalBurst(li) {
    if (reduce) return;
    var count = 14;
    for (var k = 0; k < count; k++) {
      var p = document.createElement('span');
      p.className = 'burst-petal';
      p.innerHTML = PETAL_SVG.replace('FILL', PETAL_COLORS[k % PETAL_COLORS.length]);
      var size = 16 + Math.random() * 12;                 // 16–28px
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (10 + Math.random() * 80) + '%';
      p.style.top = (25 + Math.random() * 45) + '%';
      p.style.setProperty('--dx', (Math.random() * 90 - 45).toFixed(0) + 'px');
      p.style.setProperty('--dy', (-80 - Math.random() * 80).toFixed(0) + 'px');
      p.style.setProperty('--dr', (Math.random() * 320 - 160).toFixed(0) + 'deg');
      p.style.animationDelay = (Math.random() * 160).toFixed(0) + 'ms';
      li.appendChild(p);
      (function (el) { setTimeout(function () { el.remove(); }, 1700); })(p);
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
