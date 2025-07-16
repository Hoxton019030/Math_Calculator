<template>
  <div class="row mb-3">
    <div class="col-md-2">
      <label for="m" class="form-label">m (定義域個數)</label>
      <input type="number" class="form-control" v-model.number="m" min="0" />
    </div>
    <div class="col-md-2">
      <label for="n" class="form-label">n (對應值個數)</label>
      <input type="number" class="form-control" v-model.number="n" min="0" />
    </div>
    <div class="col-md-3 d-flex align-items-end">
      <button class="btn btn-primary w-100" @click="onCalculate">計算</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['onCalculateRequest'])
const m = ref(5)
const n = ref(3)

function onCalculate() {
  props.onCalculateRequest(m.value, n.value)
}
</script>
