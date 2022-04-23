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
              <div>
                <v-text-field
                v-model="start_bar"
                autofocus
                class="text-center"
                type="number"
                variant="plain"
                density="compact"
                hide-details
                />
              </div>
            </td>
            <td>
              <div>
                <v-text-field
                v-model="start_beat"
                class="text-center"
                type="number"
                variant="plain"
                density="compact"
                hide-details
                />
              </div>
            </td>
          </tr>
          <tr>
            <th>終了</th>
            <td>
              <div>
                <v-text-field
                v-model="end_bar"
                class="text-center"
                type="number"
                variant="plain"
                density="compact"
                hide-details
                />
              </div>
            </td>
            <td>
              <div>
                <v-text-field
                v-model="end_beat"
                class="text-center"
                type="number"
                variant="plain"
                density="compact"
                hide-details
                />
              </div>
            </td>
          </tr>
        </table>
        <template v-if="submitted">
          <div
          v-if="!isStartValid"
          class="error-message"
          >開始には適切な値を入力してください。</div>
          <div
          v-if="!isEndValid"
          class="error-message"
          >終了には適切な値を入力してください。</div>
          <div
          v-if="!isStartEarlierThanEnd"
          class="error-message"
          >開始を終了より前にしてください。</div>
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
}
tr > th:first-child {
  padding: 0 5px;
}
td > div {
  border: 1px solid transparent;
}
td > div:focus-within {
  border-color: black;
}
.error-message {
  color: red;
}
.text-center:deep(input) {
  text-align: center;
}
</style>

<script setup lang="ts">
import { useProject } from '../../project'
import { computed, ref, watch, watchEffect } from 'vue'

const emits = defineEmits<{ (e: 'submit', value: [number, number]): void }>()

const project = useProject()

const isOpen = ref(false)

function getTime(bar: number, beat: number) {
  return (bar - 1) * project.bar_time + (beat - 1) * project.scale_time
}

const start_bar = ref("")
const start_beat = ref("")

const start_time = computed(() => getTime(start_bar.value, start_beat.value))

const end_bar = ref("")
const end_beat = ref("")

const end_time = computed(() => getTime(end_bar.value, end_beat.value))

const submitted = ref(false)

const isStartValid = computed(() => start_time.value >= 0)
const isEndValid = computed(() => end_time.value > 0)
const isStartEarlierThanEnd = computed(() => start_time.value < end_time.value)

function submit() {
  if(
    !isStartValid.value ||
    !isEndValid.value ||
    !isStartEarlierThanEnd.value
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
</script>
