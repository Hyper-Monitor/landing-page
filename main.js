// Hypermonitor landing: language, the block logo's messages, the tour video, the carousel, the diagnosis,
// the early access form and the entrances.

const I18N = window.HM_I18N;
const t = (key) => I18N.t(key);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Language ---------- */
const langSelect = document.getElementById('lang');
if (langSelect) {
  langSelect.value = I18N.lang;
  langSelect.addEventListener('change', () => I18N.apply(langSelect.value));
}

/* ---------- Block logo: every column carries one message ---------- */
const blocks = document.getElementById('hero-blocks');
const tip = document.getElementById('tip');
const tipText = document.getElementById('tip-text');
let tipFor = null;
let hideTimer = null;
const showTip = (btn) => {
  clearTimeout(hideTimer);
  tipFor = btn;
  blocks.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', b === btn));
  tipText.textContent = I18N.tips()[Number(btn.dataset.tip)];
  tip.hidden = false;
  const host = blocks.parentElement.getBoundingClientRect();
  const r = btn.getBoundingClientRect();
  const w = tip.offsetWidth;
  const center = r.left - host.left + r.width / 2 - w / 2;
  // A logo in the top bar has no room above it, so its messages open below and may spill past the tile.
  const below = blocks.dataset.tipSide === 'below';
  const left = below
    ? Math.min(Math.max(center, 8 - host.left), document.documentElement.clientWidth - host.left - w - 8)
    : Math.min(Math.max(center, 8), host.width - w - 8);
  const top = below ? r.bottom - host.top + 10 : Math.max(r.top - host.top - tip.offsetHeight - 10, 8);
  tip.style.transform = `translate(${left}px, ${top}px)`;
  btn.setAttribute('aria-describedby', 'tip-text');
};
const hideTip = (delay = 180) => {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    tip.hidden = true;
    blocks.querySelectorAll('button').forEach((b) => { b.classList.remove('is-on'); b.removeAttribute('aria-describedby'); });
    tipFor = null;
  }, delay);
};
if (blocks && tip) {
  blocks.querySelectorAll('button').forEach((btn) => {
    btn.setAttribute('aria-label', `${btn.textContent}: ${I18N.tips()[Number(btn.dataset.tip)]}`);
    btn.addEventListener('mouseenter', () => showTip(btn));
    btn.addEventListener('focus', () => showTip(btn));
    btn.addEventListener('click', () => (tipFor === btn && !tip.hidden ? hideTip(0) : showTip(btn)));
    btn.addEventListener('mouseleave', () => hideTip());
    btn.addEventListener('blur', () => hideTip());
  });
  tip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  tip.addEventListener('mouseleave', () => hideTip());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(0); });
  // Uma mensagem aparece sozinha depois que as barras sobem, para mostrar que as colunas respondem; com o logo na
  // barra de cima ela abriria por cima do título, então só aparece quando alguém passa, foca ou toca numa coluna
  if (blocks.dataset.tipSide !== 'below') setTimeout(() => { if (!tipFor) { showTip(blocks.querySelectorAll('button')[3]); hideTip(3200); } }, reduced ? 400 : 1700);
}

/* ---------- Subtitle: the highlighted word cycles through what Hypermonitor watches ---------- */
const rotator = document.getElementById('rotator');
let wordIndex = 0;
const setWord = () => { if (rotator) rotator.textContent = I18N.words()[wordIndex % I18N.words().length]; };
if (rotator) {
  setWord();
  if (!reduced) {
    setInterval(() => {
      if (document.hidden) return;
      rotator.classList.add('is-out');
      setTimeout(() => {
        wordIndex += 1;
        setWord();
        rotator.classList.remove('is-out');
        rotator.classList.add('is-in');
        requestAnimationFrame(() => requestAnimationFrame(() => rotator.classList.remove('is-in')));
      }, 320);
    }, 2400);
  }
}

/* ---------- Tour video: pause control, and still under reduced motion ---------- */
const video = document.getElementById('tour');
const toggle = document.getElementById('tour-toggle');
const syncToggle = () => {
  const paused = video.paused;
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.setAttribute('aria-label', t(paused ? 'video.play' : 'video.pause'));
  toggle.classList.toggle('is-paused', paused);
};
if (video && toggle) {
  if (reduced) { video.removeAttribute('autoplay'); video.pause(); }
  toggle.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  video.addEventListener('play', syncToggle);
  video.addEventListener('pause', syncToggle);
  syncToggle();
}

