<template>
  <v-dialog
  v-model="isOpen"
  activator="parent"
  >
    <v-card>
      <v-card-title>書き出す範囲を選択</v-card-title>
      <v-card-text>
        <v-table>
          <tr>
            <th></th>
            <th>小節</th>
            <th>拍</th>
          </tr>
          <tr>
            <th>開始</th>
            <td>
              <v-text-field
              class="text-center"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              />
            </td>
            <td>
              <v-text-field
              class="text-center"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              />
            </td>
          </tr>
          <tr>
            <th>終了</th>
            <td>
              <v-text-field
              class="text-center"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              />
            </td>
            <td>
              <v-text-field
              class="text-center"
              type="number"
              variant="plain"
              density="compact"
              hide-details
              />
            </td>
          </tr>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
        variant="plain"
        size="small"
        >ok</v-btn>
        <v-btn
        variant="plain"
        size="small"
        @click.stop="isOpen=false"
        >cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style>
.text-center input {
  text-align: center;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
const isOpen = ref(false)
</script>
