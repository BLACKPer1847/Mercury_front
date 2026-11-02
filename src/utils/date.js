/*
 * 日期工具：表单里的 'YYYY-MM-DD' 与 Date 互转，以及按「日历天」计算的倒计时。
 * 关键点：new Date('2026-10-01') 会按 UTC 零点解析，在 +8 时区读出来是 09-30 16:00，
 * 所以日期字符串转 Date 一律走 parseDate 按本地时区逐段构造，不要直接 new Date(str)。
 */

// 'YYYY-MM-DD' -> Date（本地时区零点）；空值或格式不对返回 null
export function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = String(str).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Date -> 'YYYY-MM-DD'
export function formatDate(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 目标日期距现在还有多少日历天：今天=0、明天=1、已过期为负数
// 两边都归到本地零点再相减，避免时分秒把结果推到下一天
export function diffInDays(target, base = new Date()) {
  const targetDate = target instanceof Date ? target : parseDate(target);
  if (!targetDate) return null;
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}
