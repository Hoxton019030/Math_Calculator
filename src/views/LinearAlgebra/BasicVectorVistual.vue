<template>
  <div class="basis-transformation">
    <h1>🎯 基底變換視覺化</h1>
    
    <div class="main-content">
      <div class="control-panel">
        <div class="input-group">
          <label>基向量 1 (b₁)</label>
          <div class="vector-inputs">
            <input 
              type="number" 
              v-model.number="basis1.x" 
              step="0.1" 
              placeholder="x"
              @input="updateVisualization"
            >
            <input 
              type="number" 
              v-model.number="basis1.y" 
              step="0.1" 
              placeholder="y"
              @input="updateVisualization"
            >
          </div>
        </div>

        <div class="input-group">
          <label>基向量 2 (b₂)</label>
          <div class="vector-inputs">
            <input 
              type="number" 
              v-model.number="basis2.x" 
              step="0.1" 
              placeholder="x"
              @input="updateVisualization"
            >
            <input 
              type="number" 
              v-model.number="basis2.y" 
              step="0.1" 
              placeholder="y"
              @input="updateVisualization"
            >
          </div>
        </div>

        <div class="input-group">
          <label>目標向量 (v)</label>
          <div class="vector-inputs">
            <input 
              type="number" 
              v-model.number="targetVector.x" 
              step="0.1" 
              placeholder="x"
              @input="updateVisualization"
            >
            <input 
              type="number" 
              v-model.number="targetVector.y" 
              step="0.1" 
              placeholder="y"
              @input="updateVisualization"
            >
          </div>
        </div>

        <div class="input-group">
          <label>向量行為</label>
          <select v-model="vectorBehavior" @change="updateVectorBehavior">
            <option value="fixed">固定</option>
            <option value="stretch">拉伸</option>
          </select>
        </div>

        <div class="preset-buttons">
          <button @click="setStandardBasis">標準基底</button>
          <button @click="setExample1">範例 1</button>
          <button @click="setExample2">範例 2</button>
          <button @click="randomBasis">隨機基底</button>
        </div>

        <div class="display-options">
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="showStandardGrid" 
                @change="updateVisualization"
              >
              <span class="checkmark"></span>
              顯示標準格線
            </label>
          </div>
        </div>

        <div class="coordinate-display">
          <h3>坐標表示</h3>
          <div class="coord-item">
            <span>標準坐標:</span>
            <span>{{ standardCoordinates }}</span>
          </div>
          <div class="coord-item">
            <span>新基底坐標:</span>
            <span>{{ newCoordinates }}</span>
          </div>
          <div class="coord-item">
            <span>驗證:</span>
            <span :style="{ color: isVerificationCorrect ? '#27ae60' : '#e74c3c' }">
              {{ isVerificationCorrect ? '✓' : '✗' }}
            </span>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="canvas-container">
        <canvas 
          ref="canvas" 
          @resize="handleResize"
        ></canvas>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #e74c3c;"></div>
            <span>目標向量</span>
          </div>
          <div class="legend-item" v-if="!isStandardBasis">
            <div class="legend-color" style="background: #9b59b6;"></div>
            <span>基向量</span>
          </div>
          <div class="legend-item" v-if="showStandardGrid">
            <div class="legend-color" style="background: #3498db;"></div>
            <span>標準格線</span>
          </div>
          <div class="legend-item" v-if="!isStandardBasis">
            <div class="legend-color" style="background: #9b59b6; opacity: 0.3;"></div>
            <span>新基底格線</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

// 響應式數據
const canvas = ref(null)
const ctx = ref(null)

const basis1 = reactive({ x: 1, y: 0 }) // 標準基底
const basis2 = reactive({ x: 0, y: 1 }) // 標準基底
const targetVector = reactive({ x: 4, y: 5 }) // 與圖片匹配
const showStandardGrid = ref(true)
const vectorBehavior = ref('fixed') // 新增向量行為選項，預設為固定
const initialTargetVector = reactive({ x: 4, y: 5 }) // 儲存初始目標向量

const determinant = computed(() => {
  return basis1.x * basis2.y - basis1.y * basis2.x
})
const newBasisCoordinates = computed(() => {
  if (!isLinearlyIndependent.value) return { c1: 0, c2: 0 }
  
  const det = determinant.value
  const c1 = (targetVector.x * basis2.y - targetVector.y * basis2.x) / det
  const c2 = -(targetVector.x * basis1.y - targetVector.y * basis1.x) / det // 修正公式
  
  return { c1, c2 }
})

const standardCoordinates = computed(() => {
  return `(${targetVector.x}, ${targetVector.y})`
})

