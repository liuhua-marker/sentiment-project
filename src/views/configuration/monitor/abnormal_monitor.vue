<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <el-card class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item
          v-if="userInfo.orgId === '0'"
          label="机构:"
          content-width="100"
        >
          <el-select v-model="queryForm.orgId">
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
          <el-select v-model="queryForm.errorType" clearable placeholder="全部">
            <el-option
              v-for="(val, key, i) in optionsAbnormal"
              :key="i"
              :label="val"
              :value="key"
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
            format="yyyy 年 MM 月 dd 日 hh:ss:mm"
            value-format="yyyy-MM-dd"
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
  distributeRecord,
  getErrorMonitorErrorType,
  domnLoadFile,
} from '@/api/monitor/abnormal_monitor'
import { confdatasourcetype } from '@/api/dashboard'
import { system } from '@/api/analysis/hot_analysis'
import { DomnLoadFile } from '@/utils/exportFiles'
import listTable from '@/components/table/listTable'
import { parseTime } from '@/utils'

export default {
  name: 'AbnormalMonitor',
  components: { listTable },
  data() {
    var that = this
    return {
      tableData: {
        title: '异常监控表',
        listBtns: [
          {
            label: '导出',
            commandName: 'exportFiles',
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
            width: '200px',
          },
          // {
          //   label: '数据源类型',
          //   propName: 'sourceTypeName',
          // },
          {
            label: '数据ID',
            propName: 'dataId',
          },
          {
            label: '集合名称',
            propName: 'collectionName',
          },
          {
            label: '异常类型',
            propName: 'errorType',
          },

          {
            label: '异常时间',
            propName: 'errorTimeStr',
            width: '100px',
          },
          {
            label: '异常信息',
            propName: 'errorMsg',
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
        orgId: '',
        sourceTypeCode: '',
        errorType: '',
        startTime: '',
        endTime: '',
      },
      time: '',
      solutionForm: {
        deptId: '0',
        pageNo: 1,
        pageSize: 100,
      },
      optionsSystem: [],
      optionsSource: [],
      optionsAbnormal: {},
      userInfo: {},
      quanWordList: [],
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    this.solutionForm.deptId = this.userInfo.deptId
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
      const ress = await confdatasourcetype(this.solutionForm)
      this.optionsSource = ress.rows
      // 异常类型
      const row = await getErrorMonitorErrorType()
      this.optionsAbnormal = row.data
    },
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    // 页面数据
    async getDistribute() {
      this.$nextTick(() => {
        this.$refs['listTable'].search(this.queryForm)
      })
    },
    queryQuanIndex(v) {
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
