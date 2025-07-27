<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">Canvas 樹狀結構視覺化</h1>
    <div class="row">
      <div class="col-md-8">
        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
        <div class="mb-3 d-flex gap-2 flex-wrap">
          <select v-model="treeMode" class="form-select" style="width: auto;">
            <option value="undirected">無向樹</option>
            <option value="directed">有向樹</option>
          </select>
          <input ref="inputField" v-model="inputText" type="text" 
            :placeholder="treeMode === 'undirected' ? '輸入無向樹，例如 1(2,3(4))5(6)' : '輸入有向樹，例如 1(->2,3(<-4,->5))'"
            class="form-control" @keydown="handleKeyDown" />
          <button @click="saveAndDrawTree" class="btn btn-primary">建立樹</button>
        </div>
        <div class="mb-3 d-flex gap-2 flex-wrap">
          <select v-model="toolMode" class="form-select" style="width: auto;">
            <option value="select">選擇節點</option>
            <option value="arrow">畫箭頭</option>
            <option value="text">添加文字</option>
            <option value="edit">編輯筆記</option>
          </select>
          <button @click="clearAnnotations" class="btn btn-warning">清除筆記</button>
          <button v-if="selectedAnnotation !== null" @click="editSelectedAnnotation" class="btn btn-info">編輯選中筆記</button>
          <button v-if="selectedAnnotation !== null" @click="deleteSelectedAnnotation" class="btn btn-danger">刪除選中筆記</button>
        </div>
        <div class="canvas-container" ref="canvasContainer">
          <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="border"
            @mousedown="handleCanvasMouseDown" @mousemove="handleCanvasMouseMove" @mouseup="handleCanvasMouseUp"></canvas>
          <div class="resize-handle" @mousedown="startResize"></div>
        </div>
        <div class="mt-3 d-flex gap-2 flex-wrap">
          <button class="btn btn-success" @click="copyCanvasToClipboard">
            截圖按鈕
          </button>
        </div>
        <div v-if="copySuccess" class="copy-toast">已複製到剪貼簿！</div>
      </div>
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

const inputText = ref('A(_,->C(<-D,->E))')
const canvas = ref(null)
const canvasContainer = ref(null)
const inputField = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(400)
const history = ref([])
const selectedNodes = ref(new Set())
const treeMode = ref('directed')
const toolMode = ref('select')
const annotations = ref([])
const selectedAnnotation = ref(null)
const HISTORY_KEY = 'tree_history'
const CANVAS_SIZE_KEY = 'canvas_size'
const ANNOTATIONS_KEY = 'canvas_annotations'
const errorMessage = ref('')
const copySuccess = ref(false)
let isDrawing = false
let startPoint = null
let isDraggingAnnotation = false
let dragPoint = null

