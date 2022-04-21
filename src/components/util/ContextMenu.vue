<template>
  <v-menu
  v-model="isOpen"
  :style="style"
  transition="scale-transition"
  @click="isOpen=false"
  >
    <v-list class="elevation-3 rounded">
      <v-list-item
      v-for="(item, index) in menuItems"
      :key="index"
      @click="item.action"
      >{{ item.text }}</v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
const props = defineProps<{ menuItems: Object[] }>()

const isOpen = ref(false)

const style = reactive({})

function show(e) {
  e.preventDefault()
  isOpen.value = true
  style.left = e.clientX + 'px'
  style.top = e.clientY + 'px'
}

const { parent } = getCurrentInstance()
parent.attrs.onContextmenu = show
onMounted(() => {
  parent.ctx.$el.addEventListener('contextmenu', show)
})
</script>
