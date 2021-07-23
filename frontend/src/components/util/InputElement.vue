<template>
<div class="input">
  <p v-if="!isInputing" @dblclick="isInputing=true">{{ value }}</p>
  <textarea rows="1" :cols="length" v-else v-model="value" @keydown.enter.stop="finishInput" @keydown.stop></textarea>
</div>
</template>

<style>
.input:hover{
  cursor: pointer;
}
.input p{
  color: #f0f0f0;
}
.input textarea{
  color: black;
  overflow: hidden;
  text-align: center;
  resize: none;
}
</style>

<script>
export default {
  name: 'InputElement',
  props: ['length', 'default'],
  data(){
    return {
      isInputing: false,
      value: this.default
    }
  },
  methods: {
    finishInput(){
      if(!this.value){
        return;
      }
      this.isInputing = false;
      this.$emit('value-changed', this.value);
    }
  }
}
</script>
