<template>
  <div
  class="no-scroll-bar"
  v-scroll-value:left="project.scroll_width"
  @scroll="onScroll"
  @click="setCurrentTime"
  ref="pointer_layer"
  >
    <slot/>
  </div>
</template>

<style scoped>
div {
  background-color: #323232;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-x: scroll;
  overflow-y: hidden;
  font-size: 0;
  touch-action: manipulation;
}
</style>

<script setup lang="ts">
import { POINTER_MARGIN } from '../config'
import { useProject } from '../project'
import { onMounted, ref, watch } from 'vue'

const project = useProject()

const pointer_layer = ref()

onMounted(() => {
  project.min_width = pointer_layer.value.offsetWidth
  window.addEventListener('resize', () => {
    project.min_width = pointer_layer.value.offsetWidth
  })
})

function setCurrentTime(e){
  if(project.state === "recording") return;
  const x = e.clientX - e.currentTarget.getBoundingClientRect().left + e.currentTarget.scrollLeft - POINTER_MARGIN
  project.current_time = x / project.second_width
  if(project.state === "playing"){
    project.pause();
    project.play();
  }
}
function onScroll(e) {
  const scrollLeft = e.target.scrollLeft
  if(scrollLeft >= 0)
    project.scroll_width = scrollLeft
}
</script>
