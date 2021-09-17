<template>
  <div
  class="track-label"
  :class="{isTrackLabelSelected: isSelected}"
  @pointerdown="e=>$emit('track-selected', e.shiftKey)"
  @contextmenu="$refs.menu.show"
  @touchstart="$refs.menu.show"
  ref="domElement"
  >
    <div class="track-label-inner-container">
      <InputElement length="10" default="新規トラック" ref="trackName"/>
      <TrackSlider :gainNode="gainNode" :pannerNode="pannerNode" ref="trackSlider"/>
      <div class="track-btn-container">
        <TrackRecordBtn :recordNode="recordNode" ref="trackRecordBtn"/>
        <TrackMuteBtn :muteNode="muteNode" ref="trackMuteBtn"/>
        <TrackSoloBtn @track-solo="$emit('track-solo')" ref="trackSoloBtn"/>
      </div>
    </div>
  </div>
  <ContextMenu ref="menu">
    <li @click.stop="$emit('track-remove')">削除</li>
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
.track-btn-container{
  margin-top: 10px;
}
.track-btn-container > *{
  margin-right: 10px;
}
.track-btn-container > *:last-child{
  margin-right: 0;
}
.track-btn{
  background-color: white;
  width: 34px;
  height: 25px;
  border-radius: 5px;
  vertical-align: middle;
}
.track-btn:hover{
  cursor: pointer;
}
.isTrackLabelSelected{
  background-color: #606060;
}
</style>

<script>
import InputElement from '../../../util/InputElement.vue';
import TrackSlider from './TrackSlider.vue';
import TrackRecordBtn from './TrackRecordBtn.vue';
import TrackMuteBtn from './TrackMuteBtn.vue';
import TrackSoloBtn from './TrackSoloBtn.vue';

import ContextMenu from '../../../util/ContextMenu.vue';

export default {
  name: 'TrackLabel',
  props: ['recordNode', 'gainNode', 'pannerNode', "muteNode"],
  emits: ['track-selected', 'track-solo', 'track-remove'],
  components: {
    InputElement,
    TrackSlider,
    TrackRecordBtn,
    TrackMuteBtn,
    TrackSoloBtn,
    ContextMenu
  },
  data(){
    return {
      isSelected: false,
    }
  }
}
</script>
