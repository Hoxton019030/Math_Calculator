<template>
  <div class="container py-4">
    <h1 class="mb-4">滿射個數計算器 (Onto Function Count)</h1>
    <InputForm :onCalculateRequest="handleCalculate" />
    <div class="alert alert-info">{{ resultText }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InputForm from '../components/InputForm.vue'
import { countOntoFunctions } from '../utils/ontoUtils'

const resultText = ref('請輸入數值並點擊計算。')

function handleCalculate(m, n) {
  const result = countOntoFunctions(m, n)
  resultText.value = `滿射個數為：${result}`
}
</script>
