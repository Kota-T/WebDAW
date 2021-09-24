<template>
  <div id="choose-track-component-container">
    <form @submit.prevent="chooseTrackType">
      <p><label><input type="radio" name="track" value="AudioTrack" required v-model="component" checked>オーディオ</label></p>
      <p><label><input type="radio" name="track" value="VideoTrack" required v-model="component">ビデオ</label></p>
      <p>
        <button type="submit">決定</button>
        <button type="button" @click="$emit('hide-dialog')">中止</button>
      </p>
    </form>
  </div>
</template>

<style>
#choose-track-component-container{
}
#choose-track-component-container button{
  width: 50px;
  margin-right: 10px;
}
#choose-track-component-container button:last-child{
  margin-right: 0;
}
#choose-track-component-container button:hover{
  cursor: pointer;
}
</style>

<script>
export default {
  name: 'ChooseTrackComponent',
  emits: ['choose-track-component', 'hide-dialog'],
  data(){
    return {
      component: "AudioTrack"
    }
  },
  methods: {
    chooseTrackType(){
      this.$emit('choose-track-component', this.component);
      this.$emit('hide-dialog');
    }
  }
}
</script>
