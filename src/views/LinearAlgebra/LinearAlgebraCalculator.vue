<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">線性代數計算機</h1>

    <div class="row g-4">
      <!-- 矩陣 A & B 輸入 -->
      <div class="col-md-6">
        <h5>矩陣 A</h5>
        <matrix-input :matrix="matrixA" @update:matrix="val => matrixA = val" />
        <div class="my-3">
          <button class="btn btn-sm btn-outline-secondary me-2" @click="addRow(matrixA)">+列</button>
          <button class="btn btn-sm btn-outline-secondary me-2" @click="addCol(matrixA)">+欄</button>
          <button class="btn btn-sm btn-outline-danger" @click="resetMatrix(matrixA)">清空 A</button>
        </div>

        <h5 class="mt-4">矩陣 B</h5>
        <matrix-input :matrix="matrixB" @update:matrix="val => matrixB = val" />
        <div class="my-3">
          <button class="btn btn-sm btn-outline-secondary me-2" @click="addRow(matrixB)">+列</button>
          <button class="btn btn-sm btn-outline-secondary me-2" @click="addCol(matrixB)">+欄</button>
          <button class="btn btn-sm btn-outline-danger" @click="resetMatrix(matrixB)">清空 B</button>
        </div>
      </div>

      <!-- 操作與結果 -->
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">選擇操作</label>
          <select class="form-select" v-model="operation">
            <option disabled value="">-- 請選擇 --</option>
            <option value="detA">行列式 det(A)</option>
            <option value="invA">反矩陣 A⁻¹</option>
            <option value="rrefA">簡化列梯陣 RREF(A)</option>
            <option value="transposeA">轉置 Aᵗ</option>
            <option value="multiplyAB">A × B</option>
            <option value="addAB">A + B</option>
            <option value="subtractAB">A - B</option>
          </select>
        </div>

        <button class="btn btn-primary w-100 mb-3" @click="calculate">計算</button>

        <div v-if="errorText" class="alert alert-danger">{{ errorText }}</div>
        <div v-if="result" class="alert alert-success">
          <div v-if="Array.isArray(result)">
            <table class="table table-bordered text-center">
              <tr v-for="row in result" :key="row">
                <td v-for="val in row" :key="val">{{ val }}</td>
              </tr>
            </table>
          </div>
          <div v-else>
            結果：{{ result }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { create, all } from 'mathjs'
import MatrixInput from './MatrixInput.vue'

const math = create(all)

const matrixA = ref([[1, 2], [3, 4]])
const matrixB = ref([[5, 6], [7, 8]])
const operation = ref('')
const result = ref(null)
const errorText = ref('')

function addRow(matrix) {
  const cols = matrix[0]?.length || 2
  matrix.push(new Array(cols).fill(0))
}

function addCol(matrix) {
  for (let row of matrix) row.push(0)
}

function resetMatrix(matrix) {
  matrix.splice(0, matrix.length)
}

function calculate() {
  errorText.value = ''
  try {
    let A = math.matrix(matrixA.value)
    let B = math.matrix(matrixB.value)
    switch (operation.value) {
      case 'detA':
        result.value = math.det(A)
        break
      case 'invA':
        result.value = math.inv(A)._data
        break
      case 'rrefA':
        result.value = math.rref(A)._data
        break
      case 'transposeA':
        result.value = math.transpose(A)._data
        break
      case 'multiplyAB':
        result.value = math.multiply(A, B)._data
        break
      case 'addAB':
        result.value = math.add(A, B)._data
        break
      case 'subtractAB':
        result.value = math.subtract(A, B)._data
        break
      default:
        errorText.value = '請選擇一個有效的操作'
    }
  } catch (err) {
    result.value = null
    errorText.value = err.message
  }
}
</script>

<style scoped>
table td {
  min-width: 40px;
}
</style>
