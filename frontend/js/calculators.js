// ===================================================================
// HELPERS
// ===================================================================
function formatINR(num) {
  if (!isFinite(num)) return "—";
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

// Keeps a <input type=range> and <input type=number> pair in sync,
// and runs `onChange` whenever either one changes.
function bindPair(rangeId, numberId, onChange) {
  const rangeEl = document.getElementById(rangeId);
  const numEl = document.getElementById(numberId);
  if (!rangeEl || !numEl) return;

  rangeEl.addEventListener("input", () => {
    numEl.value = rangeEl.value;
    onChange();
  });
  numEl.addEventListener("input", () => {
    let v = parseFloat(numEl.value);
    if (isNaN(v)) return;
    if (rangeEl.max && v > parseFloat(rangeEl.max)) rangeEl.max = v;
    rangeEl.value = v;
    onChange();
  });
}

function renderResultBar(resultEl, investedLabel, investedVal, gainLabel, gainVal) {
  const total = Math.max(investedVal + gainVal, 1);
  const investedPct = Math.max((investedVal / total) * 100, 0);
  const gainPct = 100 - investedPct;

  return `
    <div class="calc-bar">
      <div class="calc-bar-invested" style="width:${investedPct}%"></div>
      <div class="calc-bar-gain" style="width:${gainPct}%"></div>
    </div>
    <div class="calc-legend">
      <span><span class="dot" style="background:var(--navy-700)"></span>${investedLabel}</span>
      <span><span class="dot" style="background:var(--gold-500)"></span>${gainLabel}</span>
    </div>
  `;
}

// ===================================================================
// TAB SWITCHING
// ===================================================================
document.querySelectorAll(".calc-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".calc-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".calc-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`[data-panel="${tab.dataset.calc}"]`).classList.add("active");
  });
});

// ===================================================================
// SIP CALCULATOR
// ===================================================================
function calcSIP() {
  const P = parseFloat(document.getElementById("sip-amount-num").value) || 0;
  const annualRate = parseFloat(document.getElementById("sip-return-num").value) || 0;
  const years = parseFloat(document.getElementById("sip-years-num").value) || 0;

  const i = annualRate / 100 / 12;
  const n = years * 12;
  const fv = i === 0 ? P * n : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const invested = P * n;
  const gain = fv - invested;

  document.getElementById("sip-result").innerHTML = `
    <div class="result-row"><span>Total Invested</span><span>${formatINR(invested)}</span></div>
    <div class="result-row"><span>Wealth Gained</span><span>${formatINR(gain)}</span></div>
    <div class="result-row highlight"><span>Maturity Value</span><span>${formatINR(fv)}</span></div>
    ${renderResultBar(null, "Invested", invested, "Growth", gain)}
  `;
}
bindPair("sip-amount", "sip-amount-num", calcSIP);
bindPair("sip-return", "sip-return-num", calcSIP);
bindPair("sip-years", "sip-years-num", calcSIP);

// ===================================================================
// LUMPSUM CALCULATOR
// ===================================================================
function calcLumpsum() {
  const P = parseFloat(document.getElementById("lump-amount-num").value) || 0;
  const annualRate = parseFloat(document.getElementById("lump-return-num").value) || 0;
  const years = parseFloat(document.getElementById("lump-years-num").value) || 0;

  const fv = P * Math.pow(1 + annualRate / 100, years);
  const gain = fv - P;

  document.getElementById("lump-result").innerHTML = `
    <div class="result-row"><span>Invested Amount</span><span>${formatINR(P)}</span></div>
    <div class="result-row"><span>Wealth Gained</span><span>${formatINR(gain)}</span></div>
    <div class="result-row highlight"><span>Maturity Value</span><span>${formatINR(fv)}</span></div>
    ${renderResultBar(null, "Invested", P, "Growth", gain)}
  `;
}
bindPair("lump-amount", "lump-amount-num", calcLumpsum);
bindPair("lump-return", "lump-return-num", calcLumpsum);
bindPair("lump-years", "lump-years-num", calcLumpsum);

