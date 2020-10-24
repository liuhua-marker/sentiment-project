<template>
  <div class="app-container">
    <h3 class="app-header">数 据 源 配 置</h3>
    <div style="height:50px">
      <el-button type="warning" icon="el-icon-document" @click="saveDataSource">保存</el-button>
    </div>
    <!-- 搜索查询 -->
    <div class="app-tabs clearfix">
      <div
        v-for="(item) in sourceList"
        :key="item.sourceTypeId"
        class="app-tabs-body"
        :style="{
          backgroundImage: 'url(' + getImgName(item) + ')',
          backgroundRepeat: 'no-repeat'
        }"
      >
        <div>
          <h2 class="app-tabs-title">{{ item.typeName }}</h2>
          <div class="app-tabs-text">{{ item.remark }}</div>
        </div>
        <el-checkbox-group v-model="sourceForm">
          <el-checkbox-button :label="item.sourceTypeId" :checked="item.selection" border>选择</el-checkbox-button>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
import { page, saveData } from '@/api/dataSource/data_source_configuration'

export default {
  name: 'DataSourceConfiguration',
  data() {
    return {
      queryForm: {
        deptId: ''
      },
      queryList: {
        deptId: '0'
      },
      sourceList: [],
      sourceForm: [],
      checkAll: false,
      isIndeterminate: true
    }
  },
  created() {
    this.getlist()
    this.queryForm.deptId = this.$store.getters.userInfo.deptId
  },
  methods: {
    getImgName(item) {
      try {
        return require(`@/assets/data/${item.typeCode}.png`)
      } catch {
        return require(`@/assets/data/img.png`)
      }
    },
    async getlist() {
      // 所有数据类型
      const ress = await page()
      if (!ress.data && ress.data.length === 0) {
        this.$message({
          type: 'warning',
          message: '请联系系统管理员配置数据源'
        })
      }
      this.sourceList = ress.data
    },
    // 保存
    async saveDataSource() {
      const res = await saveData(this.sourceForm)
      if (res.code === 200) {
        this.$message({
          type: 'success',
          message: '保存成功'
        })
      } else {
        this.$message({
          type: 'error',
          dangerouslyUseHTMLString: true,
          message: res.data
        })
      }
      this.getlist()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}
@media screen and (max-width: 3600px) {
  .app-tabs-body {
    height: 245px;
  }
  .app-tabs-text {
    height: 100px;
    line-height: 25px;
    font-size: 14px;
  }
}
@media screen and (max-width: 1600px) {
  .app-tabs-body {
    height: 210px;
  }
  .app-tabs-text {
    height: 75px;
    line-height: 18px;
    font-size: 12px;
  }
}
@media screen and (max-width: 1400px) {
  .app-tabs-body {
    height: 195px;
  }
  .app-tabs-text {
    height: 60px;
    line-height: 15px;
    font-size: 10px;
  }
}
@media screen and (max-width: 1200px) {
  .app-tabs-body {
    height: 165px;
  }
  .app-tabs-text {
    height: 60px;
    line-height: 14px;
    font-size: 10px;
  }
}
@media screen and (max-width: 1024px) {
  .app-tabs-body {
    height: 135px;
  }
  .app-tabs-text {
    height: 55px;
    line-height: 14px;
    font-size: 8px;
  }
}
.app-tabs {
  .app-tabs-body {
    position: relative;
    float: left;
    width: 22%;
    padding-left: 9%;
    padding-right: 0.5%;
    margin-left: 20px;
    margin-bottom: 5%;
    text-align: center;
    background-size: 100%;
    color: #fff;
    .app-tabs-title {
      font-size: 20px;
      letter-spacing: 5px;
      margin: 8% 0;
    }
    .el-checkbox-button {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%);
      border-radius: 25px;
    }
    .app-tabs-text {
      text-overflow: -o-ellipsis-lastline;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      text-align: left;
  }
  }
}
</style>
