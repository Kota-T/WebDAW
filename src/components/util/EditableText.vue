<template>
  <span
  v-if="!isEditing"
  class="editable-text__text"
  @dblclick="startEdit"
  >{{ modelValue }}</span>
  <div v-else class="editable-text__container">
    <input
    class="editable-text__input"
    v-model="text"
    @keydown.enter="endEdit($event.isComposing)"
    ref="input"
    >
    <div class="editable-text__border-bottom"/>
  </div>
</template>

<style scoped>
.editable-text__text {
  border-bottom: 1px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.editable-text__text:hover {
  cursor: pointer;
}
.editable-text__container {
  position: relative;
}
.editable-text__input {
  width: 100%;
  border-bottom: 1px solid transparent;
  outline: none;
}
.editable-text__border-bottom {
  border-bottom: 1px solid grey;
  position: absolute;
  bottom: 0;
  animation: border-bottom 0.4s ease-out forwards;
}
@keyframes border-bottom {
  0% {
    left: 50%;
    right: 50%;
  }
  100% {
    left: 0;
    right: 0;
  }
}
</style>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
const props = defineProps<{ modelValue: string, validator?: (value: string) => boolean }>()
const emits = defineEmits<{ (e: 'update:modelValue', modelValue: string): void }>()
const isEditing = ref(false)
const text = ref(props.modelValue)
const input = ref()

async function startEdit() {
  isEditing.value = true
  await nextTick()
  input.value.focus()
}

function endEdit(isComposing: boolean) {
  if(isComposing || text.value === "") return
  if(props.validator === undefined || props.validator(text.value))
    emits('update:modelValue', text.value)
  isEditing.value = false
}
</script>
