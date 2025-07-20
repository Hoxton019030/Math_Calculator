<template>
  <div class="tree-node">
    <div class="node-circle">{{ node.name }}</div>
    <div v-if="node.children && node.children.length" class="children">
      <TreeNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
      />
      <div
        v-for="(child, index) in node.children"
        :key="'line-' + index"
        class="connection-line"
        :style="{
          left: `${(index / (node.children.length - 1 || 1)) * 100}%`,
          '--target-x': `${(index / (node.children.length - 1 || 1)) * 100}%`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  node: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.tree-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.node-circle {
  width: 40px;
  height: 40px;
  background-color: #f0f0f0;
  border: 2px solid #555;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: relative;
  z-index: 1;
}

.children {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  position: relative;
  width: 100%;
}

.connection-line {
  position: absolute;
  width: 2px;
  height: 0;
  background-color: red;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  transform-origin: 50% 100%;
}

.connection-line::after {
  content: "";
  position: absolute;
  width: 2px;
  height: calc(100vh - 100px); /* 確保線條夠長連接到子節點 */
  background-color: red;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  transform-origin: 50% 0;
}

.children .tree-node {
  position: relative;
  margin: 0 20px;
}
</style>