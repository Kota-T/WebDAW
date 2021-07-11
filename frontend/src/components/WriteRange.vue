<template>
<div class="popup-inner-container">
  <table>
    <tr><th></th><th>小節</th><th>拍</th></tr>
    <tr>
      <th>start</th>
      <td><textarea ref="startBar"></textarea></td>
      <td><textarea ref="startBeat"></textarea></td>
    </tr>
    <tr>
      <th>stop</th>
      <td><textarea ref="stopBar"></textarea></td>
      <td><textarea ref="stopBeat"></textarea></td>
    </tr>
  </table>
  <button @click.stop="writeProject">決定</button>
  <button @click.stop="hide">中止</button>
</div>
</template>

<style>
.popup-inner-container{
  text-align: center;
}
.popup-inner-container textarea{
  font-size: 15px;
  width: 50px;
  height: 20px;
  border: 1px solid;
  text-align: center;
  resize: none;
}
.popup-inner-container button{
  width: 50px;
}
</style>

<script>
export default {
  name: 'WriteRange',
  emits:['hide-popup', 'write-project'],
  methods: {
    writeProject(){
      const self = this;
      const start = Object.freeze({
        bar  : Number(self.$refs.startBar.value),
        beat : Number(self.$refs.startBeat.value),
      });
      const stop = Object.freeze({
        bar  : Number(self.$refs.stopBar.value),
        beat : Number(self.$refs.stopBeat.value),
      });

      this.$emit('write-project', {start, stop});
      this.$emit('hide-popup');
    },
    reset(){
      this.$refs.startBar.value = "";
      this.$refs.startBeat.value = "";
      this.$refs.stopBar.value = "";
      this.$refs.stopBeat.value = "";
    },
    hide(){
      this.reset();
      this.$emit('hide-popup');
    }
  }
}
</script>
