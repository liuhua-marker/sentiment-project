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
          <el-select v-model="queryForm.deptId" clearable placeholder="全部" @change="queryQuanIndex">
            <el-option
              v-for="item in optionsSystemDept"
              :key="item.id"
              :label="item.deptName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据类型:">
          <el-select
            v-model="queryForm.sourceTypeCode"
            clearable
            placeholder="全部"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="item in optionsSource"
              :key="item.sourceTypeId"
              :label="item.typeName"
              :value="item.typeCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="time"
            type="daterange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <div class="app-head">
        <h4 class="fl app-title">舆情记录表</h4>
        <el-form :inline="true" class="demo-form-inline fr">
          <el-form-item>
            <el-button type="primary">批量导出</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column v-if="userInfo.orgId === '0'" label="机构名称" width="220">
          <template>
            <span
              v-for="item in optionsSystem"
              :key="item.id"
            >{{ item.id === queryForm.orgId ? item.name: '' }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="userInfo.deptId === '0'" label="部门名称" prop="deptName" />
        <el-table-column label="数据源类型" prop="sourceTypeName" />
        <el-table-column label="公司数量" prop="companyCount" />
        <el-table-column label="舆情数量" prop="count" />
        <el-table-column label="舆情时间" width="200">
          <template slot-scope="scope">{{ Number(scope.row.startTime) | parseTime('{y}-{m}-{d}') }}</template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
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
</template>

<script>
import { publicSentimentMonitor } from '@/api/monitor/sentiment_monitor'
import { confdatasourcetype } from '@/api/dashboard'
import { system, systemDept } from '@/api/analysis/hot_analysis'

export default {
  name: 'SentimentMonitor',

  data() {
    var that = this
    return {
      pickerOptions: {
        disabledDate: (time) => {
          return that.dealDisabledDate(time)
        }
      },
      loading: true,
      // 表单数据
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        deptId: '',
        orgId: '',
        sourceTypeCode: '',
        startTime: '',
        endTime: ''
      },
      total: 0,
      time: '',
      solutionForm: {
        deptId: '0',
        pageNo: 1,
        pageSize: 100
      },
      optionsSystem: [],
      optionsSystemDept: [],
      optionsSource: [],
      userInfo: {},
      quanWordList: []
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.get()
  },
  methods: {
    // 标准的时间格式转为时间戳
    dateToMs(date) {
      const result = new Date(date).getTime()
      return result
    },
    dealDisabledDate(time) {
      // 一天的毫秒数 = 8.64e7  判断时在return处可进行加减
      const date =
        new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + 1
      const curDate = new Date(date).getTime()
      return curDate > time.getTime() || time.getTime() > new Date() - 8.64e6
    },
    async get() {
      await this.getWordsTypeId()
      await this.getDistribute()
    },
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
      // this.systemDept(this.queryForm.orgId)
      if (this.userInfo.deptId === '0') {
        this.systemDept(this.queryForm.orgId)
      } else {
        this.queryForm.deptId = this.userInfo.deptId
      }
      // 数据类型
      if (this.userInfo.deptId !== '0') {
        this.solutionForm.deptId = this.userInfo.deptId
      }
      const ress = await confdatasourcetype(this.solutionForm)
      this.optionsSource = ress.rows
    },
    async systemDept(id) {
      const orgId = { orgIds: [id] }
      const row = await systemDept(orgId)
      this.optionsSystemDept = row.rows
      if (this.optionsSystemDept.length > 0) {
        this.queryForm.deptId = this.optionsSystemDept[0].id
      } else {
        this.queryForm.deptId = ''
      }
    },
    changeSystem(val) {
      this.systemDept(val)
    },
    // 页面数据
    async getDistribute() {
      const res = await publicSentimentMonitor(this.queryForm)
      // console.log(res)
      this.quanWordList = res.rows
      this.total = res.total
      this.loading = false
    },
    // 查询
    queryQuanIndex() {
      this.loading = true
      this.queryForm.pageNo = 1
      if (!!this.time && this.time.length !== 0) {
        this.queryForm.startDate = this.time[0].getDate()
        this.queryForm.endDate = this.time[1].getDate()
        // this.queryForm.startTime = this.dateToMs(this.time[0])
        // this.queryForm.endTime =
        //   this.dateToMs(this.time[1]) + 24 * 60 * 60 * 1000
      } else {
        this.queryForm.startDate = ''
        this.queryForm.endDate = ''
        // this.queryForm.startTime = ''
        // this.queryForm.endTime = ''
      }
      // console.log(this.queryForm)
      this.getDistribute()
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
      // console.log(val);
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
    .app-table-list {
      width: 100%;
      margin: 20px 0;
    }
    .app-head {
      height: 30px;
      padding: 10px;
    }
    .app-title {
      margin: 10px;
    }
  }
}
</style>
