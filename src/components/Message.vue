<template>
  <v-snackbar
  v-model="isShowing"
  :timeout="2000"
  :color="color"
  fixed
  left
  bottom
  >{{ text }}</v-snackbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isShowing = ref(false)
const color = ref()
const text = ref("メッセージが設定されていません。")

function show(_text: string, _color: string) {
  color.value = _color
  text.value = _text
  isShowing.value = true
}

defineExpose({ show })
</script>