const isLinearlyIndependent = computed(() => {
  return Math.abs(determinant.value) > 0.001
})

const errorMessage = computed(() => {
  return isLinearlyIndependent.value ? '' : '基向量線性相關！請修改數值。'
})

const newCoordinates = computed(() => {
  const { c1, c2 } = newBasisCoordinates.value
  return `(${c1.toFixed(2)}, ${c2.toFixed(2)})`
})

const isVerificationCorrect = computed(() => {
  if (!isLinearlyIndependent.value) return false
  
  const { c1, c2 } = newBasisCoordinates.value
  const verifyX = c1 * basis1.x + c2 * basis2.x
  const verifyY = c1 * basis1.y + c2 * basis2.y
  
  return Math.abs(verifyX - targetVector.x) < 0.01 && 
         Math.abs(verifyY - targetVector.y) < 0.01
})

const isStandardBasis = computed(() => {
  return Math.abs(basis1.x - 1) < 0.001 && Math.abs(basis1.y) < 0.001 && 
         Math.abs(basis2.x) < 0.001 && Math.abs(basis2.y - 1) < 0.001
})

// 畫布相關方法
const toCanvas = (x, y) => {
  if (!canvas.value) return { x: 0, y: 0 }
  
  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 2
  const scale = Math.min(canvas.value.width, canvas.value.height) / 20
  
  return {
    x: centerX + x * scale,
    y: centerY - y * scale
  }
}

const fromCanvas = (canvasX, canvasY) => {
  if (!canvas.value) return { x: 0, y: 0 }
  
  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 2
  const scale = Math.min(canvas.value.width, canvas.value.height) / 20
  
  return {
    x: (canvasX - centerX) / scale,
    y: (centerY - canvasY) / scale
  }
}

const drawGrid = (b1, b2, color = '#9b59b6', opacity = 0.3) => {
  if (!ctx.value || !canvas.value) return
  
  ctx.value.save()
  ctx.value.strokeStyle = color
  ctx.value.globalAlpha = opacity
  ctx.value.lineWidth = 1
  
  const range = 15
  
  const isStandardBasis = (Math.abs(b1.x - 1) < 0.001 && Math.abs(b1.y) < 0.001 && 
                          Math.abs(b2.x) < 0.001 && Math.abs(b2.y - 1) < 0.001)
  
  if (isStandardBasis) {
    const topLeft = fromCanvas(0, 0)
    const bottomRight = fromCanvas(canvas.value.width, canvas.value.height)
    
    for (let x = Math.floor(topLeft.x) - range; x <= Math.ceil(bottomRight.x) + range; x++) {
      const p1 = toCanvas(x, topLeft.y - range)
      const p2 = toCanvas(x, bottomRight.y + range)
      ctx.value.beginPath()
      ctx.value.moveTo(p1.x, p1.y)
      ctx.value.lineTo(p2.x, p2.y)
      ctx.value.stroke()
    }
    
    for (let y = Math.floor(bottomRight.y) - range; y <= Math.ceil(topLeft.y) + range; y++) {
      const p1 = toCanvas(topLeft.x - range, y)
      const p2 = toCanvas(bottomRight.x + range, y)
      ctx.value.beginPath()
      ctx.value.moveTo(p1.x, p1.y)
      ctx.value.lineTo(p2.x, p2.y)
      ctx.value.stroke()
    }
  } else {
    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        if (i === 0 && j === 0) continue
        
        const x1 = i * b1.x + j * b2.x
        const y1 = i * b1.y + j * b2.y
        const x2 = (i + 1) * b1.x + j * b2.x
        const y2 = (i + 1) * b1.y + j * b2.y
        const x3 = i * b1.x + (j + 1) * b2.x
        const y3 = i * b1.y + (j + 1) * b2.y
        
        const p1 = toCanvas(x1, y1)
        const p2 = toCanvas(x2, y2)
        const p3 = toCanvas(x3, y3)
        
        if (Math.abs(p1.x) < canvas.value.width * 1.5 && Math.abs(p1.y) < canvas.value.height * 1.5) {
          ctx.value.beginPath()
          ctx.value.moveTo(p1.x, p1.y)
          ctx.value.lineTo(p2.x, p2.y)
          ctx.value.stroke()
          
          ctx.value.beginPath()
          ctx.value.moveTo(p1.x, p1.y)
          ctx.value.lineTo(p3.x, p3.y)
          ctx.value.stroke()
        }
      }
    }
  }
  
  ctx.value.restore()
}

