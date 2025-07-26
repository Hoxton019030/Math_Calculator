<template>
  <div class="container py-4">
    <h1 class="mb-4 text-center">Graph 視覺化</h1>
    <div class="mb-3 d-flex gap-2 flex-wrap">
      <input v-model="inputText" type="text" class="form-control"
        placeholder="輸入邊列表，例如：A->B,B->C,C->A,D->C" />
      <button class="btn btn-primary" @click="drawGraph">畫圖</button>
    </div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="border"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const inputText = ref('A->B,B->C,C->A,D->C')
const canvas = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(600)

const nodes = ref([])
const edges = ref([])
const positions = ref({})
const velocities = ref({})
const radius = 25

function parseGraph(input) {
  const edgeList = input.split(',').map(e => e.trim())
  const nodeSet = new Set()
  const edgePairs = []

  for (let edge of edgeList) {
    const [from, to] = edge.split('->')
    if (from && to) {
      nodeSet.add(from)
      nodeSet.add(to)
      edgePairs.push({ from: from.trim(), to: to.trim() })
    }
  }
  return {
    nodes: Array.from(nodeSet),
    edges: edgePairs
  }
}

function initPositions(nodelist) {
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

  // Repulsive force
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

  // Attractive force (springs)
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

  // Update positions
  for (let node of nodes.value) {
    velocities.value[node].x *= damping
    velocities.value[node].y *= damping
    positions.value[node].x += velocities.value[node].x
    positions.value[node].y += velocities.value[node].y
  }
}

function drawGraph() {
  const ctx = canvas.value.getContext('2d')
  const parsed = parseGraph(inputText.value)
  nodes.value = parsed.nodes
  edges.value = parsed.edges
  initPositions(nodes.value)

  function draw() {
    applyForces()

    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

    // Draw edges
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 2
    for (let { from, to } of edges.value) {
      const start = positions.value[from]
      const end = positions.value[to]

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      // draw arrow
      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      const arrowLength = 10
      ctx.beginPath()
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x - arrowLength * Math.cos(angle - 0.4), end.y - arrowLength * Math.sin(angle - 0.4))
      ctx.lineTo(end.x - arrowLength * Math.cos(angle + 0.4), end.y - arrowLength * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fillStyle = '#555'
      ctx.fill()
    }

    // Draw nodes
    for (let node of nodes.value) {
      const { x, y } = positions.value[node]
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.stroke()

      ctx.fillStyle = '#000'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node, x, y)
    }

    requestAnimationFrame(draw)
  }

  requestAnimationFrame(draw)
}

onMounted(() => {
  drawGraph()
})
</script>

<style scoped>
canvas {
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}
</style>
