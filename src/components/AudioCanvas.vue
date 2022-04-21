<template>
  <data-canvas
  @play="play"
  @remove="emits('remove')"
  />
</template>

<style></style>

<script setup lang="ts">
import DataCanvas from './DataCanvas/DataCanvas.vue'
import { CanvasData } from '../type.d'
import { provide } from 'vue'

const props = defineProps<{ canvasData: CanvasData }>()
const emits = defineEmits<{ (e: 'remove'): void }>()

provide('canvasData', props.canvasData)

function play() {

}
</script>
