<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-popover v-model="visibleTime" placement="bottom-start" trigger="click">
        <div class="tab-body">
          <div>
            <el-radio v-model="radio" label="0" @change="queryFrom">全部</el-radio>
            <el-radio v-model="radio" label="1" @change="queryFrom">当天</el-radio>
            <el-radio v-model="radio" label="2" @change="queryFrom">近3天</el-radio>
            <el-radio v-model="radio" label="3" @change="queryFrom">近7天</el-radio>
            <el-radio v-model="radio" label="4">自定义时间</el-radio>
            <span v-if="radio==='4'" style="margin-top: 20px">
              <el-date-picker
                v-model="time"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="queryFrom"
                @focus="dateFocus"
                @blur="dateBlur"
              />
            </span>
          </div>
        </div>
        <el-button slot="reference" type="text">
          <b class="demonstration">时间</b>
          <span>{{ radioName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
          <span>|</span>
        </el-button>
      </el-popover>
      <el-popover v-model="visibleData" placement="bottom-start" trigger="click">
        <div>
          <el-radio v-model="dataType" label="0" @change="queryData">全部</el-radio>
          <el-radio
            v-for="item in optionsSource"
            :key="item.sourceTypeId"
            v-model="dataType"
            :label="item.typeCode"
            @change="queryData(item.typeName)"
          >{{ item.typeName }}</el-radio>
        </div>
        <el-button slot="reference" type="text">
          <b class="demonstration">数据源类型</b>
          <span>{{ dataName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
          <span>|</span>
        </el-button>
      </el-popover>
      <el-popover v-model="visibleRepeat" placement="bottom-start" trigger="click">
        <div>
          <el-radio v-model="removal" label="0" @change="queryFrom">重复</el-radio>
          <el-radio v-model="removal" label="1" @change="queryFrom">不重复</el-radio>
        </div>
        <el-button slot="reference" type="text">
          <b class="demonstration">重复信息</b>
          <span>{{ removalName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
      </el-popover>
    </div>
    <!-- 主体 -->
    <div v-loading="loading">
      <div class="app-title">
        <i class="el-icon-set-up icon-bell" />
        <span class="title">事件概述</span>
      </div>
      <div class="topic" v-html="distributeRecordFrom.introduction" />
      <div class="app-title">
        <i class="el-icon-s-operation icon-bell" />
        <span class="title">事件脉络</span>
      </div>
      <div class="body-title">
        <span>开始时间</span>
      </div>
      <div v-for="(item, index) in detailsRecordFrom" :key="index" class="app-body">
        <timeline timeline-theme="#ccc" timeline-bg="#998">
          <template>
            <div>
              <timeline-title bg-color="#f76d37" font-color="#f76d37">
                <h3 style="margin: 0">{{ item.topicDetailName }}</h3>
              </timeline-title>
              <timeline-item
                v-for="(it, i) in item.hotTopicRouteEntities.slice(0,sliceLength[index])"
                :key="i"
                bg-color="#3488d6"
              >
                <span class="time_style">{{ Number(it.releaseTime) | parseTime() }}</span>
                <div style="display: inline-block; width:95%">
                  <el-link :href="it.url" target="view_window" :underline="false">
                    <h4 style="margin: 3px 0">
                      <el-tag v-if="it.label === '中性'" size="mini">{{ it.label }}</el-tag>
                      <el-tag v-if="it.label === '正面'" type="success" size="mini">{{ it.label }}</el-tag>
                      <el-tag v-if="it.label === '负面'" type="danger" size="mini">{{ it.label }}</el-tag>
                      <span style="margin-left: 10px;">{{ i + 1 }}.</span>
                      <span>{{ it.title }}</span>
                    </h4>
                  </el-link>
                  <p class="content">
                    <b>摘要：</b>
                    <span v-html="it.introduction" />
                  </p>
                  <p class="content">
                    <b>数据类型：</b>
                    <span
                      v-for="items in optionsSource"
                      :key="items.sourceTypeId"
                    >{{ it.dataType===items.typeCode? items.typeName:'' }}</span>
                    <b style="margin-left: 20px;">来源：</b>
                    <span>{{ it.source === '' ? '未知': it.source }}</span>
                  </p>
                </div>
              </timeline-item>
              <el-button
                v-if="sliceLength[index] < item.hotTopicRouteEntities.length"
                type="primary"
                class="loadMore"
                @click="loadMore(item, index)"
              >加载更多</el-button>
            </div>
          </template>
        </timeline>
      </div>
    </div>
    <!--  词云图 -->
    <div>
      <div class="app-title" style="width: 100%;">
        <i class="el-icon-collection icon-bell" />
        <span class="title">关键词云</span>
      </div>
      <div>
        <div id="word_cloud_view_id" />
        <div class="wordCloud">
          <el-table
            :data="wordCloud"
            stripe
            max-height="400"
            :header-row-style="{fontSize: '18px',fontWeight: 700,color: '#333'}"
          >
            <el-table-column prop="name" label="事件高频词" min-width="120">
              <template slot-scope="scope">
                <i>{{ scope.$index + 1 }}.</i>
                {{ scope.row.name }}
              </template>
            </el-table-column>
            <el-table-column prop="score" min-width="120">
              <template slot-scope="scope">{{ scope.row.score.toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <!-- 情感占比分析 -->
    <div>
      <div class="app-title" style="width: 99%;">
        <i class="el-icon-pie-chart icon-bell" />
        <span class="title">情感占比分析</span>
      </div>
      <div id="emotionCharts" ref="emotionCharts" />
    </div>
    <!-- 调性分析 -->
    <div>
      <div class="app-title" style="width: 99%;">
        <i class="el-icon-aim icon-bell" />
        <span class="title">调性分析</span>
      </div>
      <div class="fr">
        <el-button size="mini" @click="annualEnquiry">年</el-button>
        <el-popover placement="bottom" width="330" trigger="click" @after-leave="hideTrend">
          <el-date-picker
            v-model="monthlyValue"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="yyyy 年 MM 月"
            value-format="yyyy-MM"
            @change="monthlyEnquiry"
          />
          <el-button slot="reference" size="mini">月</el-button>
        </el-popover>
        <el-popover placement="bottom" trigger="click" @after-leave="hideTrend">
          <el-date-picker
            v-model="dailyValue"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy 年 MM 月 dd 日"
            value-format="timestamp"
            @change="dailyEnquiry"
          />
          <el-button slot="reference" size="mini">日</el-button>
        </el-popover>
      </div>
      <div id="tonalityCharts" ref="tonalityCharts" />
    </div>
    <!-- 传播趋势 -->
    <div>
      <div class="app-title" style="width: 99%;">
        <i class="el-icon-data-line icon-bell" />
        <span class="title">传播趋势</span>
      </div>
      <div class="fr">
        <el-button size="mini" @click="annualTrend">年</el-button>
        <el-popover placement="bottom" width="330" trigger="click" @after-leave="hideTrend">
          <el-date-picker
            v-model="monthlyValue"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="yyyy 年 MM 月"
            value-format="yyyy-MM"
            @change="monthlyTrend"
          />
          <el-button slot="reference" size="mini">月</el-button>
        </el-popover>
        <el-popover placement="bottom" trigger="click" @after-leave="hideTrend">
          <el-date-picker
            v-model="dailyValue"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy 年 MM 月 dd 日"
            value-format="timestamp"
            @change="dailyTrend"
          />
          <el-button slot="reference" size="mini">日</el-button>
        </el-popover>
      </div>
      <div id="trendCharts" ref="charts" />
    </div>
    <!--  传播路径-->
    <div>
      <div class="app-title" style="width: 99%;">
        <i class="el-icon-place icon-bell" />
        <span class="title">传播路径</span>
      </div>
      <div id="RouteCharts" ref="RouteCharts" />
    </div>
  </div>
</template>

<script>
import { confdatasourcetype } from '@/api/dashboard'
import {
  topicContext,
  spreadTrend,
  details,
  keyWordsCloud,
  spreadPath,
  emotionAnalysis,
  tonalAnalysis
} from '@/api/analysis/hot_analysis'
import Timeline from '@/views/components/timeline'
import TimelineItem from '@/views/components/timelineItem'
import TimelineTitle from '@/views/components/timelineTitle'
import { parseTime } from '@/utils'
// 引入基本模板
var echarts = require('echarts/lib/echarts')
// 引入柱状图组件
require('echarts/lib/chart/bar')
// 引入提示框和title组件
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts-wordcloud')
import 'echarts/theme/macarons.js'
import { deepClone } from '../../../../utils'
export default {
  name: 'HotAnalysisPage',
  components: { Timeline, TimelineItem, TimelineTitle },
  data() {
    return {
      loading: true,
      visibleTime: false,
      visibleData: false,
      visibleRepeat: false,
      userInfo: {},
      radio: '0',
      radioName: '全部',
      radioTime: '0',
      dataType: '0',
      dataName: '全部',
      removal: '1',
      removalName: '不重复',
      time: '',
      solutionForm: {
        deptId: '0',
        pageNo: 1,
        pageSize: 100
      },
      optionsSource: [],
      distributeRecordFrom: {},
      detailsRecordFrom: {},
      queryForm: {
        pageNo: 1,
        pageSize: 100,
        dataType: '',
        endTime: '',
        startTime: '',
        topicId: ''
      },
      footer: false,
      word_cloud_view: null,
      word_cloud_options: {},
      word_list: [],
      wordCloud: [],
      sliceLength: [],
      monthlyValue: '',
      dailyValue: ''
    }
  },
  beforeCreate() {
    if (!this.$route.query.id) {
      this.$router.push({ path: '/configuration/analysis/hot_analysis' })
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    this.queryForm.topicId = this.$route.query.id
    this.distributeRecord()
    this.getWordsTypeId()
    // this.getchart()
  },
  methods: {
    // 加载更多
    loadMore(item, index) {
      this.sliceLength[index] += 5
      this.$set(this.sliceLength, index, this.sliceLength[index])
    },
    // 词云图
    init_view_data() {
      this.word_cloud_view = echarts.init(
        document.getElementById('word_cloud_view_id'),
        'macarons'
      )
      const word_cloud_series = [
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
            minSize: 6
          },
          textPadding: 0,
          // rotationStep: 45,
          // gridSize: 8,
          drawOutOfBound: false,
          textStyle: {
            normal: {
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              // Color can be a callback function or a color string
              color: function() {
                // Random color
                return (
                  'rgb(' +
                  [
                    Math.round(Math.random() * 256),
                    Math.round(Math.random() * 256),
                    Math.round(Math.random() * 256)
                  ].join(',') +
                  ')'
                )
              }
            },
            emphasis: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: this.word_list
        }
      ]

      this.word_cloud_options = {
        tooltip: {
          show: true
        },
        toolbox: {
          show: true,
          feature: {
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        series: word_cloud_series
      }
      this.word_cloud_view.setOption(this.word_cloud_options)
    },
    // 标准的时间格式转为时间戳
    dateToMs(date) {
      const result = new Date(date).getTime()
      return result
    },
    // 获取选择框数据
    async getWordsTypeId() {
      // 数据类型
      if (this.userInfo.deptId !== '0') {
        this.solutionForm.deptId = '0'
      } else {
        this.solutionForm.deptId = this.userInfo.deptId
      }
      const ress = await confdatasourcetype(this.solutionForm)
      this.optionsSource = ress.rows
      this.getchart()
    },
    distributeRecord() {
      this.loading = true
      topicContext(this.queryForm.topicId).then(res => {
        this.distributeRecordFrom = res.data
      })
      details(this.queryForm).then(res => {
        this.detailsRecordFrom = res.data
        this.detailsRecordFrom.forEach((item, index) => {
          if (
            item.hotTopicRouteEntities &&
            item.hotTopicRouteEntities.length !== 0
          ) {
            this.sliceLength[index] = 5
          }
        })
        if (res.data.length === 0) {
          this.footer = true
        }
        this.loading = false
      })
    },
    // 图
    getchart() {
      // 词云数据
      keyWordsCloud(this.queryForm).then(res => {
        this.wordCloud = res.data
        this.word_list = res.data.map(item => {
          return {
            name: item.name,
            value: item.score
          }
        })
        this.init_view_data()
      })
      // 传播趋势
      this.getspreadTrend(this.queryForm)
      // 传播路径
      spreadPath(this.queryForm).then(res => {
        var categories = []
        var date = []
        res.data.data.forEach(item => {
          item.draggable = true
          if (item.name.substring(0, 3) === '子事件') {
            item.category = item.name
            date.push(item.name)
          }
          if (item.value) {
            item.value = [item.value]
          }
          categories.push({ name: item.name })
        })
        res.data.links.forEach(item => {
          if (item.value) {
            item.symbolSize = [0, 10]
          } else {
            item.value = ''
          }
        })
        var myChart = echarts.init(document.getElementById('RouteCharts'))
        myChart.showLoading()
        var option = {
          color: [
            '#b10505',
            '#09189a',
            '#2f4554',
            '#d48265',
            '#07a85d',
            '#749f83',
            '#744601',
            '#ee6b43',
            '#099afa',
            '#61a0a8',
            '#c4ccd3',
            '#8903aa'
          ],
          backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [
            {
              offset: 0,
              color: '#fff'
            },
            {
              offset: 1,
              color: '#fff'
            }
          ]),
          title: {
            text: '传播路径图',
            top: 'top',
            left: 'center'
          },
          tooltip: {},
          legend: [
            {
              type: 'scroll',
              orient: 'vertical',
              left: 10,
              top: 30,
              tooltip: {
                show: true
              },
              selectedMode: 'false',
              data: date
            }
          ],
          toolbox: {
            show: true,
            feature: {
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          animationDuration: 3000,
          animationEasingUpdate: 'quinticInOut',
          series: [
            {
              type: 'graph',
              layout: 'force',
              force: {
                gravity: 0,
                edgeLength: 60,
                repulsion: 400
              },
              data: res.data.data,
              links: res.data.links,
              categories: categories,
              focusNodeAdjacency: true,
              roam: true,
              label: {
                normal: {
                  show: true,
                  position: 'top'
                }
              },
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [0, 0],
              lineStyle: {
                normal: {
                  color: 'source',
                  curveness: 0,
                  type: 'solid'
                }
              }
            }
          ]
        }
        myChart.setOption(option, true)
        myChart.hideLoading()
      })
      // 调性分析
      this.getTonalAnalysis(this.queryForm)
      // 情感占比分析
      emotionAnalysis(this.queryForm).then(res => {
        var emotionOption = {
          title: {
            text: '情感占比来源',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: res.data.labelTypes
          },
          toolbox: {
            show: true,
            feature: {
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          series: [
            {
              name: '情感占比分析',
              type: 'pie',
              radius: '55%',
              center: ['50%', '60%'],
              data: res.data.analysisCounts,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              itemStyle: {
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                normal: {
                  color: function(params) {
                    // 自定义颜色
                    var colorList = ['#13ce66', '#ff4949', '#409EFF']
                    return colorList[params.dataIndex]
                  }
                }
              }
            }
          ]
        }
        echarts.init(this.$refs.emotionCharts).setOption(emotionOption)
      })
    },
    // 调性分析
    getTonalAnalysis(queryForm, i) {
      tonalAnalysis(queryForm).then(res => {
        var title = '调性分析图'
        this.processingData(
          res.data.labelTypes,
          res.data.times,
          res.data.tonalSeriesResList,
          title,
          i
        )
      })
    },
    // 传播趋势
    getspreadTrend(queryForm, i) {
      spreadTrend(queryForm).then(res => {
        var xAxis = []
        if (res.data.timeList) {
          res.data.timeList.forEach((item, index) => {
            const data = parseTime(Number(item)).substring(0, 10)
            xAxis.push(data)
          })
        }
        var title = '传播趋势图'
        this.processingData(
          res.data.dataTypes,
          xAxis,
          res.data.spreadTrendSeriesResList,
          title,
          i
        )
      })
    },
    // 折线图数据处理
    processingData(labelType, time, tonalSeries, title, i) {
      var titles = title
      var labelTypes = labelType
      var times = []
      var tonalSeriesResList = []
      if (time.length <= 60 && i === undefined) {
        times = time
        tonalSeriesResList = tonalSeries
      }
      if (time.length > 60 && time.length < 365 * 3 && i === undefined) {
        i = 7
      }
      if (time.length >= 365 * 3 && i === undefined) {
        i = 4
      }
      if (i === 4 || i === 7) {
        var list = tonalSeries
        list.forEach(val => {
          var v = deepClone(val)
          tonalSeriesResList.push(v)
        })
        tonalSeriesResList.forEach(val => {
          val.data = []
        })
        time.forEach((item, index) => {
          if (times.indexOf(item.substring(0, i)) === -1) {
            times.push(item.substring(0, i))
            tonalSeriesResList.forEach((val, t) => {
              val.data.push(list[t].data[index])
            })
          } else {
            const a = tonalSeriesResList[0].data.length - 1
            tonalSeriesResList.forEach((val, t) => {
              val.data[a] += list[t].data[index]
            })
          }
        })
      }
      if (i === 0) {
        times = time
        tonalSeriesResList = tonalSeries
      }
      this.tonalityOption(labelTypes, times, tonalSeriesResList, titles)
    },
    tonalityOption(labelTypes, times, tonalSeriesResList, titles) {
      if (times[0].length === 4) {
        times.unshift(times[0] - 1)
        times.push(Number(times[times.length - 1]) + 1)
        tonalSeriesResList.forEach(item => {
          item.data.unshift(0)
          item.data.push(0)
        })
      }
      const color = ['#13ce66', '#ff4949', '#409EFF']
      var tonalityOption = {
        title: {
          text: titles
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          color: color,
          data: labelTypes
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          show: true,
          feature: {
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            rotate: -60
          },
          data: times
        },
        yAxis: {
          type: 'value'
        },
        series: tonalSeriesResList
      }
      if (titles === '调性分析图') {
        color.forEach((item, index) => {
          tonalityOption.series[index].itemStyle = {
            normal: {
              color: item
            }
          }
        })
      }
      if (titles === '调性分析图') {
        echarts.init(this.$refs.tonalityCharts).setOption(tonalityOption)
      }
      if (titles === '传播趋势图') {
        echarts.init(this.$refs.charts).setOption(tonalityOption)
      }
    },
    // 按年查询
    annualEnquiry() {
      const i = 4
      this.queryForm.startTime = ''
      this.queryForm.endTime = ''
      this.getTonalAnalysis(this.queryForm, i)
    },
    annualTrend() {
      const i = 4
      this.queryForm.startTime = ''
      this.queryForm.endTime = ''
      this.getspreadTrend(this.queryForm, i)
    },
    // 按月查询
    monthlyEnquiry() {
      if (this.monthlyValue) {
        const i = 7
        this.queryForm.startTime = new Date(this.monthlyValue[0]).getTime()
        this.queryForm.endTime =
          new Date(
            this.monthlyValue[1].slice(0, 4),
            this.monthlyValue[1].slice(6, 7),
            0
          ).getTime() +
          24 * 60 * 60 * 1000 -
          1
        this.getTonalAnalysis(this.queryForm, i)
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
        this.getTonalAnalysis(this.queryForm)
      }
    },
    monthlyTrend() {
      if (this.monthlyValue) {
        const i = 7
        this.queryForm.startTime = new Date(this.monthlyValue[0]).getTime()
        this.queryForm.endTime =
          new Date(
            this.monthlyValue[1].slice(0, 4),
            this.monthlyValue[1].slice(6, 7),
            0
          ).getTime() +
          24 * 60 * 60 * 1000 -
          1
        this.getspreadTrend(this.queryForm, i)
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
        this.getspreadTrend(this.queryForm)
      }
    },
    // 按日查询
    dailyEnquiry() {
      if (this.dailyValue) {
        const i = 0
        this.queryForm.startTime = this.dailyValue[0]
        this.queryForm.endTime = this.dailyValue[1]
        this.getTonalAnalysis(this.queryForm, i)
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
        this.getTonalAnalysis(this.queryForm)
      }
    },
    dailyTrend() {
      if (this.dailyValue) {
        const i = 0
        this.queryForm.startTime = this.dailyValue[0]
        this.queryForm.endTime = this.dailyValue[1]
        this.getspreadTrend(this.queryForm, i)
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
        this.getspreadTrend(this.queryForm)
      }
    },
    queryData(val) {
      if (this.dataType === '0') {
        this.queryForm.dataType = ''
        this.dataName = '全部'
      } else {
        this.queryForm.dataType = this.dataType
        this.dataName = val
      }
      this.newData = []
      this.distributeRecordFrom = []
      this.footer = false
      this.distributeRecord()
      this.visibleData = false
    },
    queryFrom() {
      this.queryForm.pageNo = 1
      if (this.radio === '0') {
        this.radioName = '全部'
        this.time = ''
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
      } else if (this.radio === '1') {
        this.radioName = '当天'
        this.time = ''
        const today = new Date(
          new Date(new Date().toLocaleDateString()).getTime()
        )
        this.queryForm.startTime = this.dateToMs(today)
        this.queryForm.endTime = this.dateToMs(today) + 24 * 60 * 60 * 1000
      } else if (this.radio === '2') {
        this.radioName = '近3天'
        this.time = ''
        const today = new Date(
          new Date(new Date().toLocaleDateString()).getTime()
        )
        this.queryForm.startTime =
          this.dateToMs(today) - 2 * 24 * 60 * 60 * 1000
        this.queryForm.endTime = this.dateToMs(today) + 24 * 60 * 60 * 1000
      } else if (this.radio === '3') {
        this.radioName = '近7天'
        this.time = ''
        const today = new Date(
          new Date(new Date().toLocaleDateString()).getTime()
        )
        this.queryForm.startTime =
          this.dateToMs(today) - 6 * 24 * 60 * 60 * 1000
        this.queryForm.endTime = this.dateToMs(today) + 24 * 60 * 60 * 1000
      } else if (this.radio === '4') {
        this.radioName = '自定义时间'
        this.queryForm.startTime = this.dateToMs(this.time[0])
        this.queryForm.endTime =
          this.dateToMs(this.time[1]) + 24 * 60 * 60 * 1000
      }
      if (this.removal === '0') {
        this.queryForm.deduplicate = ''
        this.removalName = '重复'
      } else {
        this.queryForm.deduplicate = false
        this.removalName = '不重复'
      }
      this.newData = []
      this.distributeRecordFrom = []
      this.footer = false
      this.distributeRecord()
      this.visibleTime = false
      this.visibleRepeat = false
    },
    // 隐藏时触发
    hideTrend() {
      this.dailyValue = ''
      this.monthlyValue = ''
    }
  }
}
</script>

<style lang='scss' scoped>
.img {
  vertical-align: top;
}
.fr {
  float: right;
  margin-right: 290px;
}
.loadMore {
  margin: 20px;
}
.icon-bell {
  color: #1296db;
  font-size: 30px;
  vertical-align: middle;
  // transform: rotate(180deg);
}
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
  .app-title {
    display: inline-block;
    // border-bottom: 1px solid #ccc;
    font-size: 20px;
    margin: 10px 0;
    .title {
      display: inline-block;
      padding: 8px;
      border-bottom: 5px solid #0984ff;
    }
  }
  .topic {
    margin-left: 35px;
    font-size: 16px;
    text-indent: 2em;
    line-height: 28px;
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
  .app-body {
    margin-left: 90px;
    font-size: 15px;
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
  .app-footer {
    text-align: center;
    color: #f76d37;
    margin-bottom: 20px;
    .el-button {
      width: 80%;
    }
  }
  #emotionCharts,
  #RouteCharts {
    width: 80%;
    margin: 20px 0 0 50px;
  }
  #tonalityCharts,
  #trendCharts {
    width: 80%;
    margin: 40px 0 0 50px;
  }
  #emotionCharts {
    height: 400px;
  }
  #RouteCharts {
    height: 800px;
  }
  #tonalityCharts,
  #trendCharts {
    height: 400px;
  }
  #word_cloud_view_id {
    display: inline-block;
    width: 60%;
    height: 400px;
    margin: 20px 0 0 50px;
  }
  .wordCloud {
    float: right;
    width: 25%;
    font-size: 16px;
    border: 1px solid #ebeef5;
    border-bottom: none;
    margin-right: 8%;
  }
}
</style>
