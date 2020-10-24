<template>
  <div class="app-container">
    <Search
      :name="companyName"
      :btnnames="btnName"
      @search_company="queryQuanIndex"
      @tabBtn="tabBtn"
    />
    <Popover
      v-if="btnName === '公司'"
      :queryforms="queryForm"
      @RefreshData="querySearch"
    />
    <div class="app-table">
      <ul v-if="btnName === '公司'" v-loading="loading" class="table-ul">
        <li v-for="(item, index) in quanWordList" :key="index" class="table">
          <div
            style="
              display: inline-block;
              width: 3%;
              vertical-align: top;
              padding-top: 10px;
            "
          >
            <el-tag
              v-if="item.emotionType === 1"
              effect="dark"
              type="success"
              size="mini"
            >正</el-tag>
            <el-tag
              v-if="item.emotionType === -1"
              effect="dark"
              type="danger"
              size="mini"
            >负</el-tag>
          </div>
          <div style="display: inline-block; width: 95%">
            <a href="javascript:;" @click="detailsPage(item)">
              <h3 style="margin: 10px 0">
                <span>{{ index + 1 }}.</span>
                <span>{{ item.title }}</span>
              </h3>
            </a>
            <p class="content">
              <b>摘要：</b>
              <span v-html="item.abstracts" />
            </p>
            <p class="content">
              <b v-if="item.emotionType === -1">预警级别：</b>
              <span v-if="item.emotionType === -1">{{ item.contentGrade }}</span>
              <b :style="item.emotionType === -1 ? 'margin-left: 20px;' : ''">目标公司：</b>
              <span>{{ item.companyName }}</span>
              <!-- <el-button type="text">{{ item.companyName }}</el-button> -->
              <span v-if="item.transmitTarget" style="margin-left: 20px">
                <b>控股企业：</b>
                <span>{{ item.transmitTarget }}</span>
              </span>
            </p>
            <p class="content">
              <b>事件标签：</b>
              <span v-for="(val, j) in item.labels" :key="j">{{ val }}</span>
              <b style="margin-left: 20px">预警类型：</b>
              <span v-for="type in item.eventType" :key="type.id">{{
                type.name
              }}</span>
            </p>
            <p class="content">
              <b>发表时间：</b>
              <span>{{ Number(item.releaseTime) | parseTime() }}</span>
              <b style="margin-left: 20px">分析时间：</b>
              <span>{{ Number(item.analysisTime) | parseTime() }}</span>
              <b style="margin-left: 20px">数据类型：</b>
              <span>{{ item.sourceTypeName }}</span>
              <b style="margin-left: 20px">来源：</b>
              <span>{{ item.source === '' ? '未知' : item.source }}</span>
              <b style="margin-left: 20px">作者：</b>
              <span>{{ item.nickname === '' ? '未知' : item.nickname }}</span>
            </p>
            <!-- <div class="icon">
              <PopoverTag
                :yuqingtag="item"
                :deptid="queryForm.deptId"
                @RefreshData="getDistribute"
              />
            </div>-->
          </div>
        </li>
      </ul>
      <ul v-if="btnName === '事件'" v-loading="loading" class="table-ul">
        <li v-for="(item, index) in quanWordList" :key="index" class="table">
          <div
            style="
              display: inline-block;
              width: 3%;
              vertical-align: top;
              padding-top: 10px;
            "
          >
            <el-tag effect="dark" type="danger" size="mini">热</el-tag>
          </div>
          <div style="display: inline-block; width: 95%">
            <a href="javascript:;" @click="eventPage(item)">
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
              <b style="margin-left: 20px">时间：</b>
              <span>{{ Number(item.topicTime) | parseTime() }}</span>
            </p>
          </div>
        </li>
      </ul>
      <!-- 分页 -->
      <div v-if="quanWordList.length > 0" class="pagination">
        <el-pagination
          v-if="quanWordList.length > 0"
          :current-page="queryForm.pageNo"
          :page-size="queryForm.pageSize"
          layout="total, prev, pager, next, jumper"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </div>
      <div v-if="!loading && quanWordList.length <= 0">{{ messages }}</div>
    </div>
  </div>
</template>

