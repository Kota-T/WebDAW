<template>
<button type="button" class="track-btn track-solo-btn" :style="styles" @click="isSolo=!isSolo">Solo</button>
</template>

<style>
.track-solo-btn{
  font-size: 14px;
}
</style>

<script>
export default {
  name: 'TrackSoloBtn',
  emits: ['track-solo'],
  data(){
    return {
      isSolo: false,
      styles: {
        backgroundColor: "white"
      }
    }
  },
  watch:{
    isSolo(val){
      this.$emit('track-solo');
      this.styles.backgroundColor = val ? "gold" : "white";
    }
  }
}
</script>
