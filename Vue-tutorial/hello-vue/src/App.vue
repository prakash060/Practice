<template>
<div>
  <h1>{{homeTitle}}</h1>
  <HomePage/> 
</div>
</template>

<script>
import HomePage from './components/home/HomePage.vue'

export default {
  name: 'App',
  components: {
   HomePage,
  },

  data() {
    return {
      homeTitle: "Sample User Form"
    }
  }

}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
