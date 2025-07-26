<template>
  <div class="bg-dark text-white p-3 vh-100">
    <h4 class="text-white mb-4">數學工具</h4>

    <div>
      <h6 class="text-secondary">線性代數</h6>
      <ul class="list-unstyled ms-2">
        <li class="mb-2"><router-link class="text-white text-decoration-none" to="/linear-algebra/placeholder">尚未定義</router-link>
        </li>
         <li class="mb-2"><router-link class="text-white text-decoration-none" to="/linear-algebra/LinearAlgebraCalculator">矩陣計算機</router-link></li>
      </ul>
    </div>

    <div class="mt-4">
      <h6 class="text-secondary">離散數學</h6>
      <ul class="list-unstyled">
        <li class="mb-2">
          <router-link class="text-white text-decoration-none" to="/discrete/onto">
            滿射個數計算器
          </router-link>
        </li>
        <li class="mb-2">
          <router-link class="text-white text-decoration-none" to="/discrete/combinatorics">
            排列組合計算器
          </router-link>
        </li>
      </ul>
    </div>
        <div class="mt-4">
      <h6 class="text-secondary">資料結構</h6>
      <ul class="list-unstyled">
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
</template>
