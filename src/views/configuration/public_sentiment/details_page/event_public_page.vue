<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div>
      <div class="app-title">
        <svg-icon icon-class="shuxian" class="icon-bell" />
        <span class="title_echart">事件</span>
      </div>
      <div v-if="distributeRecordFrom.eventTitle" class="title">
        {{ distributeRecordFrom.eventTitle }}
        <span class="hotLevel">
          事件脉络
          <span :class="hotLevel >= 1 ? 'isHot' : ''"
            ><i class="el-icon-s-flag" /> {{ hotLevel }}</span
          >
        </span>
      </div>
      <div class="abstracts">
        {{ distributeRecordFrom.abstracts }}
      </div>
    </div>
    <div class="app-title">
      <svg-icon icon-class="shuxian" class="icon-bell" />
      <span class="title_echart">事件脉络</span>
    </div>
    <div v-loading="loading" element-loading-custom-class="custom">
      <div class="app-body">
        <timeline timeline-theme="#ccc" timeline-bg="#998">
          <template>
            <div
              v-for="(it,
              dex) in distributeRecordFrom.publicSentimentLevelEvents"
              :key="dex"
            >
              <timeline-title bg-color="#f76d37" font-color="#f76d37">
                <h3 style="margin: 5px 0px 16px">{{ it.level }}</h3>
              </timeline-title>
              <timeline-item
                v-for="(item, index) in it.internetAnalysisResList"
                :key="index"
                bg-color="#3488d6"
              >
                <span class="time_style">{{
                  Number(item.releaseTime) | parseTime()
                }}</span>
                <div
                  style="display: inline-block; width: 95%; margin-top: -10px"
                >
                  <a href="javascript:;" @click="detailsPage(item.id)">
                    <h4 style="margin: 10px 0">
                      <el-tag
                        v-if="item.emotionType === 1"
                        effect="dark"
                        type="success"
                        size="mini"
                        >正</el-tag
                      >
                      <el-tag
                        v-if="item.emotionType === -1"
                        effect="dark"
                        type="danger"
                        size="mini"
                        >负</el-tag
                      >
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
                      >目标公司：</b
                    >
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
    <!-- 词云 -->
    <div>
      <div class="app-title">
        <svg-icon icon-class="shuxian" class="icon-bell" />
        <span class="title_echart">关键词云</span>
      </div>
      <div ref="wordEcharts" class="eventEcharts"></div>
    </div>
    <!-- 热度趋势 -->
    <div>
      <div class="app-title">
        <svg-icon icon-class="shuxian" class="icon-bell" />
        <span class="title_echart">热度趋势</span>
      </div>
      <div ref="eventEcharts" class="eventEcharts"></div>
    </div>
    <!-- 调性分析图 -->
    <!-- <div>
      <div class="app-title">
        <svg-icon icon-class="shuxian" class="icon-bell" />
        <span class="title_echart">调性分析图</span>
      </div>
      <div ref="emotionEcharts" class="eventEcharts aa"></div>
    </div> -->
  </div>
</template>

<script>
import {
  getPublicSentimentEventContext,
  getEventHotAnalysisRes,
  getEventHot,
  getEventTonalAnalysisRes,
  eventWordsCloud,
} from '@/api/public_sentiment/alert_public_sentiment'
import Timeline from '@/views/components/timeline'
import TimelineItem from '@/views/components/timelineItem'
import TimelineTitle from '@/views/components/timelineTitle'
var echarts = require('echarts/lib/echarts')
// 词云图
require('echarts-wordcloud')
// import Popover from '../compoments/popover'

