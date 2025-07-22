<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">Canvas 樹狀結構視覺化</h1>
    <div class="row">
      <!-- 左邊輸入和畫布區 -->
      <div class="col-md-8">
        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
        <div class="mb-3 d-flex gap-2 flex-wrap">
          <input ref="inputField" v-model="inputText" type="text" placeholder="輸入樹結構，例如 A(B(D,E),C(F)) 或 A(_(B,C))"
            class="form-control" @keydown="handleKeyDown" />
          <button @click="saveAndDrawTree" class="btn btn-primary">建立樹</button>
        </div>
        <div class="canvas-container" ref="canvasContainer">
          <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="border"
            @click="handleCanvasClick"></canvas>
          <div class="resize-handle" @mousedown="startResize"></div>
        </div>
        <div class="mt-3 d-flex gap-2 flex-wrap">
          <button class="btn btn-success" @click="copyCanvasToClipboard">
            截圖按鈕
          </button>
        </div>
        <div v-if="copySuccess" class="copy-toast">已複製到剪貼簿！</div>
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
          <li v-for="(item, index) in history" :key="index"
            class="list-group-item d-flex justify-content-between align-items-center" style="cursor: pointer"
            @click="loadHistoryItem(item)">
            <span>{{ item }}</span>
          </li>
          <li v-if="history.length === 0" class="list-group-item text-muted">
            尚無紀錄
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const inputText = ref('A(_,B(C,D))')
const canvas = ref(null)
const canvasContainer = ref(null)
const inputField = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(400)
const history = ref([])
const selectedNodes = ref(new Set())
const HISTORY_KEY = 'tree_history'
const CANVAS_SIZE_KEY = 'canvas_size'
const errorMessage = ref('')


function loadCanvasSize() {
  const savedSize = localStorage.getItem(CANVAS_SIZE_KEY)
  if (savedSize) {
    const { width, height } = JSON.parse(savedSize)
    canvasWidth.value = Math.max(300, width) // Minimum width
    canvasHeight.value = Math.max(200, height) // Minimum height
  }
}

function saveCanvasSize() {
  localStorage.setItem(CANVAS_SIZE_KEY, JSON.stringify({
    width: canvasWidth.value,
    height: canvasHeight.value
  }))
}

function loadHistory() {
  const savedHistory = localStorage.getItem(HISTORY_KEY)
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}

function parseTree(str) {
  let index = 0
  function parseNode() {
    let name = ''
    // 節點名稱允許包含任何非結構控制字元
    while (index < str.length && !['(', ')', ','].includes(str[index])) {
      name += str[index++]
    }
    const node = { name: name.trim(), children: [], isPlaceholder: name.trim() === '_' }

    if (str[index] === '(') {
      index++
      while (str[index] !== ')') {
        node.children.push(parseNode())
        if (str[index] === ',') index++
      }
      index++
    }
    return node
  }
  return parseNode()
}


function calculatePositions(root, depth = 0, xOffset = { x: 0 }) {
  const node = { ...root, x: 0, y: depth * 80, children: [] }
  for (let child of root.children) {
    const childNode = calculatePositions(child, depth + 1, xOffset)
    node.children.push(childNode)
  }
  if (node.children.length === 0) {
    node.x = xOffset.x
    xOffset.x += 120
  } else {
    if (node.isPlaceholder) {
      node.x = xOffset.x + 60
      xOffset.x = node.x + 60
    } else {
      node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2
    }
  }
  return node
}

function drawTree() {
  const ctx = canvas.value.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  try {
    const tree = parseTree(inputText.value)
    const treeWithPos = calculatePositions(tree)
    drawNode(ctx, treeWithPos)
    errorMessage.value = '' // 如果成功畫出，清除錯誤
  } catch (err) {
    console.error('Invalid tree structure:', err)
    errorMessage.value = '樹的結構格式錯誤，請檢查輸入內容'
  }
}


function drawNode(ctx, node) {
  const radius = 30
  ctx.lineWidth = 2
  if (!node.isPlaceholder) {
    ctx.beginPath()
    ctx.arc(node.x + 40, node.y + 40, radius, 0, 2 * Math.PI)
    ctx.fillStyle = selectedNodes.value.has(`${node.x},${node.y}`) ? '#ff6666' : '#fff'
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#000'
    ctx.font = '18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.name, node.x + 40, node.y + 40)
  }

  for (let child of node.children) {
    const dx = (child.x + 40) - (node.x + 40)
    const dy = (child.y + 40) - (node.y + 40)
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance === 0) return

    if (!child.isPlaceholder) {
      const parentEdgeX = node.x + 40 + (dx * radius) / distance
      const parentEdgeY = node.y + 40 + (dy * radius) / distance
      const childEdgeX = child.x + 40 - (dx * radius) / distance
      const childEdgeY = child.y + 40 - (dy * radius) / distance

      ctx.beginPath()
      ctx.moveTo(parentEdgeX, parentEdgeY)
      ctx.lineTo(childEdgeX, childEdgeY)
      ctx.stroke()
    }

    drawNode(ctx, child)
  }
}

