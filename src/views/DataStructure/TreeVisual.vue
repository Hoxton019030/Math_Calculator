<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Canvas 樹狀結構視覺化</h1>
    <input
      v-model="inputText"
      type="text"
      placeholder="輸入樹結構，例如 A(B(D,E),C(F))"
      class="border px-2 py-1 mb-4 w-full"
    />
    <button @click="drawTree" class="bg-blue-500 text-white px-4 py-2 rounded">建立樹</button>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="border mt-4"></canvas>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const inputText = ref('A(B(D,E),C(F))')
const canvas = ref(null)
const canvasWidth = 800
const canvasHeight = 600

function parseTree(str) {
  let index = 0
  function parseNode() {
    let name = ''
    while (index < str.length && /[A-Za-z0-9]/.test(str[index])) {
      name += str[index++]
    }
    const node = { name, children: [] }
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
    xOffset.x += 80
  } else {
    node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2
  }
  return node
}

function drawTree() {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  const tree = parseTree(inputText.value)
  const treeWithPos = calculatePositions(tree)
  drawNode(ctx, treeWithPos)
}

function drawNode(ctx, node) {
  const radius = 20
  // Draw node circle
  ctx.beginPath()
  ctx.arc(node.x + 40, node.y + 40, radius, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(node.name, node.x + 40, node.y + 40)

  // Draw lines to children
  for (let child of node.children) {
    // Calculate angle between parent and child
    const dx = (child.x + 40) - (node.x + 40)
    const dy = (child.y + 40) - (node.y + 40)
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance === 0) continue // Prevent division by zero

    // Calculate points on the circle edges
    const parentEdgeX = node.x + 40 + (dx * radius) / distance
    const parentEdgeY = node.y + 40 + (dy * radius) / distance
    const childEdgeX = child.x + 40 - (dx * radius) / distance
    const childEdgeY = child.y + 40 - (dy * radius) / distance

    // Draw line from parent's edge to child's edge
    ctx.beginPath()
    ctx.moveTo(parentEdgeX, parentEdgeY)
    ctx.lineTo(childEdgeX, childEdgeY)
    ctx.stroke()

    // Recursively draw child nodes
    drawNode(ctx, child)
  }
}

nextTick(() => drawTree())
</script>

<style scoped>
canvas {
  background-color: #f9fafb;
}
</style>