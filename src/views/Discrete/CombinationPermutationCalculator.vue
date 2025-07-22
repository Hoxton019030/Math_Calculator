<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">排列組合計算器</h1>
    <div class="row">
      <!-- 左邊輸入區（可拖曳排序） -->
      <div class="col-md-8">
        <draggable v-model="terms" item-key="id" handle=".drag-handle" animation="200">
          <template #item="{ element: term, index }">
            <div
              class="card p-3 mb-3 shadow-sm d-flex align-items-center"
              style="user-select: none;"
            >
              <div class="d-flex align-items-center gap-3 w-100">
                <div
                  class="drag-handle d-flex align-items-center justify-content-center"
                  style="cursor: grab; width: 32px; height: 32px; font-size: 24px; user-select:none;"
                  title="拖曳改變順序"
                >
                  ⇆
                </div>
                <div class="fw-bold fs-3" style="width: 30px;">{{ term.type }}</div>
                <div class="d-flex flex-column">
                  <label class="form-label small mb-1">n</label>
                  <input
                    type="number"
                    v-model.number="term.n"
                    class="form-control"
                    min="0"
                    style="width: 100px;"
                  />
                </div>
                <div class="d-flex flex-column">
                  <label class="form-label small mb-1">r</label>
                  <input
                    type="number"
                    v-model.number="term.r"
                    class="form-control"
                    min="0"
                    style="width: 100px;"
                  />
                </div>
                <button
                  class="btn btn-outline-danger rounded-circle p-2 ms-auto"
                  style="width: 32px; height: 32px;"
                  @click="removeTerm(index)"
                  title="刪除此項"
                >
                  
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <div class="mb-3 d-flex gap-2 flex-wrap justify-content-center">
          <button class="btn btn-outline-secondary" @click="addTerm('C')">
            + 新增 C
          </button>
          <button class="btn btn-outline-secondary" @click="addTerm('P')">
            + 新增 P
          </button>
          <button class="btn btn-primary" @click="calculate">
            計算
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
      <div class="col-md-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">歷史紀錄</h5>
          <button class="btn btn-sm btn-outline-danger" @click="clearHistory">
            清除全部
          </button>
        </div>

        <ul class="list-group">
          <draggable
            v-model="history"
            item-key="id"
            handle=".drag-handle-history"
            animation="200"
          >
            <template #item="{ element: item, index }">
              <li class="list-group-item d-flex justify-content-between align-items-center flex-column align-items-start">
                <div class="d-flex align-items-center w-100">
                  <div
                    class="drag-handle-history me-2"
                    style="cursor: grab; font-size: 20px; user-select:none;"
                    title="拖曳改變順序"
                  >
                    ⇆
                  </div>
                  <span
                    @click="loadHistoryItem(item.terms)"
                    style="cursor: pointer; flex-grow:1;"
                    :title="item.expression"
                  >
                    {{ item.expression }}
                  </span>
                  <button
                    class="btn btn-sm btn-outline-danger ms-2"
                    @click.stop="deleteHistory(index)"
                    title="刪除此筆歷史"
                  >
                    ×
                  </button>
                </div>
              <small class="text-muted mt-1 w-100 text-end">
  結果：
  {{ item.result !== undefined ? item.result.toLocaleString() : '-' }}
</small>

              </li>
            </template>
          </draggable>
          <li v-if="history.length === 0" class="list-group-item text-muted">尚無紀錄</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'

function combination(n, r) {
  if (r > n) return 0
  if (r === 0 || r === n) return 1
  let res = 1
  for (let i = 1; i <= r; i++) {
    res = (res * (n - i + 1)) / i
  }
  return Math.round(res)
}

function permutation(n, r) {
  if (r > n) return 0
  let res = 1
  for (let i = 0; i < r; i++) {
    res *= n - i
  }
  return res
}

const terms = ref([
  { id: 0, type: 'C', n: 100, r: 2 },
  { id: 1, type: 'C', n: 22, r: 3 },
])

const resultText = ref('')
const errorText = ref('')
const history = ref([])

let idCounter = 2
let historyIdCounter = 0
const HISTORY_KEY = 'combinatorics_history'

function addTerm(type) {
  terms.value.push({ id: idCounter++, type, n: 0, r: 0 })
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

    const savedTerms = terms.value.map(({ type, n, r }) => ({ type, n, r }))
    const newItem = { id: historyIdCounter++, expression, terms: savedTerms, result }
    history.value.unshift(newItem)
  } catch (err) {
    resultText.value = ''
    errorText.value = err.message
  }
}

function loadHistoryItem(savedTerms) {
  terms.value = savedTerms.map((term) => ({ ...term, id: idCounter++ }))
  resultText.value = ''
  errorText.value = ''
}

function deleteHistory(index) {
  history.value.splice(index, 1)
}

function clearHistory() {
  history.value = []
  localStorage.removeItem(HISTORY_KEY)
}

onMounted(() => {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) {
    try {
      history.value = JSON.parse(saved)
      if (history.value.length) {
        // 從最大id開始接續
        historyIdCounter = Math.max(...history.value.map(i => i.id)) + 1
      }
    } catch (e) {
      console.error('讀取歷史資料失敗', e)
    }
  }
})

watch(
  history,
  (newVal) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newVal))
  },
  { deep: true }
)
</script>

<style scoped>
.drag-handle,
.drag-handle-history {
  user-select: none;
}
</style>
