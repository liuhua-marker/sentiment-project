<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="18">
        <div v-if="JSON.stringify(distributeRecordForm) !== '{}'" class="box article">
          <div class="title">{{ distributeRecordForm.title }}</div>
          <el-row style="margin: 20px 0 50px">
            <el-col :span="8" style="margin-left: 30%">
              <div style="font-size: 16px;">
                发表时间:
                <span>{{ Number(distributeRecordForm.releaseTime) | parseTime() }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div style="font-size: 16px;">
                来源:
                <a
                  :href="distributeRecordForm.sourceUrl"
                  target="view_window"
                  style="color: #0984ff"
                >{{ distributeRecordForm.source === '' ? (distributeRecordForm.dataType === 'wechat' ? '微信': '未知') : distributeRecordForm.source }}</a>
              </div>
            </el-col>
          </el-row>
          <div class="content" v-html="distributeRecordForm.content" />
        </div>
      </el-col>
      <el-col :span="6">
        <div class="box vant_info">
          <div>主体机构</div>
          <div
            v-for="(val, key, i) in distributeRecordForm.mainCompanies"
            :key="i"
            class="info_about"
          >
            <i class="el-icon-office-building info_icon" />
            <el-button type="text" @click="details(distributeRecordForm, key)">{{ key }}</el-button>
          </div>
        </div>
        <div class="box vant_info cdct">
          <div class="clearfix">
            <div class="fl">传导穿透</div>
            <svg-icon icon-class="fullscreen" class="fullscreen_icon fr" @click="fullscreen" />
          </div>
          <div id="DaoCharts" ref="DaoCharts" />
        </div>
      </el-col>
    </el-row>
    <!-- 传到弹框 -->
    <el-dialog title="传导穿透" :visible.sync="fullscreenDialogVisible" width="50%" center>
      <div id="dialogCharts" ref="dialogCharts" />
    </el-dialog>
  </div>
</template>

<script>
import { yqSearchInfo } from '@/api/public_sentiment/public_sentiment_page'
// import screenfull from 'screenfull'

// 引入基本模板
var echarts = require('echarts/lib/echarts')
// 引入柱状图组件
require('echarts/lib/chart/bar')
// 引入提示框和title组件
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
import 'echarts/theme/macarons.js'

export default {
  name: 'AlertPublicPage',
  data() {
    return {
      // 表单数据
      distributeRecordForm: {},
      fullscreenDialogVisible: false
    }
  },
  watch: {
    async $route() {
      this.getDistributeRecord(this.$route.query.id)
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
    this.getDistributeRecord(this.$route.query.id)
  },
  methods: {
    getDistributeRecord(id) {
      yqSearchInfo(id).then((res) => {
        this.distributeRecordForm = res.data
        if (!this.distributeRecordForm.nickname) {
          this.distributeRecordForm.nickname = '未知'
        }
        if (res.data.negativeSentences) {
          res.data.negativeSentences.forEach((val, index) => {
            const replaceReg = new RegExp(val, 'g')
            this.distributeRecordForm.content = this.distributeRecordForm.content.replace(
              replaceReg,
              `<span style="background-color: #faa0a0">${val}</span>`
            )
          })
        }
        const Reg = /【/g
        const Reg2 = /】/g
        if (res.data.emotionType === -1) {
          res.data.abstracts = res.data.abstracts.replace(
            Reg,
            '【<span style="color:#ff4949">'
          )
        }
        if (res.data.emotionType === 1) {
          res.data.abstracts = res.data.abstracts.replace(
            Reg,
            '【<span style="color:#13ce66">'
          )
        }
        res.data.abstracts = res.data.abstracts.replace(Reg2, '</span>】')
        if (res.data.abbs) {
          res.data.abbs.forEach((item) => {
            if (item === '公司') return
            const aa = /((?=[\x21-\x7e]+)[^A-Za-z0-9])/g
            item = item.replace(aa, '')
            const replaceReg1 = new RegExp(item, 'g')
            this.distributeRecordForm.abstracts = this.distributeRecordForm.abstracts.replace(
              replaceReg1,
              `<span style="color: #0984ff; font-weight: 700">${item}</span>`
            )
            this.distributeRecordForm.content = this.distributeRecordForm.content.replace(
              replaceReg1,
              `<span style="color: #0984ff; font-weight: 700">${item}</span>`
            )
          })
        }
        var myChart = echarts.init(document.querySelector('#DaoCharts'))
        this.boxData(myChart, res.data.spreadPathRes)
      })
    },
    boxData(myChart, data) {
      myChart.showLoading()
      const arr = data.data.map((x) => x.category)
      const newArr = arr.filter((x, index, self) => self.indexOf(x) === index)
      const colorArr = [
        '#e02807',
        '#5845c2',
        '#2d90f3',
        '#40e0d0',
        '#054ac9',
        '#e40fdd',
        '#ffa600'
      ]
      const color = {}
      const categories = []
      newArr.forEach((item, i) => {
        color[item] = colorArr[i]
        categories.push({
          name: item,
          itemStyle: {
            color: color[item]
          }
        })
      })
      data.data.forEach((node) => {
        node.itemStyle = {
          normal: {
            shadowBlur: 10,
            shadowColor: color[node.category],
            color: color[node.category]
          }
        }
      })
      data.links.forEach((link) => {
        link.label = {
          align: 'center',
          fontSize: 12
        }
        link.lineStyle = {
          color: '#000'
        }
      })
      var option = {
        legend: [
          {
            type: 'scroll',
            orient: 'horizontal',
            left: 'left',
            top: 10,
            tooltip: {
              show: true
            },
            selectedMode: 'false',
            data: categories.map((x) => x.name)
          }
        ],
        series: [
          {
            type: 'graph',
            layout: 'force',
            symbolSize: 40,
            draggable: true,
            roam: true,
            top: '20%',
            focusNodeAdjacency: true,
            categories: categories,
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [0, 0],
            edgeLabel: {
              normal: {
                show: true,
                textStyle: {
                  fontSize: 12
                },
                formatter(x) {
                  return x.data.name
                }
              }
            },
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            force: {
              gravity: 0,
              edgeLength: 70,
              repulsion: 700
            },
            data: data.data,
            links: data.links
          }
        ]
      }
      myChart.setOption(option, true)
      myChart.hideLoading()
    },
    // 舆情脉络详情
    details(val, key) {
      this.$router.push({
        path:
          '/configuration/public_sentiment/details_page/company_public_page',
        query: {
          deptId: val.deptId,
          targetCompany: key,
          orgId: val.orgId,
          deduplicate: 0
        }
      })
    },
    fullscreen() {
      this.fullscreenDialogVisible = true
      setTimeout(() => {
        var myChart = echarts.init(document.querySelector('#dialogCharts'))
        this.boxData(myChart, this.distributeRecordForm.spreadPathRes)
      }, 500)
    }
    // fullscreen() {
    //   const element = document.getElementById('DaoCharts')
    //   if (screenfull.enabled) {
    //     screenfull.toggle(element)
    //   }
    // },
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  font-size: 16px;
  .box {
    width: 100%;
    min-height: 60px;
    background: #fff;
    box-sizing: border-box;
  }
  .article {
    padding: 20px;
  }
  .vant_info {
    padding: 10px;
    margin-bottom: 10px;
    min-height: 200px;
    .info_about {
      line-height: 40px;
    }
    .info_icon {
      vertical-align: middle;
      font-size: 18px;
    }
    .info_text {
      color: #409eff;
    }
  }
  .title {
    text-align: center;
    font-size: 30px;
    font-weight: 700;
  }
  .content {
    font-size: 18px;
    line-height: 40px;
    margin: 0 30px;
    text-align: justify;
  }
  #dialogCharts {
    width: 100%;
    height: 700px;
  }
  .cdct {
    height: 500px;
  }
  #DaoCharts {
    width: 100%;
    height: 100%;
    background: #fff;
  }

  .fullscreen_icon {
    cursor: pointer;
  }
}
</style>
