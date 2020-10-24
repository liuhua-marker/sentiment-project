<template>
  <div>
    <el-table v-loading="load" :data="tablefrom" border>
      <el-table-column label="序号" type="index" width="50" />
      <!-- <el-table-column v-if="userInfo.orgId === '0'" label="机构名称" prop="orgName" /> -->
      <!-- <el-table-column v-if="userInfo.orgId === '0'" label="部门名称" prop="deptName" /> -->
      <el-table-column label="目标公司" prop="companyName" />
      <el-table-column label="舆情总数量" width="230" prop="count" />
      <el-table-column label="最新舆情时间" width="320">
        <template
          slot-scope="scope"
        >{{ Number(scope.row.releaseTime) | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button type="primary" @click="details(scope.row)">详情</el-button>
          <el-popover width="424" trigger="click">
            <div :ref="'analysisEchart'+ scope.$index" style="width: 400px;height:400px;" />
            <el-button
              v-if="scope.row.nameValueResList"
              slot="reference"
              type="success"
              @click="analysisData(scope)"
            >分析</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { array } from 'jszip/lib/support'
// 引入基本模板
var echarts = require('echarts/lib/echarts')
export default {
  name: 'CompanyTable',
  props: {
    tablefrom: {
      type: array,
      default: []
    },
    load: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      userInfo: {}
    }
  },
  watch: {},
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
  },
  methods: {
    // 舆情脉络详情
    details(val) {
      this.$router.push({
        path:
          '/configuration/public_sentiment/details_page/company_public_page',
        query: {
          deptId: val.deptId,
          targetCompany: decodeURIComponent(val.companyName),
          orgId: val.orgId,
          deduplicate: false
        }
      })
    },
    // 分析
    analysisData(scope) {
      this.$nextTick(() => {
        this.getEchart(scope)
      })
    },
    getEchart(scope) {
      var data = scope.row.nameValueResList
      var legendData = data.map((item) => {
        return item.name
      })
      const option = {
        title: {
          text: '数据分析',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        legend: {
          type: 'scroll',
          top: 40,
          data: legendData
        },
        series: [
          {
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      echarts
        .init(this.$refs['analysisEchart' + scope.$index])
        .setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
#analysisEchart {
  width: 400px;
  height: 400px;
  // margin: 10px;
  // background-color: pink;
}
.el-table {
  width: 100%;
  margin: 10px 0;
}
</style>
