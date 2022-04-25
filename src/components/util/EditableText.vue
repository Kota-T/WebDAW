<template>
  <span
  v-if="!isEditing"
  class="editable-text__text"
  @dblclick="startEdit"
  >{{ modelValue }}</span>
  <div v-else class="editable-text__container">
    <input
    class="editable-text__input"
    v-model="text"
    @keydown.enter="endEdit"
    ref="input"
    >
    <div class="editable-text__border-bottom"/>
  </div>
</template>

<style scoped>
.editable-text__text {
  color: v-bind(color);
  border-bottom: 1px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.editable-text__text:hover {
  cursor: pointer;
}
.editable-text__container {
  position: relative;
}
.editable-text__input {
  color: v-bind(color);
  text-align: inherit;
  width: 100%;
  border-bottom: 1px solid transparent;
  outline: none;
}
.editable-text__border-bottom {
  border-bottom: 1px solid;
  border-color: v-bind(color);
  position: absolute;
  bottom: 0;
  animation: border-bottom 0.3s ease-out forwards;
}
@keyframes border-bottom {
  0% {
    left: 50%;
    right: 50%;
  }
  100% {
    left: 0;
    right: 0;
  }
}
</style>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

type EditableTextProps = {
  modelValue: string
  validators?: ((text: string) => boolean)[]
  color?: string
}

type EditableTextEmits = {
  (e: 'update:modelValue', modelValue: string): void
}

const props = withDefaults(defineProps<EditableTextProps>(), { validators: [] })
const emits = defineEmits<EditableTextEmits>()
const isEditing = ref(false)
const text = ref(props.modelValue)
const input = ref()

async function startEdit() {
  isEditing.value = true
  await nextTick()
  input.value.focus()
}

function endEdit(e: KeydownEvent) {
  if(e.isComposing) return
  if(
    text.value !== "" &&
    !props.validators
      .map(v => v(text.value))
      .includes(false)
  ) {
    emits('update:modelValue', text.value)
  } else {
    text.value = props.modelValue
  }
  isEditing.value = false
}
</script>
