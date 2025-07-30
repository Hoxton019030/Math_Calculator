<template>
  <div class="container-fluid">
    <div class="main-content py-4">
      <h1 class="mb-4 text-center text-3xl font-bold text-gray-800">三次方程因式分解計算機</h1>

      <div class="row justify-content-center mb-4">
        <div class="col-md-10">
          <div class="card p-4 shadow-sm bg-white rounded-lg">
            <div class="d-flex flex-wrap justify-content-center gap-3 align-items-end">
              <div class="d-flex flex-column align-items-center">
                <label class="form-label small mb-1 text-gray-600">係數 a</label>
                <input v-model.number="a" type="number" class="form-control text-center" style="width: 100px" />
                <small class="text-muted">x³</small>
              </div>
              <div class="d-flex flex-column align-items-center">
                <label class="form-label small mb-1 text-gray-600">係數 b</label>
                <input v-model.number="b" type="number" class="form-control text-center" style="width: 100px" />
                <small class="text-muted">x²</small>
              </div>
              <div class="d-flex flex-column align-items-center">
                <label class="form-label small mb-1 text-gray-600">係數 c</label>
                <input v-model.number="c" type="number" class="form-control text-center" style="width: 100px" />
                <small class="text-muted">x</small>
              </div>
              <div class="d-flex flex-column align-items-center">
                <label class="form-label small mb-1 text-gray-600">常數項 d</label>
                <input v-model.number="d" type="number" class="form-control text-center" style="width: 100px" />
                <small class="text-muted">常數</small>
              </div>
              <button class="btn btn-primary h-100 align-self-center" @click="factorize">計算</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="resultText" class="alert alert-success text-center fs-5 rounded-md">
        {{ resultText }}
      </div>
      <div v-if="errorText" class="alert alert-danger text-center fs-6 rounded-md">
        {{ errorText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const a = ref(1)
const b = ref(0)
const c = ref(0)
const d = ref(0)

const resultText = ref('')
const errorText = ref('')

function trimFloat(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(6).replace(/(?:\.0+|(?<=\..*?)0+)$/, '')
}

function factorize() {
  try {
    const A = a.value
    const B = b.value
    const C = c.value
    const D = d.value

    if (A === 0) throw new Error('a 不能為 0（不是三次方程）')

    const candidates = []
    const absD = Math.abs(D)
    for (let i = 1; i <= absD; i++) {
      if (D % i === 0) {
        candidates.push(i)
        candidates.push(-i)
      }
    }

    let root = null
    for (const r of candidates) {
      if (A * r ** 3 + B * r ** 2 + C * r + D === 0) {
        root = r
        break
      }
    }

    if (root === null) throw new Error('找不到整數根，無法因式分解')

    const b1 = A
    const b2 = B + b1 * root
    const b3 = C + b2 * root

    const discriminant = b2 ** 2 - 4 * b1 * b3
    let quadFactor
    if (discriminant > 0) {
      const sqrtD = Math.sqrt(discriminant)
      const r1 = (-b2 + sqrtD) / (2 * b1)
      const r2 = (-b2 - sqrtD) / (2 * b1)
      quadFactor = `(x - ${trimFloat(r1)}) (x - ${trimFloat(r2)})`
    } else if (discriminant === 0) {
      const r1 = -b2 / (2 * b1)
      quadFactor = `(x - ${trimFloat(r1)})²`
    } else {
      quadFactor = `${b1}x² + ${b2}x + ${b3}`
    }

    resultText.value = `因式分解結果為： (x - ${root}) ${quadFactor}`
    errorText.value = ''
  } catch (err) {
    resultText.value = ''
    errorText.value = err.message
  }
}
</script>

<style scoped>
.container-fluid {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding-right: 40px;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>