<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item v-if="userInfo.orgId === '0'" label="机构:" content-width="100">
          <el-select v-model="queryForm.orgId" @change="changeSystem(queryForm.orgId)">
            <el-option
              v-for="item in optionsSystem"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="userInfo.deptId === '0'" label="部门:">
          <el-select
            v-model="queryForm.deptId"
            clearable
            placeholder="全部"
            @change="changedept(queryForm.deptId)"
          >
            <el-option
              v-for="item in optionsSystemDept"
              :key="item.id"
              :label="item.deptName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公司:">
          <Autocomplete :targetcompany="queryForm.targetCompany" @RefreshData="RefreshData" />
        </el-form-item>
      </el-form>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="重复:" content-width="50">
          <el-select v-model="queryForm.deduplicate" @change="queryQuanIndex">
            <el-option v-for="(v, k, i) in optionCate" :key="i" :label="k" :value="v" />
          </el-select>
        </el-form-item>
        <el-form-item label="极性:">
          <el-select v-model="queryForm.emotionType" clearable @change="queryQuanIndex">
            <el-option v-for="(v, k, i) in optionEmotionType" :key="i" :label="k" :value="v" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间:">
          <el-date-picker
            v-model="time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 400px"
            @change="queryQuanIndex"
          />
        </el-form-item>
      </el-form>
    </div>
    <el-card class="box-card" shadow="never">
      <h4 style="margin-top: 0">公司舆情预警表</h4>
      <CompanyTable :load="loading" :tablefrom="quanWordList" />
      <div class="pagination">
        <el-pagination
          :current-page="queryForm.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- <el-tabs v-model="activeName" type="border-card" @tab-click="queryQuanIndex">
      <el-tab-pane label="最新舆情" name="1">
        <CompanyTable :load="loading" :tablefrom="quanWordList" />
      </el-tab-pane>
      <el-tab-pane label="舆情数量" name="2">
        <CompanyTable :load="loading" :tablefrom="quanWordList" />
      </el-tab-pane>
      <el-tab-pane v-if="userInfo.deptId !== '0'" label="目标监控组合" name="3">
        <CompanyTable :load="loading" :tablefrom="quanWordList" />
      </el-tab-pane>
      <el-tab-pane v-if="isShow" label="公司检索" name="4">
        <CompanyTable :load="loading" :tablefrom="quanWordList" />
      </el-tab-pane>
    </el-tabs>-->
    <!-- 分页 -->
  </div>
</template>

<script>
import {
  // distributeRecord,
  // findEsCompanyWaringNewTop,
  findEsCompanyWaringCountTop
  // findEsCompanyWaringTarget,
  // domnLoadFile
} from '@/api/public_sentiment/company_public_sentiment'
import { system, systemDept } from '@/api/analysis/hot_analysis'
import Autocomplete from './compoments/autocomplete'
import CompanyTable from './compoments/company_table'

export default {
  name: 'CompanysPublicSentiment',
  components: { Autocomplete, CompanyTable },
  data() {
    return {
      loading: true,
      // 表单数据
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        deptId: '',
        orgId: '',
        targetCompany: '',
        startTime: '',
        endTime: '',
        deduplicate: false,
        emotionType: '',
        like: true
      },
      optionCate: {
        重复: '',
        不重复: false
      },
      optionEmotionType: {
        负面: -1,
        中性: 0,
        正面: 1
      },
      total: 0,
      time: '',
      optionsSystem: [],
      optionsSystemDept: [],
      userInfo: {},
      quanWordList: []
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.getWordsTypeId()
  },
  methods: {
    // 获取页面数据
    async getWordsTypeId() {
      if (this.userInfo.orgId === '0') {
        // 机构
        const data = {}
        const res = await system(data)
        this.optionsSystem = res.rows
        this.queryForm.orgId = this.optionsSystem[0].id
      } else {
        this.queryForm.orgId = this.userInfo.orgId
      }
      // 部门
      if (this.userInfo.deptId === '0') {
        this.systemDept(this.queryForm.orgId)
      } else {
        this.queryForm.deptId = this.userInfo.deptId
        this.getDistribute()
      }
    },
    async systemDept(id) {
      const orgId = { orgIds: [id] }
      const row = await systemDept(orgId)
      this.optionsSystemDept = row.rows
      if (this.optionsSystemDept.length !== 0) {
        this.queryForm.deptId = this.optionsSystemDept[0].id
      } else {
        this.queryForm.deptId = ''
      }
      this.getDistribute()
    },
    changeSystem(val) {
      this.queryForm.pageNo = 1
      this.loading = true
      this.systemDept(val)
    },
    changedept(val) {
      this.queryForm.pageNo = 1
      this.loading = true
      this.queryForm.deptId = val
      this.getDistribute()
    },
    // 页面数据
    async getDistribute() {
      document.body.click()
      //   console.log(this.queryForm)
      var params = { ...{}, ...this.queryForm }
      var res = await findEsCompanyWaringCountTop(params)
      this.quanWordList = res.rows
      this.total = res.total
      this.loading = false
    },
    // 查询
    queryQuanIndex(val) {
      this.loading = true
      this.queryForm.pageNo = 1
      if (!!this.time && this.time.length !== 0) {
        this.queryForm.startTime = new Date(this.time[0]).getTime()
        this.queryForm.endTime =
          new Date(this.time[1]).getTime() + 24 * 60 * 60 * 1000 - 1
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
      }
      this.getDistribute()
    },
    RefreshData(targetCompany) {
      this.queryForm.targetCompany = targetCompany
      this.queryQuanIndex()
    },
    // 分页
    handleSizeChange(val) {
      this.loading = true
      this.queryForm.pageSize = val
      this.getDistribute()
    },
    handleCurrentChange(val) {
      this.loading = true
      this.queryForm.pageNo = val
      this.getDistribute()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .pagination {
    text-align: right;
    margin-top: 20px;
  }
}
</style>
