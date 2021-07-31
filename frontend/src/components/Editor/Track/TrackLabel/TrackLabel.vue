<template>
  <div
  class="track-label"
  :class="{isTrackLabelSelected: isSelected}"
  @pointerdown="$emit('track-selected')"
  v-menu="$refs.menu"
  ref="domElement"
  >
    <div>
      <InputElement length="10" default="新規トラック" ref="trackName"/>
      <TrackSlider :gainNode="gainNode" :pannerNode="pannerNode" ref="trackSlider"/>
    </div>
  </div>
  <ContextMenu ref="menu">
    <li @click.stop="">削除</li>
  </ContextMenu>
</template>

<style>
.track-label{
  background-color: #323232;
  border-right: 1px solid white;
  border-bottom: 1px solid;
  width: 200px;
  height: 120px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
.track-label:hover{
  cursor: pointer;
}
.isTrackLabelSelected{
  background-color: #606060;
}
</style>

<script>
import InputElement from '../../../util/InputElement.vue';
import TrackSlider from './TrackSlider.vue';

export default {
  name: 'TrackLabel',
  props: ['gainNode', 'pannerNode'],
  emits: ['track-selected'],
  components: {
    InputElement, TrackSlider
  },
  data(){
    return {
      isSelected: false,
    }
  },
  methods: {
    remove(){
      this.$refs.domElement.remove();
    }
  }
}
</script>
