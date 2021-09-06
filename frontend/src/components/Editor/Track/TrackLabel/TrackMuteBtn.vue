<template>
<button type="button" class="track-btn track-mute-btn" @click="isMuted=!isMuted">
  <svg v-show="!isMuted"><use href="../../../../assets/volume_on.svg#volume_on" fill="#323232" stroke="#323232"/></svg>
  <svg v-show="isMuted"><use href="../../../../assets/volume_off.svg#volume_off" fill="#323232" stroke="#323232"/></svg>
</button>
</template>

<style>
.track-mute-btn{
  padding: 0px 5px;
}
.track-mute-btn svg{
  width: 24px;
  height: 24px;
}
</style>

<script>
export default {
  name: 'TrackMuteBtn',
  props: ['muteNode'],
  data(){
    return {
      isMuted: false
    }
  },
  watch: {
    isMuted(val){
      this.muteNode.gain.value = val ? 0 : 1;
    }
  }
}
</script>
