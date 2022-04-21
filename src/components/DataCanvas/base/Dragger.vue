<template>
  <div
  class="dragger"
  @pointerdown.stop="startMove"
  @pointermove.stop="onMove"
  @pointerout.stop="endMove"
  @pointerup.stop="endMove"
  @click.stop
  />
</template>

<style scoped>
.dragger {
  position: absolute;
  top: 0;
  right: 30px;
  bottom: 0;
  left: 30px;
}
</style>

<script setup lang="ts">
const emits = defineEmits<{
  (e: 'move', dif: number): void
}>()
let isMoving = false
let startX: number

function startMove(e) {
  isMoving = true
  startX = e.offsetX
}
function onMove(e) {
  if(isMoving)
    emits('move', e.offsetX - startX)
}
function endMove() {
  isMoving = false
}
</script>
