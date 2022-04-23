<template>
  <div
  class="no-scroll-bar"
  v-scroll-value="modelValue"
  @scroll="emits('update:modelValue', $event.target.scrollTop)"
  >
    <slot/>
  </div>
</template>

<style scoped>
div {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: scroll;
}
</style>

<script setup lang="ts">
defineProps<{ modelValue: number }>()
const emits = defineEmits<{ (e: 'update:modelValue', modelValue): void }>()
</script>
