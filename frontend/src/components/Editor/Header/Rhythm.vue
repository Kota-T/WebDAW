<template>
  <InputElement type="text" size="3" default="4/4" @value-changed="valueChanged" ref="inputElement"/>
</template>

<script>
export default {
  name: 'Rhythm',
  inject: ['socket'],
  methods: {
    init(value){
      this.$refs.inputElement.value = value.join("/");
      this.$store.commit('rhythm', value.map(elem=>Number(elem)));
    },

    valueChanged(value){
      const changedValue = value.split('/').map(elem=>Number(elem));
      this.$store.commit('rhythm', changedValue);
      if(this.socket.connected)
        this.socket.send({ type: 'changeRhythm', value: changedValue });
    }
  }
}
</script>
