/* ============================================================================
   L.I.S.A. — логика страницы: калькулятор экономии, тарифы, галерея, формы.
   Все числа считаются в js/calc.js — здесь только привязка к элементам.
   L.I.S.A. сдаётся в аренду: экономика считается от абонентской платы,
   капитальных вложений и срока окупаемости в модели нет.
   ========================================================================== */
import { CONFIG, computeSavings, computeTiers, money, rubShort, pct } from './calc.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------------------------------------------------------------------------
   КОНТАКТ / ФОРМА  (адрес получателя скрыт от парсеров — base64)
   -------------------------------------------------------------------------*/
const CONTACT = atob('aXZkb2xnb3ZAZ21haWwuY29t');
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + CONTACT;

/* ===========================================================================
   1. КАЛЬКУЛЯТОР ЭКОНОМИИ
   =========================================================================*/
function currentTariff() {
  const el = $('input[name="cTariff"]:checked');
  return el ? el.value : CONFIG.defaultTariff;
}

function initCalculator() {
  const box = $('#calc');
  if (!box) return;

  const branches = $('#cBranches');
  const cost = $('#cCost');
  const perOp = $('#cPerOp');

  const out = {
    current: $('#cCurrent'),
    tax: $('#cTax'),
    operators: $('#cOperators'),
    rent: $('#cRent'),
    ops: $('#cOps'),
    withLisa: $('#cWithLisa'),
    month: $('#cMonth'),
    year: $('#cYear'),
    share: $('#cShare'),
    perBranch: $('#cPerBranch'),
  };

  const read = () => computeSavings({
    branches: +branches.value,
    salaryNet: +cost.value,
    branchesPerOperator: +perOp.value,
    tariff: currentTariff(),
  });

  function render() {
    const s = read();
    out.current.textContent = money(s.currentCost) + ' / мес';
    if (out.tax) out.tax.textContent = money(s.staff * s.payrollTaxPerEmployee) + ' / мес';
    out.operators.textContent = String(s.operators);
    if (out.rent) out.rent.textContent = money(s.rent) + ' / мес';
    if (out.ops) out.ops.textContent = money(s.operatorsCost) + ' / мес';
    out.withLisa.textContent = money(s.withLisa) + ' / мес';
    out.month.textContent = money(s.monthlyDiff) + ' / мес';
    out.year.textContent = rubShort(s.annualDiff) + ' / год';
    out.share.textContent = pct(s.savingsShare);
    if (out.perBranch) {
      out.perBranch.textContent = `${money(s.perBranchNow)} → ${money(s.perBranchLisa)}`;
    }
    const bar = $('#cShareBar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, s.savingsShare * 100)).toFixed(1) + '%';
    const warn = $('#cWarn');
    if (warn) warn.hidden = s.monthlyDiff >= 0;
    syncRange(box);
    syncRatio(s);
    syncTierCards(s);
  }

  [branches, cost, perOp].forEach((el) => {
    el.addEventListener('input', () => {
      if (el === branches) $('#cBranchesRange').value = el.value;
      if (el === perOp) syncRange(box);
      render();
    });
  });

  const range = $('#cBranchesRange');
  range.addEventListener('input', () => {
    branches.value = range.value;
    render();
  });

  const perRange = $('#cPerOpRange');
  if (perRange) {
    perRange.addEventListener('input', () => {
      perOp.value = perRange.value;
      render();
    });
    perOp.addEventListener('change', () => { perRange.value = perOp.value; });
  }

  $$('input[name="cTariff"]').forEach((r) => r.addEventListener('change', render));

  // исходные значения
  branches.value = 5;
  range.value = 5;
  cost.value = CONFIG.salaryNetDefault;
  perOp.value = CONFIG.branchesPerOperatorDefault;
  perRange.value = CONFIG.branchesPerOperatorDefault;
  const def = $(`input[name="cTariff"][value="${CONFIG.defaultTariff}"]`);
  if (def) def.checked = true;
  render();
}

function syncRange(box) {
  const r = $('#cBranchesRange');
  if (!r) return;
  const min = +r.min, max = +r.max, v = +r.value;
  r.style.setProperty('--fill', ((v - min) / (max - min) * 100) + '%');
}

/* подпись «1 оператор → N филиалов» */
function syncRatio(s) {
  const el = $('#cRatio');
  if (el) el.textContent = `1 оператор → ${s.branchesPerOperator} филиалов`;
}

/* цены в карточках выбора тарифа (статичные, из CONFIG) */
function syncTierCards(s) {
  $$('[data-tariff-price]').forEach((el) => {
    const p = CONFIG.tariffs[el.dataset.tariffPrice];
    if (p) el.textContent = money(p.price) + ' / мес';
  });
  const note = $('#cRentNote');
  if (note) {
    note.textContent = `Аренда L.I.S.A.: ${s.branches} × ${money(s.tariffPrice)} = ${money(s.rent)} / мес`;
  }
  const taxNote = $('#cTaxNote');
  if (taxNote) {
    const ndflPct = Math.round(s.ndflRate * 100);
    const taxPct = Math.round(s.payrollTaxRate * 100);
    taxNote.textContent = `${money(s.salaryNet)} на руки → оклад ${money(s.gross)} ` +
      `+ НДФЛ ${ndflPct}% (${money(s.ndflPerEmployee)}) + взносы ${taxPct}% (${money(s.contribPerEmployee)}) ` +
      `= ${money(s.employeeFull)} / мес на человека`;
  }
}

/* ===========================================================================
   2. ТРИ ГОТОВЫХ СЦЕНАРИЯ (5 / 10 / 20 филиалов)
   =========================================================================*/
function initScenarioCards() {
  const rows = $$('[data-scenario]');
  if (!rows.length) return;
  rows.forEach((row) => {
    const b = +row.dataset.branches;
    const per = +row.dataset.perOperator;
    const tariff = row.dataset.tariff || CONFIG.defaultTariff;
    const c = CONFIG.salaryNetDefault;
    const s = computeSavings({ branches: b, salaryNet: c, branchesPerOperator: per, tariff });
    const set = (sel, txt) => { const e = $(sel, row); if (e) e.textContent = txt; };
    set('[data-out="branches"]', `${b} филиалов`);
    set('[data-out="staff"]', `${b} сотрудников`);
    set('[data-out="current"]', money(s.currentCost));
    set('[data-out="operators"]', `${s.operators} ${plural(s.operators, 'оператор', 'оператора', 'операторов')}`);
    set('[data-out="rent"]', money(s.rent));
    set('[data-out="withLisa"]', money(s.withLisa));
    set('[data-out="month"]', `${money(s.monthlyDiff)} / мес`);
    set('[data-out="year"]', `${rubShort(s.annualDiff)} / год`);
  });
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/* Блок «Аренда» — статичная витрина тарифов без полей ввода (дублирующий
   калькулятор убран: посетитель вводил одни и те же числа дважды).
   Расчёт экономии остался в блоке «Экономика» (initCalculator). */

/* ===========================================================================
   4. ФОРМА «ПОЛУЧИТЬ РАСЧЁТ»
   =========================================================================*/
function initContactForm() {
  const form = $('#leadForm');
  if (!form) return;
  const msg = $('#leadMsg');
  const btn = $('#leadBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.phone) {
      msg.textContent = 'Заполните имя и телефон — остальное по желанию.';
      msg.className = 'form-msg err';
      return;
    }
    // доложить текущий расчёт калькулятора в заявку
    const b = +($('#cBranches')?.value || 0);
    const c = +($('#cCost')?.value || 0);
    const per = +($('#cPerOp')?.value || CONFIG.branchesPerOperatorDefault);
    const tariff = currentTariff();
    if (b) {
      const s = computeSavings({ branches: b, salaryNet: c, branchesPerOperator: per, tariff });
      data['_Тариф'] = CONFIG.tariffs[tariff]?.name || tariff;
      data['_Расчёт'] = `${b} филиалов, тариф ${data['_Тариф']} (${money(s.tariffPrice)}/мес за точку) → ` +
        `${s.operators} опер. → сейчас ${money(s.currentCost)}, с L.I.S.A. ${money(s.withLisa)} → ` +
        `экономия ${money(s.monthlyDiff)}/мес, ${rubShort(s.annualDiff)}/год`;
    }
    data._subject = 'L.I.S.A. — заявка на расчёт (lisa-is.com)';
    data._template = 'table';
    data._captcha = 'false';

    btn.disabled = true;
    msg.textContent = 'Отправляем…';
    msg.className = 'form-msg';
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (json.success === 'true' || json.success === true) {
        form.classList.add('hidden');
        $('#leadDone').classList.remove('hidden');
      } else {
        throw new Error('not delivered');
      }
    } catch (err) {
      msg.innerHTML = 'Не отправилось. Напишите напрямую: <a href="mailto:' + CONTACT + '">' + CONTACT +
        '</a> или позвоните <a href="tel:+79774872876">+7 977 487-28-76</a>.';
      msg.className = 'form-msg err';
    } finally {
      btn.disabled = false;
    }
  });
}

