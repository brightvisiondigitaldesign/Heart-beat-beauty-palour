/* Heartbeat Beauty Parlour: front-end behaviour (no dependencies) */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '233207665913';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header state on scroll ---------- */
  var header = document.getElementById('site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    if (!toggle || !navLinks) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) setMenu(false);
    });
  }

  /* ---------- Active nav link as sections come into view ---------- */
  var navAnchors = document.querySelectorAll('[data-nav]');
  if (navAnchors.length && 'IntersectionObserver' in window) {
    var byId = {};
    navAnchors.forEach(function (a) { byId[a.getAttribute('data-nav')] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) { a.classList.remove('active'); });
        var link = byId[entry.target.id];
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- Entrance animations ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Service buttons pre-fill the booking form ---------- */
  var serviceSelect = document.getElementById('service');
  document.querySelectorAll('[data-service]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!serviceSelect) return;
      var wanted = btn.getAttribute('data-service');
      for (var i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].value === wanted) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbCaption = document.getElementById('lightbox-caption');
  var lbImg = document.getElementById('lightbox-img');
  var lbClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  var lastFocus = null;

  function openLightbox(trigger) {
    if (!lightbox) return;
    lastFocus = trigger;
    var img = trigger.querySelector('img');
    if (img && lbImg) { lbImg.src = img.src; lbImg.alt = img.alt; }
    lbCaption.textContent = trigger.getAttribute('data-caption') || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('[data-lightbox]').forEach(function (item) {
    item.addEventListener('click', function () { openLightbox(item); });
  });

  if (lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------- Booking form ---------- */
  var form = document.getElementById('booking-form');
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');

  function setError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var errEl = document.getElementById(fieldId + '-error');
    var wrap = input.closest('.field');
    if (message) {
      wrap.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    } else {
      wrap.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
    }
    if (errEl) errEl.textContent = message || '';
    return !message;
  }

  function validate(d) {
    var ok = true;
    ok = setError('name', d.name.length < 2 ? 'Please enter your full name.' : '') && ok;
    ok = setError('phone', !/^[+0-9\s()-]{9,16}$/.test(d.phone) ? 'Please enter a valid phone number.' : '') && ok;
    ok = setError('service', !d.service ? 'Please choose a service.' : '') && ok;

    var dateMsg = '';
    if (!d.date) {
      dateMsg = 'Please choose a preferred date.';
    } else {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var chosen = new Date(d.date + 'T00:00:00');
      if (chosen < today) dateMsg = 'Please choose today or a later date.';
    }
    ok = setError('date', dateMsg) && ok;
    return ok;
  }

  function buildMessage(d) {
    return [
      'Hello Heartbeat Beauty Parlour, I would like to request an appointment.',
      '',
      'Name: ' + d.name,
      'Phone: ' + d.phone,
      'Service: ' + d.service,
      'Preferred date: ' + d.date,
      'Preferred time: ' + (d.time || 'Any time'),
      'Message: ' + (d.message || 'None'),
      '',
      'Please confirm my appointment.'
    ].join('\n');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var data = {
        name: String(fd.get('name') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        service: String(fd.get('service') || ''),
        date: String(fd.get('date') || ''),
        time: String(fd.get('time') || '').trim(),
        message: String(fd.get('message') || '').trim()
      };

      if (!validate(data)) {
        status.className = 'form-status error';
        status.textContent = 'Please fix the highlighted fields and try again.';
        var firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildMessage(data));
      var win = null;
      try { win = window.open(url, '_blank', 'noopener'); } catch (err) { win = null; }

      setTimeout(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }, 600);

      if (win) {
        status.className = 'form-status ok';
        status.textContent = 'WhatsApp is opening with your request. This is a request only. The salon will confirm your appointment with you.';
      } else {
        status.className = 'form-status error';
        status.innerHTML = '';
        status.textContent = 'Your browser blocked the WhatsApp window. Please use the WhatsApp button on this page to send your request.';
      }
    });

    /* Clear an error as soon as the user fixes the field */
    form.addEventListener('input', function (e) {
      var id = e.target.id;
      if (!id) return;
      var wrap = e.target.closest('.field');
      if (wrap && wrap.classList.contains('invalid')) {
        setError(id, '');
      }
    });
  }
})();
