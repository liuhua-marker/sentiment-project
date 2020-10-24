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
          <el-select v-model="queryForm.deptId" clearable placeholder="全部" @change="changeDept()">
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
        <el-form-item label="重复信息:" content-width="50">
          <el-select v-model="queryForm.deduplicate" @change="queryQuanIndex">
            <el-option v-for="(v, k, i) in optionCate" :key="i" :label="k" :value="v" />
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
        数据监控表
        <div class="fr">
          <el-button type="primary" @click="exportFiles">批量导出</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column v-if="userInfo.orgId === '0'" label="机构名称">
          <template>
            <span
              v-for="item in optionsSystem"
              :key="item.id"
            >{{ item.id === queryForm.orgId ? item.name: '' }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="userInfo.deptId === '0'" label="部门名称" prop="deptName" />
        <el-table-column label="数据源类型" prop="sourceTypeName" />
        <el-table-column label="分发公司数量" prop="distributeCompanyCount" />
        <el-table-column label="分发数据数量" prop="distributeDataCount" />
        <el-table-column label="分析公司数量" prop="analysisCompanyCount" />
        <el-table-column label="分析数据数量" prop="analysisDataCount" />
        <el-table-column label="时间" prop="timeStr" />
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
  // configuration_list,
  distributeRecord,
  domnLoadFile
} from '@/api/monitor/distribute_monitor'
import { confdatasourcetype } from '@/api/dashboard'
import { system, systemDept } from '@/api/analysis/hot_analysis'
import { DomnLoadFile } from '@/utils/exportFiles'

export default {
  name: 'DistributeMonitor',
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
        like: false,
        endDate: '',
        startDate: '',
        deduplicate: false
      },
      optionCate: {
        重复: '',
        不重复: false
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
    this.getWordsTypeId()
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
      // 数据类型
      if (this.userInfo.deptId !== '0') {
        this.queryForm.deptId = this.userInfo.deptId
        this.sourceData()
      }
    },
    // 数据类型
    async sourceData() {
      if (this.queryForm.deptId === '') {
        this.solutionForm.deptId = '0'
      } else {
        this.solutionForm.deptId = this.queryForm.deptId
      }
      const ress = await confdatasourcetype(this.solutionForm)
      this.optionsSource = ress.rows
    },
    systemDept(id) {
      const orgId = { orgIds: [id] }
      systemDept(orgId).then((row) => {
        this.optionsSystemDept = row.rows
        if (this.optionsSystemDept.length > 0) {
          this.queryForm.deptId = this.optionsSystemDept[0].id
        } else {
          this.queryForm.deptId = ''
        }
        this.getDistribute()
        this.sourceData()
      })
    },
    changeSystem(val) {
      this.loading = true
      this.systemDept(val)
    },
    changeDept() {
      this.loading = true
      this.getDistribute()
      this.sourceData()
    },
    // 页面数据
    getDistribute() {
      distributeRecord(this.queryForm).then((res) => {
        if (res.rows) {
          this.quanWordList = res.rows
        }
        this.total = res.total
      })
      this.loading = false
    },
    // 查询
    queryQuanIndex() {
      this.loading = true
      this.queryForm.pageNo = 1
      if (!!this.time && this.time.length !== 0) {
        this.queryForm.startDate = this.time[0].getDate()
        this.queryForm.endDate = this.time[1].getDate()
      } else {
        this.queryForm.startDate = ''
        this.queryForm.endDate = ''
      }
      this.getDistribute()
    },
    // 导出
    exportFiles() {
      const File = domnLoadFile(this.queryForm)
      const fname = `数据监控文档`
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
