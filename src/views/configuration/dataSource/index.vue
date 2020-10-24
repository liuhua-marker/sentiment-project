
<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>

export default {

}
</script>

<style lang="scss" scoped>
.app-container {
  .app-tabs {
    margin-top: 20px;
  }
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
    .app-table-list {
      width: 100%;
      margin: 20px 0;
    }
  }
  .app-main {
    border: 1px solid #ccc;
    padding: 10px 10px 0;
    width: 100%;
  }
  .el-tag {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
