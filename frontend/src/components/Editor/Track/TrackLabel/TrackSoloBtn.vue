<template>
<button type="button" class="track-btn track-solo-btn" :style="styles" @click="isSolo=!isSolo">Solo</button>
</template>

<style>
.track-solo-btn{
  width: 34px;
  height: 24px;
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
        color: "black",
        backgroundColor: "white"
      }
    }
  },
  watch:{
    isSolo(val){
      this.$emit('track-solo', val);
      this.styles.color = val ? "white" : "black";
      this.styles.backgroundColor = val ? "blue" : "white";
    }
  }
}
</script>
