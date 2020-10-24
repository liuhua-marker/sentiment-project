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
    <div class="app-table">
      <div class="app-head">
        公司预警表
        <!-- <div class="fr"> -->
        <!-- <el-button type="primary" @click="exportFiles">批量导出</el-button> -->
        <!-- </div> -->
      </div>
      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column v-if="userInfo.orgId === '0'" label="机构名称" prop="orgName" />
        <el-table-column v-if="userInfo.orgId === '0'" label="部门名称" prop="deptName" />
        <el-table-column label="目标公司" prop="companyName" />
        <el-table-column label="新闻舆情数量" width="130" prop="newsCount" />
        <el-table-column label="公告舆情数量" width="130" prop="noticeCount" />
        <el-table-column label="舆情总数量" width="130" prop="count" />
        <el-table-column label="最新舆情时间" width="220">
          <template
            slot-scope="scope"
          >{{ Number(scope.row.lastPublicSentimentTime) | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" @click="details(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
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
    </div>
  </div>
</template>

<script>
import {
  distributeRecord
  // domnLoadFile
} from '@/api/public_sentiment/company_public_sentiment'
import { system, systemDept } from '@/api/analysis/hot_analysis'
// 引入基本模板
// var echarts = require('echarts/lib/echarts')
import Autocomplete from './compoments/autocomplete'

export default {
  name: 'CompanyPublicSentiment',
  components: { Autocomplete },
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
        emotionType: ''
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
      this.loading = true
      this.systemDept(val)
    },
    changedept(val) {
      this.loading = true
      this.queryForm.deptId = val
      this.getDistribute()
    },
    // 页面数据
    async getDistribute() {
      var params = { ...{}, ...this.queryForm }
      const res = await distributeRecord(params)
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
    },
    details(val) {
      this.$router.push({
        path:
          '/configuration/public_sentiment/details_page/company_public_page',
        query: {
          deptId: val.deptId,
          targetCompany: decodeURIComponent(val.companyName),
          orgId: val.orgId,
          deduplicate: this.queryForm.deduplicate
        }
      })
    }
    // // 导出
    // exportFiles() {
    //   domnLoadFile(this.queryForm).then((res) => {
    //     if (res) {
    //       var blob = res
    //       var objectUrl = URL.createObjectURL(blob)
    //       var link = document.createElement('a')
    //       var fname = `公司预警文档` // 下载文件的名字
    //       link.href = objectUrl
    //       link.setAttribute('download', fname + '.xlsx')
    //       document.body.appendChild(link)
    //       link.click()
    //     } else {
    //       this.$message({
    //         type: 'error',
    //         message: '导出失败',
    //       })
    //     }
    //   })
    // },
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .pagination {
    text-align: right;
    margin-top: 20px;
  }
  .app-table {
    border: 1px solid #ccc;
    padding: 10px;
    .app-head {
      height: 36px;
      line-height: 36px;
      font-weight: 700;
      font-size: 14px;
    }
  }
}
</style>
