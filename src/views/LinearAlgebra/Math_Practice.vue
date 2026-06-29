<template>
  <div class="math-quiz-wrapper">
    <div class="container">
      <!-- 開始畫面 -->
      <div v-if="currentScreen === 'start'" id="startScreen">
        <h2>十位數加減法特訓</h2>
        <p class="subtitle">
          每次挑戰 10 題。<br>答題後會顯示結果，1 秒後自動進入下一題。
        </p>
        <button class="action-btn" @click="startGame">開始測驗</button>
      </div>

      <!-- 遊戲畫面 -->
      <div v-else-if="currentScreen === 'game'" id="gameScreen">
        <div class="progress">第 {{ questionCount }} / {{ MAX_QUESTIONS }} 題</div>
        
        <div class="equation">{{ currentEquationText }} = ?</div>
        
        <div class="feedback">
          <span :style="{ color: feedbackColor }">{{ feedbackMessage }}</span>
          <span v-if="timeLeft > 0" class="countdown">({{ timeLeft }} 秒後下一題)</span>
        </div>
        
        <div class="options-grid">
          <button
            v-for="(opt, index) in options"
            :key="index"
            class="option-btn"
            :class="opt.status"
            :disabled="isAnswered"
            @click="checkAnswer(opt)"
          >
            {{ opt.value }}
          </button>
        </div>
      </div>

      <!-- 結算畫面 -->
      <div v-else-if="currentScreen === 'end'" id="endScreen">
        <h2>測驗結束！</h2>
        <div class="equation final-score">{{ correctCount }} / {{ MAX_QUESTIONS }}</div>
        
        <p class="evaluation" v-html="evaluationText"></p>
        
        <!-- 錯誤檢討顯示區塊 -->
        <div v-if="mistakes.length > 0" id="mistakesContainer">
          <h3 class="mistake-title">答錯的題目檢討：</h3>
          <div class="mistakes-box">
            <div v-for="(m, index) in mistakes" :key="index" class="mistake-item">
              <div class="mistake-eq">{{ m.equation }} = <span class="text-correct">{{ m.correct }}</span></div>
              <div class="mistake-choice">
                你的選擇：<span class="text-wrong">{{ m.selected }}</span>
              </div>
            </div>
          </div>
        </div>

        <button class="action-btn" @click="startGame">再挑戰一次</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

// --- 狀態變數 ---
const currentScreen = ref('start') // 'start', 'game', 'end'
const questionCount = ref(0)
const correctCount = ref(0)
const currentAnswer = ref(null)
const currentEquationText = ref('')
const options = ref([]) // 儲存選項的陣列： { value: Number, status: String }
const isAnswered = ref(false)
const mistakes = ref([])

const feedbackMessage = ref('請作答')
const feedbackColor = ref('#d2dae2')
const timeLeft = ref(0)

// --- 常數設定 ---
const MAX_QUESTIONS = 10
const OPTION_COUNT = 12
const AUTO_ADVANCE_TIME = 1 // 答題後的等待秒數

let timerInterval = null

// --- 元件生命週期 ---
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

// --- 計算屬性 ---
const evaluationText = computed(() => {
  if (correctCount.value === MAX_QUESTIONS) {
    return '太神啦！<span style="color:#05c46b;">全對滿分！</span> 計算能力非常扎實。'
  } else if (correctCount.value >= 7) {
    return '表現不錯！只差一點點就完美了，繼續保持！'
  } else {
    return '沒關係，這本來就很吃專注力，多練習幾次一定會進步！'
  }
})

// --- 工具函式 ---
const getRandom2Digit = () => {
  let num = Math.floor(Math.random() * 100)
  return Math.random() < 0.5 ? num : -num
}

const formatOperand = (num) => {
  return num < 0 ? `(${num})` : num
}

