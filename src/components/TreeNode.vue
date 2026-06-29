<template>
  <div class="tree-node">
    <div class="node-circle">{{ node.name }}</div>
    
    <div v-if="node.children && node.children.length" class="children-wrapper">
      <div class="vertical-line"></div>
      
      <div class="children-container">
        <div v-if="node.children.length > 1" class="horizontal-line"></div>
        
        <div
          v-for="(child, index) in node.children"
          :key="index"
          class="child-node-wrapper"
        >
          <div class="child-connection"></div>
          
          <TreeNode :node="child" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import TreeNode from './TreeNode.vue';
import { onMounted, nextTick } from 'vue';

defineProps({
  node: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
/* 確保所有元素在計算尺寸時都包含 padding 和 border */
* {
  box-sizing: border-box;
}

.tree-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
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
  z-index: 10;
}

.children-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 從父節點向下的垂直線 */
.vertical-line {
  position: absolute;
  width: 2px;
  height: 20px;
  background-color: #333;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.children-container {
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
}

/* 連接所有子節點的水平線 */
.horizontal-line {
  position: absolute;
  height: 2px;
  background-color: #333;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.child-node-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1; /* 讓每個子節點均分空間 */
  padding: 20px 10px 0;
}

/* 從水平線到每個子節點的垂直連線 */
.child-connection {
  position: absolute;
  width: 2px;
  height: 20px;
  background-color: #333;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>