<template>
<button type="button" class="track-btn" :style="styles" @click="isSolo=!isSolo">Solo</button>
</template>

<style>
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
      this.$emit('track-solo', val);
      this.styles.backgroundColor = val ? "gold" : "white";
    }
  }
}
</script>
