<template>
<input type="range" min="10" max="100" step="1" :title="value" v-model="value" @input="valueChanged" :disabled="disabled">
</template>

<style>
</style>

<script>
export default {
  name: 'Resizer',
  data(){
    return {
      value: 20,
      disabled: false
    }
  },
  methods: {
    init(value){
      this.value = value;
      this.$store.commit('beat_interval', Number(value));
    },
    valueChanged(){
      this.$store.commit('beat_interval', Number(this.value));
    }
  }
}
</script>