/* ===========================================================================
   5. ГАЛЕРЕЯ (лайтбокс)
   =========================================================================*/
function initLightbox() {
  const lb = $('#lb');
  if (!lb) return;
  const items = $$('.g-item img');
  const img = $('#lbImg');
  let idx = 0;

  const show = (i) => {
    idx = (i + items.length) % items.length;
    img.src = items[idx].dataset.full || items[idx].src;
    img.alt = items[idx].alt || '';
    lb.classList.add('is-on');
    document.body.style.overflow = 'hidden';
  };
  const hide = () => {
    lb.classList.remove('is-on');
    document.body.style.overflow = '';
  };

  items.forEach((el, i) => el.closest('.g-item').addEventListener('click', () => show(i)));
  $('#lbClose').addEventListener('click', hide);
  $('#lbPrev').addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  $('#lbNext').addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) hide(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-on')) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
}

/* ===========================================================================
   6. МЕЛОЧИ: мобильное меню, появление блоков, год
   =========================================================================*/
function initUI() {
  const burger = $('#burger');
  const nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 })
    : null;
  $$('.rv').forEach((el) => {
    if (io) io.observe(el); else el.classList.add('in');
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const hdr = $('#hdr');
  if (hdr) {
    const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // плавный скролл к якорям (если браузер не умеет scroll-behavior)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------------------------------------------------------------------------
   СТАРТ
   -------------------------------------------------------------------------*/
function boot() {
  initUI();
  initCalculator();
  initScenarioCards();
  initContactForm();
  initLightbox();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
