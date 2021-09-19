<template>
<button type="button" class="track-btn track-input-btn" @click="isInputed=!isInputed" title="入力モニタリング">
  <svg v-show="isInputed"><use href="../../../../assets/connect.svg#connect" fill="#323232"/></svg>
  <svg v-show="!isInputed"><use href="../../../../assets/disconnect.svg#disconnect" fill="#323232"/></svg>
</button>
</template>

<style>
.track-input-btn{
  font-size: 15px;
  color: black;
}
.track-input-btn svg{
  width: 25px;
  height: 25px;
}
</style>

<script>
export default {
  name: 'TrackInputBtn',
  data(){
    return {
      isInputed: false
    }
  }
}
</script>
