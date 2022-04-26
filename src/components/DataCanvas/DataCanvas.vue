<template>
  <controller
  v-model:x="x"
  v-model:width="width"
  v-model:trim_left="trim_left"
  v-model:trim_right="trim_right"
  :menuItems="menuItems"
  @remove="emits('remove')"
  >
    <canvas :height="TRACK_HEIGHT" :style="{ left: -trim_left }" ref="canvas"/>
  </controller>
</template>

<style scoped>
canvas {
  position: absolute;
}
</style>

<script setup lang="ts">
import Controller from './base/Controller.vue'
import { useProject } from '../../project'
import { CanvasData } from '../../type.d'
import { TRACK_HEIGHT as _TRACK_HEIGHT } from '../../config'
import { computed, inject, onMounted, readonly, ref, watch } from 'vue'

const canvas = ref<InstanceType<HTMLCanvasElement>>()
let ctx: CanvasRenderingContext2D

onMounted(() => {
  ctx = canvas.value.getContext('2d')
})

const project = useProject()

const canvasData = inject('canvasData')
const emits = defineEmits<{
  (e: 'play', when: number): void,
  (e: 'remove'): void
}>()

const TRACK_HEIGHT = readonly(ref(_TRACK_HEIGHT))

const x = computed({
  get: () => {
    return canvasData.start_time * project.second_width
  },
  set: x => {
    canvasData.start_time = x / project.second_width
  }
})

const width = computed({
  get: () => {
    return canvasData.duration * project.second_width
  },
  set: width => {
    canvasData.duration = width / project.second_width
  }
})

const trim_left = computed({
  get: () => {
    return canvasData.trim_start * project.second_width
  },
  set: trim_left => {
    canvasData.trim_start = trim_left / project.second_width
  }
})

const trim_right = computed({
  get: () => {
    return canvasData.trim_end * project.second_width
  },
  set: trim_right => {
    canvasData.trim_end = trim_right / project.second_width
  }
})

watch(() => project.current_time, newVal => {
  if(newVal > canvasData.start_time)
    emits('play', newVal - canvasData.start_time)
})

const menuItems = ref([
  {
    text: 'ダウンロード',
    action: () => console.log('ダウンロード')
  },
  {
    text: '削除',
    action: () => emits('remove')
  }
])
</script>
