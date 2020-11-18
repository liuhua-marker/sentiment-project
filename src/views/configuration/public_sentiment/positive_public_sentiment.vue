<template>
  <div class="main_box">
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
import {
  findTargetCombinationWarning,
  domnLoadFile,
} from '@/api/public_sentiment/public_sentiment_page'
import { ExportFiles } from '@/utils/exportFiles'
import Popover from './compoments/popover'
import Sentiment from '@/views/search/components/sentiment'

export default {
  name: 'AlertPublicSentiment',
  components: { Popover, Sentiment },
  data() {
    return {
      queryForm: {
        pageNo: 1,
        pageSize: 10,
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
        companyCombSubId: '',
      },
      options: findTargetCombinationWarning,
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
  },
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
    eventSentiment(val) {
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/event_public_page',
        query: {
          id: val.id,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.main_box {
  padding: 0 0.15rem;
}
.option_box {
  padding: 0 0.3rem 0.2rem;
  min-height: 50vh;
}
</style>
