<template>
  <div id="add_track_btn" title="トラックを追加" @click="$emit('add-track')">
    <img src="../../assets/plus_icon.png">
  </div>
</template>

<style>
#add_track_btn{
  background-color: #aaaaaa;
  width: 100%;
  height: 30px;
  position: sticky;
  top: 0;
  text-align: center;
  touch-action: none;
}
#add_track_btn img{
  height: 20px;
  vertical-align: middle;
}
#add_track_btn:hover{
  cursor: pointer;
}
</style>

<script>
export default {
  name: 'AddTrackBtn',
  emits: ['add-track'],
}
</script>