function loadCanvasSize() {
  const savedSize = localStorage.getItem(CANVAS_SIZE_KEY)
  if (savedSize) {
    const { width, height } = JSON.parse(savedSize)
    canvasWidth.value = Math.max(300, width)
    canvasHeight.value = Math.max(200, height)
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

function loadAnnotations() {
  const savedAnnotations = localStorage.getItem(ANNOTATIONS_KEY)
  if (savedAnnotations) {
    annotations.value = JSON.parse(savedAnnotations)
  }
}

function saveAnnotations() {
  localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(annotations.value))
}

function parseForest(str) {
  let index = 0
  const forest = []

  function skipSpaces() {
    while (index < str.length && /\s/.test(str[index])) index++
  }

  function parseNode() {
    let direction = null
    skipSpaces()

    if (str.slice(index, index + 2) === '->') {
      direction = 'parentToChild'
      index += 2
    } else if (str.slice(index, index + 2) === '<-') {
      direction = 'childToParent'
      index += 2
    }

    let name = ''
    skipSpaces()
    while (index < str.length && !['(', ')', ',', ' '].includes(str[index])) {
      name += str[index++]
    }
    const node = {
      name: name.trim(),
      children: [],
      isPlaceholder: name.trim() === '_',
      direction
    }

    skipSpaces()
    if (str[index] === '(') {
      index++
      while (str[index] !== ')' && index < str.length) {
        skipSpaces()
        const child = parseNode()
        node.children.push(child)
        skipSpaces()
        if (str[index] === ',') index++
      }
      index++
    }
    return node
  }

  while (index < str.length) {
    skipSpaces()
    if (index < str.length) {
      forest.push(parseNode())
    }
  }

  return forest
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
    const forest = parseForest(inputText.value)
    errorMessage.value = ''

    let xOffset = { x: 0 }
    for (const tree of forest) {
      const treeWithPos = calculatePositions(tree, 0, xOffset)
      drawNode(ctx, treeWithPos)
    }

    // Draw annotations
    drawAnnotations(ctx)
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
    if (distance === 0) continue

    if (!child.isPlaceholder) {
      const parentEdgeX = node.x + 40 + (dx * radius) / distance
      const parentEdgeY = node.y + 40 + (dy * radius) / distance
      const childEdgeX = child.x + 40 - (dx * radius) / distance
      const childEdgeY = child.y + 40 - (dy * radius) / distance

      ctx.beginPath()
      ctx.moveTo(parentEdgeX, parentEdgeY)
      ctx.lineTo(childEdgeX, childEdgeY)
      ctx.stroke()

      if (treeMode.value === 'directed' && child.direction) {
        if (child.direction === 'parentToChild') {
          drawArrow(ctx, parentEdgeX, parentEdgeY, childEdgeX, childEdgeY)
        } else if (child.direction === 'childToParent') {
          drawArrow(ctx, childEdgeX, childEdgeY, parentEdgeX, parentEdgeY)
        }
      }
    }

    drawNode(ctx, child)
  }
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
  const headLength = 10
  const dx = toX - fromX
  const dy = toY - fromY
  const angle = Math.atan2(dy, dx)

  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.stroke()
}

function drawAnnotations(ctx) {
  ctx.lineWidth = 2
  ctx.font = '16px Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  annotations.value.forEach((annotation, index) => {
    ctx.strokeStyle = selectedAnnotation.value === index ? '#00ff00' : '#ff0000'
    ctx.fillStyle = selectedAnnotation.value === index ? '#00ff00' : '#ff0000'
    
    if (annotation.type === 'arrow') {
      ctx.beginPath()
      ctx.moveTo(annotation.startX, annotation.startY)
      ctx.lineTo(annotation.endX, annotation.endY)
      ctx.stroke()
      drawArrow(ctx, annotation.startX, annotation.startY, annotation.endX, annotation.endY)
    } else if (annotation.type === 'text') {
      ctx.fillText(annotation.text, annotation.x, annotation.y)
    }
  })
  ctx.strokeStyle = '#000'
  ctx.fillStyle = '#000'
}

function isPointNearLine(x, y, x1, y1, x2, y2, threshold = 5) {
  const A = x - x1
  const B = y - y1
  const C = x2 - x1
  const D = y2 - y1
  const dot = A * C + B * D
  const len_sq = C * C + D * D
  let param = -1
  if (len_sq !== 0) {
    param = dot / len_sq
  }
  let xx, yy
  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }
  const dx = x - xx
  const dy = y - yy
  return Math.sqrt(dx * dx + dy * dy) <= threshold
}

function isPointNearText(x, y, textX, textY, text, ctx) {
  ctx.font = '16px Arial'
  const metrics = ctx.measureText(text)
  const width = metrics.width
  const height = 16
  return x >= textX && x <= textX + width && y >= textY && y <= textY + height
}

