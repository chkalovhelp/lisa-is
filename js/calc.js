/* ============================================================================
   L.I.S.A. — модуль расчётов (экономика)
   L.I.S.A. сдаётся в аренду (абонентская плата). Модель:

     текущие расходы    = филиалы × стоимость сотрудника
     операторов         = ceil(филиалы / филиалов_на_оператора)
     аренда L.I.S.A.    = филиалы × тариф
     расходы с L.I.S.A. = аренда + операторы × стоимость сотрудника
     экономия           = текущие − расходы с L.I.S.A.

   Чистые функции: на входе числа, на выходе числа. Ничего не рисуют.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   1) КОНФИГУРАЦИЯ (правится в одном месте)
   -------------------------------------------------------------------------*/
export const CONFIG = {
  // Полная стоимость одного сотрудника для компании, ₽/мес (по умолчанию в форме)
  employeeCostDefault: 80000,

  // Сколько филиалов обслуживает один удалённый оператор (по умолчанию)
  branchesPerOperatorDefault: 5,

  // Тарифы аренды, ₽/мес за одну точку (L.I.S.A. сдаётся в аренду, не продаётся)
  tariffs: {
    avatar: {
      key: 'avatar',
      name: 'Аватар',
      price: 24900,
      tagline: 'Физическое присутствие удалённого сотрудника.',
    },
    avatarAi: {
      key: 'avatarAi',
      name: 'Аватар + AI',
      price: 34900,
      tagline: 'Физическое присутствие + автономная работа AI.',
    },
  },
  defaultTariff: 'avatarAi',

  // Границы калькулятора
  branchesMin: 1,
  branchesMax: 100,
  branchesPerOperatorMin: 1,
  branchesPerOperatorMax: 10,
};

export const tariffPrice = (key) =>
  (CONFIG.tariffs[key] || CONFIG.tariffs[CONFIG.defaultTariff]).price;

/* ---------------------------------------------------------------------------
   2) ФОРМУЛЫ
   -------------------------------------------------------------------------*/

/**
 * Базовая модель: централизация ресепшена при аренде L.I.S.A.
 */
export function computeSavings({
  branches,
  employeeCost,
  branchesPerOperator = CONFIG.branchesPerOperatorDefault,
  tariff = CONFIG.defaultTariff,
}) {
  const b = num(branches);
  const c = num(employeeCost);
  const per = Math.max(1, num(branchesPerOperator));
  const price = tariffPrice(tariff);

  const currentCost = b * c;                       // ₽/мес на ресепшен сейчас
  const operators = Math.ceil(b / per);            // сколько удалённых операторов нужно
  const rent = b * price;                          // ₽/мес аренда L.I.S.A.
  const operatorsCost = operators * c;             // ₽/мес на удалённых операторов
  const withLisa = rent + operatorsCost;           // ₽/мес с L.I.S.A.
  const monthlyDiff = currentCost - withLisa;      // ₽/мес экономия
  const annualDiff = monthlyDiff * 12;             // ₽/год экономия

  return {
    branches: b,
    employeeCost: c,
    branchesPerOperator: per,
    tariff: tariff,
    tariffPrice: price,
    currentCost,
    operators,
    staff: b,                                      // сотрудников на ресепшене сейчас
    rent,
    operatorsCost,
    withLisa,
    monthlyDiff,
    annualDiff,
    savingsShare: currentCost > 0 ? monthlyDiff / currentCost : 0, // доля 0..1
    perBranchNow: c,                               // ₽/мес за одну точку сейчас
    perBranchLisa: price,                          // ₽/мес за одну точку с L.I.S.A.
  };
}

/**
 * Сравнение двух тарифов на одной и той же сети.
 * Возвращает обе конфигурации + разницу между ними.
 */
export function computeTiers({ branches, employeeCost, branchesPerOperator = CONFIG.branchesPerOperatorDefault }) {
  const keys = Object.keys(CONFIG.tariffs);
  const rows = keys.map((k) => {
    const s = computeSavings({ branches, employeeCost, branchesPerOperator, tariff: k });
    return { ...s, tariffName: CONFIG.tariffs[k].name, tagline: CONFIG.tariffs[k].tagline };
  });
  const [a, b] = rows;
  const priceGap = b.tariffPrice - a.tariffPrice;          // ₽/мес за точку
  const monthlyGap = rows.length > 1 ? b.withLisa - a.withLisa : 0;
  return { rows, priceGap, monthlyGap };
}

/* ---------------------------------------------------------------------------
   3) ФОРМАТИРОВАНИЕ И МЕЛОЧИ
   -------------------------------------------------------------------------*/
const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

export const money = (v) => `${nf.format(Math.round(num(v)))} ₽`;
export const rubShort = (v) => {
  const x = num(v);
  if (Math.abs(x) >= 1_000_000) return `${nf1.format(x / 1_000_000)} млн ₽`;
  if (Math.abs(x) >= 1_000) return `${nf.format(x / 1_000)} тыс ₽`;
  return `${nf.format(x)} ₽`;
};
export const pct = (v) => `${nf.format(num(v) * 100)}%`;
export const annualRub = (v) => `${nf.format(Math.round(num(v)))} ₽/год`;

function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
  return isFinite(n) ? n : 0;
}
