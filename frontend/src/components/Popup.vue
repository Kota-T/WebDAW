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
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 150;
}
#popup{
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  width: 300px;
  height: 150px;
  border-radius: 10px;
}
</style>

<script>
export default {
  name: 'Popup',
  emits: ['hide-popup']
}
</script>
