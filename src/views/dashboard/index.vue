<template>
  <div class="dashboard_main">
    <panel-group ref="top" :homepage="homePage" />
    <!-- <component :is="currentRole" /> -->
    <div class="data_box">
      <!-- 舆情脉络图 -->
      <!-- <vue-draggable-resizable-gorkys
        :w="900"
        :h="738"
        :isConflictCheck="true"
        :snap="true"
        :snapTolerance="30"
        class-name="my-class"
        style="transition: none; will-change: transform;"
      >-->
      <el-card class="app-main">
        <div slot="header" class="clearfix">
          <span>
            <span class="el-icon-tickets">
              预警
              <!-- 部门用户 -->
              <span v-if="userInfo.orgId !== '0' && userInfo.deptId !== '0'">
                <span v-if="userInfo.isAdmin">{{ userInfo.name }}</span>
                <el-select
                  v-else
                  v-model="queryForm.companyCombSubId"
                  clearable
                  placeholder="请选择目标组合"
                  @change="distributeRecord"
                >
                  <el-option
                    v-for="item in optionsCompanyCombSub"
                    :key="item.companyCombSubId"
                    :label="item.subName"
                    :value="item.companyCombSubId"
                  />
                </el-select>
              </span>
            </span>
            <!-- 超级管理员 -->
            <el-cascader
              v-if="userInfo.orgId === '0' && userInfo.deptId === '0'"
              v-model="selectedOptions"
              expand-trigger="hover"
              placeholder="搜索"
              :options="dataFollow"
              :props="defaultProps"
              filterable
              @change="dataFollowHandleChange"
            />
            <!-- 机构 -->
            <el-select
              v-if="userInfo.orgId !== '0' && userInfo.deptId === '0'"
              v-model="selectedOption"
              placeholder="请选择"
              @change="dataFollowChange"
            >
              <el-option
                v-for="item in deptOptions"
                :key="item.id"
                :label="item.deptName"
                :value="item.id"
                >{{ item.deptName }}</el-option
              >
            </el-select>
          </span>
          <el-button
            type="text"
            :disabled="disabled"
            style="font-size: 16px"
            class="fr"
            @click="Refresh"
          >
            <i class="el-icon-refresh" style="font-size: 20px" />
          </el-button>
        </div>
        <div v-loading="load1">
          <div
            v-if="distributeRecordFrom && distributeRecordFrom.length === 0"
            style="margin-top: 20px"
          >
            暂无数据
          </div>
          <div class="time_line">
            <timeline
              v-if="distributeRecordFrom.length !== 0"
              timeline-theme="#ccc"
              timeline-bg="#998"
            >
              <template>
                <div v-for="(item, index) in distributeRecordFrom" :key="index">
                  <timeline-item bg-color="#3488d6">
                    <div class="time_style">{{ item.releaseTimeStr }}</div>
                    <div style="display: inline-block; width: 95%">
                      <a href="javascript:;" @click="detailsPage(item.id)">
                        <h3 class="pic">
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
                        </h3>
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
                          >预警类型：</b
                        >
                        <span v-for="(val, j) in item.signalNames" :key="j">{{
                          val
                        }}</span>
                        <b style="margin-left: 20px">目标公司：</b>
                        <span>{{ item.companyName }}</span>
                      </p>
                      <p class="content">
                        <b>事件标签：</b>
                        <span v-for="(val, j) in item.labelNames" :key="j">{{
                          val
                        }}</span>
                      </p>
                      <p class="content">
                        <!-- <b>分析时间：</b>
                        <span>{{ Number(item.analysisTime) | parseTime() }}</span> -->
                        <b>数据类型：</b>
                        <span>{{ item.sourceTypeName }}</span>
                        <b style="margin-left: 20px">来源：</b>
                        <span>{{
                          item.source === '' ? '未知' : item.source
                        }}</span>
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
      </el-card>
      <!-- </vue-draggable-resizable-gorkys> -->
      <!-- 表 -->
      <!-- <vue-draggable-resizable-gorkys
        :w="900"
        :h="438"
        :isConflictCheck="true"
        :snap="true"
        :snapTolerance="30"
        class-name="my-class"
        style="transition: none; will-change: transform;"
      >-->
      <el-card v-loading="loadEcharts" class="app-main">
        <div id="myChart1" ref="charts" />
        <div id="myChart2" ref="chart" />
      </el-card>
      <!-- </vue-draggable-resizable-gorkys> -->
      <!-- <vue-draggable-resizable-gorkys
        :w="900"
        :h="338"
        :isConflictCheck="true"
        :snap="true"
        :snapTolerance="30"
        class-name="my-class"
        style="transition: none; will-change: transform;"
      >
        <el-card v-loading="loadEcharts" class="app-main">
          <div id="myChart1" ref="charts" />
          <div id="myChart2" ref="chart" />
        </el-card>
      </vue-draggable-resizable-gorkys>-->
    </div>
    <!-- <iframe
      src="http://192.168.36.172:8888//#/dashboard?token=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ5dW4iLCJ1c2VySWQiOjEyODA3NzUyODQ4NjExNzM3NjEsIm5hbWUiOiLkupEiLCJleHAiOjE1OTc4MzAwNTR9.DWw3ZPhu_JadD81vNCaym989_rYYnslU4iY5JCXI5Kt5Aubv-ChVPApOfj9yYkt9R9skhaLPQtomZIXtBKi6p7jtCeLk9YIVpaaDdJAGa63oQZYSrI5ZXHDI-i1NZOpDVGdwRuCj92fyBK_4NwRWGWPmlJwb_sLHXGyIJtYTvoY"
      frameborder="0"
      style="width: 100%;height: 1000px;"
    ></iframe>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import adminDashboard from './admin'
