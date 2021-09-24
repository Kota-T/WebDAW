<template>
  <InputElement type="number" size="3" default="120" @value-changed="valueChanged" ref="inputElement"/>
</template>

<script>
export default {
  name: 'Bpm',
  inject: ['socket'],
  computed: {
    disabled: {
      get(){return this.$refs.inputElement.disabled;},
      set(value){this.$refs.inputElement.disabled = value;}
    }
  },
  methods: {
    init(value){
      this.$refs.inputElement.value = value;
      this.$store.commit('bpm', Number(value));
    },

    valueChanged(value){
      if(this.disabled){
        this.$refs.inputElement.value = this.$store.state.bpm;
        return;
      }
      this.$store.commit('bpm', Number(value));
      if(this.socket.connected)
        this.socket.send({ type: 'changeBpm', value });
    }
  }
}
</script>
