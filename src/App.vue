<template>
  <div class="d-flex app-container">
    <Sidebar />
    <div class="flex-grow-1 p-4 main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<style>
/* 設定整頁最大尺寸與隱藏水平溢出 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  overflow-y: auto;
  height: 100vh;
}
</style>
