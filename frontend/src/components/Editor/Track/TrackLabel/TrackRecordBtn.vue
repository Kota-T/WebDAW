<template>
<button type="button" class="track-btn track-record-btn" :class="{active: isRecording}" @click="isRecording=!isRecording">R</button>
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
  data(){
    return {
      isRecording: false
    }
  }
}
</script>
