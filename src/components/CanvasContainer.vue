<template>
  <div :style="style">
    <component
    v-for="(canvasData, index) in trackData.canvases"
    :key="canvasData.id"
    :is="CanvasComponents[canvasData.type]"
    :canvasData="canvasData"
    @remove="remove(index)"
    />
    <component
    :is="DraftCanvasComponents[trackData.type]"
    v-if="project.state === 'recording' && trackData.selected"
    :trackData="trackData"
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
import { TRACK_HEIGHT } from '../config'
import { CanvasComponents, DraftCanvasComponents } from '../canvas'
import { useProject } from '../project'
import { TrackData } from '../type.d'
import { computed, inject } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const { trackData } = defineProps<{ trackData: TrackData }>()

trackData.canvases.push(
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
  trackData.canvases.splice(index, 1)
  showMessage("キャンバスを削除しました。")
}
</script>
