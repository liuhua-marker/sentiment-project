<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <Popover :queryforms="queryForm" @RefreshData="queryFrom" />
    <div class="body-title">
      <span>舆情脉络</span>
    </div>
    <div v-loading="loading" element-loading-custom-class="custom">
      <div class="app-body">
        <timeline timeline-theme="#ccc" timeline-bg="#998">
          <template>
            <div v-for="(it, dex) in distributeRecordFrom" :key="dex">
              <timeline-title bg-color="#f76d37" font-color="#f76d37">
                <h3 style="margin: 0">{{ it.year }}</h3>
              </timeline-title>
              <timeline-item v-for="(item, index) in it.newsArr" :key="index" bg-color="#3488d6">
                <span class="time_style">{{ Number(item.releaseTime) | parseTime() }}</span>
                <div style="display: inline-block; width:95%">
                  <a href="javascript:;" @click="detailsPage(item.id)">
                    <h4 style="margin: 10px 0">
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
                      <span>{{ index + 1 }}.</span>
                      <span>{{ item.title }}</span>
                    </h4>
                  </a>
                  <p class="content">
                    <b>摘要：</b>
                    <span v-html="item.abstracts" />
                  </p>
                  <p class="content">
                    <b v-if="item.emotionType === -1">预警级别：</b>
                    <span v-if="item.emotionType === -1">{{ item.contentGrade }}</span>
                    <b :style="item.emotionType === -1 ? 'margin-left: 20px;' : ''">目标公司：</b>
                    <el-button type="text" @click="details(item)">{{ item.companyName }}</el-button>
                    <span v-if="item.transmitTarget" style="margin-left: 20px;">
                      <b>控股企业：</b>
                      <span>{{ item.transmitTarget }}</span>
                    </span>
                  </p>
                  <p class="content">
                    <b>事件标签：</b>
                    <span v-for="(val,j) in item.labelNames" :key="j">{{ val }}</span>
                    <b style="margin-left: 20px;">预警类型：</b>
                    <span v-for="name in item.signalNames" :key="name">{{ name }}</span>
                  </p>
                  <p class="content">
                    <b>数据类型：</b>
                    <span>{{ item.sourceTypeName }}</span>
                    <b style="margin-left: 20px;">来源：</b>
                    <span>{{ item.source === '' ? '未知' : item.source }}</span>
                    <b style="margin-left: 20px;">作者：</b>
                    <span>{{ item.nickname === '' ? '未知' : item.nickname }}</span>
                  </p>
                </div>
              </timeline-item>
            </div>
            <el-button v-if="!footer" type="primary" class="btn_more" @click="more">点击加载更多</el-button>
          </template>
        </timeline>
      </div>
    </div>
    <div
      v-if="footer"
      class="app-footer"
    >------------------------------- 没 有 啦 ~ ~ ~ -------------------------------</div>
  </div>
</template>

<script>
import { distributeRecord } from '@/api/public_sentiment/alert_public_sentiment'
import Timeline from '@/views/components/timeline'
import TimelineItem from '@/views/components/timelineItem'
import TimelineTitle from '@/views/components/timelineTitle'
import Popover from '../compoments/popover'

export default {
  name: 'CompanyPublicPage',
  components: { Timeline, TimelineItem, TimelineTitle, Popover },

  data() {
    return {
      loading: true,
      userInfo: {},
      distributeRecordFrom: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        deptId: '',
        orgId: '',
        emotionType: '',
        targetCompany: '',
        contentGrade: '',
        sourceType: '',
        signals: [],
        startTime: '',
        endTime: '',
        deduplicate: false,
        like: false,
        analysisTimeSort: false,
        transmission: []
      },
      footer: false,
      newData: []
    }
  },
  beforeCreate() {
    if (!this.$route.query.deptId) {
      this.$router.push({
        path: '/configuration/public_sentiment/company_public_sentiment'
      })
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    this.queryForm.orgId = this.$route.query.orgId
    this.queryForm.deptId = this.$route.query.deptId
    this.queryForm.targetCompany = this.$route.query.targetCompany
    this.queryForm.deduplicate = this.$route.query.deduplicate
    this.distributeRecord()
  },
  methods: {
    async distributeRecord() {
      var year = ''
      const res = await distributeRecord(this.queryForm)
      console.log(res)
      this.newData = this.newData.concat(res.rows)
      this.addStyles(this.newData)
      if (res.rows.length !== 0) {
        this.distributeRecordFrom = [
          {
            year: new Date(Number(this.newData[0].releaseTime)).getFullYear(),
            newsArr: []
          }
        ]
        this.newData.forEach((el, i) => {
          year = new Date(Number(el.releaseTime)).getFullYear()
          const a = this.distributeRecordFrom.findIndex((item) => {
            return year === item.year
          })
          if (a === -1) {
            this.distributeRecordFrom.push({ year: year, newsArr: [el] })
          } else {
            this.distributeRecordFrom[a].newsArr.push(el)
          }
        })
      } else {
        this.footer = true
      }
      this.loading = false
    },
    addStyles(val) {
      val.forEach((itemParent, index) => {
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
    },
    // 跳转到详情页
    detailsPage(val) {
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/alert_public_page',
        query: { id: val }
      })
    },
    queryFrom(val) {
      this.queryForm.pageNo = 1
      this.loading = true
      this.newData = []
      this.distributeRecordFrom = []
      this.footer = false
      this.distributeRecord()
    },
    more() {
      this.loading = true
      this.queryForm.pageNo = this.queryForm.pageNo - 0 + 1
      this.distributeRecord()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .app-tabs {
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
  /deep/.el-loading-spinner {
    position: absolute;
    bottom: 0;
    left: 45%;
    // background: rgba(0, 0, 0, 0.7);
    width: auto;
    text-align: center;
    .circular {
      position: absolute;
      bottom: 200px;
      width: 80px;
      height: 80px;
    }
  }
  .body-title {
    width: 150px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    background-color: #3488d6;
    font-size: 20px;
    color: #fff;
    border-radius: 0 40px 0 40px;
    margin-bottom: 20px;
  }
  .emotionType {
    vertical-align: bottom;
    margin-right: 10px;
  }
  .body {
    min-height: 200px;
  }
  .app-body {
    min-height: 200px;
    margin-left: 90px;
    .time_style {
      display: inline-block;
      position: absolute;
      left: -128px;
      line-height: 18px;
      width: 85px;
      height: 20px;
      font-size: 16px;
      text-align: right;
      color: #4ba5fa;
    }
    .el-button {
      border-radius: 10px;
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
  }
  .btn_more {
    margin: 10px;
  }
  .app-footer {
    text-align: center;
    color: #f76d37;
    margin: 20px 0;
    font-size: 16px;
  }
}
</style>
