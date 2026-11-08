// Tối ưu thứ tự ghé thăm (bài toán người du lịch — TSP) trên ma trận thời gian di chuyển theo đường bộ.
import type { Meal } from "./meal-stops";

// Cặp điểm không có đường bộ → coi như rất xa để thuật toán tránh
const UNREACHABLE = 1e9;
// Held-Karp có độ phức tạp O(2^n · n²): chính xác và vẫn nhanh tới khoảng 11 điểm
const EXACT_LIMIT = 11;

export type OptimizeOptions = {
  // Chỉ số điểm xuất phát cố định (vd: khách sạn); bỏ trống → tự chọn điểm đầu tốt nhất
  start?: number;
  // Quay về điểm xuất phát ở cuối hành trình
  roundTrip?: boolean;
};

type Matrix = (number | null)[][];

const cost = (matrix: Matrix, from: number, to: number) => matrix[from]?.[to] ?? UNREACHABLE;

/** Tổng chi phí của một thứ tự ghé thăm. */
export function orderCost(matrix: Matrix, order: number[], roundTrip = false): number {
  let total = 0;
  for (let i = 1; i < order.length; i++) total += cost(matrix, order[i - 1], order[i]);
  if (roundTrip && order.length > 1) total += cost(matrix, order[order.length - 1], order[0]);
  return total;
}

/**
 * Trả về thứ tự chỉ số các điểm (bắt đầu bằng `start` nếu có) sao cho tổng thời gian di chuyển nhỏ nhất.
 * n ≤ 11: quy hoạch động Held-Karp (tối ưu chính xác); lớn hơn: láng giềng gần nhất + cải tiến 2-opt.
 */
export function optimizeOrder(matrix: Matrix, options: OptimizeOptions = {}): number[] {
  const n = matrix.length;
  if (n <= 1) return n === 1 ? [0] : [];
  // Vòng khép kín không có điểm đầu cố định: mọi phép xoay đều như nhau → cố định điểm 0
  const start = options.start ?? (options.roundTrip ? 0 : undefined);
  const roundTrip = Boolean(options.roundTrip);
  return n <= EXACT_LIMIT
    ? heldKarp(matrix, start, roundTrip)
    : twoOpt(matrix, nearestNeighbor(matrix, start), start !== undefined, roundTrip);
}

/**
 * Tối ưu thứ tự các điểm chính (không thuộc `insertIndices`), sau đó chèn từng điểm phụ (quán ăn) vào lộ trình:
 * - quán có bữa (`meals`): sáng → ngay sau điểm xuất phát; tối → cuối ngày (trước khi về khách sạn);
 *   trưa → chỗ làm tăng ít thời gian nhất trong khoảng giữa tuyến;
 * - quán không có bữa: chỗ làm tăng ít thời gian nhất — nằm dọc đường thay vì bị TSP đẩy về cuối ngày.
 */
export function optimizeWithInsertions(
  matrix: Matrix,
  insertIndices: number[],
  options: OptimizeOptions = {},
  meals: ReadonlyMap<number, Meal> = new Map(),
): number[] {
  const inserts = new Set(insertIndices);
  const main = matrix.map((_, i) => i).filter((i) => !inserts.has(i));
  if (main.length === 0 || inserts.size === 0) return optimizeOrder(matrix, options);

  const sub = main.map((i) => main.map((j) => matrix[i]?.[j] ?? null));
  const subStart = options.start !== undefined ? main.indexOf(options.start) : -1;
  const order = optimizeOrder(sub, {
    start: subStart >= 0 ? subStart : undefined,
    roundTrip: options.roundTrip,
  }).map((k) => main[k]);

  const roundTrip = Boolean(options.roundTrip);
  // Điểm đầu cố định (khách sạn/điểm xuất phát) không bị chèn lên trước
  const fixedStart = subStart >= 0 || roundTrip;
  const first = fixedStart ? 1 : 0;
  // Số điểm chính đứng trước vị trí chèn `pos` (không tính điểm xuất phát)
  const mainBefore = (pos: number) => order.slice(first, pos).filter((i) => !inserts.has(i)).length;
  const visits = main.length - first;
  const lunchMin = Math.min(visits, Math.max(1, Math.floor(visits / 3)));
  const lunchMax = Math.min(visits, Math.max(1, Math.ceil((2 * visits) / 3)));

  const addedCost = (pos: number, extra: number) => {
    const prev = pos > 0 ? order[pos - 1] : undefined;
    const next = pos < order.length ? order[pos] : roundTrip ? order[0] : undefined;
    return (
      (prev !== undefined ? cost(matrix, prev, extra) : 0) +
      (next !== undefined ? cost(matrix, extra, next) : 0) -
      (prev !== undefined && next !== undefined ? cost(matrix, prev, next) : 0)
    );
  };
  // Quán trưa/không bữa chỉ nằm sau các quán sáng và trước các quán tối đã chèn
  const cheapest = (extra: number, allowed: (pos: number) => boolean) => {
    let lo = first;
    while (lo < order.length && meals.get(order[lo]) === "breakfast") lo++;
    const firstDinner = order.findIndex((i, k) => k >= lo && meals.get(i) === "dinner");
    const hi = firstDinner < 0 ? order.length : firstDinner;
    let bestPos = -1;
    let bestAdded = Infinity;
    for (let pos = lo; pos <= hi; pos++) {
      if (!allowed(pos)) continue;
      const added = addedCost(pos, extra);
      if (added < bestAdded) {
        bestAdded = added;
        bestPos = pos;
      }
    }
    return bestPos;
  };

  // Sáng, tối trước (vị trí cố định), rồi trưa (giữa tuyến), cuối cùng quán không có bữa
  const rank = (i: number) => ({ breakfast: 0, dinner: 1, lunch: 2 })[meals.get(i) ?? "lunch"] + (meals.has(i) ? 0 : 3);
  for (const extra of [...insertIndices].sort((a, b) => rank(a) - rank(b))) {
    const meal = meals.get(extra);
    let pos: number;
    if (meal === "breakfast") {
      // Sau các quán sáng đã chèn (nếu có nhiều)
      pos = first;
      while (pos < order.length && meals.get(order[pos]) === "breakfast") pos++;
    } else if (meal === "dinner") {
      pos = order.length;
    } else if (meal === "lunch") {
      pos = cheapest(extra, (p) => {
        const before = mainBefore(p);
        return before >= lunchMin && before <= lunchMax;
      });
      if (pos < 0) pos = cheapest(extra, () => true);
    } else {
      pos = cheapest(extra, () => true);
    }
    order.splice(pos < 0 ? order.length : pos, 0, extra);
  }
  return order;
}

