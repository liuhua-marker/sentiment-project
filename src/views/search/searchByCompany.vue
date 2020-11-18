<template>
  <div class="app-container">
    <div class="seach_bg">
      <Search
        ref="search"
        :name="targetCompany"
        :btnnames="btnName"
        @search="queryQuanIndex"
      />
    </div>

    <Popover
      ref="popover"
      :queryforms="queryForm"
      :activeName="activeName"
      @RefreshData="getDistribute"
    />
    <div>
      <sentiment ref="listDataAll" :hotLevel="true" :options="optionsAll" />
    </div>
  </div>
</template>

<script>
import { findEsOriginalAll } from '@/api/search/index'
import Search from '@/views/search/components/search'
import Popover from '@/views/search/components/popover'
import Sentiment from '@/views/search/components/sentiment'
export default {
  name: 'SearchByCompany',
  components: { Popover, Search, Sentiment },
  data() {
    return {
      // 表单数据
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
        eventTypes: [], //事件类型  一级
        eventNames: [], //事件名称  二级
        eventWords: [],
        transmission: [], //传导关系编码
        keyword: '', //关键词查询
      },
      btnName: '',
      targetCompany: '',
      optionsAll: findEsOriginalAll,
      activeName: 0,
      listItem: {},
    }
  },
  mounted() {
    this.btnName = this.$route.query.btnName
    this.targetCompany = this.$route.query.companyName
    let item = { level: this.$route.query.level }
    if (this.btnName) {
      this.getQuery(this.targetCompany, this.btnName, item)
      this.activeName = 0
    } else {
      this.activeName = 1
    }
  },
  methods: {
    // 公司页面数据
    getDistribute(v) {
      this.queryForm = v
      this.$nextTick(() => {
        let data = this.$refs.search.getName()
        this.getQuery(data.companyName, data.btnName, data.listItem)
        this.$refs.listDataAll.search(this.queryForm)
        this.$router.push({
          query: {
            companyName: data.companyName,
            btnName: data.btnName,
            level: data.listItem.level,
          },
        })
      })
    },
    // 查询
    queryQuanIndex(name, btn, item) {
      this.getQuery(name, btn, item)
      this.$refs.popover.queryFrom()
    },
    getQuery(name, btn, item) {
      this.listItem = item
      this.btnName = btn
      this.queryForm.targetCompany = ''
      this.queryForm.keyword = ''
      this.queryForm.eventNames = []
      this.queryForm.eventTypes = []
      this.queryForm.eventWords = []
      this.queryForm.keyword = name
      if (btn === '公司') {
        this.queryForm.targetCompany = name
      } else if (btn === '标签') {
        if (item.level === 1) {
          this.queryForm.eventTypes = [name]
        } else if (item.level === 2) {
          this.queryForm.eventNames = [name]
        } else if (item.level === 3) {
          this.queryForm.eventWords = [name]
        } else {
          this.queryForm.eventTypes = [name]
          this.queryForm.eventNames = [name]
          this.queryForm.eventWords = [name]
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  // background: #fff;
  .seach_bg {
    // background: #e9ecf7;
    border-radius: 0.05rem;
  }
}
</style>
