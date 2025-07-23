<template>
  <div class="matrix-input">
    <table class="table table-bordered text-center align-middle">
      <tbody>
        <tr v-for="(row, rowIndex) in modelValue" :key="rowIndex">
          <td v-for="(cell, colIndex) in row" :key="colIndex">
            <input
              type="number"
              class="form-control form-control-sm"
              v-model.number="modelValue[rowIndex][colIndex]"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex gap-2 mt-2">
      <button class="btn btn-sm btn-outline-secondary" @click="addRow">+ 列</button>
      <button class="btn btn-sm btn-outline-secondary" @click="addCol">+ 行</button>
      <button
        class="btn btn-sm btn-outline-danger"
        @click="removeRow"
        :disabled="modelValue.length <= 1"
      >
        - 列
      </button>
      <button
        class="btn btn-sm btn-outline-danger"
        @click="removeCol"
        :disabled="modelValue[0].length <= 1"
      >
        - 行
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function addRow() {
  const newRow = props.modelValue[0].map(() => 0)
  const updated = [...props.modelValue, newRow]
  emit('update:modelValue', updated)
}

function removeRow() {
  const updated = props.modelValue.slice(0, -1)
  emit('update:modelValue', updated)
}

function addCol() {
  const updated = props.modelValue.map((row) => [...row, 0])
  emit('update:modelValue', updated)
}

function removeCol() {
  const updated = props.modelValue.map((row) => row.slice(0, -1))
  emit('update:modelValue', updated)
}
</script>

<style scoped>
input {
  width: 60px;
  text-align: center;
}
</style>
