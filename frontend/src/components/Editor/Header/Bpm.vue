<template>
  <InputElement type="number" size="3" v-model="value" :disabled="disabled" ref="inputElement"/>
</template>

<script>
export default {
  name: 'Bpm',
  inject: ['socket'],
  data(){
    return {
      value: "120",
      disabled: false
    }
  },
  watch: {
    value(value){
      if(this.disabled){
        this.value = this.$store.state.bpm;
        return;
      }
      this.$store.commit('bpm', Number(value));
      if(this.socket.connected)
        this.socket.send({ type: 'changeBpm', value });
    }
  },
  methods: {
    init(value){
      this.$refs.inputElement.value = value;
      this.$store.commit('bpm', Number(value));
    }
  }
}
</script>
