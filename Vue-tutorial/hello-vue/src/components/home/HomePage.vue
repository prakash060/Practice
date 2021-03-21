<template>
<div>
<form>
  <div class="form-group">
    <label for="email">Email address:</label>
    <input class="form-control" id="email">
  </div>
  <div class="form-group">
    <label for="pwd">Password:</label>
    <input class="form-control" id="pwd">
  </div>
  <div class="checkbox">
    <label><input type="checkbox"> Remember me</label>
  </div>
  <button type="submit" class="btn btn-primary" @click="clickBtn">Submit</button>
</form>
</div>   
</template>

<script>

  export default  {
    name: 'HomePage',
    props: [],
    mounted () {

    },
    data () {
      return {

      }
    },
    methods: {
      clickBtn() {
        var arr = [["one","two"], ["one","two"]];
        var newArr = arr.pop();
        alert(newArr);
      },
    },
    computed: {

    }
}


</script>

<style scoped lang="scss">
  .home-page {
    font-weight: 100;
  }
</style>
