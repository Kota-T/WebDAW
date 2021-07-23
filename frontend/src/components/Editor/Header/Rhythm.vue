<template>
  <InputElement length="5" default="4/4" @value-changed="valueChanged"/>
</template>

<script>
import InputElement from '../../util/InputElement.vue';

export default {
  name: 'Rhythm',
  components: {
    InputElement
  },
  methods: {
    valueChanged(value){
      this.$store.commit('rhythm', value.split('/').map(elem=>Number(elem)));
    }
  }
}
</script>
