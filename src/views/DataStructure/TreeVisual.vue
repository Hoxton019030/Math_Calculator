<template>
  <div class="container py-4">
    <h1 class="mb-4">樹狀結構可視化器</h1>
    <div class="mb-3">
      <label class="form-label">請輸入樹狀結構（例如：A(B(D,E),C(F))）</label>
      <input v-model="input" class="form-control" placeholder="A(B(D,E),C(F))" />
    </div>
    <button class="btn btn-primary mb-3" @click="renderTree">建立樹</button>

    <div v-if="tree" class="tree-container">
      <TreeNode :node="tree" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TreeNode from '../../components/TreeNode.vue'

const input = ref('')
const tree = ref(null)

function renderTree() {
  try {
    tree.value = parseTree(input.value)
  } catch (e) {
    alert('解析錯誤，請確認格式正確')
    tree.value = null
  }
}

function parseTree(str) {
  let i = 0

  function parseNode() {
    if (i >= str.length) return null

    const name = str[i++]
    const node = { name, children: [] }

    if (str[i] === '(') {
      i++ // skip '('
      while (str[i] !== ')') {
        node.children.push(parseNode())
        if (str[i] === ',') i++ // skip ','
      }
      i++ // skip ')'
    }
    return node
  }

  return parseNode()
}
</script>

<style scoped>
.tree-container {
  padding-top: 20px;
  border-left: 2px dashed #ccc;
  padding-left: 20px;
}
</style>