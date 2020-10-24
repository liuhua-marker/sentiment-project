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
        <el-form-item label="异常类型:">
          <el-select
            v-model="queryForm.errorType"
            clearable
            placeholder="全部"
            @change="queryQuanIndex"
          >
            <el-option v-for="(val, key, i) in optionsAbnormal" :key="i" :label="val" :value="key" />
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
            format="yyyy 年 MM 月 dd 日 hh:ss:mm"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <div class="app-head">
        异常监控表
        <div class="fr">
          <el-button type="primary" @click="exportFiles">批量导出</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column v-if="userInfo.orgId === '0'" label="机构名称" width="200">
          <template>
            <span
              v-for="item in optionsSystem"
              :key="item.id"
            >{{ item.id === queryForm.orgId ? item.name: '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数据源类型" width="150" prop="typeName" />
        <el-table-column label="数据ID" prop="dataId" />
        <el-table-column label="集合名称" prop="collectionName" />
        <el-table-column label="异常类型" width="150">
          <template slot-scope="scope">
            <span
              v-for="(val, key, i) in optionsAbnormal"
              :key="i"
            >{{ key === scope.row.errorType ? val: '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="异常时间" width="180">
          <template
            slot-scope="scope"
          >{{ Number(scope.row.errorTime) | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="异常信息" prop="errorMsg" />
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
  distributeRecord,
  getErrorMonitorErrorType,
  domnLoadFile
} from '@/api/monitor/abnormal_monitor'
import { confdatasourcetype } from '@/api/dashboard'
import { system, systemDept } from '@/api/analysis/hot_analysis'
import { DomnLoadFile } from '@/utils/exportFiles'

export default {
  name: 'AbnormalMonitor',

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
        errorType: '',
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
      optionsAbnormal: {},
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
    // 获取选择框数据
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
      }
      // 数据类型
      if (this.userInfo.deptId !== '0') {
        this.solutionForm.deptId = this.userInfo.deptId
      }
      const ress = await confdatasourcetype(this.solutionForm)
      this.optionsSource = ress.rows
      // 异常类型
      const row = await getErrorMonitorErrorType()
      this.optionsAbnormal = row.data
    },
    async systemDept(id) {
      const orgId = { orgIds: [id] }
      const row = await systemDept(orgId)
      this.optionsSystemDept = row.rows
      this.getDistribute()
      // if (this.optionsSystemDept.length > 0) {
      //   this.queryForm.deptId = this.optionsSystemDept[0].id
      // } else {
      //   this.queryForm.deptId = ''
      // }
      // this.queryForm.deptId = this.optionsSystemDept[0].id
    },
    changeSystem(val) {
      this.loading = true
      this.systemDept(val)
    },
    // 页面数据
    async getDistribute() {
      const res = await distributeRecord(this.queryForm)
      this.quanWordList = res.rows
      this.total = res.total
      this.loading = false
    },
    queryQuanIndex() {
      this.loading = true
      this.queryForm.pageNo = 1
      if (this.time && this.time.length !== 0) {
        this.queryForm.startTime = this.dateToMs(this.time[0])
        this.queryForm.endTime =
          this.dateToMs(this.time[1]) + 24 * 60 * 60 * 1000
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
      }
      this.getDistribute()
    },
    // 导出
    exportFiles() {
      const File = domnLoadFile(this.queryForm)
      const fname = `异常监控文档`
      DomnLoadFile(File, fname)
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
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
    .el-table {
      width: 100%;
      margin: 10px 0;
    }
    .app-head {
      height: 36px;
      line-height: 36px;
      font-weight: 700;
      font-size: 14px;
    }
    .app-title {
      margin: 10px;
    }
  }
  .pagination {
    text-align: right;
  }
}
</style>
