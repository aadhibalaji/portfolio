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

  // Cache each section's absolute (document-relative) top/bottom once, instead of calling
  // getBoundingClientRect() on every scroll frame -- that forced a synchronous layout recalc
  // every frame (a style write earlier in onScroll, then a layout read, is the classic
  // thrashing pattern). Recomputed only on load/resize, never during scrolling.
  let sectionBounds = [];
  function measureSections() {
    sectionBounds = SECTION_KEYS.map((key) => {
      const el = sections[key];
      const top = el.offsetTop;
      return { key, top, bottom: top + el.offsetHeight };
    });
  }
  measureSections();
  window.addEventListener('resize', measureSections);

  function onScroll() {
    const scrollY = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(100, Math.max(0, (scrollY / h) * 100)) : 0;
    const rotY = (pct / 100) * 720; // two full turns: starts dead-on at page load and lands dead-on again at the bottom (Contact), everything in between can land at an angle
    const rotX = 14 + Math.sin(pct / 100 * Math.PI * 2) * 10;
    const rotZ = -8 + 20 * Math.sin(2 * Math.PI * pct / 100); // returns to the same -8deg tilt at pct=100 as at pct=0, so Contact reads flat like Intro

    const line = scrollY + window.innerHeight * 0.4;
    let matchedKey = null;
    for (const { key, top, bottom } of sectionBounds) {
      if (top <= line && bottom > line) { matchedKey = key; break; }
    }

    const hue = pct * 1.3;
    progressFill.style.width = pct + '%';
    shardSpin.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
    glassShard.style.filter = `hue-rotate(${hue}deg)`;
    document.documentElement.style.setProperty('--shard-hue', `${hue}deg`);
    if (matchedKey) setActive(matchedKey);
  }
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => { onScroll(); scrollTicking = false; });
  }, { passive: true });
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
    { role: 'DEVELOPER', title: 'Verdict', period: 'MAY 2026 – PRESENT',
      summary: 'Open-source multi-agent debate tool where AI agents argue for and against any decision, idea, or piece of writing, giving sharper, less sycophantic feedback than a single LLM session.',
      tags: ['Anthropic API', 'TypeScript', 'Multi-Agent Systems'] },
    { role: 'DEVELOPER', title: 'Gesturist', period: 'JUL 2026 – PRESENT',
      summary: 'A macOS app in progress that lets people control their Mac with custom hand gestures they train themselves, rather than a fixed set of built-in ones, so it can work for hands that don’t move in the "standard" pinch or fist way existing tools assume.',
      tags: ['Computer Vision', 'Swift'] },
  ];

  const TRANSFORMS = [
    'translate(0px,0px) rotate(0deg) scale(1)',
    'translate(18px,-16px) rotate(-4deg) scale(0.96)',
    'translate(34px,-30px) rotate(-8deg) scale(0.92)',
    'translate(48px,-42px) rotate(-12deg) scale(0.88)',
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

  let order = [0, 1, 2, 3]; // project index at each stack position, front-to-back
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
      card.style.opacity = shuffling ? 0.4 : (pos === 0 ? 1 : pos === 1 ? 0.85 : pos === 2 ? 0.6 : 0);
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
