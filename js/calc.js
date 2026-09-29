/* ============================================================================
   L.I.S.A. — модуль расчётов (экономика)
   L.I.S.A. сдаётся в аренду (абонентская плата). Модель:

     оклад               = «на руки» ÷ (1 − НДФЛ)        ← gross, до НДФЛ
     налоги на сотрудника = НДФЛ + страховые взносы
     стоимость сотрудника = оклад + взносы
     текущие расходы    = филиалы × стоимость сотрудника
     операторов         = ceil(филиалы / филиалов_на_оператора)
     аренда L.I.S.A.    = филиалы × тариф
     расходы с L.I.S.A. = аренда + операторы × стоимость сотрудника
     экономия           = текущие − расходы с L.I.S.A.

   Вводится зарплата «на руки» — то, что сотрудник реально получает (московская
   практика). Сверху работодатель платит НДФЛ 13% и страховые взносы ~30%; модель
   добавляет их автоматически — и для штата филиалов, и для удалённых операторов.
   80 000 ₽ на руки → оклад 91 954 ₽ → полная стоимость 119 540 ₽/мес.

   Чистые функции: на входе числа, на выходе числа. Ничего не рисуют.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   1) КОНФИГУРАЦИЯ (правится в одном месте)
   -------------------------------------------------------------------------*/
export const CONFIG = {
  // Зарплата одного сотрудника «на руки», ₽/мес (по умолчанию в форме).
  // Московский ориентир для администратора ресепшена: 80 000 ₽ на руки.
  salaryNetDefault: 80000,

  // НДФЛ, удерживаемый из оклада (сотрудник получает «на руки» меньше оклада)
  ndflRate: 0.13,

  // Страховые взносы работодателя сверх оклада (единый тариф, в пределах базы)
  payrollTaxRate: 0.30,

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
  salaryNet,
  branchesPerOperator = CONFIG.branchesPerOperatorDefault,
  tariff = CONFIG.defaultTariff,
}) {
  const b = num(branches);
  const net = num(salaryNet);                      // «на руки», ₽/мес
  const per = Math.max(1, num(branchesPerOperator));
  const price = tariffPrice(tariff);
  const ndflRate = CONFIG.ndflRate;                // 0.13
  const taxRate = CONFIG.payrollTaxRate;           // 0.30
  const gross = Math.round(net / (1 - ndflRate));  // оклад до НДФЛ, ₽/мес
  const ndfl = gross - net;                        // НДФЛ на человека, ₽/мес
  const contrib = Math.round(gross * taxRate);     // страховые взносы на человека
  const full = gross + contrib;                    // полная стоимость для компании
  const taxPerEmployee = ndfl + contrib;           // всё, что сверх «на руки»

  const currentCost = b * full;                    // ₽/мес на ресепшен сейчас
  const operators = Math.ceil(b / per);            // сколько удалённых операторов нужно
  const rent = b * price;                          // ₽/мес аренда L.I.S.A.
  const operatorsCost = operators * full;          // ₽/мес на удалённых операторов
  const withLisa = rent + operatorsCost;           // ₽/мес с L.I.S.A.
  const monthlyDiff = currentCost - withLisa;      // ₽/мес экономия
  const annualDiff = monthlyDiff * 12;             // ₽/год экономия

  return {
    branches: b,
    salaryNet: net,                                // «на руки», как введено
    gross,                                         // оклад до НДФЛ
    ndflRate,
    ndflPerEmployee: ndfl,
    payrollTaxRate: taxRate,
    contribPerEmployee: contrib,
    payrollTaxPerEmployee: taxPerEmployee,         // НДФЛ + взносы на человека
    payrollTaxMonthly: (b + operators) * taxPerEmployee, // налоги по всей схеме
    employeeFull: full,                            // полная стоимость человека
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
    perBranchNow: full,                            // ₽/мес за одну точку сейчас (полная)
    perBranchLisa: price,                          // ₽/мес за одну точку с L.I.S.A.
  };
}

/**
 * Сравнение двух тарифов на одной и той же сети.
 * Возвращает обе конфигурации + разницу между ними.
 */
export function computeTiers({ branches, salaryNet, branchesPerOperator = CONFIG.branchesPerOperatorDefault }) {
  const keys = Object.keys(CONFIG.tariffs);
  const rows = keys.map((k) => {
    const s = computeSavings({ branches, salaryNet, branchesPerOperator, tariff: k });
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