<script>
import {
  getYuqingListByCondition,
  searchEventByEvent
} from '@/api/search/index'
import Search from './components/search'
// import { ExportFiles } from '@/utils/exportFiles'
// import { parseTime } from '@/utils/index'
import Popover from './components/popover'
export default {
  name: 'SearchByCompany',
  components: { Popover, Search },
  data() {
    return {
      loading: true,
      // 表单数据
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        companyName: '',
        deduplicate: '',
        contentGrade: [],
        emotionType: [],
        endTime: 0,
        eventTypeCode: [],
        sourceType: [],
        startTime: 0,
        transmission: []
      },
      queryEvent: {
        keyword: '',
        pageNo: 1,
        pageSize: 10
      },
      quanWordList: [],
      value: '',
      userInfo: {},
      sentiment: {
        aiMarkList: [],
        analysisId: '',
        analysisType: '',
        evaluationId: '',
        evaluationResult: '',
        grade: '',
        spiderMarkList: []
      },
      btnName: '',
      companyName: '',
      messages: ''
    }
  },
  created() {
    this.userInfo = this.$store.getters.userInfo
    this.btnName = this.$route.query.btnName
    this.companyName = this.$route.query.companyName
    // 获取页面数据
    if (this.btnName === '公司') {
      this.queryForm.companyName = this.$route.query.companyName
      // this.getDistribute()
    } else if (this.btnName === '事件') {
      this.queryEvent.keyword = this.$route.query.companyName
      // this.getEvent()
    } else if (this.btnName === '资讯') {
      this.$message('功能暂未开放')
    }
  },
  methods: {
    // 页面数据
    getDistribute() {
      getYuqingListByCondition(this.queryForm).then((res) => {
        if (res.rows.length <= 0) {
          this.messages = '暂未收录该企业舆情信息'
        }
        this.quanWordListData(res.rows)
        this.total = res.total
        this.loading = false
      })
    },
    getEvent(companyName) {
      searchEventByEvent(this.queryEvent).then((res) => {
        this.loading = false
        this.total = res.total
        if (res.rows.length <= 0) {
          this.messages = '暂未收录该企业事件信息'
        }
        this.quanWordList = res.rows
      })
    },
    quanWordListData(res) {
      res.forEach((itemParent, index) => {
        if (!itemParent.yuqingEvaluationReq) {
          itemParent.yuqingEvaluationReq = this.sentiment
        }
        if (itemParent.abbs) {
          itemParent.abbs.forEach((item) => {
            const pattern = /[`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g
            if (item === '公司') return
            const name = item.replace(pattern, '')
            const replaceReg = new RegExp(name, 'g')
            itemParent.abstracts = itemParent.abstracts.replace(
              replaceReg,
              `<span style="color: #0984ff">${item}</span>`
            )
          })
        }
        const Reg = /【/g
        const Reg2 = /】/g
        if (itemParent.emotionType === 1) {
          itemParent.abstracts = itemParent.abstracts.replace(
            Reg,
            '【<span style="color: #13ce66">'
          )
        }
        if (itemParent.emotionType === -1) {
          itemParent.abstracts = itemParent.abstracts.replace(
            Reg,
            '【<span style="color: #ff4949">'
          )
        }
        itemParent.abstracts = itemParent.abstracts.replace(Reg2, '</span>】')
      })
      this.quanWordList = res
    },
    tabBtn(companyName, btnName) {
      this.btnName = btnName
      if (companyName.length > 0) {
        this.queryQuanIndex(companyName)
      } else {
        this.quanWordList = []
        this.$message('搜索内容不能为空！')
        this.messages = '搜索内容不能为空！'
        return
      }
      // this.queryQuanIndex(companyName)
    },
    // 查询
    queryQuanIndex(companyName) {
      this.loading = true
      this.queryForm.pageNo = 1
      if (this.btnName === '公司') {
        this.queryForm.companyName = companyName
        this.getDistribute()
      } else if (this.btnName === '事件') {
        this.queryEvent.keyword = companyName
        this.getEvent()
      } else if (this.btnName === '资讯') {
        this.$message('功能暂未开放')
        return
      }
    },
    // 高级搜索
    querySearch(val) {
      this.queryForm = val
      this.loading = true
      this.queryForm.pageNo = 1
      this.getDistribute()
    },
    // 分页
    handleCurrentChange(val) {
      this.loading = true
      if (this.btnName === '公司') {
        this.queryForm.pageNo = val
        this.getDistribute()
      } else if (this.btnName === '事件') {
        this.queryEvent.pageNo = val
        this.getEvent()
      } else if (this.btnName === '资讯') {
        this.$message('功能暂未开放')
        return
      }
    },
    // 跳转到公司详情页
    detailsPage(val) {
      // console.log(val.yqId)
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/alert_public_page',
        query: { id: val.yqId }
      })
    },
    // 跳转到事件详情页
    eventPage(val) {
      this.$router.push({
        path: '/configuration/analysis/hot/hot_analysis_page',
        query: { id: val.id }
      })
    }
    // 舆情脉络详情
    // details(val) {
    //   this.$router.push({
    //     path:
    //       '/configuration/public_sentiment/details_page/company_public_page',
    //     query: {
    //       deptId: this.userInfo.deptId,
    //       targetCompany: decodeURIComponent(val.companyName),
    //       orgId: this.userInfo.orgId,
    //       deduplicate: this.queryForm.deduplicate,
    //     },
    //   })
    // },
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  background: #fff;
  .table-ul {
    padding: 0;
    margin: 0;
    // min-height: 500px;
  }
  .app-table {
    margin-top: 10px;
    padding: 10px;
    min-height: 200px;
    .table {
      position: relative;
      box-sizing: border-box;
      list-style: none;
      border-bottom: 1px dashed #ccc;
    }
    .content {
      font-size: 14px;
      line-height: 20px;
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
    margin-top: 20px;
    text-align: right;
  }
}
</style>
