<template>
  <div
  class="trimmer"
  :class="{ 'trimmer-right': right }"
  @pointerdown="startTrim"
  @pointermove="onTrim"
  @pointerout="endTrim"
  @pointerup="endTrim"
  >
    <v-icon color="red">{{
      limit
      ? right
        ? 'mdi-arrow-expand-left'
        : 'mdi-arrow-expand-right'
      : 'mdi-arrow-left-right'
    }}</v-icon>
  </div>
</template>

<style scoped>
.trimmer {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  color: black;
  font-size: 1rem;
  opacity: 0;
  width: var(--trimmer-width);
  position: absolute;
  top: 0;
  bottom: 0;
  transition: opacity 0.2s;
}
.trimmer-right {
  right: 0;
}
</style>

<script setup lang="ts">
import { TRIMMER_WIDTH } from '../../../config'
const props = defineProps<{ right?: boolean, limit: boolean }>()
const emits = defineEmits<{
  (e: 'lengthen', dif: number): void,
  (e: 'shorten', dif: number): void
}>()
let startPoint: number
let isResizing = false
function getCurrentPoint(e) {
  return props.right ? TRIMMER_WIDTH - e.offsetX : e.offsetX
}
function startTrim(e) {
  startPoint = getCurrentPoint(e)
  isResizing = true
}
function onTrim(e) {
  if(!isResizing) return
  const curPoint = getCurrentPoint(e)
  if(startPoint > curPoint)//端の方にカーソルを移動させた時
    emits('lengthen', startPoint - curPoint)
  else
    emits('shorten', curPoint - startPoint)
}
function endTrim() {
  isResizing = false
}
</script>
