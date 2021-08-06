<template>
  <InputElement length="5" default="120" @value-changed="valueChanged" ref="inputElement"/>
</template>

<script>
import InputElement from '../../util/InputElement.vue';

export default {
  name: 'Bpm',
  components: {
    InputElement
  },
  computed: {
    disabled: {
      get: function(){return this.$refs.inputElement.disabled;},
      set: function(value){this.$refs.inputElement.disabled = value;}
    }
  },
  methods: {
    valueChanged(value){
      if(this.disabled){
        this.$refs.inputElement.value = this.$store.state.bpm;
        return;
      }
      this.$store.commit('bpm', Number(value));
    }
  }
}
</script>