const drawStandardGrid = () => {
  if (!ctx.value || !canvas.value) return
  
  ctx.value.save()
  ctx.value.strokeStyle = '#3498db'
  ctx.value.globalAlpha = 0.2
  ctx.value.lineWidth = 1
  
  const topLeft = fromCanvas(0, 0)
  const bottomRight = fromCanvas(canvas.value.width, canvas.value.height)
  const range = 2
  
  for (let x = Math.floor(topLeft.x) - range; x <= Math.ceil(bottomRight.x) + range; x++) {
    const p1 = toCanvas(x, topLeft.y - range)
    const p2 = toCanvas(x, bottomRight.y + range)
    ctx.value.beginPath()
    ctx.value.moveTo(p1.x, p1.y)
    ctx.value.lineTo(p2.x, p2.y)
    ctx.value.stroke()
  }
  
  for (let y = Math.floor(bottomRight.y) - range; y <= Math.ceil(topLeft.y) + range; y++) {
    const p1 = toCanvas(topLeft.x - range, y)
    const p2 = toCanvas(bottomRight.x + range, y)
    ctx.value.beginPath()
    ctx.value.moveTo(p1.x, p1.y)
    ctx.value.lineTo(p2.x, p2.y)
    ctx.value.stroke()
  }
  
  ctx.value.restore()
}

const drawVector = (x, y, color = '#e74c3c', lineWidth = 3, label = '') => {
  if (!ctx.value) return
  
  const start = toCanvas(0, 0)
  const end = toCanvas(x, y)
  
  ctx.value.save()
  ctx.value.strokeStyle = color
  ctx.value.fillStyle = color
  ctx.value.lineWidth = lineWidth
  
  ctx.value.beginPath()
  ctx.value.moveTo(start.x, start.y)
  ctx.value.lineTo(end.x, end.y)
  ctx.value.stroke()
  
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const arrowLength = 15
  const arrowAngle = Math.PI / 6
  
  ctx.value.beginPath()
  ctx.value.moveTo(end.x, end.y)
  ctx.value.lineTo(
    end.x - arrowLength * Math.cos(angle - arrowAngle),
    end.y - arrowLength * Math.sin(angle - arrowAngle)
  )
  ctx.value.moveTo(end.x, end.y)
  ctx.value.lineTo(
    end.x - arrowLength * Math.cos(angle + arrowAngle),
    end.y - arrowLength * Math.sin(angle + arrowAngle)
  )
  ctx.value.stroke()
  
  if (label) {
    ctx.value.fillStyle = color
    ctx.value.font = '14px Arial'
    ctx.value.fillText(label, end.x - 30, end.y - 20)
  }
  
  ctx.value.restore()
}

const drawAxes = () => {
  if (!ctx.value || !canvas.value) return
  
  const center = toCanvas(0, 0)
  
  ctx.value.save()
  ctx.value.strokeStyle = '#2c3e50'
  ctx.value.lineWidth = 2
  
  ctx.value.beginPath()
  ctx.value.moveTo(0, center.y)
  ctx.value.lineTo(canvas.value.width, center.y)
  ctx.value.stroke()
  
  ctx.value.beginPath()
  ctx.value.moveTo(center.x, 0)
  ctx.value.lineTo(center.x, canvas.value.height)
  ctx.value.stroke()
  
  ctx.value.restore()
}

const draw = () => {
  if (!ctx.value || !canvas.value) return
  
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
  if (!isLinearlyIndependent.value) return
  
  const isStandardBasis = (Math.abs(basis1.x - 1) < 0.001 && Math.abs(basis1.y) < 0.001 && 
                          Math.abs(basis2.x) < 0.001 && Math.abs(basis2.y - 1) < 0.001)
  
  if (showStandardGrid.value) {
    drawStandardGrid()
  }
  
  drawAxes()
  
  if (!isStandardBasis) {
    drawGrid({ x: basis1.x, y: basis1.y }, { x: basis2.x, y: basis2.y })
  }
  
  if (!isStandardBasis) {
    drawVector(basis1.x, basis1.y, '#9b59b6', 3, 'b₁')
    drawVector(basis2.x, basis2.y, '#9b59b6', 3, 'b₂')
  }
  
  const { c1, c2 } = newBasisCoordinates.value
  const targetLabel = isLinearlyIndependent.value ? `v (${c1.toFixed(2)}, ${c2.toFixed(2)})` : 'v'
  drawVector(targetVector.x, targetVector.y, '#e74c3c', 4, targetLabel)
}

const resizeCanvas = () => {
  if (!canvas.value) return
  
  const container = canvas.value.parentElement
  if (!container) return
  
  canvas.value.width = container.clientWidth
  canvas.value.height = container.clientHeight
  
  ctx.value = canvas.value.getContext('2d')
  
  setTimeout(() => {
    draw()
  }, 10)
}

