<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div class="app-search">
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
          <el-select v-model="queryForm.deptId" placeholder="全部" @change="changeDept">
            <el-option
              v-for="item in optionsSystemDept"
              :key="item.id"
              :label="item.deptName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model.trim="queryForm.targetCompany"
            placeholder="目标公司"
            @keyup.enter.native="queryQuanIndex"
          />
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="time"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
            :default-time="['00:00:00', '23:59:59']"
            @change="changleTime"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
          <el-button type="primary" @click="exportFiles">导出</el-button>
          <el-button type="info" round @click="queryReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <ul v-loading="loading" style="margin: 0; padding: 0">
        <li v-for="(item,index) in quanWordList" :key="index" class="table">
          <div style="display: inline-block; width:3%; vertical-align : top; padding-top: 10px">
            <el-tag effect="dark" type="danger" size="mini">热</el-tag>
          </div>
          <div style="display: inline-block; width:95%">
            <a href="javascript:;" @click="detailsPage(item.id)">
              <h3 style="margin: 10px 0">
                <span>{{ index + 1 }}.</span>
                <span>{{ item.topic }}</span>
              </h3>
            </a>
            <p class="content">
              <b>概述：</b>
              <span v-html="item.introduction" />
            </p>
            <p class="content">
              <b>目标公司：</b>
              <span>{{ item.targetCompany }}</span>
              <b style="margin-left: 20px;">时间：</b>
              <span>{{ Number(item.topicTime) | parseTime() }}</span>
            </p>
          </div>
        </li>
      </ul>
      <div v-if="quanWordList && quanWordList.length === 0">暂无数据</div>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-if="quanWordList.length > 0"
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
  system,
  systemDept,
  distributeRecord,
  confsignalList,
  domnLoadFile
} from '@/api/analysis/hot_analysis'
// import { configuration_list } from '@/api/monitor/distribute_monitor'
import { selectNowSolution } from '@/api/configuration/ruls'
import { ExportFiles } from '@/utils/exportFiles'
import { parseTime, debounce } from '@/utils/index'

export default {
  name: 'HotAnalysis',

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
        deptId: '',
        endTime: '',
        orgId: '',
        startTime: '',
        targetCompany: '',
        pageNo: 1,
        pageSize: 10
      },
      activeName: '0',
      radio: '0',
      signal: '0',
      dataType: '0',
      removal: '1',
      contentGrade: '0',
      total: 0,
      time: '',
      solutionForm: {
        deptId: '0',
        pageNo: 1,
        pageSize: 100
      },
      quanWordList: [],
      optionsSystem: [],
      optionsSystemDept: [],
      options: {},
      value: '',
      confsignal: [],
      userInfo: {},
      signalData: {
        pageSize: 999999,
        solutionId: ''
      },
      sentiment: {
        analysisId: '',
        analysisType: 'warning',
        evaluationId: '',
        evaluationResult: '',
        remark: ''
      },
      popover: ''
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
        this.getDistribute()
      }
      this.changeDept()
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
      this.getDistribute()
      // this.selectSolution()
      this.activeName = '0'
    },
    changeSystem(val) {
      this.loading = true
      this.systemDept(val)
    },
    changeDept() {
      this.loading = true
      if (this.queryForm.deptId) {
        this.selectSolution()
        this.getDistribute()
      }
      this.activeName = '0'
    },
    async selectSolution() {
      const res = await selectNowSolution(this.queryForm.deptId)
      if (res.data) {
        this.signalData.solutionId = res.data.solutionId
      }
    },
    async tabsHandleClick(tab, event) {
      if (this.activeName === '2') {
        const res = await confsignalList(this.signalData)
        this.confsignal = res.rows
      }
    },
    // 页面数据
    async getDistribute() {
      const res = await distributeRecord(this.queryForm)
      this.quanWordList = res.rows
      this.total = res.total
      this.loading = false
    },
    changleTime(time) {
      if (time) {
        this.queryForm.startTime = time[0]
        this.queryForm.endTime = time[1]
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
      }
    },
    // 查询
    queryQuanIndex: debounce(function() {
      this.loading = true
      this.queryForm.pageNo = 1
      this.getDistribute()
      this.activeName = '0'
    }, 500),
    // 跳转到详情页
    detailsPage(val) {
      this.$router.push({
        path: '/configuration/analysis/hot/hot_analysis_page',
        query: { id: val }
      })
    },
    // 重置
    queryReset() {
      this.queryForm.pageNo = 1
      this.queryForm.pageSize = 10
      this.queryForm.targetCompany = ''
      this.queryForm.startTime = ''
      this.queryForm.endTime = ''
      this.time = ''
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
    },
    // 导出
    exportFiles() {
      let endTime = ''
      let startTime = ''
      if (this.queryForm.endTime || this.queryForm.startTime) {
        endTime = parseTime(this.queryForm.endTime)
        startTime = parseTime(this.queryForm.startTime)
      }
      const DomnLoadFile = domnLoadFile(this.queryForm)
      const fname = `热点事件文档`
      ExportFiles(DomnLoadFile, fname, startTime, endTime)
      // domnLoadFile(this.queryForm).then(res => {
      //   if (res) {
      //     var blob = res
      //     var objectUrl = URL.createObjectURL(blob)
      //     var link = document.createElement('a')
      //     var fname = `热点事件文档` // 下载文件的名字
      //     link.href = objectUrl
      //     link.setAttribute('download', fname + '.xlsx')
      //     document.body.appendChild(link)
      //     link.click()
      //   } else {
      //     this.$message({
      //       type: 'error',
      //       message: '导出失败'
      //     })
      //   }
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .red {
    color: #ee0b0b;
  }
  .blue {
    color: #0984ff;
  }
  .app-tabs {
    border-bottom: 1px solid #ccc;
    padding-bottom: 20px;
    .app-label {
      margin: 0 45px;
    }
    .tab-body {
      .tab-time {
        margin-right: 20px;
        font-size: 14px;
      }
    }
    .demonstration {
      font-size: 14px;
      margin: 20px;
    }
  }
  .app-table {
    margin-top: 10px;
    padding: 10px;
    .table {
      position: relative;
      box-sizing: border-box;
      list-style: none;
      border-bottom: 1px dashed #ccc;
    }
    .content {
      font-size: 14px;
      line-height: 26px;
      margin: 5px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
    }
    .icon {
      position: absolute;
      bottom: 0;
      // left: 750px;
      right: 50px;
    }
  }
  .pagination {
    text-align: right;
    margin-top: 20px;
  }
}
</style>
