<template>
<div class="input-element">
  <p v-if="!isInputing" @dblclick="if(!disabled){isInputing = true;}">{{ value }}</p>
  <input :type="type" :style="{ width: size + 'rem' }" v-else v-model="value" @keydown.enter.stop="finishInput" @keydown.stop>
</div>
</template>

<style>
.input-element:hover{
  cursor: pointer;
}
.input-element p{
  color: #f0f0f0;
}
.input-element input{
  color: black;
  overflow: hidden;
  text-align: center;
  height: 1.5rem;
  line-height: 1.5rem;
}
</style>

<script>
export default {
  name: 'InputElement',
  props: {
    type: String,
    size: String,
    modelValue: String,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits:['update:modelValue'],
  data(){
    return {
      isInputing: false,
      value: this.modelValue
    }
  },
  methods: {
    finishInput(){
      if(this.type === 'text')
        this.value = this.value.trim().replace(/\r?\n/g,"");
      if(!this.value){
        return;
      }
      this.isInputing = false;
      this.$emit('update:modelValue', this.value);
    }
  }
}
</script>
