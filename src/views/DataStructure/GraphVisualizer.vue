<template>
  <div class="container py-4 d-flex">
    <!-- Main content with canvas -->
    <div class="main-content">
      <h1 class="mb-4 text-center">Graph 視覺化</h1>
      <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
        <select v-model="graphMode" class="form-select" style="width: 120px;">
          <option value="directed">有向圖</option>
          <option value="undirected">無向圖</option>
        </select>
        <input v-model="inputText" type="text" class="form-control"
          :placeholder="graphMode === 'directed' 
            ? '輸入有向邊列表，例如：A->B,B->C,C->A,D->C' 
            : '輸入無向邊列表，例如：A-B,B-C,C-A,D-C'" />
        <button class="btn btn-primary" @click="drawGraph">畫圖</button>
      </div>

      <!-- 顏色選擇區 -->
      <!-- <div class="mb-3 d-flex flex-wrap gap-2">
        <div
          v-for="color in availableColors"
          :key="color"
          class="color-btn"
          :style="{ backgroundColor: color, borderColor: selectedColors.has(color) ? '#333' : 'transparent' }"
          @click="toggleColor(color)"
          :title="'選擇顏色：' + color"
        >
          <span v-if="selectedColors.has(color)" class="checkmark">✔</span>
        </div>
      </div> -->

      <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="border"></canvas>

      <div class="mt-3 d-flex justify-content-start">
        <button class="btn btn-success" @click="copyCanvasToClipboard">截圖按鈕</button>
      </div>
    </div>

    <!-- History panel on the right -->
    <div class="history-panel ms-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">歷史紀錄</h5>
        <button class="btn btn-outline-danger btn-sm" @click="clearHistory">清除</button>
      </div>
      <ul class="list-group" style="max-height: 600px; overflow-y: auto;">
        <li v-for="(item, index) in history" :key="index" class="list-group-item list-group-item-action"
          style="cursor: pointer;" @click="loadHistoryItem(item)">
          {{ item }}
        </li>
        <li v-if="history.length === 0" class="list-group-item text-muted">尚無歷史紀錄</li>
      </ul>
    </div>

    <div v-if="copySuccess" class="copy-toast">已複製到剪貼簿！</div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const inputText = ref('A->B,B->C,C->A,D->C')
const canvas = ref(null)
const canvasWidth = ref(600)
const canvasHeight = ref(600)

const graphMode = ref('directed')
const history = ref([])
const copySuccess = ref(false)
const selectedNodes = ref(new Map()) // nodeName -> color

const positions = ref({})
const velocities = ref({})
const nodes = ref([])
const edges = ref([])
const radius = 25
let animationId = null

const HISTORY_KEY = 'graph_history_with_mode'

// 淡色系可選顏色
const availableColors = [
  '#AEC6CF', // 淡藍
  '#FFDAB9', // 淡橘
  '#BFD8B8', // 淡綠
  '#FFB7B2', // 淡粉
  '#CFCFC4', // 淡灰
  '#E6E6FA', // 淡紫
  '#FFFACD', // 淡黃
]

const selectedColors = ref(new Set())

function toggleColor(color) {
  if (selectedColors.value.has(color)) {
    selectedColors.value.delete(color)
  } else {
    selectedColors.value.add(color)
  }
  // 強制觸發 Vue 更新（因為 Set 的變化不一定被偵測）
  selectedColors.value = new Set(selectedColors.value)
}

function parseGraph(input) {
  const edgesList = input.split(',').map(e => e.trim())
  const nodeSet = new Set()
  const edgePairs = []

  for (let edge of edgesList) {
    let from, to
    if (graphMode.value === 'directed') {
      [from, to] = edge.split('->').map(s => s.trim())
    } else {
      [from, to] = edge.split('-').map(s => s.trim())
    }
    if (from && to) {
      nodeSet.add(from)
      nodeSet.add(to)
      edgePairs.push({ from, to })
      if (graphMode.value === 'undirected') {
        edgePairs.push({ from: to, to: from })
      }
    }
  }
  return {
    nodes: Array.from(nodeSet),
    edges: edgePairs
  }
}

function initPositions(nodelist) {
  positions.value = {}
  velocities.value = {}
  for (const node of nodelist) {
    positions.value[node] = {
      x: Math.random() * canvasWidth.value,
      y: Math.random() * canvasHeight.value
    }
    velocities.value[node] = { x: 0, y: 0 }
  }
}

