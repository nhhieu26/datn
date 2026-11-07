// Tối ưu thứ tự ghé thăm (bài toán người du lịch — TSP) trên ma trận thời gian di chuyển theo đường bộ.

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
