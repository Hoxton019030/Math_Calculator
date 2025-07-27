<template>
  <div class="sidebar-container">
    <div class="history-panel" :style="{ width: width + 'px', right: offset + 'px' }">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">歷史紀錄</h5>
        <button class="btn btn-sm btn-outline-danger" @click="clearHistory">清除全部</button>
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
      <div class="resize-handle-left" @mousedown="startResize"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  history: { type: Array, required: true },
  width: { type: Number, default: 250 },
  offset: { type: Number, default: 20 }
})

const emit = defineEmits(['clearHistory', 'loadHistoryItem'])

const localWidth = ref(props.width)
const localOffset = ref(props.offset)
let isResizing = false
let resizeStartX = null
let resizeStartWidth = null

function startResize(event) {
  event.preventDefault()
  isResizing = true
  resizeStartX = event.clientX
  resizeStartWidth = localWidth.value

  function onMouseMove(moveEvent) {
    const dx = moveEvent.clientX - resizeStartX
    localWidth.value = Math.max(150, Math.min(400, resizeStartWidth - dx))
  }

  function onMouseUp() {
    isResizing = false
    resizeStartX = null
    resizeStartWidth = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function clearHistory() {
  emit('clearHistory')
}

function loadHistoryItem(item) {
  emit('loadHistoryItem', item)
}
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 1000;
}

.history-panel {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #fff;
  border-left: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  border-radius: 4px 0 0 4px;
  padding: 10px;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  transition: width 0.2s ease;
  overflow-y: auto;
  height: 100vh;
}

.resize-handle-left {
  position: absolute;
  left: -5px;
  top: 0;
  width: 5px;
  height: 100%;
  background: #007bff;
  cursor: ew-resize;
  border-radius: 3px;
}

.resize-handle-left:hover {
  background: #0056b3;
}
</style>