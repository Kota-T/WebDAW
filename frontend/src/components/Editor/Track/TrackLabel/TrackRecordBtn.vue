<template>
<button type="button" class="track-btn track-record-btn" :class="{active: isRecording}" disabled>R</button>
</template>

<style>
.track-record-btn{
  font-size: 15px;
  color: black;
}
.track-record-btn.active{
  color: white;
  background-color: red;
}
</style>

<script>
export default {
  name: 'TrackRecordBtn',
  props: ['recordNode'],
  data(){
    return {
      isRecording: true
    }
  },
  watch:{
    isRecording(val){
      this.recordNode.gain.value = val ? 1 : 0;
    }
  }
}
</script>
