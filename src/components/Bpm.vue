<template>
  <editable-text
  v-model="bpm"
  :validators="validators"
  style="
    width: 50px;
    text-align: center;
    font-size: 1.5rem;
  "
  />
</template>

<script setup lang="ts">
import { useProject } from '../project'
import { computed } from 'vue'
const project = useProject()
const bpm = computed({
  get: () => String(project.bpm),
  set: _bpm => project.bpm = Number(_bpm)
})
const validators = [
  bpm => bpm.match(/[1-9]\d{1,2}/)?.[0] === bpm
]
</script>
