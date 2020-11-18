<template>
  <div class="main_app">
    <Popover
      :isDept="true"
      :queryforms="queryForm"
      @RefreshData="getDistribute"
    />
    <div class="option_box">
      <sentiment ref="listData" :hotLevel="true" :options="options" />
    </div>
  </div>
</template>

<script>
import Popover from './compoments/popover'
import Sentiment from '@/views/search/components/sentiment'
import {
  distributeRecord,
  domnLoadFile,
} from '@/api/public_sentiment/alert_public_sentiment'
import {
  listByEventName,
  listByTypeName,
  getTransmitList,
} from '@/api/public_sentiment/public_sentiment_page'
import { system, systemDept } from '@/api/analysis/hot_analysis'
import { ExportFiles } from '@/utils/exportFiles'
import { parseTime } from '@/utils/index'

export default {
  name: 'AlertPublicSentiment',
  components: { Popover, Sentiment },
  data() {
    return {
      // 表单数据
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        deptId: '',
        orgId: '',
        targetCompany: '', //目标公司
        contentGrades: [], //预警级别
        emotionTypes: [], //情感类型
        sourceTypes: [], //数据类型
        startTime: '',
        endTime: '',
        deduplicate: false, //是否去重
        analysisTimeSort: false, //是否按分析时间排序
        signals: [], //预警类型
        eventTypes: [], //事件类型
        eventNames: [], //事件名称
        eventWords: [],
        transmission: [], //传导关系编码
        keyword: '', //关键词查询
      },
      options: distributeRecord,
    }
  },
  mounted() {
    // 获取页面数据
    let userInfo = this.$store.getters.userInfo
    // this.queryForm.orgId = userInfo.orgId
    // this.queryForm.deptId = userInfo.deptId
  },
  watch: {},
  methods: {
    // 页面数据
    getDistribute(v) {
      this.$refs.listData.search(v)
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
      const fname = `预警文档`
      ExportFiles(DomnLoadFile, fname, startTime, endTime)
    },
  },
}
</script>

<style lang="scss" scoped>
.option_box {
  padding: 0 0.3rem 0.2rem;
  min-height: 50vh;
}
.main_app {
  padding: 0 0.15rem;
}
</style>
