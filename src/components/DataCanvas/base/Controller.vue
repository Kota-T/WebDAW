<template>
  <div
  class="controller rounded"
  tabindex="-1"
  :style="style"
  @keydown.delete="emits('remove')"
  @click.stop
  >
    <slot />
    <trimmer
    :limit="trim_left===0"
    @lengthen="lengthenLeft"
    @shorten="shortenLeft"
    />
    <dragger @move="move"/>
    <trimmer
    right
    :limit="trim_right===0"
    @lengthen="lengthenRight"
    @shorten="shortenRight"
    />
    <context-menu :menuItems="menuItems"/>
  </div>
</template>

<style scoped>
.controller {
  position: absolute;
  background-color: red;
  overflow: hidden;
  transition: border 0.2s;
}
.controller:hover {
  cursor: pointer;
}
.controller:hover > .trimmer {
  opacity: 1;
}
.controller:focus {
  border: 2px solid white;
}
</style>

<script setup lang="ts">
import Dragger from './Dragger.vue'
import Trimmer from './Trimmer.vue'
import { TRIMMER_WIDTH } from '../../../config'
import { computed, reactive, ref } from 'vue'

type ControllerProps = {
  width: number
  x: number
  trim_left: number
  trim_right: number
  menuItems: { text: string, action: () => void }[]
}

type ControllerEmits = {
  (e: 'update:x', x: number): void
  (e: 'update:width', width: number): void
  (e: 'update:trim_left', trim_left: number): void
  (w: 'update:trim_right', trim_right: number): void
  (e: 'remove'): void
}

const props = defineProps<ControllerProps>()
const emits = defineEmits<ControllerEmits>()
const style = computed(() => ({
  width: props.width + 'px',
  left: props.x + 'px'
}))
const width = computed({
  get: () => props.width,
  set: width => emits('update:width', width)
})
const x = computed({
  get: () => props.x,
  set: x => emits('update:x', x)
})
const trim_left = computed({
  get: () => props.trim_left,
  set: trim_left => emits('update:trim_left', trim_left)
})
const trim_right = computed({
  get: () => props.trim_right,
  set: trim_right => emits('update:trim_right', trim_right)
})

const MIN_WIDTH = TRIMMER_WIDTH * 2

function move(dif: number) {
  const moved_x = x.value + dif
  x.value = moved_x > 0 ? moved_x : 0
}

function lengthenLeft(dif: number){
  if(trim_left.value < dif){
    dif = trim_left.value;
  }
  x.value -= dif;
  width.value += dif;
  trim_left.value -= dif;
}

function shortenLeft(dif: number){
  if(width.value - dif < MIN_WIDTH){
    dif = width.value - MIN_WIDTH;
  }
  x.value += dif;
  width.value -= dif;
  trim_left.value += dif;
}

function lengthenRight(dif: number){
  if(trim_right.value < dif){
    dif = trim_right.value;
  }
  width.value += dif;
  trim_right.value -= dif;
}

function shortenRight(dif: number){
  if(width.value - dif < MIN_WIDTH){
    dif = width.value - MIN_WIDTH;
  }
  width.value -= dif;
  trim_right.value += dif;
}
</script>
