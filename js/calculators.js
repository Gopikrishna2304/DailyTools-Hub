/* ==========================================================================
   DailyTools Hub — calculators.js
   Pure calculation functions used by the finance and date/time tool pages.
   Kept framework-free so they're easy to unit test or reuse.
   ========================================================================== */

/* ---------- Age Calculator ---------- */
function calcAge(dobStr, onDateStr) {
  const dob = new Date(dobStr);
  const onDate = onDateStr ? new Date(onDateStr) : new Date();
  if (isNaN(dob.getTime())) return null;
  if (dob > onDate) return { error: "Date of birth can't be in the future." };

  let years = onDate.getFullYear() - dob.getFullYear();
  let months = onDate.getMonth() - dob.getMonth();
  let days = onDate.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(onDate.getFullYear(), onDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Next birthday
  let next = new Date(onDate.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < onDate || (next.getMonth() === onDate.getMonth() && next.getDate() === onDate.getDate() && false)) {
    next = new Date(onDate.getFullYear() + 1, dob.getMonth(), dob.getDate());
  }
  if (next < onDate) next = new Date(onDate.getFullYear() + 1, dob.getMonth(), dob.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysToNextBirthday = Math.round((next - onDate) / msPerDay);
  const totalDays = Math.round((onDate - dob) / msPerDay);

  return { years, months, days, daysToNextBirthday, totalDays };
}

/* ---------- EMI Calculator ---------- */
function calcEMI(principal, annualRatePct, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return null;
  const monthlyRate = annualRatePct / 12 / 100;
  let emi;
  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    const r = monthlyRate;
    const n = tenureMonths;
    emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  return {
    emi: round2(emi),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    principal: round2(principal),
  };
}

/* ---------- Percentage Calculator ---------- */
function calcPercentOf(percent, value) {
  return round2((percent / 100) * value);
}
function calcWhatPercent(part, whole) {
  if (whole === 0) return null;
  return round2((part / whole) * 100);
}
function calcPercentChange(from, to) {
  if (from === 0) return null;
  const change = ((to - from) / Math.abs(from)) * 100;
  return round2(change);
}

/* ---------- GST Calculator ---------- */
function calcGSTAdd(amount, gstPct) {
  const gstAmount = round2((amount * gstPct) / 100);
  return { original: round2(amount), gstAmount, final: round2(amount + gstAmount) };
}
function calcGSTRemove(finalAmount, gstPct) {
  const original = round2(finalAmount / (1 + gstPct / 100));
  const gstAmount = round2(finalAmount - original);
  return { original, gstAmount, final: round2(finalAmount) };
}

/* ---------- Discount Calculator ---------- */
function calcDiscount(originalPrice, discountPct) {
  const discountAmount = round2((originalPrice * discountPct) / 100);
  const finalPrice = round2(originalPrice - discountAmount);
  return { discountAmount, finalPrice, saved: discountAmount };
}

/* ---------- Salary Calculator ---------- */
function calcSalary(monthly, deductionPct) {
  const annual = round2(monthly * 12);
  const deduction = round2((annual * (deductionPct || 0)) / 100);
  const netAnnual = round2(annual - deduction);
  const netMonthly = round2(netAnnual / 12);
  return { monthly: round2(monthly), annual, deduction, netAnnual, netMonthly };
}

/* ---------- Date Calculator ---------- */
function calcDateDifference(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((end - start) / msPerDay);

  let y1 = start.getFullYear(), m1 = start.getMonth(), d1 = start.getDate();
  let y2 = end.getFullYear(), m2 = end.getMonth(), d2 = end.getDate();
  const early = end >= start ? { y: y1, m: m1, d: d1 } : { y: y2, m: m2, d: d2 };
  const late = end >= start ? { y: y2, m: m2, d: d2 } : { y: y1, m: m1, d: d1 };

  let years = late.y - early.y;
  let months = late.m - early.m;
  let days = late.d - early.d;
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(late.y, late.m, 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { totalDays: Math.abs(totalDays), years, months, days };
}

function calcAddDays(dateStr, days) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d;
}

/* ---------- Days Calculator ---------- */
function calcDaysBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / msPerDay);
}
function calcDaysFromToday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  if (isNaN(target.getTime())) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.round((target - today) / msPerDay);
  return diff; // positive = future, negative = past
}

/* ---------- Helpers ---------- */
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function formatCurrency(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}