/* ---------- Carousel: moves on its own until someone touches it ---------- */
const carousel = document.getElementById('carousel');
const navButtons = [...document.querySelectorAll('.carousel__btn')];
if (carousel) {
  const step = () => {
    const slide = carousel.querySelector('.slide');
    return slide ? slide.getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).columnGap || 8) : 320;
  };
  const atEnd = () => carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 2;
  const sync = () => {
    navButtons.forEach((b) => { b.disabled = b.dataset.dir === '-1' ? carousel.scrollLeft <= 2 : atEnd(); });
  };
  let held = false;
  let visible = false;
  let resumeAt = 0;
  const hold = (ms = 9000) => { resumeAt = Date.now() + ms; };
  navButtons.forEach((b) => b.addEventListener('click', () => {
    hold();
    carousel.scrollBy({ left: Number(b.dataset.dir) * step(), behavior: 'smooth' });
  }));
  carousel.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    hold();
    carousel.scrollBy({ left: d * step(), behavior: 'smooth' });
  });
  carousel.addEventListener('pointerenter', () => { held = true; });
  carousel.addEventListener('pointerleave', () => { held = false; });
  carousel.addEventListener('focusin', () => { held = true; });
  carousel.addEventListener('focusout', () => { held = false; });
  carousel.addEventListener('pointerdown', () => hold());
  carousel.addEventListener('wheel', () => hold(), { passive: true });
  carousel.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 }).observe(carousel);
  }
  if (!reduced) {
    setInterval(() => {
      if (held || !visible || document.hidden || Date.now() < resumeAt) return;
      if (atEnd()) carousel.scrollTo({ left: 0, behavior: 'smooth' });
      else carousel.scrollBy({ left: step(), behavior: 'smooth' });
    }, 3800);
  }
}

/* ---------- Diagnosis: last night's runs, one explained at a time ---------- */
// [signal, before, when it failed, unit, tone]; tone: bad confirms the cause, good rules the server out, ok is normal
const RUNS = [
  { job: 'mysqldump shop', host: 'db-02', time: '02:00', status: 'bad', sig: [['disk', 71, 97, '%', 'bad'], ['io', 2, 84, 'MB/s', 'bad'], ['mem', 44, 46, '%', 'ok']] },
  { job: 'report-build', host: 'app-03', time: '02:30', status: 'bad', sig: [['mem', 62, 98, '%', 'bad'], ['swap', 8, 71, '%', 'bad'], ['cpu', 35, 64, '%', 'ok']] },
  { job: 'sync-orders', host: 'app-01', time: '03:00', status: 'bad', sig: [['net', 1.2, 1.4, 'MB/s', 'good'], ['cpu', 6, 7, '%', 'ok'], ['mem', 41, 41, '%', 'ok']] },
  { job: 'image-sync', host: 'app-03', time: '03:15', status: 'warn', sig: [['cpu', 22, 99, '%', 'bad'], ['took', 5, 22, 'min', 'bad'], ['mem', 80, 88, '%', 'ok']] },
  { job: 'nightly-dump', host: 'ops-02', time: '04:00', status: 'warn', sig: [['size', 1.2e9, 45, 'bytes', 'bad'], ['took', 400, 0.2, 's', 'bad']] },
  { job: 'invoice-export', host: 'erp-01', time: '05:00', status: 'missed', sig: [['agent', 1, 1, 'bool', 'good'], ['cron', 1, 0, 'bool', 'bad']] },
];
const RUN_TEXT = [1, 0, 2, 3, 4, 5];
const runsEl = document.getElementById('diag-runs');
const pane = document.getElementById('diag-pane');
let selected = 1;

const fmtValue = (v, unit) => {
  const nf = new Intl.NumberFormat(I18N.lang, { maximumFractionDigits: 1 });
  if (unit === 'bool') return t(v ? 'val.yes' : 'val.no');
  if (unit === 'bytes') {
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0; let n = v;
    while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
    return `${nf.format(n)} ${units[i]}`;
  }
  return unit === '%' ? `${nf.format(v)}%` : `${nf.format(v)} ${unit}`;
};
const barWidth = (v, other, unit) => {
  if (unit === '%') return v;
  if (unit === 'bool') return v ? 100 : 0;
  return Math.max(2, (v / Math.max(v, other)) * 100);
};

const renderRuns = () => {
  if (!runsEl) return;
  runsEl.replaceChildren(...RUNS.map((run, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === selected));
    li.tabIndex = i === selected ? 0 : -1;
    li.className = `run run--${run.status}`;
    li.innerHTML = `<span class="run__dot" aria-hidden="true"></span><span class="run__job" translate="no"></span><span class="run__time"></span>`;
    li.querySelector('.run__job').textContent = run.job;
    li.querySelector('.run__time').textContent = run.time;
    li.addEventListener('click', () => select(i, false));
    li.addEventListener('keydown', (e) => {
      const d = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); select((i + d + RUNS.length) % RUNS.length, true); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i, true); }
    });
    return li;
  }));
};

