<template>
  <div class="sidebar-container" :style="{ left: isCollapsed ? `-${sidebarWidth}px` : '0' }">
    <div class="bg-dark text-white p-3 vh-100" :style="{ width: sidebarWidth + 'px' }">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <router-link to="/" class="text-white text-decoration-none">
          <h4 class="text-white mb-0">首頁</h4>
        </router-link>
        <button class="btn btn-sm btn-outline-light" @click="toggleSidebar">
          {{ isCollapsed ? '展開' : '收起' }}
        </button>
      </div>

      <div>
        <h6 class="text-secondary">線性代數</h6>
        <ul class="list-unstyled ms-2">
          <li class="mb-2">
            <router-link class="text-white text-decoration-none" to="/linear-algebra/CubicFactorizer">
              三次方程因式分解計算機
            </router-link>
          </li>
          <li class="mb-2">
            <router-link class="text-white text-decoration-none" to="/linear-algebra/BasicVectorVisual">
              基向量變化視覺化
            </router-link>
          </li>
        </ul>
      </div>

      <div class="mt-4">
        <h6 class="text-secondary">離散數學</h6>
        <ul class="list-unstyled ms-2">
          <li class="mb-2">
            <router-link class="text-white text-decoration-none" to="/discrete/onto">
              Stirling Number-第二類
            </router-link>
          </li>
          <li class="mb-2">
            <router-link class="text-white text-decoration-none" to="/discrete/combinatorics">
              排列組合計算器
            </router-link>
          </li>
          <li class="mb-2">
            <router-link class="text-white text-decoration-none" to="/discrete/euclidean_gcd">
              歐幾里德輾轉相除法計算器
            </router-link>
          </li>
        </ul>
      </div>

      <div class="mt-4">
        <h6 class="text-secondary">資料結構</h6>
        <ul class="list-unstyled ms-2">
          <li class="mb-2">
            <router-link class="text-white text-decoration-none" to="/dataStructure/tree_visual">
              Tree 的視覺化
            </router-link>
          </li>
          <li class="mb-2">
            <router-link class="text-white text-decoration-none" to="/dataStructure/graph_visual">
              Graph 的視覺化
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <button v-if="isCollapsed" class="toggle-btn" @click="toggleSidebar">
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isCollapsed = ref(false)
const sidebarWidth = ref(250) // Default sidebar width in pixels

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: left 0.3s ease;
}

.bg-dark {
  background-color: #212529;
  overflow-y: auto;
}

.toggle-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease;
}

.toggle-btn:hover {
  background-color: #0056b3;
}

.toggle-btn .fas {
  font-size: 20px;
}

/* .text-white:hover {
  color: #e9ecef;
  text-decoration: underline;
} */

.btn-outline-light {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-light:hover {
  background-color: #6c757d;
  color: #fff;
}
</style>