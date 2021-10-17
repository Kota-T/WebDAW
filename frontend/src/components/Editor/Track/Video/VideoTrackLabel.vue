<template>
  <TrackLabel
  :isSelected="isSelected"
  @update:isSelected="v=>$emit('update:isSelected', v)"
  @track-select="shiftKey=>$emit('track-select', shiftKey)"
  @track-remove="$emit('track-remove')"
  ref="container"
  >
    <template v-slot:track-type>{{ trackType.slice(0, -5) }}</template>
    <template v-slot:contents>
      <InputElement type="text" size="8" :modelValue="name" @update:modelValue="v=>$emit('update:name', v)" />
    </template>
  </TrackLabel>
</template>

<script>
import TrackLabel from '../TrackLabel.vue';

export default {
  name: 'VideoTrackLabel',
  components: {
    TrackLabel
  },
  props: {
    trackType: String,
    name: String,
    isSelected: Boolean
  },
  emits: [
    'update:name',
    'update:isSelected',
    'track-select',
    'track-remove'
  ]
}
</script>
