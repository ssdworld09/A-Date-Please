/* =========================================================
   interactions.js
   Turns the .observations cards into clickable "unfolding" tiles
   and reveals them gently on scroll. Pure progressive enhancement:
   if this file never loads, the page still works and shows everything.
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.observations').forEach(function (list, listIndex) {
    var items = Array.prototype.slice.call(list.querySelectorAll('li'));
    if (!items.length) return;

    // mark the list so the collapsed CSS kicks in
    list.classList.add('is-enhanced');

    // a gentle hint above the tiles
    var hint = document.createElement('p');
    hint.className = 'tiles-hint';
    hint.textContent = 'tap each one to open \uD83C\uDF38';
    list.parentNode.insertBefore(hint, list);

    items.forEach(function (li, i) {
      var title = li.querySelector('.t');
      var desc = li.querySelector('.d');
      if (!title || !desc) return;

      // accessibility: each tile behaves like a toggle button
      var descId = 'obs-' + listIndex + '-' + i;
      desc.id = descId;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-controls', descId);

      // the highlighted (span) card opens by default to model the pattern
      var startOpen = li.classList.contains('span');
      setOpen(li, startOpen);

      function toggle() { setOpen(li, !li.classList.contains('open')); }

      li.addEventListener('click', toggle);
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          toggle();
        }
      });

      // queue up for scroll reveal (staggered)
      if (!reduce) {
        li.classList.add('reveal');
        li.style.transitionDelay = Math.min(i, 6) * 55 + 'ms';
      }
    });
  });

  function setOpen(li, open) {
    li.classList.toggle('open', open);
    li.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // reveal tiles as they scroll into view
  var revealables = document.querySelectorAll('.reveal');
  if (!revealables.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealables.forEach(function (el) { io.observe(el); });
})();
