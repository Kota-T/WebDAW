<template>
  <controller
  v-model:x="x"
  v-model:width="width"
  v-model:trim_left="trim_left"
  v-model:trim_right="trim_right"
  >
    <canvas :width="width" :style="{ left: -trim_left }" ref="canvas"/>
  </controller>
</template>

<script setup lang="ts">
import Controller from './base/Controller.vue'
import { useStore } from '../../store'
import { ref, watch, watchEffect } from 'vue'

const x = ref(0)
const width = ref(200)
const trim_left = ref(0)
const trim_right = ref(0)

const store = useStore()

watch(() => store.state.second_width, zoom)

function zoom(newVal, oldVal){
  const ratio = newVal / oldVal;
  x.value *= ratio;
  width.value *= ratio;
  trim_left.value *= ratio;
  trim_right.value *= ratio;
}

watchEffect(() => console.table({
  x: x.value,
  width: width.value,
  trim_left: trim_left.value,
  trim_right: trim_right.value
}))
</script>
