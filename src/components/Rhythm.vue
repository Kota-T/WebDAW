<template>
  <editable-text
  v-model="rhythm"
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
import { computed, ref } from 'vue'

const project = useProject()
const rhythm = computed({
  get: () => project.rhythm.join('/'),
  set: _rhythm => project.rhythm = _rhythm.split('/').map(Number)
})
const validators = ref([
  rhythm => rhythm.match(/\d+\/\d+/)?.[0] === rhythm, // 数値/数値かどうか
  rhythm => {
    const [_, den] = rhythm.split('/').map(Number)
    return (den & (den - 1)) === 0 //分母が2の累乗かどうか
  }
])
</script>
