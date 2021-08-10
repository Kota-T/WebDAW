<template>
  <InputElement length="5" default="4/4" @value-changed="valueChanged" ref="inputElement"/>
</template>

<script>
import InputElement from '../../util/InputElement.vue';

export default {
  name: 'Rhythm',
  components: {
    InputElement
  },
  methods: {
    init(value){
      this.$refs.inputElement.value = value.join("/");
      this.$store.commit('rhythm', value.map(elem=>Number(elem)));
    },
    valueChanged(value){
      this.$store.commit('rhythm', value.split('/').map(elem=>Number(elem)));
    }
  }
}
</script>
