export function factorial(n) {
  if (n < 0) return 0
  let res = 1
  for (let i = 2; i <= n; i++) res *= i
  return res
}

export function combination(n, r) {
  if (r > n) return 0
  return factorial(n) / (factorial(r) * factorial(n - r))
}

export function permutation(n, r) {
  if (r > n) return 0
  return factorial(n) / factorial(n - r)
}

export function evaluateExpression(expression) {
  const regex = /([CP])\((\d+),\s*(\d+)\)/g
  let match
  let result = 1
  let hasMatch = false

  while ((match = regex.exec(expression)) !== null) {
    hasMatch = true
    const type = match[1]
    const n = parseInt(match[2])
    const r = parseInt(match[3])

    const value = type === 'C'
      ? combination(n, r)
      : permutation(n, r)

    result *= value
  }

  if (!hasMatch) throw new Error('無效的輸入格式。請使用例如 C(10,3) 或 P(5,2) 的格式。')
  return result
}
