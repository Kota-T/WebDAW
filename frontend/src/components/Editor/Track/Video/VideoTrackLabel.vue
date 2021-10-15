<template>
  <TrackLabel
  @track-select="shiftKey=>$emit('track-select', shiftKey)"
  @track-remove="$emit('track-remove')"
  ref="container"
  >
    <template v-slot:contents>
      <InputElement type="text" size="8" v-model="_name" />
    </template>
  </TrackLabel>
</template>

<script>
import TrackLabel from '../TrackLabel.vue';

export default {
  name: 'VideoTrackLabel',
  props: {
    name: String
  },
  emits: [
    'update:name',
    'track-select',
    'track-remove'
  ],
  components: {
    TrackLabel
  },
  data(){
    return {
      _name: this.name
    }
  },
  watch: {
    name(newVal){
      this.$emit('update:name', newVal)
    }
  }
}
</script>
