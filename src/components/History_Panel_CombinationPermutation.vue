<template>
  <div class="sidebar-container">
    <div class="history-panel" :style="{ width: localWidth + 'px', right: localOffset + 'px' }">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">歷史紀錄</h5>
        <button class="btn btn-sm btn-outline-danger" @click="clearHistory">清除全部</button>
      </div>
      <ul class="list-group">
        <draggable v-model="localHistory" item-key="id" handle=".drag-handle-history" animation="200">
          <template #item="{ element: item, index }">
            <li class="list-group-item d-flex justify-content-between align-items-center flex-column align-items-start">
              <div class="d-flex align-items-center w-100">
                <div
                  class="drag-handle-history me-2"
                  style="cursor: grab; font-size: 20px;"
                  title="拖曳改變順序"
                >
                  ⇆
                </div>
                <span
                  @click="loadHistoryItem(item.terms)"
                  style="cursor: pointer; flex-grow: 1;"
                  :title="item.expression"
                >
                  {{ item.expression }}
                </span>
                <button
                  class="btn btn-sm btn-outline-danger ms-2"
                  @click.stop="deleteHistory(index)"
                  title="刪除此筆歷史"
                >
                  ×
                </button>
              </div>
              <small class="text-muted mt-1 w-100 text-end">
                結果：{{ item.result !== undefined ? item.result.toLocaleString() : '-' }}
              </small>
            </li>
          </template>
        </draggable>
        <li v-if="localHistory.length === 0" class="list-group-item text-muted">
          尚無紀錄
        </li>
      </ul>
      <div class="resize-handle-left" @mousedown="startResize"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  history: { type: Array, required: true },
  width: { type: Number, default: 300 },
  offset: { type: Number, default: 20 },
  historyKey: { type: String, required: true }
})

const emit = defineEmits(['clearHistory', 'loadHistoryItem', 'update:history'])

const localHistory = ref([...props.history])
const localWidth = ref(props.width)
const localOffset = ref(props.offset)
let isResizing = false
let resizeStartX = null
let resizeStartWidth = null

watch(
  () => props.history,
  (newHistory) => {
    localHistory.value = [...newHistory]
  },
  { deep: true }
)

watch(
  localHistory,
  (newVal) => {
    emit('update:history', newVal)
    localStorage.setItem(props.historyKey, JSON.stringify(newVal))
  },
  { deep: true }
)

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

function loadHistoryItem(terms) {
  emit('loadHistoryItem', terms)
}

function deleteHistory(index) {
  localHistory.value.splice(index, 1)
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

.drag-handle-history {
  user-select: none;
}
</style>