// ===================================================================
// RETIREMENT CALCULATOR
// ===================================================================
function calcRetirement() {
  const currentAge = parseFloat(document.getElementById("ret-age-num").value) || 0;
  const retireAge = parseFloat(document.getElementById("ret-retire-age-num").value) || 0;
  const expense = parseFloat(document.getElementById("ret-expense-num").value) || 0;
  const inflation = parseFloat(document.getElementById("ret-inflation-num").value) || 0;
  const postReturn = parseFloat(document.getElementById("ret-return-num").value) || 0;

  const yearsToRetire = Math.max(retireAge - currentAge, 1);
  const futureMonthlyExpense = expense * Math.pow(1 + inflation / 100, yearsToRetire);
  const futureAnnualExpense = futureMonthlyExpense * 12;

  const realRate = (postReturn - inflation) / 100;
  let corpusNeeded;
  if (realRate > 0.001) {
    corpusNeeded = futureAnnualExpense / realRate;
  } else {
    corpusNeeded = futureAnnualExpense * 25; // fallback rule-of-thumb
  }

  // Required monthly SIP (accumulation phase) to reach that corpus
  const i = postReturn / 100 / 12;
  const n = yearsToRetire * 12;
  const annuityFactor = i === 0 ? n : ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const requiredSIP = corpusNeeded / annuityFactor;
  const totalInvested = requiredSIP * n;
  const growth = corpusNeeded - totalInvested;

  document.getElementById("ret-result").innerHTML = `
    <div class="result-row"><span>Future Monthly Expense</span><span>${formatINR(futureMonthlyExpense)}</span></div>
    <div class="result-row"><span>Retirement Corpus Needed</span><span>${formatINR(corpusNeeded)}</span></div>
    <div class="result-row highlight"><span>Suggested Monthly SIP</span><span>${formatINR(requiredSIP)}</span></div>
    ${renderResultBar(null, "Your Contribution", Math.max(totalInvested,0), "Growth", Math.max(growth,0))}
  `;
}
[
  ["ret-age", "ret-age-num"],
  ["ret-retire-age", "ret-retire-age-num"],
  ["ret-expense", "ret-expense-num"],
  ["ret-inflation", "ret-inflation-num"],
  ["ret-return", "ret-return-num"],
].forEach(([r, n]) => bindPair(r, n, calcRetirement));

// ===================================================================
// EMI CALCULATOR
// ===================================================================
function calcEMI() {
  const P = parseFloat(document.getElementById("emi-amount-num").value) || 0;
  const annualRate = parseFloat(document.getElementById("emi-rate-num").value) || 0;
  const years = parseFloat(document.getElementById("emi-years-num").value) || 0;

  const r = annualRate / 100 / 12;
  const n = years * 12;
  const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  document.getElementById("emi-result").innerHTML = `
    <div class="result-row highlight"><span>Monthly EMI</span><span>${formatINR(emi)}</span></div>
    <div class="result-row"><span>Total Interest Payable</span><span>${formatINR(totalInterest)}</span></div>
    <div class="result-row"><span>Total Payment</span><span>${formatINR(totalPayment)}</span></div>
    ${renderResultBar(null, "Principal", P, "Interest", totalInterest)}
  `;
}
bindPair("emi-amount", "emi-amount-num", calcEMI);
bindPair("emi-rate", "emi-rate-num", calcEMI);
bindPair("emi-years", "emi-years-num", calcEMI);

// ===================================================================
// GOAL PLANNING CALCULATOR
// ===================================================================
function calcGoal() {
  const goalAmount = parseFloat(document.getElementById("goal-amount-num").value) || 0;
  const years = parseFloat(document.getElementById("goal-years-num").value) || 0;
  const annualRate = parseFloat(document.getElementById("goal-return-num").value) || 0;

  const i = annualRate / 100 / 12;
  const n = years * 12;
  const annuityFactor = i === 0 ? n : ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const requiredSIP = goalAmount / annuityFactor;
  const totalInvested = requiredSIP * n;
  const growth = goalAmount - totalInvested;

  document.getElementById("goal-result").innerHTML = `
    <div class="result-row highlight"><span>Required Monthly SIP</span><span>${formatINR(requiredSIP)}</span></div>
    <div class="result-row"><span>Total You'll Invest</span><span>${formatINR(totalInvested)}</span></div>
    <div class="result-row"><span>Target Goal Amount</span><span>${formatINR(goalAmount)}</span></div>
    ${renderResultBar(null, "Your Contribution", Math.max(totalInvested,0), "Growth", Math.max(growth,0))}
  `;
}
bindPair("goal-amount", "goal-amount-num", calcGoal);
bindPair("goal-years", "goal-years-num", calcGoal);
bindPair("goal-return", "goal-return-num", calcGoal);

// ===================================================================
// INITIAL RENDER
// ===================================================================
calcSIP();
calcLumpsum();
calcRetirement();
calcEMI();
calcGoal();