function applyForces() {
  const repulsion = 10000
  const springLength = 150
  const springStrength = 0.1
  const damping = 0.85

  for (let i = 0; i < nodes.value.length; i++) {
    for (let j = i + 1; j < nodes.value.length; j++) {
      const a = nodes.value[i], b = nodes.value[j]
      const dx = positions.value[a].x - positions.value[b].x
      const dy = positions.value[a].y - positions.value[b].y
      let dist = Math.sqrt(dx * dx + dy * dy) || 1
      const force = repulsion / (dist * dist)
      const fx = force * dx / dist
      const fy = force * dy / dist

      velocities.value[a].x += fx
      velocities.value[a].y += fy
      velocities.value[b].x -= fx
      velocities.value[b].y -= fy
    }
  }

  for (let { from, to } of edges.value) {
    const dx = positions.value[to].x - positions.value[from].x
    const dy = positions.value[to].y - positions.value[from].y
    let dist = Math.sqrt(dx * dx + dy * dy) || 1
    const force = springStrength * (dist - springLength)
    const fx = force * dx / dist
    const fy = force * dy / dist

    velocities.value[from].x += fx
    velocities.value[from].y += fy
    velocities.value[to].x -= fx
    velocities.value[to].y -= fy
  }

  for (let node of nodes.value) {
    velocities.value[node].x *= damping
    velocities.value[node].y *= damping
    positions.value[node].x += velocities.value[node].x
    positions.value[node].y += velocities.value[node].y
    positions.value[node].x = Math.min(Math.max(radius, positions.value[node].x), canvasWidth.value - radius)
    positions.value[node].y = Math.min(Math.max(radius, positions.value[node].y), canvasHeight.value - radius)
  }
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
  const headLength = 12
  const headAngle = Math.PI / 6
  const dx = toX - fromX
  const dy = toY - fromY
  const angle = Math.atan2(dy, dx)

  // Draw the main line
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()

  // Draw filled arrowhead
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle - headAngle),
    toY - headLength * Math.sin(angle - headAngle)
  )
  ctx.lineTo(
    toX - headLength * Math.cos(angle + headAngle),
    toY - headLength * Math.sin(angle + headAngle)
  )
  ctx.closePath()
  ctx.fillStyle = '#555'
  ctx.fill()
}

function drawGraph() {
  const ctx = canvas.value.getContext('2d')
  const parsed = parseGraph(inputText.value)
  nodes.value = parsed.nodes
  edges.value = parsed.edges
  initPositions(nodes.value)

  if (!history.value.includes(inputText.value + '|' + graphMode.value)) {
    history.value.unshift(inputText.value + '|' + graphMode.value)
    if (history.value.length > 20) history.value.pop()
    saveHistory()
  }

  cancelAnimationFrame(animationId)

  function draw() {
    applyForces()
    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

    // Draw edges and arrows
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 2
    for (let { from, to } of edges.value) {
      const start = positions.value[from]
      const end = positions.value[to]

      if (graphMode.value === 'directed') {
        const dx = end.x - start.x
        const dy = end.y - start.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist === 0) continue
        const offsetX = (dx / dist) * radius
        const offsetY = (dy / dist) * radius
        drawArrow(ctx, start.x, start.y, end.x - offsetX, end.y - offsetY)
      } else {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
      }
    }

    // Draw nodes
    for (let node of nodes.value) {
      const { x, y } = positions.value[node]
      let fillColor = '#fff'
      if (selectedNodes.value.has(node)) {
        fillColor = selectedNodes.value.get(node)
      }

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.stroke()

      ctx.fillStyle = '#000'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node, x, y)
    }

    animationId = requestAnimationFrame(draw)
  }
  animationId = requestAnimationFrame(draw)
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}

function loadHistory() {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) {
    history.value = JSON.parse(saved)
  }
}

function clearHistory() {
  history.value = []
  saveHistory()
}

function loadHistoryItem(item) {
  const [input, mode] = item.split('|')
  inputText.value = input
  graphMode.value = mode
  selectedNodes.value.clear()
  nextTick(() => {
    drawGraph()
  })
}

async function copyCanvasToClipboard() {
  try {
    const canvasEl = canvas.value
    if (!canvasEl) return
    const blob = await new Promise(resolve => canvasEl.toBlob(resolve))
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    copySuccess.value = true
    setTimeout(() => copySuccess.value = false, 1500)
  } catch (err) {
    console.error(err)
  }
}

function handleCanvasClick(event) {
  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const lightRed = '#FFB6C1' // Define the light red color

  let changed = false
  for (let node of nodes.value) {
    const pos = positions.value[node]
    const dx = x - pos.x
    const dy = y - pos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance <= radius) {
      if (selectedNodes.value.has(node)) {
        selectedNodes.value.delete(node) // Remove color if already colored
      } else {
        selectedNodes.value.set(node, lightRed) // Set to light red
      }
      changed = true
      break
    }
  }

  if (changed) {
    selectedNodes.value = new Map(selectedNodes.value) // Force reactive update
    console.log('目前已上色節點：', Object.fromEntries(selectedNodes.value))
  }
}

onMounted(() => {
  loadHistory()
  drawGraph()
  canvas.value.addEventListener('click', handleCanvasClick)
})
</script>

<style scoped>
.container {
  max-width: 1000px;
}

.main-content {
  flex: 3;
  padding-right: 20px;
}

.history-panel {
  flex: 1;
  min-width: 200px;
  max-width: 250px;
}

canvas {
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  display: block;
  margin-left: 0;
}

.copy-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  user-select: none;
  font-weight: 600;
}

/* 顏色按鈕 */
.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  user-select: none;
  transition: border-color 0.2s ease;
}
.color-btn:hover {
  border-color: #666;
}
.checkmark {
  position: absolute;
  top: 2px;
  right: 5px;
  font-size: 18px;
  color: #333;
  pointer-events: none;
}
</style>