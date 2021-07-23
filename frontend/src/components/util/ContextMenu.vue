<template>
  <div class="context-menu" :style="styles">
    <ul>
      <slot></slot>
    </ul>
  </div>
</template>

<style>
.context-menu{
  background-color: white;
  font-size: 12px;
  border-radius: 10px;
  width: 100px;
  position: fixed;
}
.context-menu ul{
  list-style: none;
}
.context-menu li:hover{
  color: white;
  background-color: blue;
}
</style>

<script>
export default {
  name: 'ContextMenu',
  data(){
    return {
      styles: {
        top  : '0px',
        left : '0px'
      }
    }
  }
}
</script>
