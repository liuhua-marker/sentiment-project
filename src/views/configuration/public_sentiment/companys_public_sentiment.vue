<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <el-card>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item
          v-if="userInfo.orgId === '0'"
          label="机构"
          content-width="100"
        >
          <el-select
            v-model="queryForm.orgId"
            @change="changeSystem(queryForm.orgId)"
          >
            <el-option
              v-for="item in optionsSystem"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="userInfo.deptId === '0'" label="部门">
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
        <el-form-item label="公司">
          <Autocomplete
            :targetcompany="queryForm.targetCompany"
            @RefreshData="RefreshData"
          />
        </el-form-item>
      </el-form>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="重复" content-width="50">
          <el-select v-model="queryForm.deduplicate" @change="queryQuanIndex">
            <el-option
              v-for="(v, k, i) in optionCate"
              :key="i"
              :label="k"
              :value="v"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="情感类型">
          <el-select
            v-model="queryForm.emotionType"
            clearable
            @change="queryQuanIndex"
          >
            <el-option
              v-for="(v, k, i) in optionEmotionType"
              :key="i"
              :label="k"
              :value="v"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
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
    </el-card>
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <el-dialog :title="dialogTitle" :visible.sync="dialogTableVisible">
      <div ref="analysisEchart" style="width: 100%; height: 500px" />
    </el-dialog>
  </div>
</template>

<script>
import { findEsCompanyWaringCountTop } from '@/api/public_sentiment/company_public_sentiment'
import { system, systemDept } from '@/api/analysis/hot_analysis'
import Autocomplete from './compoments/autocomplete'
import listTable from '@/components/table/listTable'
import { parseTime } from '@/utils'
var echarts = require('echarts/lib/echarts')

export default {
  name: 'CompanysPublicSentiment',
  components: { Autocomplete, listTable },
  data() {
    return {
      tableData: {
        title: '公司舆情预警表',
        listApi: {
          serviceFN: findEsCompanyWaringCountTop, // 获取表格的查询接口
          params: {},
        },
        // multipleTable: true, // 是否显示复选框
        index: {
          // 序号配置项
          num: true, // 是否显示序号
          width: 60,
        },
        header: [
          {
            label: '目标公司', // 表头名称
            propName: 'companyName', // 查询返回的字段名
          },
          {
            label: '舆情总数量',
            propName: 'count',
            width: '230px',
          },
          {
            label: '最新舆情时间',
            propName: 'releaseTime',
            width: '300px',
            formatter: (value, row) => {
              // 格式化当前表格数据    参数value 为当前列的值  row为当前行数据
              const date = new Date(Number(value))
              return parseTime(date)
            },
          },
          {
            label: '操作',
            btns: [
              {
                label: '详情',
                commandName: 'details',
                type: 'primary',
              },
              {
                label: '分析',
                commandName: 'analysisData',
                type: 'success',
              },
            ],
            btnGroups: false,
          },
        ],
      },

      // 表单数据
      queryForm: {
        deptId: '',
        orgId: '',
        targetCompany: '',
        startTime: '',
        endTime: '',
        deduplicate: false,
        emotionType: '',
        like: true,
      },
      optionCate: {
        重复: '',
        不重复: false,
      },
      optionEmotionType: {
        负面: -1,
        中性: 0,
        正面: 1,
      },
      time: '',
      optionsSystem: [],
      optionsSystemDept: [],
      userInfo: {},
      dialogTitle: '',
      dialogTableVisible: false,
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
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    // 页面数据
    async getDistribute() {
      document.body.click()
      this.$nextTick(() => {
        this.$refs['listTable'].search(this.queryForm)
      })
    },
    // 查询
    queryQuanIndex(val) {
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
    details(val) {
      this.$router.push({
        path:
          '/configuration/public_sentiment/details_page/company_public_page',
        query: {
          deptId: val.deptId,
          targetCompany: decodeURIComponent(val.companyName),
          orgId: val.orgId,
          deduplicate: false,
        },
      })
    },
    analysisData(scope, index) {
      this.dialogTableVisible = true
      this.dialogTitle = scope.companyName
      this.$nextTick(() => {
        this.getEchart(scope)
      })
    },
    getEchart(scope) {
      var data = scope.nameValueResList
      var legendData = data.map((item) => {
        return item.name
      })
      const option = {
        title: {
          text: '数据分析',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)',
        },
        legend: {
          type: 'scroll',
          top: 40,
          data: legendData,
        },
        series: [
          {
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }
      echarts.init(this.$refs['analysisEchart']).setOption(option)
    },
  },
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-form:last-child {
    .el-form-item {
      margin-bottom: 0;
    }
  }

}
</style>
