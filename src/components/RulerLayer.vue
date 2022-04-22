<template>
  <div
  id="ruler-layer"
  class="no-scroll-bar"
  v-scroll-value:top="modelValue"
  @scroll="emits('update:modelValue', $event.target.scrollTop)"
  @touchstart="startTouches"
  @touchmove="zoomWithTouches"
  >
    <slot/>
  </div>
</template>

<style scoped>
div {
  background-color: #323232;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  overflow-x: hidden;
  overflow-y: scroll;
  font-size: 0;
  touch-action: manipulation;
}
</style>

<script setup lang="ts">
import { useProject } from '../project'

defineProps<{ modelValue: number }>()
const emits = defineEmits<{ (e: 'update:modelValue', modelValue: number): void }>()

const project = useProject()

function getTouchesDiff(touches): number {
  const x1 = touches[0].clientX
  const y1 = touches[0].clientY

  const x2 = touches[1].clientX
  const y2 = touches[1].clientY
  return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
}

let oldTouchesDiff: number

function startTouches(e) {
  if(project.state !== "recording" && e.touches.length === 2)
    oldTouchesDiff = getTouchesDiff(e.touches)
}

function zoomWithTouches(e){
  if(project.state === "recording" || e.touches.length !== 2) return;
  e.preventDefault()
  const curDiff = getTouchesDiff(e.touches)
  const newVal = Math.round(project.second_width * curDiff / oldTouchesDiff)
  if(20 < newVal && newVal < 200){
    project.second_width = newVal
    oldTouchesDiff = curDiff
  }
}
</script>
