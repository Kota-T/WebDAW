<template>
<div id="write-range-container">
  <form @submit="writeProject">
    <table>
      <tr><th></th><th>小節</th><th>拍</th></tr>
      <tr>
        <th>start</th>
        <td><input type="number" required :min="minBar" :max="maxStartBar" v-model="startBar"></td>
        <td><input type="number" required :min="minBeat" :max="maxBeat" v-model="startBeat"></td>
      </tr>
      <tr>
        <th>stop</th>
        <td><input type="number" required :min="minStopBar" :max="maxBar" v-model="stopBar"></td>
        <td><input type="number" required :min="minStopBeat" :max="maxStopBeat" v-model="stopBeat"></td>
      </tr>
    </table>
    <p>
      <button type="submit">決定</button>
      <button type="button" @click="hide">中止</button>
    </p>
  </form>
</div>
</template>

<style>
#write-range-container{
  text-align: center;
}
#write-range-container input{
  width: 50px;
  height: 20px;
  border: 1px solid;
  text-align: center;
}
#write-range-container button{
  width: 50px;
  margin-right: 10px;
}
#write-range-container button:last-child{
  margin-right: 0;
}
#write-range-container button:hover{
  cursor: pointer;
}
</style>

<script>
export default {
  name: 'WriteRange',
  emits:['hide-popup', 'write-project'],
  data(){
    return {
      startBar: "",
      startBeat: "",
      stopBar: "",
      stopBeat: ""
    }
  },
  computed: {
    minBar(){
      return 0;
    },
    maxBar(){
      return this.$store.state.number_of_bars;
    },
    minBeat(){
      return 1;
    },
    maxBeat(){
      return this.$store.state.rhythm[0];
    },
    maxStartBar(){
      return this.maxBar - 1;
    },
    minStopBar(){
      if(this.startBeat == this.maxBeat)
        return Number(this.startBar) + 1;
      return this.startBar;
    },
    minStopBeat(){
      if(this.startBar === this.stopBar)
        return Number(this.startBeat) + 1;
      return 1;
    },
    maxStopBeat(){
      if(this.startBar == this.maxStartBar)
        return 1;
      return this.maxBeat;
    }
  },
  methods: {
    writeProject(e){
      e.preventDefault();

      const start = Object.freeze({
        bar  : Number(this.startBar),
        beat : Number(this.startBeat)
      });
      const stop = Object.freeze({
        bar  : Number(this.stopBar),
        beat : Number(this.stopBeat)
      });

      this.$emit('write-project', {start, stop});
      this.$emit('hide-popup');
    },
    reset(){
      this.startBar = "";
      this.startBeat = "";
      this.stopBar = "";
      this.stopBeat = "";
    },
    hide(){
      this.reset();
      this.$emit('hide-popup');
    }
  }
}
</script>
