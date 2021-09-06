<template>
<svg id="menu-btn" @click="isShow=!isShow">
  <use
  href="../assets/hamburger.svg#hamburger"
  :fill="isShow ? '#323232' : 'white'"
  :stroke="isShow ? '#323232' : 'white'"
  />
</svg>
<div id="side-menu" v-show="isShow" @click.stop @keydown.stop>
  <slot></slot>
</div>
</template>

<style>
#menu-btn{
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 500;
}
#menu-btn:hover{
  cursor: pointer;
}
#side-menu{
  background-color: rgba(255,255,255,0.8);
  color: #323232;
  text-align: center;
  width: 200px;
  height: 100vh;
  padding: 55px 10px 0 10px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 400;
}
#side-menu a{
  display: block;
  text-decoration: none;
  margin-bottom: 10px;
}
#side-menu a:hover{
  cursor: pointer;
}
</style>

<script>
export default {
  name: 'SideMenu',
  data(){
    return {
      isShow: false
    }
  }
}
</script>