function heldKarp(matrix: Matrix, start: number | undefined, roundTrip: boolean): number[] {
  const n = matrix.length;
  const full = (1 << n) - 1;
  const dp = new Float64Array((1 << n) * n).fill(Infinity);
  const parent = new Int8Array((1 << n) * n).fill(-1);
  const at = (mask: number, j: number) => mask * n + j;

  const starts = start === undefined ? [...Array(n).keys()] : [start];
  for (const s of starts) dp[at(1 << s, s)] = 0;

  for (let mask = 1; mask <= full; mask++) {
    for (let j = 0; j < n; j++) {
      const current = dp[at(mask, j)];
      if (!(mask & (1 << j)) || current === Infinity) continue;
      for (let k = 0; k < n; k++) {
        if (mask & (1 << k)) continue;
        const next = mask | (1 << k);
        const candidate = current + cost(matrix, j, k);
        if (candidate < dp[at(next, k)]) {
          dp[at(next, k)] = candidate;
          parent[at(next, k)] = j;
        }
      }
    }
  }

  let end = 0;
  let best = Infinity;
  for (let j = 0; j < n; j++) {
    const total = dp[at(full, j)] + (roundTrip && start !== undefined ? cost(matrix, j, start) : 0);
    if (total < best) {
      best = total;
      end = j;
    }
  }

  const order: number[] = [];
  let mask = full;
  let node = end;
  while (node !== -1) {
    order.push(node);
    const prev = parent[at(mask, node)];
    mask &= ~(1 << node);
    node = prev;
  }
  return order.reverse();
}

function nearestNeighbor(matrix: Matrix, start: number | undefined): number[] {
  const n = matrix.length;
  const begin = start ?? 0;
  const order = [begin];
  const visited = new Set(order);
  while (order.length < n) {
    const last = order[order.length - 1];
    let next = -1;
    for (let k = 0; k < n; k++) {
      if (visited.has(k)) continue;
      if (next === -1 || cost(matrix, last, k) < cost(matrix, last, next)) next = k;
    }
    order.push(next);
    visited.add(next);
  }
  return order;
}

// Đảo ngược từng đoạn con nếu làm giảm tổng chi phí, lặp tới khi không cải thiện được nữa
function twoOpt(matrix: Matrix, initial: number[], fixedStart: boolean, roundTrip: boolean): number[] {
  let order = initial;
  let best = orderCost(matrix, order, roundTrip);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = fixedStart ? 1 : 0; i < order.length - 1; i++) {
      for (let k = i + 1; k < order.length; k++) {
        const candidate = [
          ...order.slice(0, i),
          ...order.slice(i, k + 1).reverse(),
          ...order.slice(k + 1),
        ];
        const candidateCost = orderCost(matrix, candidate, roundTrip);
        if (candidateCost < best - 1e-9) {
          order = candidate;
          best = candidateCost;
          improved = true;
        }
      }
    }
  }
  return order;
}
