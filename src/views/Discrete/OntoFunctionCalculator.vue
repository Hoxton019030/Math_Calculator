<script setup>
import { ref } from 'vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['calculate'])
const m = ref(5)
const n = ref(3)

function emitCalculate() {
  emit('calculate', m.value, n.value)
}
</script>

<template>
  <div class="container my-4">
    <div class="card shadow-sm p-4">
      <h5 class="mb-4 text-center">輸入參數</h5>
      <div class="row justify-content-center g-3">
        <div class="col-md-3">
          <label for="inputM" class="form-label">m（定義域個數）</label>
          <input id="inputM" type="number" class="form-control" v-model.number="m" min="0" />
        </div>
        <div class="col-md-3">
          <label for="inputN" class="form-label">n（對應值個數）</label>
          <input id="inputN" type="number" class="form-control" v-model.number="n" min="0" />
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-primary w-100" @click="emitCalculate">計算</button>
        </div>
      </div>
    </div>
  </div>
</template>