function handleCanvasClick(event) {
  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const radius = 30

  try {
    const tree = parseTree(inputText.value)
    const treeWithPos = calculatePositions(tree)
    let nodeClicked = false
    function checkNode(node) {
      if (!node.isPlaceholder) {
        const dx = x - (node.x + 40)
        const dy = y - (node.y + 40)
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          const nodeKey = `${node.x},${node.y}`
          if (selectedNodes.value.has(nodeKey)) {
            selectedNodes.value.delete(nodeKey)
          } else {
            selectedNodes.value.add(nodeKey)
          }
          nodeClicked = true
          return true
        }
      }
      for (let child of node.children) {
        if (checkNode(child)) return true
      }
      return false
    }
    checkNode(treeWithPos)
    if (!nodeClicked) {
      selectedNodes.value.clear()
    }
    drawTree()
  } catch (err) {
    console.error('Invalid tree structure:', err)
  }
}

function startResize(event) {
  event.preventDefault()
  const startX = event.clientX
  const startY = event.clientY
  const startWidth = canvasWidth.value
  const startHeight = canvasHeight.value

  function onMouseMove(moveEvent) {
    const newWidth = startWidth + (moveEvent.clientX - startX)
    const newHeight = startHeight + (moveEvent.clientY - startY)
    canvasWidth.value = Math.max(300, newWidth) // Minimum width
    canvasHeight.value = Math.max(200, newHeight) // Minimum height
    saveCanvasSize()
    drawTree()
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function isValidTreeStructure(str) {
  try {
    parseTree(str)
    return true
  } catch {
    return false
  }
}


function saveAndDrawTree() {
  if (!inputText.value.trim()) {
    errorMessage.value = '請輸入樹的結構'
    return
  }

  if (!isValidTreeStructure(inputText.value)) {
    errorMessage.value = '樹的結構格式錯誤，請檢查輸入內容'
    return
  }

  // 驗證通過，繼續建立樹
  if (!history.value.includes(inputText.value)) {
    history.value.unshift(inputText.value)
    if (history.value.length > 10) {
      history.value.pop()
    }
    saveHistory()
  }

  selectedNodes.value.clear()
  errorMessage.value = ''
  drawTree()
}


function loadHistoryItem(item) {
  inputText.value = item
  selectedNodes.value.clear()
  drawTree()
}

function clearHistory() {
  history.value = []
  selectedNodes.value.clear()
  saveHistory()
  drawTree()
}

function handleKeyDown(event) {
  const input = inputField.value
  const cursorPosition = input.selectionStart
  const value = input.value

  if (event.key === 'Backspace') {
    const charToDelete = value[cursorPosition - 1]
    const charAfter = value[cursorPosition]

    if (charToDelete === '(' && charAfter === ')') {
      event.preventDefault()
      const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition + 1)
      inputText.value = newValue
      nextTick(() => {
        input.setSelectionRange(cursorPosition - 1, cursorPosition - 1)
      })
    }
  } else if (event.key === '(') {
    event.preventDefault()
    const newValue = value.slice(0, cursorPosition) + '()' + value.slice(cursorPosition)
    inputText.value = newValue
    nextTick(() => {
      input.setSelectionRange(cursorPosition + 1, cursorPosition + 1)
    })
  }
}

const copySuccess = ref(false)
async function copyCanvasToClipboard() {
  try {
    const canvasEl = canvas.value
    if (!canvasEl) return

    const blob = await new Promise((resolve) => canvasEl.toBlob(resolve))

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])

    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 1500)
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  loadCanvasSize()
  loadHistory()
  nextTick(() => drawTree())
})

watch(
  history,
  (newVal) => {
    saveHistory()
  },
  { deep: true }
)
</script>

<style scoped>
canvas {
  background-color: #f9fafb;
}

.canvas-container {
  position: relative;
  display: inline-block;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  background: #007bff;
  cursor: se-resize;
  border-radius: 3px;
}

.resize-handle:hover {
  background: #0056b3;
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
</style>