export function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function combination(n, k) {
  if (k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

export function stirlingSecondKind(m, n) {
  let total = 0;
  for (let i = 0; i <= n; i++) {
    const sign = (i % 2 === 0) ? 1 : -1;
    const comb = combination(n, i);
    total += sign * comb * Math.pow(n - i, m);
  }
  return total / factorial(n);
}

export function countOntoFunctions(m, n) {
  if (n > m) return 0;
  return factorial(n) * stirlingSecondKind(m, n);
}
