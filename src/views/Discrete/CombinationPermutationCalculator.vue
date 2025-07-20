<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">排列組合計算器</h1>
    <div class="row">
      <!-- 左邊輸入區 -->
      <div class="col-md-8">
        <div
          v-for="(term, index) in terms"
          :key="index"
          class="card p-3 mb-3 shadow-sm position-relative"
        >
          <div class="d-flex align-items-center gap-3">
            <div class="display-6 fw-bold">{{ term.type }}</div>
            <div class="d-flex flex-column">
              <label class="form-label small mb-1">n</label>
              <input type="number" v-model.number="term.n" class="form-control" min="0" />
            </div>
            <div class="d-flex flex-column">
              <label class="form-label small mb-1">r</label>
              <input type="number" v-model.number="term.r" class="form-control" min="0" />
            </div>
            <div class="ms-auto">
              <button class="btn btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style="width: 32px; height: 32px"
                      @click="removeTerm(index)">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div v-if="index < terms.length - 1" class="text-center mt-2 text-muted">×</div>
        </div>

        <div class="mb-3 d-flex gap-2 flex-wrap justify-content-center">
          <button class="btn btn-outline-secondary" @click="addTerm('C')">
            <i class="bi bi-plus-lg"></i> 新增 C
          </button>
          <button class="btn btn-outline-secondary" @click="addTerm('P')">
            <i class="bi bi-plus-lg"></i> 新增 P
          </button>
          <button class="btn btn-primary" @click="calculate">
            <i class="bi bi-calculator-fill"></i> 計算
          </button>
        </div>

        <div v-if="resultText" class="alert alert-success text-center fs-5">
          {{ resultText }}
        </div>
        <div v-if="errorText" class="alert alert-danger text-center fs-6">
          {{ errorText }}
        </div>
      </div>

      <!-- 右邊歷史紀錄區 -->
      <!-- 右邊歷史紀錄區 -->
<div class="col-md-4">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0">歷史紀錄</h5>
    <button class="btn btn-sm btn-outline-danger" @click="clearHistory">
      清除全部
    </button>
  </div>
  <ul class="list-group">
    <li
      v-for="(item, index) in history"
      :key="index"
      class="list-group-item d-flex justify-content-between align-items-center"
      style="cursor: pointer"
      @click="loadHistoryItem(item.terms)"
    >
      <span>{{ item.expression }}</span>
    </li>
    <li v-if="history.length === 0" class="list-group-item text-muted">尚無紀錄</li>
  </ul>
</div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { combination, permutation } from '../../utils/combinatoricsUtils'

const terms = ref([{ type: 'C', n: 10, r: 3 }])
const resultText = ref('')
const errorText = ref('')
const history = ref([])

const HISTORY_KEY = 'combinatorics_history'

function addTerm(type) {
  terms.value.push({ type, n: 0, r: 0 })
}

function removeTerm(index) {
  terms.value.splice(index, 1)
}

function calculate() {
  try {
    let result = 1
    const expressionParts = []

    for (const { type, n, r } of terms.value) {
      if (n < 0 || r < 0) throw new Error('n 和 r 必須為非負整數')
      if (r > n) throw new Error(`r (${r}) 不可大於 n (${n})`)
      const value = type === 'C' ? combination(n, r) : permutation(n, r)
      expressionParts.push(`${type}(${n},${r})`)
      result *= value
    }

    const expression = expressionParts.join(' × ')
    resultText.value = `結果為：${result.toLocaleString()}`
    errorText.value = ''

    const newItem = { expression, terms: JSON.parse(JSON.stringify(terms.value)) }
    history.value.unshift(newItem)
  } catch (err) {
    resultText.value = ''
    errorText.value = err.message
  }
}

function loadHistoryItem(savedTerms) {
  terms.value = JSON.parse(JSON.stringify(savedTerms))
}

function clearHistory() {
  history.value = []
  localStorage.removeItem(HISTORY_KEY)
}

// 🧠 載入時從 localStorage 讀取
onMounted(() => {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse history from localStorage', e)
    }
  }
})

// 📦 當 history 更新，自動存到 localStorage
watch(history, (newVal) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newVal))
}, { deep: true })
</script>