const handleResize = () => {
  nextTick(() => {
    resizeCanvas()
  })
}

const updateVisualization = () => {
  nextTick(() => {
    draw()
  })
}

const updateVectorBehavior = () => {
  if (vectorBehavior.value === 'stretch' && isLinearlyIndependent.value) {
    // 計算新基底下的目標向量，使其在新基底坐標保持與初始值 (c1, c2) 一致
    const det = determinant.value
    const c1 = (initialTargetVector.x * basis2.y - initialTargetVector.y * basis2.x) / det
    const c2 = -(initialTargetVector.x * basis1.y - initialTargetVector.y * basis1.x) / det
    targetVector.x = c1 * basis1.x + c2 * basis2.x
    targetVector.y = c1 * basis1.y + c2 * basis2.y
  } else if (vectorBehavior.value === 'fixed') {
    // 恢復到初始值
    targetVector.x = initialTargetVector.x
    targetVector.y = initialTargetVector.y
  }
  updateVisualization()
}

// 監聽基底向量變化，實時更新目標向量
watch([basis1, basis2], () => {
  if (vectorBehavior.value === 'stretch' && isLinearlyIndependent.value) {
    const det = determinant.value
    const c1 = (initialTargetVector.x * basis2.y - initialTargetVector.y * basis2.x) / det
    const c2 = -(initialTargetVector.x * basis1.y - initialTargetVector.y * basis1.x) / det
    targetVector.x = c1 * basis1.x + c2 * basis2.x
    targetVector.y = c1 * basis1.y + c2 * basis2.y
    updateVisualization()
  }
}, { deep: true })

const setStandardBasis = () => {
  basis1.x = 1
  basis1.y = 0
  basis2.x = 0
  basis2.y = 1
  updateVectorBehavior()
}

const setExample1 = () => {
  basis1.x = -3
  basis1.y = 2
  basis2.x = 4
  basis2.y = -2
  targetVector.x = -7
  targetVector.y = 4
  initialTargetVector.x = -7
  initialTargetVector.y = 4
  updateVectorBehavior()
}

const setExample2 = () => {
  basis1.x = 2
  basis1.y = 1
  basis2.x = -1
  basis2.y = 3
  targetVector.x = 5
  targetVector.y = -2
  initialTargetVector.x = 5
  initialTargetVector.y = -2
  updateVectorBehavior()
}

const randomBasis = () => {
  basis1.x = parseFloat((Math.random() * 6 - 3).toFixed(1))
  basis1.y = parseFloat((Math.random() * 6 - 3).toFixed(1))
  basis2.x = parseFloat((Math.random() * 6 - 3).toFixed(1))
  basis2.y = parseFloat((Math.random() * 6 - 3).toFixed(1))
  updateVectorBehavior()
}

watch([targetVector, showStandardGrid], () => {
  updateVisualization()
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    if (canvas.value) {
      ctx.value = canvas.value.getContext('2d')
      resizeCanvas()
      
      window.addEventListener('resize', handleResize)
      
      setTimeout(() => {
        draw()
      }, 100)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.basis-transformation {
  font-family: 'Microsoft JhengHei', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
  padding: 20px;
}

.basis-transformation h1 {
  text-align: center;
  font-size: 2.5em;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.main-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  height: calc(100vh - 150px);
  max-width: 1400px;
  margin: 0 auto;
}

.control-panel {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.canvas-container {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  position: relative;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
}

.vector-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

input[type="number"], select {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: rgba(255,255,255,0.9);
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
}

input[type="number"]:focus, select:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 20px rgba(255,255,255,0.3);
}

.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 15px;
}

.display-options {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.checkbox-group {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 4px;
  margin-right: 10px;
  transition: all 0.3s ease;
}

.checkbox-label:hover .checkmark {
  background: rgba(255,255,255,0.3);
  border-color: rgba(255,255,255,0.7);
}

.checkbox-label input:checked ~ .checkmark {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  border-color: #ff6b6b;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

button {
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.coordinate-display {
  background: rgba(0,0,0,0.1);
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
}

.coordinate-display h3 {
  margin-bottom: 15px;
  text-align: center;
  color: #ffd700;
}

.coord-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 8px 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
}

.legend {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255,255,255,0.9);
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.legend-color {
  width: 20px;
  height: 3px;
  margin-right: 10px;
  border-radius: 2px;
}

.error-message {
  background: rgba(255,0,0,0.2);
  border: 1px solid rgba(255,0,0,0.5);
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .control-panel {
    height: auto;
  }
}
</style>