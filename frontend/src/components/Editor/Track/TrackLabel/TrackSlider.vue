<template>
<div>
  <select v-model="selectedValue">
    <option selected title="Volume">V</option>
    <option title="Pan">P</option>
  </select>
  <input type="range" min="0" max="1" step="0.05" v-show="selectedValue==='V'" v-model="gainValue" :title="gainValue">
  <input type="range" min="-1" max="1" step="0.1" v-show="selectedValue==='P'" v-model="panValue"  :title="panValue">
</div>
</template>

<style>
</style>

<script>
export default {
  name: 'TrackSlider',
  props: ['gainNode', 'pannerNode'],
  data(){
    return {
      selectedValue: "V",
      gainValue: 0.5,
      panValue: 0
    }
  },
  watch: {
    gainValue(newVal){
      this.gainNode.gain.value = newVal;
    },
    panValue(newVal){
      this.pannerNode.pan.value = newVal;
    }
  }
}
</script>