// import editorDashboard from './editor'
import PanelGroup from './admin/components/PanelGroup'
import {
  system,
  dataSourceTypeBarChart,
  dataSourceTypePie,
  queryAllDept,
} from '@/api/dashboard'
import { distributeRecord } from '@/api/public_sentiment/alert_public_sentiment'
import { confCompanyCombinationSubscribe } from '@/api/enterprise/enterpriseTotal'
import { findTargetCombinationWarning } from '@/api/public_sentiment/public_sentiment_page'
// import { login } from '@/api/user'
import Timeline from '@/views/components/timeline'
import TimelineItem from '@/views/components/timelineItem'
// import TimelineTitle from '@/views/components/timelineTitle'
import { Downline } from '@/utils/esresize'
// import VueDraggableResizable from 'vue-draggable-resizable'
// import VueDraggableResizableGorkys from 'vue-draggable-resizable-gorkys'
// import { getToken } from '@/utils/auth'

export default {
  name: 'Dashboard',
  // components: { adminDashboard, editorDashboard },
  components: { Timeline, TimelineItem, PanelGroup },

  data() {
    return {
      load1: true,
      loadEcharts: true,
      disabled: true,
      // currentRole: 'editorDashboard',
      userInfo: {},
      queryForm: {
        deptId: '',
        orgId: '',
        pageNo: 1,
        pageSize: 10,
        deduplicate: false,
        analysisTimeSort: false,
      },
      homePage: {},
      distributeRecordFrom: '',
      optionsSource: [],
      solutionForm: {
        deptId: '0',
        pageNo: 1,
        pageSize: 100,
      },
      dialogVisible: false,
      total: 0,
      dataFollow: [],
      defaultProps: {
        children: 'deptDtos',
        label: 'name',
        value: 'id',
      },
      selectedOptions: [],
      selectedOption: '',
      deptOptions: [],
      check: [],
      optionsCompanyCombSub: [],
    }
  },
  computed: {
    ...mapGetters(['isDot']),
  },
  watch: {
    isDot: {
      // 深度监听，可监听到对象、数组的变化
      handler(newV, oldV) {
        if (this.isDot) {
          this.distributeRecord()
        }
      },
    },
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    this.get()
  },
  methods: {
    handleIsDot() {
      this.$store.dispatch('app/isDot', false)
    },
    async get() {
      // 获取数据类型
      await this.getConfdatasourcetype()
      await this.distributeRecord()
    },
    async getConfdatasourcetype() {
      var that = this
      // 机构部门
      if (this.userInfo.orgId === '0' && this.userInfo.deptId === '0') {
        const row = await system()
        this.dataFollow = row.data
        this.dataFollow.forEach((item) => {
          item.deptDtos.forEach((val) => {
            val.name = val.deptName
          })
        })
        this.selectedOptions = [
          this.dataFollow[0].id,
          this.dataFollow[0].deptDtos[0].id,
        ]
        this.queryForm.orgId = this.dataFollow[0].id
        this.queryForm.deptId = this.dataFollow[0].deptDtos[0].id
        setTimeout(() => {
          that.$refs.top.getHomePageIndex()
        }, 1000)
      }
      if (this.userInfo.orgId !== '0' && this.userInfo.deptId === '0') {
        this.queryForm.orgId = this.userInfo.orgId
        const res = await queryAllDept(this.userInfo.orgId)
        this.deptOptions = res.data
        this.queryForm.deptId = this.deptOptions[0].id
        this.selectedOption = this.deptOptions[0].id
        setTimeout(() => {
          that.$refs.top.getHomePageIndex()
        }, 1000)
      }
      if (this.userInfo.orgId !== '0' && this.userInfo.deptId !== '0') {
        this.queryForm.orgId = this.userInfo.orgId
        this.queryForm.deptId = this.userInfo.deptId
        this.queryForm.companyCombSubId = ''
        confCompanyCombinationSubscribe({}).then((res) => {
          this.optionsCompanyCombSub = res.rows
        })
        if (this.userInfo.isAdmin) {
          setTimeout(() => {
            that.$refs.top.getHomePageIndex()
          }, 1000)
        } else {
          this.getchart()
        }
      }
    },
    // 跳转到详情页
    detailsPage(val) {
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/alert_public_page',
        query: { id: val },
      })
    },
    distributeRecord() {
      this.disabled = true
      if (
        this.userInfo.orgId !== '0' &&
        this.userInfo.deptId !== '0' &&
        !this.userInfo.isAdmin
      ) {
        this.homePage.companyCombSubId = this.queryForm.companyCombSubId
        this.$refs.top.getHomePageIndex(this.homePage)
        findTargetCombinationWarning(this.queryForm).then((res) => {
          this.shudata(res)
        })
      } else {
        distributeRecord(this.queryForm).then((res) => {
          this.shudata(res)
        })
        this.getchart()
      }
      this.handleIsDot()
    },
    shudata(res) {
      this.load1 = false
      this.distributeRecordFrom = res.rows
      this.distributeRecordFrom.forEach((itemParent, index) => {
        if (itemParent.abbs) {
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
      this.total = res.total
    },
    getchart() {
      const TypeBarChart = {
        deptId: this.queryForm.deptId,
        orgId: this.queryForm.orgId,
      }
      dataSourceTypeBarChart(TypeBarChart).then((res) => {
        this.loadEcharts = false
        const dom = 'myChart2'
        const option = {
          color: ['#13ce66', '#ff4949', '#666', '#409EFF'],
          title: {
            text: '预警数量（当月）',
          },
          barMaxWidth: 60,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {
            top: '20px',
            left: 'center',
            data: ['正面', '负面', '分发总数'],
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
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: res.data.categories,
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              name: '正面',
              type: 'bar',
              stack: '总量',
              data: res.data.positiveCounts,
            },
            {
              name: '负面',
              type: 'bar',
              stack: '总量',
              data: res.data.negativeCounts,
            },
            {
              name: '总量',
              type: 'scatter',
              symbolSize: 0.0001,
              itemStyle: {
                color: 'transparent',
              },
              label: {
                show: true,
                color: '#000',
                fontSize: 16,
                position: 'top',
                formatter: '{c}',
              },
              data: res.data.sumCounts,
            },
          ],
        }
        Downline(dom, option)
        this.disabled = false
      })
      dataSourceTypePie(TypeBarChart).then((ress) => {
        this.loadEcharts = false
        const dom = 'myChart1'
        const legendData = []
        ress.data.forEach((item, i) => {
          legendData.push(item.name)
        })
        const options = {
          title: {
            text: '数据总数（当月）',
            left: 'center',
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
          },
          legend: {
            type: 'scroll',
            orient: 'vertical',
            left: 10,
            data: legendData,
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
              name: '数据源类型',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                normal: {
                  show: false,
                  position: 'center',
                },
                emphasis: {
                  show: true,
                  textStyle: {
                    fontSize: '30',
                    fontWeight: 'bold',
                  },
                },
              },
              labelLine: {
                normal: {
                  show: false,
                },
              },
              data: ress.data,
            },
          ],
        }
        Downline(dom, options)
      })
    },
    // 刷新
    Refresh() {
      this.load1 = true
      document.querySelector('.time_line').scrollTop = 0
      if (this.queryForm.pageNo < this.total / this.queryForm.pageSize) {
        this.queryForm.pageNo++
      } else {
        this.queryForm.pageNo = 1
      }
      this.distributeRecord()
    },
    // 关注部门
    async dataFollowHandleChange() {
      this.loadEcharts = true
      this.load1 = true
      if (this.selectedOptions.length !== 0) {
        this.selectedOptions.forEach((item, i) => {
          this.dataFollow.forEach((val) => {
            if (item === val.id) {
              this.queryForm.orgId = item
            } else {
              this.queryForm.deptId = item
            }
          })
        })
        this.queryForm.pageNo = 1
      }
      this.distributeRecord()
    },
    dataFollowChange() {
      this.queryForm.pageNo = 1
      this.queryForm.deptId = this.selectedOption
      this.distributeRecord()
    },
    queryQuanIndex() {
      this.loading = true
      this.queryForm.pageNo = 1
    },
  },
}
</script>
<style lang="scss" scoped>
.dashboard_main {
  padding: 0.15rem;
}
/deep/.el-card__body {
  padding: 0.1rem;
}
/deep/.el-card__header {
  padding: 0.1rem;
  padding-bottom: 0.02rem;
}
.my-class {
  display: inline-block;
  width: 4.5rem;
  height: 738px;
  background: #ffffff;
  border: 0;
  margin-right: 20px;
}
.data_box {
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  margin: 0.1rem 0;
}
.pic {
  margin: 0;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  .el-tag {
    margin-right: 0.05rem;
  }
}
.el-icon-tickets {
  font-size: 0.18rem;
  line-height: 20px;
  margin-right: 0.1rem;
  color: #409eff;
}
.time_line {
  height: 664px;
  overflow: auto;
}
.app-main:first-child {
  margin-left: 0;
}
.app-main {
  flex: 12;
  display: inline-block;
  height: 738px;
  margin-left: 0.1rem;
  margin-bottom: 20px;
  text-align: left;
  .time_style {
    display: inline-block;
    position: absolute;
    left: -1.6rem;
    line-height: 20px;
    width: 1rem;
    height: 20px;
    font-size: 0.14rem;
    text-align: right;
    color: #4ba5fa;
  }
  .timeline-item {
    margin-top: 0.05rem;
    padding-bottom: 0;
    border-bottom: 1px dashed #ccc;
    width: 84%;
    float: right;
  }
  .content {
    font-size: 0.12rem;
    line-height: 20px;
    margin: 5px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
  }
}
#myChart1 {
  width: 100%;
  height: 310px;
  margin-bottom: 20px;
}
#myChart2 {
  height: 375px;
  width: 100%;
}
</style>
