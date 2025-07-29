<script setup>
import { ref } from 'vue'

const m = ref(5)
const n = ref(3)
const result = ref('')

// 計算第二類 Stirling 數的遞迴函式，加入備忘錄優化
const memo = new Map()

function stirlingSecond(m, n) {
  if (n === 0 || n > m) return 0
  if (n === 1 || n === m) return 1

  const key = `${m},${n}`
  if (memo.has(key)) return memo.get(key)

  const val = n * stirlingSecond(m - 1, n) + stirlingSecond(m - 1, n - 1)
  memo.set(key, val)
  return val
}

function onCalculate() {
  if (m.value < 0 || n.value < 0) {
    result.value = 'm 和 n 不能是負數'
    return
  }
  if (n.value > m.value) {
    result.value = 'n 不能大於 m'
    return
  }
  result.value = `S(${m.value}, ${n.value}) = ${stirlingSecond(m.value, n.value)}`
}
</script>

<template>
  <div class="container my-4">
    <div class="card shadow-sm p-4">
      <h5 class="mb-4 text-center">計算第二類 Stirling 數 S(m, n)</h5>
      <div class="row justify-content-center g-3">
        <div class="col-md-3">
          <label class="form-label">m（定義域個數）</label>
          <input type="number" class="form-control" v-model.number="m" min="0" />
        </div>
        <div class="col-md-3">
          <label class="form-label">n（對應值個數）</label>
          <input type="number" class="form-control" v-model.number="n" min="0" />
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-primary w-100" @click="onCalculate">計算</button>
        </div>
      </div>

      <div v-if="result" class="mt-4 text-center fs-5">
        運算結果：<strong>{{ result }}</strong>
      </div>
    </div>
  </div>
</template>
