<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">Canvas 樹狀結構視覺化</h1>
    <div class="row">
      <!-- 左邊輸入和畫布區 -->
      <div class="col-md-8">
        <div class="mb-3 d-flex gap-2 flex-wrap">
          <input
            ref="inputField"
            v-model="inputText"
            type="text"
            placeholder="輸入樹結構，例如 A(B(D,E),C(F)) 或 A(_(B,C))"
            class="form-control"
            @input="autoCompleteParentheses"
          />
          <button @click="saveAndDrawTree" class="btn btn-primary">建立樹</button>
        </div>
        <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="border"></canvas>
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
          <li
            v-for="(item, index) in history"
            :key="index"
            class="list-group-item d-flex justify-content-between align-items-center"
            style="cursor: pointer"
            @click="loadHistoryItem(item)"
          >
            <span>{{ item }}</span>
          </li>
          <li v-if="history.length === 0" class="list-group-item text-muted">尚無紀錄</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const inputText = ref('A(_(B,C),D)')
const canvas = ref(null)
const inputField = ref(null)
const canvasWidth = 800
const canvasHeight = 600
const history = ref([])
const HISTORY_KEY = 'tree_history'

function parseTree(str) {
  let index = 0
  function parseNode() {
    let name = ''
    while (index < str.length && /[A-Za-z0-9+\-÷_]/.test(str[index])) {
      name += str[index++]
    }
    const node = { name, children: [], isPlaceholder: name === '_' }
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
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  try {
    const tree = parseTree(inputText.value)
    const treeWithPos = calculatePositions(tree)
    drawNode(ctx, treeWithPos)
  } catch (err) {
    console.error('Invalid tree structure:', err)
  }
}

function drawNode(ctx, node) {
  const radius = 30
  ctx.lineWidth = 2
  if (!node.isPlaceholder) {
    ctx.beginPath()
    ctx.arc(node.x + 40, node.y + 40, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
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

    // Only draw line if child is not a placeholder
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

function saveAndDrawTree() {
  if (inputText.value && !history.value.includes(inputText.value)) {
    history.value.unshift(inputText.value)
    if (history.value.length > 10) {
      history.value.pop()
    }
  }
  drawTree()
}

function loadHistoryItem(item) {
  inputText.value = item
  drawTree()
}

function clearHistory() {
  history.value = []
  localStorage.removeItem(HISTORY_KEY)
}

function autoCompleteParentheses(event) {
  const input = inputField.value
  const cursorPosition = input.selectionStart
  const lastChar = input.value.slice(cursorPosition - 1, cursorPosition)

  if (lastChar === '(') {
    const newValue = input.value.slice(0, cursorPosition) + ')' + input.value.slice(cursorPosition)
    inputText.value = newValue

    nextTick(() => {
      input.selectionStart = cursorPosition
      input.selectionEnd = cursorPosition
    })
  }
}

onMounted(() => {
  const saved = localStorage.getItem(HISTORY_KEY)
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse history from localStorage', e)
    }
  }
  nextTick(() => drawTree())
})

watch(history, (newVal) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newVal))
}, { deep: true })
</script>

<style scoped>
canvas {
  background-color: #f9fafb;
}
</style>