function handleCanvasMouseDown(event) {
  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  if (toolMode.value === 'select') {
    const radius = 30
    try {
      const forest = parseForest(inputText.value)
      let nodeClicked = false

      let xOffset = { x: 0 }
      for (const tree of forest) {
        const treeWithPos = calculatePositions(tree, 0, xOffset)
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
      }

      if (!nodeClicked) {
        selectedNodes.value.clear()
      }
      drawTree()
    } catch (err) {
      console.error('Invalid tree structure:', err)
    }
  } else if (toolMode.value === 'arrow') {
    isDrawing = true
    startPoint = { x, y }
  } else if (toolMode.value === 'text') {
    const text = prompt('請輸入文字筆記：')
    if (text) {
      annotations.value.push({ type: 'text', text, x, y })
      saveAnnotations()
      drawTree()
    }
  } else if (toolMode.value === 'edit') {
    const ctx = canvas.value.getContext('2d')
    selectedAnnotation.value = null
    annotations.value.forEach((annotation, index) => {
      if (annotation.type === 'arrow') {
        if (isPointNearLine(x, y, annotation.startX, annotation.startY, annotation.endX, annotation.endY)) {
          selectedAnnotation.value = index
          isDraggingAnnotation = true
          dragPoint = { x, y }
        }
      } else if (annotation.type === 'text') {
        if (isPointNearText(x, y, annotation.x, annotation.y, annotation.text, ctx)) {
          selectedAnnotation.value = index
          isDraggingAnnotation = true
          dragPoint = { x, y }
        }
      }
    })
    drawTree()
  }
}

function handleCanvasMouseMove(event) {
  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  if (isDrawing && toolMode.value === 'arrow') {
    drawTree()
    const ctx = canvas.value.getContext('2d')
    ctx.strokeStyle = '#ff0000'
    ctx.beginPath()
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(x, y)
    ctx.stroke()
    drawArrow(ctx, startPoint.x, startPoint.y, x, y)
    ctx.strokeStyle = '#000'
  } else if (isDraggingAnnotation && toolMode.value === 'edit' && selectedAnnotation.value !== null) {
    const annotation = annotations.value[selectedAnnotation.value]
    if (annotation.type === 'arrow') {
      const dx = x - dragPoint.x
      const dy = y - dragPoint.y
      annotation.startX += dx
      annotation.startY += dy
      annotation.endX += dx
      annotation.endY += dy
    } else if (annotation.type === 'text') {
      annotation.x += x - dragPoint.x
      annotation.y += y - dragPoint.y
    }
    dragPoint = { x, y }
    saveAnnotations()
    drawTree()
  }
}

function handleCanvasMouseUp(event) {
  if (isDrawing && toolMode.value === 'arrow') {
    const rect = canvas.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    annotations.value.push({
      type: 'arrow',
      startX: startPoint.x,
      startY: startPoint.y,
      endX: x,
      endY: y
    })
    saveAnnotations()
    isDrawing = false
    startPoint = null
    drawTree()
  } else if (isDraggingAnnotation && toolMode.value === 'edit') {
    isDraggingAnnotation = false
    dragPoint = null
    saveAnnotations()
    drawTree()
  }
}

function editSelectedAnnotation() {
  if (selectedAnnotation.value === null) return
  const annotation = annotations.value[selectedAnnotation.value]
  if (annotation.type === 'text') {
    const newText = prompt('請輸入新的文字筆記：', annotation.text)
    if (newText) {
      annotation.text = newText
      saveAnnotations()
      drawTree()
    }
  }
}

function deleteSelectedAnnotation() {
  if (selectedAnnotation.value !== null) {
    annotations.value.splice(selectedAnnotation.value, 1)
    selectedAnnotation.value = null
    saveAnnotations()
    drawTree()
  }
}

function clearAnnotations() {
  annotations.value = []
  selectedAnnotation.value = null
  saveAnnotations()
  drawTree()
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
    canvasWidth.value = Math.max(300, newWidth)
    canvasHeight.value = Math.max(200, newHeight)
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
    parseForest(str)
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

  if (event.key === 'Enter') {
    event.preventDefault()
    saveAndDrawTree()
    return
  }

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
  loadAnnotations()
  nextTick(() => drawTree())
})

watch(
  [history, treeMode, toolMode],
  () => {
    saveHistory()
    drawTree()
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