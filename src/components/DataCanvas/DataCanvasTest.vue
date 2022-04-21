<template>
  <data-canvas
  v-model:start_time="start_time"
  v-model:duration="duration"
  v-model:trim_start="trim_start"
  v-model:trim_end="trim_end"
  />
</template>

<script setup lang="ts">
import DataCanvas from './DataCanvas.vue'
import { ref, watchEffect } from 'vue'

const start_time = ref(0)
const duration = ref(10)
const trim_start = ref(0)
const trim_end = ref(0)

watchEffect(() => console.table({
  start_time: start_time.value,
  duration: duration.value,
  trim_start: trim_start.value,
  trim_end: trim_end.value
}))
</script>
