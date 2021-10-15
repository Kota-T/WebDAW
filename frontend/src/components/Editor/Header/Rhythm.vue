<template>
  <InputElement type="text" size="3" v-model="value" ref="inputElement"/>
</template>

<script>
export default {
  name: 'Rhythm',
  inject: ['socket'],
  data(){
    return {
      value: "4/4"
    }
  },
  watch: {
    value(value){
      const changedValue = value.split('/').map(elem=>Number(elem));
      this.$store.commit('rhythm', changedValue);
      if(this.socket.connected)
        this.socket.send({ type: 'changeRhythm', value: changedValue });
    }
  },
  methods: {
    init(value){
      this.$refs.inputElement.value = value.join("/");
      this.$store.commit('rhythm', value.map(elem=>Number(elem)));
    }
  }
}
</script>
