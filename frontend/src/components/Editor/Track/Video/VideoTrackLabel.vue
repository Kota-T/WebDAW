<template>
  <TrackLabel
  @track-select="shiftKey=>$emit('track-select', shiftKey)"
  @track-remove="$emit('track-remove')"
  ref="container"
  >
    <template v-slot:contents>
      <InputElement type="text" size="8" default="新規トラック" ref="trackName"/>
    </template>
  </TrackLabel>
</template>

<script>
import TrackLabel from '../TrackLabel.vue';

export default {
  name: 'VideoTrackLabel',
  emits: ['track-select', 'track-remove'],
  components: {
    TrackLabel
  },
  computed: {
    isSelected: {
      get(){return this.$refs.container.isSelected;},
      set(value){this.$refs.container.isSelected = value;}
    }
  }
}
</script>
