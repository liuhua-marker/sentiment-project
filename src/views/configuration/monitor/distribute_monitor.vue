<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <el-card class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item
          v-if="userInfo.orgId === '0'"
          label="机构:"
          content-width="100"
        >
          <el-select
            v-model="queryForm.orgId"
            @change="systemDept(queryForm.orgId)"
          >
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
            @change="sourceData(queryForm.deptId)"
          >
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
            <el-option
              v-for="(v, k, i) in optionCate"
              :key="i"
              :label="k"
              :value="v"
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
    </el-card>

    <list-table ref="listTable" :options="tableData" @command="listCommand" />
  </div>
</template>

<script>
import {
  // configuration_list,
  distributeRecord,
  domnLoadFile,
} from '@/api/monitor/distribute_monitor'
import { confdatasourcetype } from '@/api/dashboard'
import { system, systemDept } from '@/api/analysis/hot_analysis'
import { DomnLoadFile } from '@/utils/exportFiles'
import listTable from '@/components/table/listTable'

export default {
  name: 'DistributeMonitor',
  components: { listTable },
  data() {
    var that = this
    return {
      tableData: {
        title: '数据监控表',
        listBtns: [
          {
            label: '导出',
            commandName: 'exportFiles',
            type: 'primary',
          },
        ],
        listApi: {
          serviceFN: distributeRecord, // 获取表格的查询接口
        },
        index: {
          // 序号配置项
          num: true, // 是否显示序号
          width: 60,
        },
        header: [
          {
            label: '机构名称', // 表头名称
            propName: 'orgName', // 查询返回的字段名
            hidden: false,
          },
          {
            label: '部门名称',
            propName: 'deptName',
            hidden: false,
          },
          {
            label: '数据源类型',
            propName: 'sourceTypeName',
          },
          {
            label: '分发公司数量',
            propName: 'distributeCompanyCount',
          },
          {
            label: '分发数据数量',
            propName: 'distributeDataCount',
          },
          {
            label: '分析公司数量',
            propName: 'analysisCompanyCount',
          },
          {
            label: '分析数据数量',
            propName: 'analysisDataCount',
          },
          {
            label: '时间',
            propName: 'timeStr',
          },
        ],
      },

      pickerOptions: {
        disabledDate: (time) => {
          return that.dealDisabledDate(time)
        },
      },
      // 表单数据
      queryForm: {
        deptId: '',
        orgId: '',
        sourceTypeCode: '',
        like: false,
        endDate: '',
        startDate: '',
        deduplicate: false,
      },
      optionCate: {
        重复: '',
        不重复: false,
      },
      time: '',
      solutionForm: {
        deptId: '0',
        pageNo: 1,
        pageSize: 100,
      },
      optionsSystem: [],
      optionsSystemDept: [],
      optionsSource: [],
      userInfo: {},
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
      if (this.userInfo.orgId === '0') {
        this.systemDept(this.userInfo.orgId)
        this.getDistribute()
      } else {
        this.queryForm.deptId = this.userInfo.deptId
        this.getDistribute()
      }
      // 数据类型
      if (this.userInfo.deptId !== '0') {
        this.queryForm.deptId = this.userInfo.deptId
        this.sourceData(this.userInfo.deptId)
      }
    },
    // 数据类型
    async sourceData(deptId) {
      this.solutionForm.deptId = deptId || '0'
      const ress = await confdatasourcetype(this.solutionForm)
      this.optionsSource = ress.rows
    },
    systemDept(id) {
      const orgId = { orgIds: [id] }
      systemDept(orgId).then((row) => {
        this.optionsSystemDept = row.rows
        this.sourceData(this.queryForm.deptId)
      })
    },
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    // 页面数据
    getDistribute() {
      this.$nextTick(() => {
        this.$refs['listTable'].search(this.queryForm)
      })
    },
    // 查询
    queryQuanIndex(v) {
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
  },
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