const generateDistractors = (num1, num2, isAddition, correctAns, count) => {
  let opts = new Set()
  opts.add(correctAns)
  opts.add(-correctAns)

  let wrongOpAns = isAddition ? (num1 - num2) : (num1 + num2)
  opts.add(wrongOpAns)
  opts.add(-wrongOpAns)

  opts.add(correctAns + 10)
  opts.add(correctAns - 10)
  opts.add(correctAns + 1)
  opts.add(correctAns - 1)
  opts.add(correctAns + 2)
  opts.add(correctAns - 2)

  while (opts.size < count) {
    let randomOffset = Math.floor(Math.random() * 41) - 20
    opts.add(correctAns + randomOffset)
  }

  let arr = Array.from(opts)
  // Fisher-Yates 洗牌演算法
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// --- 遊戲邏輯 ---
const startGame = () => {
  questionCount.value = 0
  correctCount.value = 0
  mistakes.value = []
  currentScreen.value = 'game'
  generateProblem()
}

const generateProblem = () => {
  questionCount.value++
  isAnswered.value = false
  feedbackMessage.value = '請作答'
  feedbackColor.value = '#d2dae2'
  timeLeft.value = 0

  let num1 = getRandom2Digit()
  let num2 = getRandom2Digit()
  let isAddition = Math.random() < 0.5

  currentAnswer.value = isAddition ? num1 + num2 : num1 - num2

  let operator = isAddition ? '+' : '-'
  currentEquationText.value = `${formatOperand(num1)} ${operator} ${formatOperand(num2)}`

  const choicesArray = generateDistractors(num1, num2, isAddition, currentAnswer.value, OPTION_COUNT)
  
  // 將純數字陣列轉為物件陣列，用來綁定 CSS class 狀態
  options.value = choicesArray.map(val => ({
    value: val,
    status: '' // 可能的值：'correct', 'wrong', 'highlight'
  }))
}

const checkAnswer = (selectedOpt) => {
  if (isAnswered.value) return
  isAnswered.value = true

  const isCorrect = (selectedOpt.value === currentAnswer.value)

  if (isCorrect) {
    selectedOpt.status = 'correct'
    correctCount.value++
    feedbackMessage.value = '正確！'
    feedbackColor.value = '#05c46b'
  } else {
    selectedOpt.status = 'wrong'
    feedbackMessage.value = `算錯囉！答案是 ${currentAnswer.value}`
    feedbackColor.value = '#ff3f34'

    // 紀錄答錯的資訊
    mistakes.value.push({
      equation: currentEquationText.value,
      selected: selectedOpt.value,
      correct: currentAnswer.value
    })

    // 標示出正確答案
    const correctOpt = options.value.find(opt => opt.value === currentAnswer.value)
    if (correctOpt) {
      correctOpt.status = 'correct highlight'
    }
  }

  startAutoAdvance()
}

const startAutoAdvance = () => {
  timeLeft.value = AUTO_ADVANCE_TIME
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      if (questionCount.value >= MAX_QUESTIONS) {
        currentScreen.value = 'end'
      } else {
        generateProblem()
      }
    }
  }, 1000)
}
</script>

<style scoped>
/* 使用 scoped 確保樣式只影響這個元件 */
.math-quiz-wrapper {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1e272e;
  color: #d2dae2;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

.container {
  background: #2c3e50;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  text-align: center;
  max-width: 800px;
  width: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  margin-top: 0;
  color: #0fbcf9;
}

.subtitle {
  font-size: 20px; 
  color: #808e9b; 
  margin-bottom: 40px;
}

.progress {
  font-size: 20px;
  color: #808e9b;
  margin-bottom: 10px;
  font-weight: bold;
}

.equation {
  font-family: 'Courier New', Courier, monospace;
  font-size: 40px;
  margin: 20px 0;
  letter-spacing: 2px;
  background: #1e272e;
  padding: 20px;
  border-radius: 8px;
  font-weight: bold;
}

.final-score {
  font-size: 48px;
  color: #0fbcf9;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.option-btn {
  background-color: #3c6382;
  color: white;
  border: 2px solid #3c6382;
  padding: 15px 10px;
  font-size: 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: monospace;
  font-weight: bold;
}

.option-btn:hover:not(:disabled) {
  background-color: #0a3d62;
  border-color: #0fbcf9;
  transform: translateY(-2px);
}

.option-btn.correct {
  background-color: #05c46b !important;
  border-color: #05c46b !important;
  color: white;
}

.option-btn.wrong {
  background-color: #ff3f34 !important;
  border-color: #ff3f34 !important;
  color: white;
}

.option-btn.highlight {
  transform: scale(1.05);
  box-shadow: 0 0 10px #05c46b;
}

.option-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.feedback {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.countdown {
  font-size: 18px;
  color: #d2dae2;
  font-weight: normal;
}

.action-btn {
  background-color: #0fbcf9;
  color: #1e272e;
  border: none;
  padding: 15px 40px;
  font-size: 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 20px;
  transition: 0.2s;
}

.action-btn:hover {
  background-color: #4bcffa;
  transform: scale(1.05);
}

.evaluation {
  font-size: 24px;
  margin-bottom: 20px;
}

/* 錯誤檢討清單樣式 */
.mistake-title {
  color: #ff3f34;
  margin: 10px 0 15px 0;
  font-size: 22px;
}

.mistakes-box {
  background: #1e272e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
}

.mistake-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #3c6382;
}

.mistake-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.mistake-eq {
  font-family: 'Courier New', Courier, monospace;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
}

.mistake-choice {
  color: #808e9b;
  font-size: 18px;
}

.text-correct {
  color: #05c46b;
}

.text-wrong {
  color: #ff3f34;
  text-decoration: line-through;
}
</style>