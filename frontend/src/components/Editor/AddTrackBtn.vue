<template>
  <div id="add_track_btn" title="トラックを追加" @click="$emit('add-track')">
    <img src="../../assets/plus_icon.png">
  </div>
</template>

<style>
#add_track_btn{
  display: table-cell;
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background-color: #aaaaaa;
  width: 200px;
  height: 30px;
  text-align: center;
  vertical-align: middle;
}
#add_track_btn img{
  height: 20px;
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