export default {
  name: 'EventPublicPage',
  components: { Timeline, TimelineItem, TimelineTitle },

  data() {
    return {
      loading: true,
      userInfo: {},
      distributeRecordFrom: {},
      id: '',
      hotLevel: 0,
    }
  },
  beforeCreate() {
    if (!this.$route.query.id) {
      this.$router.push({
        path: '/configuration/public_sentiment/alert_public_sentiment',
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
    distributeRecord() {
      getPublicSentimentEventContext(this.id).then((res) => {
        this.loading = false
        this.distributeRecordFrom = res.data
        this.distributeRecordFrom.eventTitle = this.distributeRecordFrom.eventTitle.substring(
          0,
          30
        )
        this.distributeRecordFrom.publicSentimentLevelEvents.forEach((item) => {
          this.addStyles(item.internetAnalysisResList)
        })
      })
      // 热点图
      getEventHotAnalysisRes(this.id).then((res) => {
        this.tonalityOption(res.data, 'eventEcharts')
      })
      // 热点
      getEventHot(this.id).then((res) => {
        this.hotLevel = res.data
      })
      // 调性分析
      // getEventTonalAnalysisRes(this.id).then((res) => {
      //   this.tonalityOption(res.data, 'emotionEcharts')
      // })
      // 词云
      eventWordsCloud(this.id).then((res) => {
        this.init_view_data(res.data, 'wordEcharts')
      })
    },
    addStyles(val) {
      val.forEach((itemParent, index) => {
        itemParent.abbs.forEach((item) => {
          const pattern = /[`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/
          if (item === '公司') return
          const name = item.replace(pattern, '')
          const replaceReg = new RegExp(item, 'g')
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
        query: { id: val },
      })
    },
    // 折线图
    tonalityOption(data, refName) {
      var myChart = echarts.init(this.$refs[refName])
      myChart.showLoading()
      // const color = ['#13ce66', '#ff4949', '#409EFF']
      var tonalityOption = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: data.types,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        toolbox: {
          show: true,
          feature: {
            restore: {
              show: true,
            },
            saveAsImage: {
              show: true,
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          nameTextStyle: {
            align: 'left',
            width: 40,
          },
          // axisLabel: {
          //   rotate: -60,
          // },
          data: data.times,
        },
        yAxis: {
          type: 'value',
        },
        series: data.lists,
      }
      myChart.setOption(tonalityOption)
      myChart.hideLoading()
    },
    // 词云图
    init_view_data(data, refName) {
      var word_list = data.map((item) => {
        return {
          name: item.name,
          value: item.score,
        }
      })
      var myChart = echarts.init(this.$refs[refName])
      myChart.showLoading()
      var options = {
        tooltip: {
          show: true,
        },
        toolbox: {
          show: true,
          feature: {
            restore: {
              show: true,
            },
            saveAsImage: {
              show: true,
            },
          },
        },
        series: [
          {
            type: 'wordCloud',
            shape: 'circle',
            left: 'center',
            top: 'center',
            width: '100%',
            height: '100%',
            right: null,
            bottom: null,
            gridSize: 10,
            sizeRange: [16, 60],
            rotationRange: [0, 0],
            autoSize: {
              enable: true,
              minSize: 6,
            },
            textPadding: 0,
            // rotationStep: 45,
            // gridSize: 8,
            drawOutOfBound: false,
            textStyle: {
              normal: {
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                color: function () {
                  return (
                    'rgb(' +
                    [
                      Math.round(Math.random() * 256),
                      Math.round(Math.random() * 256),
                      Math.round(Math.random() * 256),
                    ].join(',') +
                    ')'
                  )
                },
              },
              emphasis: {
                shadowBlur: 5,
                shadowColor: '#999',
              },
            },
            data: word_list,
          },
        ],
      }
      myChart.setOption(options)
      myChart.hideLoading()
    },
  },
}
</script>

<style lang="scss" scoped>
.app-container {
  .hotLevel {
    margin-left: 20px;
    border: 1px solid #ff4949;
    color: #ff4949;
    padding: 0px 5px;
    border-radius: 4px;
    display: inline-block;
    font-size: 14px;
    line-height: 20px;
    span {
      color: #666;
      display: inline-block;
      border-left: 1px solid #ff4949;
      padding-left: 5px;
      margin-left: 5px;
    }
    .isHot {
      color: #ff4949;
    }
  }
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
  font-size: 17px;
  line-height: 24px;
  font-weight: 700;
  padding: 0 25px 10px;
  overflow: hidden; /*超出部分隐藏*/
  white-space: nowrap; /*不换行*/
  text-overflow: ellipsis; /*超出部分文字以...显示*/
}
.abstracts {
  font-size: 16px;
  text-indent: 2em;
  line-height: 24px;
  padding: 0 25px;
}
.eventEcharts {
  width: 80%;
  height: 400px;
  overflow: show;
}
.app-title {
  display: inline-block;
  font-size: 18px;
  margin: 10px 0;
  color: #3b99fb;
  font-weight: 700;
  .title_echart {
    display: inline-block;
    padding: 8px;
  }
  .icon-bell {
    font-size: 20px;
  }
}
</style>
