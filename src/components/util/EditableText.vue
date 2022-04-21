<template>
  <span
  v-if="!isEditing"
  @dblclick="isEditing=true"
  >{{ modelValue }}</span>
  <v-text-field
  v-else
  v-model="text"
  autofocus
  variant="underlined"
  density="compact"
  hide-details
  append-inner-icon="mdi-check"
  @change="endEdit"
  @click:append-inner="endEdit"
  />
</template>

<style scoped>
span:hover {
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{ modelValue: string, validator?: any }>()
const emits = defineEmits<{ (e: 'update:modelValue', modelValue: string): void }>()
const text = ref(props.modelValue)
const isEditing = ref(false)

function endEdit() {
  if(!text.value) return
  if(!props.validator || props.validator(text.value))
    emits('update:modelValue', text.value)
  isEditing.value = false
}
</script>
