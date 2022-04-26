<template>
  <div :style="style">
    <component
    v-for="(canvasData, index) in canvases"
    :key="canvasData.id"
    :is="CanvasComponents[canvasData.type]"
    :canvasData="canvasData"
    @remove="remove(index)"
    />
  </div>
</template>

<style scoped>
div {
  height: 150px;
  overflow: hidden;
}
</style>

<script setup lang="ts">
import { CanvasComponents } from '../canvas'
import { useProject } from '../project'
import { CanvasData } from '../type.d'
import { computed, inject, readonly, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{ canvases: CanvasData[] }>()

props.canvases.push(
  {
    id: uuidv4(),
    type: 'audio',
    url: '',
    start_time: 0,
    duration: 10,
    trim_start: 0,
    trim_end: 0
  },
  {
    id: uuidv4(),
    type: 'audio',
    url: '',
    start_time: 15,
    duration: 10,
    trim_start: 0,
    trim_end: 0
  }
)

const project = useProject()

const style = computed(() => ({
  width: project.width + 'px'
}))

const showMessage = inject('showMessage')
function remove(index: number) {
  if(!confirm("選択されているキャンバスを削除しますか？")) return
  props.canvases.splice(index, 1)
  showMessage("キャンバスを削除しました。", "error")
}
</script>
