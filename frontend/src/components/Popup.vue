<template>
<div id="popup-background" @click.stop="$emit('hide-popup')" @keydown.stop>
  <div id="popup" @click.stop>
    <slot></slot>
  </div>
</div>
</template>

<style>
#popup-background{
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 6;
}
#popup{
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}
</style>

<script>
export default {
  name: 'Popup',
  emits: ['hide-popup']
}
</script>
