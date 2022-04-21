<template>
  <v-navigation-drawer
  :modelValue="modelValue"
  @update:modelValue="emits('update:modelValue', $event)"
  temporary
  position="right"
  >
    <v-row>
      <v-col class="text-end">
        <v-btn
        icon="mdi-close"
        variant="text"
        color="grey"
        @click.stop="emits('update:modelValue', false)"
        />
      </v-col>
    </v-row>
    <v-list>
      <v-list-group>
        <template #activator="{ props }">
          <v-list-item
          v-bind="props"
          >プロジェクト</v-list-item>
        </template>
        <v-list-item href="/new" target="_blank">新規</v-list-item>
        <v-list-item>
          開く
          <open-project-dialog/>
        </v-list-item>
        <v-list-item @click="saveProject">保存</v-list-item>
        <v-list-item>
          選択範囲を書き出す
          <bounce-range-dialog/>
        </v-list-item>
      </v-list-group>
      <v-list-group>
        <template #activator="{ props }">
          <v-list-item
          v-bind="props"
          >設定</v-list-item>
        </template>
        <v-list-item @click="reset">リセット</v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import OpenProjectDialog from './Dialog/OpenProjectDialog.vue'
import BounceRangeDialog from './Dialog/BounceRangeDialog.vue'
import { useProject } from '../project'
import { reset } from '../db'
import { nextTick } from 'vue'

defineProps<{ modelValue: boolean }>()
const emits = defineEmits<{ (e: 'update:modelValue', modelValue: boolean): void }>()

const project = useProject()

async function saveProject() {
  emits('update:modelValue', false)
  await nextTick()
  project.save()
}
</script>
