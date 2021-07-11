<template>
  <InputElement length="5" default="120" @value-changed="valueChanged"/>
</template>

<script>
import InputElement from '../util/InputElement.vue';

export default {
  name: 'Bpm',
  components: {
    InputElement
  },
  methods: {
    valueChanged(value){
      this.$store.commit('bpm', Number(value));
    }
  }
}
</script>
