<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">歐幾里得輾轉相除法計算機</h1>
    <div class="row">
      <div class="col-md-8">
        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
        <div class="mb-3 d-flex gap-2 flex-wrap">
          <input
            ref="inputXRef"
            v-model="inputX"
            type="number"
            min="1"
            placeholder="輸入第一個正整數 (x)"
            class="form-control"
            style="width: 200px;"
            @keydown.enter="saveAndCalculateGCD"
          />
          <input
            ref="inputYRef"
            v-model="inputY"
            type="number"
            min="1"
            placeholder="輸入第二個正整數 (y)"
            class="form-control"
            style="width: 200px;"
            @keydown.enter="saveAndCalculateGCD"
          />
          <button @click="saveAndCalculateGCD" class="btn btn-primary">計算 GCD</button>
        </div>

        <div class="mt-3" v-if="gcdSteps.length > 0">
          <h5>計算步驟：</h5>
          <ul class="list-group">
<li
  v-for="(step, index) in gcdSteps"
  :key="index"
  class="list-group-item"
>
  <pre class="mb-0">第 {{ index + 1 }} 步: {{ formatStep(step) }}</pre>
</li>
            <li class="list-group-item list-group-item-success">
GCD({{ calculatedX }}, {{ calculatedY }}) = {{ gcdResult }}

            </li>
          </ul>
        </div>
      </div>

      <div class="col-md-4">
        <HistoryPanel
          :history="history"
          :width="historyWidth"
          :offset="historyOffset"
          @clearHistory="clearHistory"
          @loadHistoryItem="loadHistoryItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HistoryPanel from '../../components/History_Panel.vue'

const inputX = ref('315')
const inputY = ref('954')
const inputXRef = ref(null)
const inputYRef = ref(null)

const history = ref([])
const historyWidth = ref(250)
const historyOffset = ref(20)
const errorMessage = ref('')
const gcdSteps = ref([])
const gcdResult = ref(null)

const HISTORY_KEY = 'gcd_history'
const HISTORY_WIDTH_KEY = 'gcd_history_width'
const HISTORY_OFFSET_KEY = 'gcd_history_offset'
const calculatedX = ref(null)
const calculatedY = ref(null)

function loadHistory() {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) history.value = JSON.parse(saved)
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}

function loadHistoryWidth() {
  const saved = localStorage.getItem(HISTORY_WIDTH_KEY)
  if (saved) historyWidth.value = Math.max(150, Math.min(400, parseInt(saved)))
}

function saveHistoryWidth() {
  localStorage.setItem(HISTORY_WIDTH_KEY, historyWidth.value.toString())
}

function loadHistoryOffset() {
  const saved = localStorage.getItem(HISTORY_OFFSET_KEY)
  if (saved) historyOffset.value = Math.max(0, Math.min(100, parseInt(saved)))
}

function saveHistoryOffset() {
  localStorage.setItem(HISTORY_OFFSET_KEY, historyOffset.value.toString())
}

function calculateGCD(a, b) {
  const steps = []
  while (b !== 0) {
    const quotient = Math.floor(a / b)
    const remainder = a % b
    steps.push({ dividend: a, divisor: b, quotient, remainder })
    a = b
    b = remainder
  }
  return { gcd: a, steps }
}

function saveAndCalculateGCD() {
  const x = parseInt(inputX.value)
  const y = parseInt(inputY.value)
  calculatedX.value = x
calculatedY.value = y

  if (isNaN(x) || isNaN(y) || x <= 0 || y <= 0) {
    errorMessage.value = '請輸入兩個有效的正整數'
    gcdSteps.value = []
    gcdResult.value = null
    return
  }

  const inputStr = `${x},${y}`
  if (!history.value.includes(inputStr)) {
    history.value.unshift(inputStr)
    if (history.value.length > 10) history.value.pop()
    saveHistory()
  }

  const { gcd, steps } = calculateGCD(x, y)
  gcdSteps.value = steps
  gcdResult.value = gcd
  errorMessage.value = ''
}

function loadHistoryItem(item) {
  const [x, y] = item.split(',').map(n => parseInt(n.trim()))
  inputX.value = x.toString()
  inputY.value = y.toString()
  saveAndCalculateGCD()
}

function clearHistory() {
  history.value = []
  saveHistory()
  gcdSteps.value = []
  gcdResult.value = null
  errorMessage.value = ''
  inputX.value = ''
  inputY.value = ''
}

function formatStep(step) {
  const pad = (num, len) => String(num).padStart(len, ' ')
  const maxLen = Math.max(
    ...gcdSteps.value.map(s => s.dividend.toString().length)
  )
  return `${pad(step.dividend, maxLen)} = ${pad(step.divisor, 3)} × ${pad(step.quotient, 3)} + ${pad(step.remainder, 3)}`
}


onMounted(() => {
  loadHistory()
  loadHistoryWidth()
  loadHistoryOffset()
})
</script>

<style scoped>
.list-group-item {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
}
</style>