const renderPane = () => {
  if (!pane) return;
  const run = RUNS[selected];
  pane.innerHTML = `
    <div class="pane__top"><span class="pill pill--${run.status}"></span><span class="pane__job" translate="no"></span><span class="pane__host" translate="no"></span></div>
    <p class="pane__verdict"></p>
    <div class="pane__legend" aria-hidden="true"><span class="lg lg--before"></span><span class="lg lg--at"></span></div>
    <div class="pane__sigs"></div>`;
  pane.querySelector('.pill').textContent = t(`status.${run.status}`);
  pane.querySelector('.pane__job').textContent = run.job;
  pane.querySelector('.pane__host').textContent = `${run.host}, ${run.time}`;
  pane.querySelector('.pane__verdict').textContent = t(`run.${RUN_TEXT[selected]}`);
  pane.querySelector('.lg--before').textContent = t('diag.before');
  pane.querySelector('.lg--at').textContent = t('diag.at');
  pane.querySelector('.pane__sigs').replaceChildren(...run.sig.map(([key, a, b, unit, tone]) => {
    const row = document.createElement('div');
    row.className = `sig sig--${tone}`;
    row.innerHTML = `<span class="sig__name"></span><span class="sig__bars"><i class="sig__a"></i><i class="sig__b"></i></span><span class="sig__val"></span>`;
    row.querySelector('.sig__name').textContent = t(`sig.${key}`);
    row.querySelector('.sig__a').style.width = `${barWidth(a, b, unit)}%`;
    row.querySelector('.sig__b').style.width = `${barWidth(b, a, unit)}%`;
    row.querySelector('.sig__val').textContent = `${fmtValue(a, unit)} → ${fmtValue(b, unit)}`;
    return row;
  }));
};

const select = (i, focus) => {
  selected = i;
  renderRuns();
  renderPane();
  if (focus) runsEl.children[i].focus();
};
renderRuns();
renderPane();

/* ---------- Early access ---------- */
// Formspree takes the urlencoded POST to the form's action and answers JSON when asked. A mailto action opens
// the visitor's email app instead, and the error message keeps a mailto link as the way out.
const form = document.getElementById('start-form');
if (form) {
  const after = document.getElementById('start-after');
  const button = form.querySelector('button');
  const say = (key) => {
    after.dataset.i18n = key;
    if (t(key).includes('<')) after.innerHTML = t(key); else after.textContent = t(key);
  };
  const openMail = () => {
    const subject = encodeURIComponent(t('close.subject'));
    const body = encodeURIComponent(t('close.body').replace('{email}', form.email.value.trim()));
    window.location.href = `mailto:early-access@hypermonitor.net?subject=${subject}&body=${body}`;
  };
  form.addEventListener('submit', async (e) => {
    if (!form.email.checkValidity()) return;
    e.preventDefault();
    if (form._gotcha.value) return;
    if (form.getAttribute('action').startsWith('mailto:')) { openMail(); say('close.sent'); return; }
    const data = new URLSearchParams({ email: form.email.value.trim(), language: I18N.lang, _subject: t('close.subject') });
    const query = new URLSearchParams(location.search);
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref']) if (query.get(k)) data.set(k, query.get(k));
    if (document.referrer && !document.referrer.startsWith(location.origin)) data.set('referrer', document.referrer);
    button.disabled = true;
    button.dataset.i18n = 'close.sending';
    button.textContent = t('close.sending');
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say('close.done');
    } catch {
      say('close.error');
    } finally {
      button.disabled = false;
      button.dataset.i18n = 'close.apply';
      button.textContent = t('close.apply');
    }
  });
  after.addEventListener('click', (e) => {
    if (e.target.closest('a[data-mail]')) { e.preventDefault(); openMail(); }
  });
}

/* ---------- Re-render what JavaScript writes when the language changes ---------- */
document.addEventListener('hm:lang', () => {
  setWord();
  renderRuns();
  renderPane();
  if (video && toggle) syncToggle();
  if (blocks) blocks.querySelectorAll('button').forEach((btn) => btn.setAttribute('aria-label', `${btn.textContent}: ${I18N.tips()[Number(btn.dataset.tip)]}`));
  if (tipFor) showTip(tipFor);
  if (langSelect) langSelect.value = I18N.lang;
});
if (I18N.lang !== 'en') I18N.apply();

/* ---------- Entrances, once ---------- */
const targets = [...document.querySelectorAll('[data-reveal], .carousel, .diag, .alerts__board, .steps, .blocks--foot')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach((el) => el.classList.add('is-in'));
}
