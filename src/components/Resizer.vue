<template>
  <v-slider
  v-model="project.second_width"
  min="20"
  max="200"
  step="1"
  hide-details
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProject } from '../project'

const project = useProject()
const disabled = ref(false)
</script>
