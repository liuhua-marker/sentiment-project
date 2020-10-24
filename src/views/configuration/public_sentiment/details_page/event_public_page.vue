<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div>
      <div class="title">
        {{ distributeRecordFrom.eventTitle }}
      </div>
      <div class="abstracts">
        {{ distributeRecordFrom.abstracts }}
      </div>
    </div>
    <div class="body-title">
      <span>事件脉络</span>
    </div>
    <div v-loading="loading" element-loading-custom-class="custom">
      <div class="app-body">
        <timeline timeline-theme="#ccc" timeline-bg="#998">
          <template>
            <div
              v-for="(it,dex) in distributeRecordFrom.publicSentimentLevelEvents"
              :key="dex"
            >
              <timeline-title bg-color="#f76d37" font-color="#f76d37">
                <h3 style="margin: 0">{{ it.level }}</h3>
              </timeline-title>
              <timeline-item
                v-for="(item, index) in it.internetAnalysisResList"
                :key="index"
                bg-color="#3488d6"
              >
                <span class="time_style">{{
                  Number(item.releaseTime) | parseTime()
                }}</span>
                <div style="display: inline-block; width: 95%">
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
                    <span v-if="item.emotionType === -1">{{
                      item.contentGrade
                    }}</span>
                    <b
                      :style="
                        item.emotionType === -1 ? 'margin-left: 20px;' : ''
                      "
                    >目标公司：</b>
                    <el-button type="text" @click="details(item)">{{
                      item.companyName
                    }}</el-button>
                    <span v-if="item.transmitTarget" style="margin-left: 20px">
                      <b>控股企业：</b>
                      <span>{{ item.transmitTarget }}</span>
                    </span>
                  </p>
                  <p class="content">
                    <b>事件标签：</b>
                    <span v-for="(val, j) in item.labels" :key="j">{{
                      val.name
                    }}</span>
                    <b style="margin-left: 20px">预警类型：</b>
                    <span v-for="name in item.signalNames" :key="name">{{
                      name
                    }}</span>
                  </p>
                  <p class="content">
                    <b>数据类型：</b>
                    <span>{{ item.sourceTypeName }}</span>
                    <b style="margin-left: 20px">来源：</b>
                    <span>{{ item.source === '' ? '未知' : item.source }}</span>
                    <b style="margin-left: 20px">作者：</b>
                    <span>{{
                      item.nickname === '' ? '未知' : item.nickname
                    }}</span>
                  </p>
                </div>
              </timeline-item>
            </div>
          </template>
        </timeline>
      </div>
    </div>
  </div>
</template>

<script>
import { getPublicSentimentEventContext } from '@/api/public_sentiment/alert_public_sentiment'
import Timeline from '@/views/components/timeline'
import TimelineItem from '@/views/components/timelineItem'
import TimelineTitle from '@/views/components/timelineTitle'
// import Popover from '../compoments/popover'

export default {
  name: 'EventPublicPage',
  components: { Timeline, TimelineItem, TimelineTitle },

  data() {
    return {
      loading: true,
      userInfo: {},
      distributeRecordFrom: {},
      id: ''
    }
  },
  beforeCreate() {
    if (!this.$route.query.id) {
      this.$router.push({
        path: '/configuration/public_sentiment/alert_public_sentiment'
      })
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    this.id = this.$route.query.id
    this.distributeRecord()
  },
  methods: {
    async distributeRecord() {
      const res = await getPublicSentimentEventContext(this.id)
      // console.log(res)
      this.distributeRecordFrom = res.data
      this.distributeRecordFrom.publicSentimentLevelEvents.forEach((item) => {
        this.addStyles(item.internetAnalysisResList)
      })
      console.log(this.distributeRecordFrom)
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
.title {
    font-size: 30px;
    text-align: center;
    line-height: 60px;
}
.abstracts {
    font-size: 18px;
    text-indent: 2em;
    line-height: 33px;
}
</style>
