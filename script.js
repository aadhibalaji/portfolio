(() => {
  const SECTION_KEYS = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
  const SECTION_LABELS = { hero: 'Intro', about: 'About', skills: 'Skills', projects: 'Projects', experience: 'Experience', contact: 'Contact' };

  const sections = Object.fromEntries(SECTION_KEYS.map((k) => [k, document.getElementById(k)]));
  const progressFill = document.getElementById('progressFill');
  const sideDots = document.querySelectorAll('.side-dot');
  const tabItems = document.querySelectorAll('.tab-item');
  const glassShard = document.getElementById('glassShard');
  const shardSpin = document.getElementById('shardSpin');
  const shardLabel = document.getElementById('shardLabel');
  const shardLabelBack = document.getElementById('shardLabelBack');

  let activeKey = 'hero';

  function setActive(key) {
    if (key === activeKey) return;
    activeKey = key;
    sideDots.forEach((el) => el.classList.toggle('active', el.dataset.section === key));
    tabItems.forEach((el) => el.classList.toggle('active', el.dataset.section === key));
    shardLabel.textContent = SECTION_LABELS[key];
    shardLabelBack.textContent = SECTION_LABELS[key];
  }

  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
    progressFill.style.width = pct + '%';
    const rotY = -18 + (pct / 100) * 380; // multiple full turns down the page
    const rotX = 14 + Math.sin(pct / 100 * Math.PI * 2) * 10;
    const rotZ = -8 + (pct / 100) * 34;
    shardSpin.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
    glassShard.style.filter = `hue-rotate(${pct * 1.3}deg)`;

    const line = window.innerHeight * 0.4;
    for (const key of SECTION_KEYS) {
      const el = sections[key];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { setActive(key); break; }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // reveal-in on first intersection
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  sections.hero.querySelector('.reveal').classList.add('in-view');

  // smooth-scroll nav links
  document.querySelectorAll('.side-dot, .tab-item, a[href^="#"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // custom cursor
  const cursorRing = document.getElementById('cursorRing');
  const cursorDot = document.getElementById('cursorDot');
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorRing.style.left = e.clientX + 'px';
      cursorRing.style.top = e.clientY + 'px';
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
      const hovering = e.target.closest && e.target.closest('[data-hoverable]');
      cursorRing.style.width = hovering ? '38px' : '18px';
      cursorRing.style.height = hovering ? '38px' : '18px';
      cursorRing.style.borderColor = hovering ? '#f2f0ea' : '#4a7de3';
    });
  }

  // project card-stack shuffle
  const projects = [
    { role: 'LEAD SOFTWARE & CLOUD ENGINEER', title: 'PickleIQ', period: 'APR 2026 – PRESENT',
      summary: 'AI pickleball coaching app extracting biomechanical metrics and generating player-specific recommendations via the Claude API, built with a commercial facility partner.',
      tags: ['Docker', 'AWS Lambda/ECR/EC2', 'Claude API', 'TrackNetV2'] },
    { role: 'UNDERGRADUATE RESEARCHER', title: 'MORFEA', period: 'SEP 2025 – PRESENT',
      summary: 'Unsupervised CNN-LSTM autoencoder modeling embryo development as latent trajectories for label-free quality classification, trained on 700+ time-lapse sequences.',
      tags: ['PyTorch', 'CNN-LSTM', 'Computational Biology'] },
    { role: 'ANALYST, WISCONSIN CONSULTING CLUB', title: 'YouTube Music Strategy', period: 'FEB 2026 – PRESENT',
      summary: 'Competitor deep-dive across 5 platforms with usage metrics and conversion funnels, translated into feature mockups and a user journey map.',
      tags: ['Product Strategy', 'Data Analysis', 'UX Research'] },
  ];

  const TRANSFORMS = [
    'translate(0px,0px) rotate(0deg) scale(1)',
    'translate(18px,-16px) rotate(-4deg) scale(0.96)',
    'translate(34px,-30px) rotate(-8deg) scale(0.92)',
  ];
  const SHUFFLE_TRANSFORM = 'translate(70px,50px) rotate(18deg) scale(0.85)';

  const cardStack = document.getElementById('cardStack');
  const cards = Array.from(cardStack.querySelectorAll('.stack-card'));
  const dots = Array.from(document.querySelectorAll('.stack-dot'));
  const detailRole = document.getElementById('detailRole');
  const detailTitle = document.getElementById('detailTitle');
  const detailSummary = document.getElementById('detailSummary');
  const detailTags = document.getElementById('detailTags');
  const detailPeriod = document.getElementById('detailPeriod');

  let order = [0, 1, 2]; // project index at each stack position, front-to-back
  let shufflingIdx = null;

  function renderStack() {
    const posOf = {};
    order.forEach((projIdx, pos) => { posOf[projIdx] = pos; });
    cards.forEach((card) => {
      const i = Number(card.dataset.idx);
      const pos = posOf[i];
      const shuffling = shufflingIdx === i;
      card.style.transform = shuffling ? SHUFFLE_TRANSFORM : TRANSFORMS[pos];
      card.style.zIndex = shuffling ? 12 : 10 - pos;
      card.style.opacity = shuffling ? 0.4 : (pos === 0 ? 1 : pos === 1 ? 0.85 : 0.6);
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === order[0]));
  }

  function renderDetail() {
    const p = projects[order[0]];
    detailRole.textContent = p.role;
    detailTitle.textContent = p.title;
    detailSummary.textContent = p.summary;
    detailPeriod.textContent = p.period;
    detailTags.innerHTML = p.tags.map((t) => `<span class="tag-chip small">${t}</span>`).join('');
  }

  function advanceStack() {
    if (shufflingIdx != null) return;
    const frontIdx = order[0];
    shufflingIdx = frontIdx;
    renderStack();
    setTimeout(() => {
      order = [...order.slice(1), order[0]];
      shufflingIdx = null;
      renderStack();
      renderDetail();
    }, 320);
  }

  cardStack.addEventListener('click', advanceStack);
  cardStack.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advanceStack(); }
  });

  renderStack();
  renderDetail();
})();
