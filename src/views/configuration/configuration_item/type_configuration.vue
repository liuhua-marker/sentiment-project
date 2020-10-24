<template>
  <div class="app-container box">
    <!-- 导航 -->
    <div v-if="userInfo.orgId === '0'" class="app-tabs">
      <el-radio-group v-model="tableForm.solutionId" @change="switchLexicon">
        <el-radio-button
          v-for="item in solutionList"
          :key="item.solutionId"
          :label="item.solutionId"
        >{{ item.solutionName }}</el-radio-button>
      </el-radio-group>
    </div>
    <!-- 主体部分 -->
    <div class="app-table">
      <h4 class="app-table-head">过时配置</h4>
      <el-form
        ref="tableForm"
        inline
        class="demo-form-inline"
        label-width="150px"
        :model="tableForm"
      >
        <el-form-item label="新闻过时时间：">
          <el-input-number v-model="tableForm.newsExpireTime" :min="1" controls-position="right">1</el-input-number>
          <span>天</span>
        </el-form-item>
        <el-form-item label="公告过时时间：">
          <el-input-number v-model="tableForm.noticeExpireTime" :min="1" controls-position="right">1</el-input-number>
          <span>天</span>
        </el-form-item>
        <el-form-item label="财报过时时间：">
          <el-input-number
            v-model="tableForm.financialExpireTime"
            :min="1"
            controls-position="right"
          >1</el-input-number>
          <span>天</span>
        </el-form-item>
        <el-form-item label="诉讼过时时间：">
          <el-input-number
            v-model="tableForm.lawsuitExpireTime"
            :min="1"
            controls-position="right"
          >1</el-input-number>
          <span>天</span>
        </el-form-item>
      </el-form>
      <h4 class="app-table-head">企业类型配置</h4>
      <div class="app-table-body">
        <el-checkbox-group v-model="tableForm.companyTypes">
          <el-checkbox
            v-for="item in companyList"
            :key="item.companyTypeId"
            :label="item.companyTypeId"
            border
          >{{ item.companyTypeName }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <h4 class="app-table-head">量化指标配置</h4>
      <el-form
        ref="tableForm"
        inline
        class="demo-form-inline"
        label-width="150px"
        :model="tableForm"
      >
        <el-form-item label="质押比例：">
          <el-input-number v-model="tableForm.pledgeRatio" :min="0" controls-position="right">0</el-input-number>
          <span>%</span>
        </el-form-item>
        <el-form-item label="利润下降比例：">
          <el-input-number
            v-model="tableForm.profitDeclineRatio"
            :min="0"
            controls-position="right"
          >0</el-input-number>
          <span>%</span>
        </el-form-item>
        <el-form-item label="利润下降金额：">
          <el-input-number v-model="tableForm.profitDeclineQuota" controls-position="right">0</el-input-number>
          <span>万</span>
        </el-form-item>
        <el-form-item label="伤亡人数：">
          <el-input-number v-model="tableForm.casualtyNumber" :min="0" controls-position="right">0</el-input-number>
          <span>人</span>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-footer">
      <el-button v-if="!isEadite" type="primary" @click="configurationSave">保存</el-button>
      <el-button v-if="isEadite" type="primary" @click="configurationSave">修改</el-button>
    </div>
  </div>
</template>

<script>
import {
  confsolution,
  companytype,
  confconfigitems,
  save,
  editeQuanIndexFrom
} from '@/api/configuration_item/type_configuration'
import {
  selectNowSolution
} from '@/api/configuration/ruls'
// import Pagination from '@/components/Pagination'
// import { getToken } from '@/utils/auth'

export default {
  name: 'TypeConfiguration',
  // components: { Pagination },

  data() {
    return {
      isEadite: true,
      solution: { pageNo: 1, pageSize: 100 },
      companyType: { pageNo: 1, pageSize: 100 },
      solutionList: [],
      companyList: [],
      tableForm: {
        newsExpireTime: 1,
        noticeExpireTime: 1,
        financialExpireTime: 1,
        lawsuitExpireTime: 1,
        casualtyNumber: 0,
        pledgeRatio: 0,
        profitDeclineRatio: 0,
        profitDeclineQuota: 0,
        companyTypes: [],
        solutionId: ''
      },
      userInfo: {},
      configitems: ''
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.get()
  },
  methods: {
    async get() {
      await this.getConfsolution()
      await this.getConfconfigitems()
    },
    async getConfsolution() {
      // 获取导航栏数据
      if (this.userInfo.orgId === '0') {
        const res = await confsolution(this.solution)
        this.solutionList = res.rows
        this.tableForm.solutionId = res.rows[0].solutionId
        this.configitems = res.rows[0].solutionId
      } else {
        const res = await selectNowSolution(this.userInfo.deptId)
        this.tableForm.solutionId = res.data.solutionId
        this.configitems = res.data.solutionId
      }
      // 获取企业类型数据
      const data = await companytype(this.companyType)
      this.companyList = data.rows
    },
    async getConfconfigitems() {
      const res = await confconfigitems(this.configitems)
      this.isEadite = !!res.data
      if (this.isEadite) {
        this.tableForm = res.data
        this.tableForm.companyTypes = JSON.parse(res.data.companyTypes)
      } else {
        this.tableForm.newsExpireTime = 1
        this.tableForm.noticeExpireTime = 1
        this.tableForm.financialExpireTime = 1
        this.tableForm.lawsuitExpireTime = 1
        this.tableForm.casualtyNumber = 0
        this.tableForm.pledgeRatio = 0
        this.tableForm.profitDeclineRatio = 0
        this.tableForm.profitDeclineQuota = 0
        this.tableForm.companyTypes = []
      }
    },
    // 导航
    switchLexicon(label) {
      this.tableForm.solutionId = label
      this.configitems = label
      this.getConfconfigitems()
    },
    // 保存
    configurationSave() {
      this.$refs.tableForm.validate(async valid => {
        if (!valid) return
        if (!this.isEadite) {
          // 保存
          const res = await save(this.tableForm)
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
        } else {
          // 修改
          const res = await editeQuanIndexFrom(this.tableForm)
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '修改成功'
            })
          } else {
            this.$message({
              type: 'error',
              dangerouslyUseHTMLString: true,
              message: res.data
            })
          }
        }
        this.getConfconfigitems()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-form {
    padding: 0 80px;
    .el-form-item {
      width: 48%;
      margin: 20px 0;
    }
  }
  .app-table-body {
    margin-bottom: 20px;
    padding: 0 80px;
  }
  .app-table {
    margin-top: 20px;
    .app-table-head {
      border-bottom: 1px solid #ccc;
      padding-bottom: 8px;
    }
    .el-input-number {
      margin-right: 10px;
    }
  }
  .app-footer {
    position: relative;
    width: 100%;
    height: 50px;
    .el-button {
      width: 50%;
      position: absolute;
      left: 14%;
      top: 30px;
    }
  }
}
</style>
