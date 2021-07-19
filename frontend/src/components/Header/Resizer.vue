<template>
<input type="range" min="10" max="100" step="1" :title="value" v-model="value" @input="valueChanged">
</template>

<style>
</style>

<script>
export default {
  name: 'Resizer',
  data(){
    return {
      value: 20
    }
  },
  methods: {
    valueChanged(){
      this.$store.commit('beat_interval', Number(this.value));
    }
  }
}
</script>
