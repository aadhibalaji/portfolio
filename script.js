/* ═══════════════════════════════════════════════════════════
   PERSONA 3 PORTFOLIO — DIAL INTERACTION SCRIPT v2
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────
  const SECTIONS = ['about', 'projects', 'experience', 'skills', 'contact'];
  const SECTION_LABELS = {
    about:      'About',
    projects:   'Projects',
    experience: 'Experience',
    skills:     'Skills',
    contact:    'Contact'
  };
  // Angles for each section (0° = top, clockwise)
  const SECTION_ANGLES = {
    about:      0,
    projects:   72,
    experience: 144,
    skills:     216,
    contact:    288
  };

  // ── STATE ────────────────────────────────────────────────
  let currentAngle   = 0;
  let targetAngle    = 0;
  let activeSection  = null;
  let isDragging     = false;
  let lastDragAngle  = 0;
  let velocity       = 0;
  let lastTime       = 0;
  let rafId          = null;
  let introPlaying   = true;

  // ── DOM REFS ─────────────────────────────────────────────
  const dial         = document.getElementById('dial');
  const activeLabel  = document.getElementById('dialActiveLabel');
  const sbText       = document.getElementById('sbText');
  const sbClock      = document.getElementById('sbClock');
  const segments     = Array.from(dial.querySelectorAll('.dial-segment'));
  const progressFill = document.getElementById('progressFill');
  const progressSteps = Array.from(document.querySelectorAll('.progress-step'));

  // ── TICK MARKS SVG ───────────────────────────────────────
  (function buildTicks() {
    const svg = document.querySelector('.dial-ticks');
    const cx = 200, cy = 200;
    // Outer decorative ring
    const outerR = 192;
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const len = isMajor ? 12 : 5;
      const x1 = cx + (outerR - len) * Math.cos(angle);
      const y1 = cy + (outerR - len) * Math.sin(angle);
      const x2 = cx + outerR * Math.cos(angle);
      const y2 = cy + outerR * Math.sin(angle);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      line.setAttribute('stroke', isMajor ? 'rgba(81,238,252,0.5)' : 'rgba(81,238,252,0.15)');
      line.setAttribute('stroke-width', isMajor ? '1.5' : '0.8');
      svg.appendChild(line);
    }
    // Section indicator triangles on the outer ring
    SECTIONS.forEach((key, i) => {
      const angleDeg = (i / SECTIONS.length) * 360 - 90;
      const rad = angleDeg * Math.PI / 180;
      const tx = cx + (outerR + 8) * Math.cos(rad);
      const ty = cy + (outerR + 8) * Math.sin(rad);
      const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      // Small inward-pointing triangle
      const size = 5;
      const inRad = rad + Math.PI; // pointing inward
      const p1x = tx + size * Math.cos(rad);
      const p1y = ty + size * Math.sin(rad);
      const p2x = tx + size * Math.cos(rad + 2.2);
      const p2y = ty + size * Math.sin(rad + 2.2);
      const p3x = tx + size * Math.cos(rad - 2.2);
      const p3y = ty + size * Math.sin(rad - 2.2);
      tri.setAttribute('points', `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`);
      tri.setAttribute('fill', 'rgba(81,238,252,0.4)');
      tri.setAttribute('data-section', key);
      tri.style.transition = 'fill 0.3s';
      svg.appendChild(tri);
    });
  })();

  // ── SEGMENT POSITIONING ──────────────────────────────────
  (function positionSegments() {
    const dialHalfW = 160; // half of dial's 320px
    const segRadius = 118; // distance from center to segment
    segments.forEach((seg, i) => {
      const angleDeg = (i / SECTIONS.length) * 360 - 90;
      const rad = angleDeg * Math.PI / 180;
      const x = dialHalfW + segRadius * Math.cos(rad);
      const y = dialHalfW + segRadius * Math.sin(rad);
      seg.style.position = 'absolute';
      seg.style.left = x + 'px';
      seg.style.top  = y + 'px';
      seg.style.transform = 'translate(-50%, -50%)';
      seg.style.width = '68px';
      seg.style.textAlign = 'center';
      seg.dataset.sectionKey = SECTIONS[i];
      seg.dataset.baseAngle = String((i / SECTIONS.length) * 360 - 90);
    });
  })();

  // ── ROTATION HELPERS ─────────────────────────────────────
  function setDialRotation(deg) {
    dial.style.transform = `rotate(${deg}deg)`;
    segments.forEach(seg => {
      seg.style.transform = `translate(-50%, -50%) rotate(${-deg}deg)`;
    });
  }

  function normalizeAngle(a) {
    return ((a % 360) + 360) % 360;
  }

  function getSectionAtTop(rotation) {
    let best = null, bestDist = Infinity;
    SECTIONS.forEach(key => {
      const sectionAngle = SECTION_ANGLES[key];
      const apparent = normalizeAngle(sectionAngle - rotation);
      const dist = Math.min(apparent, 360 - apparent);
      if (dist < bestDist) { bestDist = dist; best = key; }
    });
    return best;
  }

  function snapToSection(sectionKey, animate = true) {
    const sectionAngle = SECTION_ANGLES[sectionKey];
    let newTarget = sectionAngle;
    while (newTarget - currentAngle > 180)  newTarget -= 360;
    while (newTarget - currentAngle < -180) newTarget += 360;
    targetAngle = newTarget;
    if (!animate) {
      currentAngle = targetAngle;
      setDialRotation(currentAngle);
    }
    activateSection(sectionKey);
  }

  function activateSection(key) {
    if (activeSection === key) return;
    activeSection = key;
    const idx = SECTIONS.indexOf(key);
    activeLabel.textContent = SECTION_LABELS[key] || key;
    sbText.textContent = SECTION_LABELS[key] || key;
    // Highlight active segment
    segments.forEach(seg => {
      seg.classList.toggle('active', seg.dataset.sectionKey === key);
    });
    // Update SVG section triangles
    document.querySelectorAll('.dial-ticks polygon').forEach(tri => {
      tri.setAttribute('fill', tri.dataset.section === key
        ? 'rgba(81,238,252,0.9)'
        : 'rgba(81,238,252,0.35)');
    });
    // Update progress bar
    progressFill.style.width = (idx / (SECTIONS.length - 1)) * 100 + '%';
    progressSteps.forEach(step => {
      const stepIdx = SECTIONS.indexOf(step.dataset.section);
      step.classList.toggle('done', stepIdx < idx);
      step.classList.toggle('current', stepIdx === idx);
    });
    // Show content panel
    document.querySelectorAll('.content-section').forEach(el => {
      el.classList.add('hidden');
    });
    const target = document.getElementById('sec-' + key);
    if (target) target.classList.remove('hidden');
  }

  // ── ANIMATION LOOP ───────────────────────────────────────
  function animLoop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    if (!isDragging && !introPlaying) {
      const diff = targetAngle - currentAngle;
      const spring = 9;
      currentAngle += diff * spring * dt;
      if (Math.abs(diff) < 0.05) currentAngle = targetAngle;
    }

    setDialRotation(currentAngle);

    if (isDragging) {
      const hovered = getSectionAtTop(currentAngle);
      if (hovered && hovered !== activeSection) activateSection(hovered);
    }

    rafId = requestAnimationFrame(animLoop);
  }
  rafId = requestAnimationFrame(animLoop);

  // ── DRAG INTERACTION ─────────────────────────────────────
  function getAngleFromCenter(e) {
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
  }

  function onDragStart(e) {
    if (introPlaying) return;
    e.preventDefault();
    isDragging = true;
    lastDragAngle = getAngleFromCenter(e);
    velocity = 0;
    dial.style.transition = 'none';
  }

  function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const angle = getAngleFromCenter(e);
    let d = angle - lastDragAngle;
    if (d > 180)  d -= 360;
    if (d < -180) d += 360;
    velocity = d;
    currentAngle += d;
    lastDragAngle = angle;
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    dial.style.transition = '';
    currentAngle += velocity * 2.5;
    const nearest = getSectionAtTop(currentAngle);
    if (nearest) snapToSection(nearest, true);
  }

  dial.addEventListener('mousedown',  onDragStart, { passive: false });
  window.addEventListener('mousemove', onDragMove,  { passive: false });
  window.addEventListener('mouseup',   onDragEnd);
  dial.addEventListener('touchstart',  onDragStart, { passive: false });
  window.addEventListener('touchmove', onDragMove,  { passive: false });
  window.addEventListener('touchend',  onDragEnd);

  // ── SCROLL WHEEL ─────────────────────────────────────────
  // Trackpads fire dozens of tiny wheel events per swipe, so a naive
  // "1 event = 1 section" handler blows through several sections per
  // gesture. Accumulate delta and require a threshold, then lock out
  // further steps until the dial's own snap animation finishes.
  let wheelAccum  = 0;
  let wheelLocked = false;
  const WHEEL_THRESHOLD = 40;
  const WHEEL_COOLDOWN  = 550;

  dial.addEventListener('wheel', (e) => {
    if (introPlaying) return;
    e.preventDefault();
    if (wheelLocked) return;
    wheelAccum += e.deltaY;
    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
    const step = wheelAccum > 0 ? 1 : -1;
    wheelAccum = 0;
    wheelLocked = true;
    setTimeout(() => { wheelLocked = false; }, WHEEL_COOLDOWN);
    const currentIdx = SECTIONS.indexOf(activeSection ?? SECTIONS[0]);
    const nextIdx = ((currentIdx + step) + SECTIONS.length) % SECTIONS.length;
    snapToSection(SECTIONS[nextIdx]);
  }, { passive: false });

  // ── SEGMENT CLICK ────────────────────────────────────────
  segments.forEach(seg => {
    seg.addEventListener('click', () => {
      if (introPlaying) return;
      const key = seg.dataset.sectionKey;
      if (key) snapToSection(key);
    });
  });

  // ── PROGRESS STEP CLICK ──────────────────────────────────
  progressSteps.forEach(step => {
    step.addEventListener('click', () => {
      if (introPlaying) return;
      const key = step.dataset.section;
      if (key) snapToSection(key);
    });
  });

  // ── KEYBOARD ─────────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if (introPlaying) return;
    const currentIdx = SECTIONS.indexOf(activeSection ?? SECTIONS[0]);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      snapToSection(SECTIONS[(currentIdx + 1) % SECTIONS.length]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      snapToSection(SECTIONS[(currentIdx - 1 + SECTIONS.length) % SECTIONS.length]);
    }
  });

  // ── CLOCK ────────────────────────────────────────────────
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    sbClock.textContent = `${h}:${m}:${s}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ── INTRO SPIN ───────────────────────────────────────────
  let introStartTime = null;
  const INTRO_DURATION = 1600; // ms
  const INTRO_ROTATIONS = 2;   // full spins

  function introFrame(ts) {
    if (!introStartTime) introStartTime = ts;
    const elapsed = ts - introStartTime;
    const progress = Math.min(elapsed / INTRO_DURATION, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    currentAngle = -(INTRO_ROTATIONS * 360) * eased;
    setDialRotation(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(introFrame);
    } else {
      introPlaying = false;
      targetAngle = currentAngle;
      // Snap to about
      setTimeout(() => snapToSection('about'), 200);
    }
  }

  setTimeout(() => requestAnimationFrame(introFrame), 500);

})();
