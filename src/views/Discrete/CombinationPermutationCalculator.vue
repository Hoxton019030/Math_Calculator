<template>
  <div class="container-fluid">
    <!-- Main content with calculator -->
    <div class="main-content py-4">
      <h1 class="mb-4 text-center text-3xl font-bold text-gray-800">排列組合計算器</h1>
      <div class="row justify-content-center">
        <div class="col-md-8">
          <draggable v-model="terms" item-key="id" handle=".drag-handle" animation="200">
            <template #item="{ element: term, index }">
              <div class="card p-3 mb-3 shadow-sm d-flex align-items-center bg-white rounded-lg" style="user-select: none;">
                <div class="d-flex align-items-center gap-3 w-100">
                  <div
                    class="drag-handle d-flex align-items-center justify-content-center text-gray-500"
                    style="cursor: grab; width: 32px; height: 32px; font-size: 24px;"
                    title="拖曳改變順序"
                  >
                    ⇆
                  </div>
                  <div class="fw-bold fs-3" style="width: 30px;">{{ term.type }}</div>
                  <div class="d-flex flex-column">
                    <label class="form-label small mb-1 text-gray-600">n</label>
                    <input
                      type="number"
                      v-model.number="term.n"
                      class="form-control border-gray-300 rounded-md"
                      min="0"
                      style="width: 100px;"
                    />
                  </div>
                  <div v-if="term.type !== 'F'" class="d-flex flex-column">
                    <label class="form-label small mb-1 text-gray-600">r</label>
                    <input
                      type="number"
                      v-model.number="term.r"
                      class="form-control border-gray-300 rounded-md"
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
            <button class="btn btn-outline-secondary rounded-md hover:bg-gray-100 transition-colors" @click="addTerm('C')">+ 新增 C</button>
            <button class="btn btn-outline-secondary rounded-md hover:bg-gray-100 transition-colors" @click="addTerm('P')">+ 新增 P</button>
            <button class="btn btn-outline-secondary rounded-md hover:bg-gray-100 transition-colors" @click="addTerm('F')">+ 新增 F</button>
            <button class="btn btn-primary rounded-md hover:bg-blue-600 transition-colors" @click="calculate">計算</button>
          </div>

          <div v-if="resultText" class="alert alert-success text-center fs-5 rounded-md">
            {{ resultText }}
          </div>
          <div v-if="errorText" class="alert alert-danger text-center fs-6 rounded-md">
            {{ errorText }}
          </div>
        </div>
      </div>
    </div>

    <!-- Right sidebar for history -->
    <div class="history-sidebar" :style="{ right: isSidebarOpen ? '0' : '-300px' }">
      <div class="sidebar-header d-flex justify-content-between align-items-center p-3 bg-gray-100 border-b border-gray-200">
        <h1 class="mb-0 text-gray-800 font-semibold">歷史紀錄</h1>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-outline-danger rounded-md hover:bg-red-50 transition-colors" @click="clearHistory">清除全部</button>
        </div>
      </div>
      <div class="sidebar-content p-3">
        <ul class="list-group">
          <draggable v-model="history" item-key="id" handle=".drag-handle-history" animation="200">
            <template #item="{ element: item, index }">
              <li class="list-group-item d-flex justify-content-between align-items-center flex-column align-items-start border-0 py-2 hover:bg-gray-50 transition-colors">
                <div class="d-flex align-items-center w-100">
                  <div
                    class="drag-handle-history me-2 text-gray-500"
                    style="cursor: grab; font-size: 20px;"
                    title="拖曳改變順序"
                  >
                    ⇆
                  </div>
                  <span
                    @click="loadHistoryItem(item.terms)"
                    style="cursor: pointer; flex-grow: 1;"
                    class="text-gray-700 hover:text-blue-600 transition-colors"
                    :title="item.expression"
                  >
                    {{ item.expression }}
                  </span>
                  <button
                    class="btn btn-sm btn-outline-danger ms-2 rounded-circle"
                    @click.stop="deleteHistory(index)"
                    title="刪除此筆歷史"
                  >
                    ×
                  </button>
                </div>
                <small class="text-muted mt-1 w-100 text-end">
                  結果：{{ item.result !== undefined ? item.result.toLocaleString() : '-' }}
                </small>
              </li>
            </template>
          </draggable>
          <li v-if="history.length === 0" class="list-group-item text-muted border-0 py-2">尚無紀錄</li>
        </ul>
      </div>
      <button
        class="toggle-button"
        :class="{ 'collapsed': !isSidebarOpen }"
        @click="toggleSidebar"
        title="切換側邊欄"
        style="position: fixed; right: 10px; bottom: 20px;"
      >
        <svg
          class="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="isSidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'"
          ></path>
        </svg>
      </button>
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

function factorial(n) {
  if (n < 0) return 0
  let res = 1
  for (let i = 2; i <= n; i++) {
    res *= i
  }
  return res
}

const terms = ref([{ id: 1, type: 'C', n: 5, r: 3 }])
const resultText = ref('')
const errorText = ref('')
const history = ref([])
const isSidebarOpen = ref(true)

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
      if (n < 0) throw new Error('n 必須為非負整數')
      if (type !== 'F' && r < 0) throw new Error('r 必須為非負整數')
      if ((type === 'C' || type === 'P') && r > n)
        throw new Error(`r (${r}) 不可大於 n (${n})`)

      let value
      if (type === 'C') value = combination(n, r)
      else if (type === 'P') value = permutation(n, r)
      else if (type === 'F') value = factorial(n)
      else throw new Error('未知的類型')

      expressionParts.push(type === 'F' ? `${n}!` : `${type}(${n},${r})`)
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

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(() => {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) {
    try {
      history.value = JSON.parse(saved)
      if (history.value.length) {
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
.container-fluid {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding-right: 40px; /* Reserve space for toggle button */
}

.history-sidebar {
  width: 300px;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  position: fixed;
  top: 0;
  bottom: 0;
  transition: right 0.3s ease-in-out;
  z-index: 1000;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px 0 0 8px;
}

.sidebar-header {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-content {
  overflow-y: auto;
  height: calc(100% - 60px); /* Adjust based on header height */
}

.toggle-button {
  position: fixed;
  bottom: 20px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  z-index: 1001;
}

.toggle-button:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), inset 0 3px 6px rgba(255, 255, 255, 0.4);
}

.toggle-button.collapsed {
  transform: none; /* No transform needed since button is fixed */
}

.drag-handle,
.drag-handle-history {
  user-select: none;
}

.list-group-item {
  background-color: transparent;
}

@media (max-width: 768px) {
  .main-content {
    padding-right: 40px; /* Reserve space for toggle button on mobile */
  }

  .history-sidebar {
    width: 100%;
  }

  .toggle-button {
    right: 10px; /* Maintain gap on mobile */
  }
}
</style>