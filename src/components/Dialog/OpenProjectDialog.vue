<template>
  <v-dialog
  v-model="isOpen"
  activator="parent"
  >
    <v-card style="width: 560px;">
      <v-card-title>プロジェクトを開く</v-card-title>
      <v-card-text>
        <v-text-field
        v-model="search_word"
        density="compact"
        variant="outlined"
        append-inner-icon="mdi-magnify"
        clearable
        hide-details
        placeholder="検索"
        class="mb-3"
        />
        <span v-if="projects.length === 0">プロジェクトはありません。</span>
        <v-row v-else class="overflow-y-auto" style="max-height: 400px;">
          <v-col cols="6" v-for="project in projects">
            <v-hover v-slot="{ isHovering, props }">
              <v-card
              :elevation="isHovering ? 10 : 0"
              :href="`/${project.id}`"
              target="_blank"
              max-width="270"
              max-height="270"
              v-bind="props"
              >
                <v-img :src="project.thumbnail"/>
                <v-card-header>
                  <v-card-header-text>
                    <v-card-title>{{ project.name }}</v-card-title>
                    <v-card-subtitle>最終更新日：{{ formatDate(project.last_updated) }}</v-card-subtitle>
                  </v-card-header-text>
                </v-card-header>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn
        variant="plain"
        size="small"
        @click.stop="isOpen=false"
        >cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { search } from '../../project_repository'

const isOpen = ref(false)
const projects = ref([])
const search_word = ref("")

onMounted(searchProject)
watch(() => search_word.value, searchProject)
watch(() => isOpen.value, () => search_word.value = "")

async function searchProject() {
  projects.value = await search(search_word.value)
}

function formatDate(date: Date) {
  return `${
    date.getFullYear()
  }年${
    date.getMonth() + 1
  }月${
    date.getDate()
  }日${
    date.getHours()
  }時${
    date.getMinutes()
  }分`
}
</script>
