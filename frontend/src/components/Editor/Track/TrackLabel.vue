<template>
  <div
  class="track-label"
  :class="{'is-selected': isSelected}"
  @pointerdown="e=>$emit('track-selected', e.shiftKey)"
  @contextmenu="$refs.menu.show"
  @touchstart="$refs.menu.show"
  >
    <div class="track-label-inner-container">

      <InputElement type="text" size="8" default="新規トラック" ref="trackName"/>

      <div class="track-slider-container">

        <select v-model="selectedSlider">
          <option selected title="音量">V</option>
          <option title="パン">P</option>
        </select>

        <input type="range" min="0" max="1" step="0.05" v-show="selectedSlider==='V'" v-model="gainValue" :title="'音量:' + gainValue">
        <input type="range" min="-1" max="1" step="0.1" v-show="selectedSlider==='P'" v-model="panValue"  :title="'パン:' + panValue">

      </div>

      <div class="track-btn-container">

        <button type="button" class="track-btn track-monitor-btn" @click="isMonitoring=!isMonitoring" title="入力モニタリング">
          <svg v-show="!isMonitoring"><use href="../../../assets/monitor_off.svg#monitor_off" fill="#323232"/></svg>
          <svg v-show="isMonitoring"><use href="../../../assets/monitor_on.svg#monitor_on" fill="red"/></svg>
        </button>

        <button type="button" class="track-btn track-mute-btn" @click="isMuted=!isMuted" title="消音">
          <svg v-show="!isMuted"><use href="../../../assets/volume_on.svg#volume_on" fill="#323232" stroke="#323232"/></svg>
          <svg v-show="isMuted"><use href="../../../assets/volume_off.svg#volume_off" fill="#323232" stroke="#323232"/></svg>
        </button>

        <button type="button" class="track-btn track-solo-btn" :class="{active: isSolo}" @click="isSolo=!isSolo" title="ソロ再生">Solo</button>

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
.track-label.is-selected{
  background-color: #606060;
}
.track-slider-container > *{
  vertical-align: middle;
}
.track-slider-container select{
  margin-right:5px;
}
.track-btn-container{
  margin-top: 10px;
}
.track-btn{
  background-color: white;
  width: 35px;
  height: 25px;
  border-radius: 5px;
  margin-right: 10px;
  vertical-align: middle;
}
.track-btn:hover{
  cursor: pointer;
}
.track-btn:last-child{
  margin-right: 0;
}
.track-monitor-btn{
  padding: 3px 0;
}
.track-monitor-btn svg{
  width: 19px;
  height: 19px;
}
.track-mute-btn{
  padding: 0px 5px;
}
.track-mute-btn svg{
  width: 25px;
  height: 25px;
}
.track-solo-btn{
  font-size: 14px;
}
.track-solo-btn.active{
  background-color: gold;
}
</style>

<script>
import InputElement from '../../util/InputElement.vue';
import ContextMenu from '../../util/ContextMenu.vue';

export default {
  name: 'TrackLabel',
  props: ['gainNode', 'pannerNode', "muteNode"],
  emits: ['track-selected', 'track-solo', 'track-remove'],
  components: {
    InputElement,
    ContextMenu
  },
  data(){
    return {
      isSelected: false,
      selectedSlider: "V",
      gainValue: 0.5,
      panValue: 0,
      isMonitoring: false,
      isMuted: false,
      isSolo: false
    }
  },
  watch: {
    gainValue(newVal){
      this.gainNode.gain.value = newVal;
    },
    panValue(newVal){
      this.pannerNode.pan.value = newVal;
    },
    isMuted(val){
      this.muteNode.gain.value = val ? 0 : 1;
    },
    isSolo(val){
      this.$emit('track-solo');
    }
  }
}
</script>
