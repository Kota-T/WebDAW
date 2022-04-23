<template>
  <v-dialog
  v-model="isOpen"
  activator="parent"
  >
    <v-card>
      <v-card-title>書き出す範囲を選択</v-card-title>
      <v-card-text>
        <table>
          <tr>
            <th></th>
            <th>小節</th>
            <th>拍</th>
          </tr>
          <tr>
            <th>開始</th>
            <td>
              <input v-model="start_bar" autofocus>
            </td>
            <td>
              <input v-model="start_beat">
            </td>
          </tr>
          <tr>
            <th>終了</th>
            <td>
              <input v-model="end_bar">
            </td>
            <td>
              <input v-model="end_beat">
            </td>
          </tr>
        </table>
        <template v-if="submitted">
          <div class="error-message">{{ start_bar_error.message }}</div>
          <div class="error-message">{{ start_beat_error.message }}</div>
          <div class="error-message">{{ end_bar_error.message }}</div>
          <div class="error-message">{{ end_beat_error.message }}</div>
          <div class="error-message">{{ start_later_than_end_error.message }}</div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
        variant="plain"
        size="small"
        @click="submit"
        >ok</v-btn>
        <v-btn
        variant="plain"
        size="small"
        @click="isOpen=false"
        >cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
table {
  border-collapse: collapse;
  color: black;
}
th, td {
  border: 1px solid grey;
}
th {
  background-color: lightgrey;
  color: #333;
  padding: 5px;
}
input {
  width: 150px;
  height: 42px;
  text-align: center;
}
input:focus {
  outline: none;
  border: 1px solid;
}
.error-message {
  color: red;
  font-size: 0.8rem;
}
</style>

<script setup lang="ts">
import { useProject } from '../../project'
import { computed, ref, watchEffect } from 'vue'

const emits = defineEmits<{ (e: 'submit', value: [number, number]): void }>()

const project = useProject()

const isOpen = ref(false)

const getTime = (bar: number, beat: number): number => {
  return (bar - 1) * project.bar_time + (beat - 1) * project.scale_time
}

const start_bar = ref("")
const start_beat = ref("")

const start_time = computed(() => getTime(start_bar.value, start_beat.value))

const end_bar = ref("")
const end_beat = ref("")

const end_time = computed(() => getTime(end_bar.value, end_beat.value))

const submitted = ref(false)

const isEmpty = (value: string): boolean => value === ""
const isNatural = (value: string | number): boolean => {
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}
const isBar = isNatural
const isBeat = (beat: string): boolean => {
  const num = Number(beat)
  return isNatural(num) && num <= project.rhythm[0]
}

const start_bar_error = computed(() => {
  const is_empty = isEmpty(start_bar.value)
  const is_bar = isBar(start_bar.value)
  return {
    is_error: is_empty || !is_bar,
    message: is_empty
      ? "開始の小節を入力してください。"
      : !is_bar
      ? "開始の小節には1以上の整数を入力してください。"
      : ""
  }
})
const start_beat_error = computed(() => {
  const is_empty = isEmpty(start_beat.value)
  const is_beat = isBeat(start_beat.value)
  return {
    is_error: is_empty || !is_beat,
    message: is_empty
      ? "開始の拍を入力してください。"
      : !is_beat
      ? `開始の拍には1から${project.rhythm[0]}までの整数を入力してください。`
      : ""
  }
})
const end_bar_error = computed(() => {
  const is_empty = isEmpty(end_bar.value)
  const is_bar = isBar(end_bar.value)
  return {
    is_error: is_empty || !is_bar,
    message: is_empty
      ? "終了の小節を入力してください。"
      : !is_bar
      ? "終了の小節には1以上の整数を入力してください。"
      : ""
  }
})
const end_beat_error = computed(() => {
  const is_empty = isEmpty(end_beat.value)
  const is_beat = isBeat(end_beat.value)
  return {
    is_error: is_empty || !is_beat,
    message: is_empty
      ? "終了の拍を入力してください。"
      : !is_beat
      ? `終了の拍には1から${project.rhythm[0]}までの整数を入力してください。`
      : ""
  }
})
const start_later_than_end_error = computed(() => {
  const is_empty = [
    start_bar.value,
    start_beat.value,
    end_bar.value,
    end_beat.value
  ].some(isEmpty)
  const is_later = start_time.value >= end_time.value
  const is_error = !is_empty && is_later
  return {
    is_error,
    message: is_error
      ? "開始は終了より前にしてください。"
      : ""
  }
})

function submit() {
  if(
    start_bar_error.value.is_error ||
    start_beat_error.value.is_error ||
    end_bar_error.value.is_error ||
    end_beat_error.value.is_error ||
    start_later_than_end_error.value.is_error
  ) {
    submitted.value = true
    return
  }
  emits('submit', [start_time.value, end_time.value])
  isOpen.value = false
}

watchEffect(() => {
  if(isOpen.value) return
  start_bar.value = ""
  start_beat.value = ""
  end_bar.value = ""
  end_beat.value = ""
  submitted.value = false
})

/*watchEffect(() => console.table({
  start_bar: start_bar.value,
  start_beat: start_beat.value,
  end_bar: end_bar.value,
  end_beat: end_beat.value,
  start_time: start_time.value,
  end_time: end_time.value
}))*/
</script>
