<template>
<button type="button" class="track-btn track-solo-btn" :class="{active: isSolo}" @click="isSolo=!isSolo" title="ソロ再生">Solo</button>
</template>

<style>
.track-solo-btn{
  font-size: 14px;
}
.track-solo-btn.active{
  background-color: gold;
}
</style>

<script>
export default {
  name: 'TrackSoloBtn',
  emits: ['track-solo'],
  data(){
    return {
      isSolo: false
    }
  },
  watch:{
    isSolo(val){
      this.$emit('track-solo');
    }
  }
}
</script>
