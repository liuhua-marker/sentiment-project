<template>
  <div class="app">
    <el-collapse v-model="activeName">
      <el-collapse-item title="筛选" :name="1">
        <!-- 时间 -->
        <div class="box_change">
          <span class="box_text">时间</span>
          <div class="box_sx">
            <el-radio v-model="radio" label="0">全部</el-radio>
            <el-radio v-model="radio" label="1">当天</el-radio>
            <el-radio v-model="radio" label="2">近3天</el-radio>
            <el-radio v-model="radio" label="3">近7天</el-radio>
            <el-radio v-model="radio" label="4">自定义时间</el-radio>
            <span v-if="radio === '4'" style="margin-top: 20px">
              <el-date-picker
                v-model="time"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </span>
          </div>
        </div>
        <!-- 是否去重 -->
        <div class="box_change">
          <span class="box_text">是否去重</span>
          <div class="box_sx">
            <el-radio v-model="queryform.deduplicate" :label="false"
              >去重</el-radio
            >
            <el-radio v-model="queryform.deduplicate" label="">不去重</el-radio>
          </div>
        </div>
        <!-- 预警级别 -->
        <div class="box_change">
          <span class="box_text">预警级别</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.contentGrades">
              <el-checkbox
                v-for="(v, k, i) in optionContentGrade"
                :key="i"
                :label="v"
                >{{ k }}</el-checkbox
              >
            </el-checkbox-group>
          </div>
        </div>
        <!-- 数据类型 -->
        <div class="box_change">
          <span class="box_text">数据类型</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.sourceTypes">
              <el-checkbox
                v-for="item in optionsSource"
                :key="item.sourceTypeId"
                :label="item.typeCode"
                >{{ item.typeName }}</el-checkbox
              >
            </el-checkbox-group>
          </div>
        </div>
        <!-- 情感类型 -->
        <div class="box_change">
          <span class="box_text">情感类型</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.emotionTypes">
              <el-checkbox
                v-for="(val, key, i) in options"
                :key="i"
                :label="val"
                >{{ key }}</el-checkbox
              >
            </el-checkbox-group>
          </div>
        </div>
        <!-- 传导关系 -->
        <div v-if="isChuandao" class="box_change">
          <span class="box_text">传导关系</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.transmission">
              <el-checkbox
                v-for="item in optionsTransmission"
                :key="item"
                :label="item"
                >{{ item }}</el-checkbox
              >
            </el-checkbox-group>
          </div>
        </div>
        <!-- 机构 --><!-- 部门 -->
        <div
          v-if="userInfo.orgId === '0' || userInfo.deptId === '0'"
          class="box_change"
        >
          <div v-if="userInfo.orgId === '0' && isDept" class="box_line">
            <span class="box_text">机构</span>
            <el-select v-model="queryform.orgId" @change="systemDept">
              <el-option
                v-for="item in optionsSystem"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
          <div v-if="userInfo.deptId === '0' && isDept" class="box_line">
            <span class="box_text">部门</span>
            <el-select v-model="queryform.deptId" placeholder="全部">
              <el-option
                v-for="item in optionsSystemDept"
                :key="item.id"
                :label="item.deptName"
                :value="item.id"
              />
            </el-select>
          </div>
        </div>
        <!-- 目标公司 --><!-- 关键词 -->
        <div v-if="isCompany" class="box_change">
          <div class="box_line">
            <span class="box_text">目标公司</span>
            <el-autocomplete
              v-model="queryform.targetCompany"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入关键字"
              value-key="companyName"
              @select="searchSelect"
              class="input-with-select"
            >
              <template slot-scope="{ item }">
                <div class="compare-name" v-html="item.companyName" />
              </template>
            </el-autocomplete>
          </div>

          <div class="box_line">
            <span class="box_text">关键词</span>
            <el-input
              placeholder="请输入关键词"
              v-model="queryform.keyword"
              clearable
            />
          </div>
        </div>
        <div
          v-if="userInfo.deptId !== '0' && !userInfo.isAdmin"
          class="box_change"
        >
          <div class="box_line">
            <span class="box_text">目标组合</span>
            <el-select
              v-model="queryform.companyCombSubId"
              clearable
              placeholder="请选择目标组合"
            >
              <el-option
                v-for="item in optionsCompanyCombSub"
                :key="item.companyCombSubId"
                :label="item.subName"
                :value="item.companyCombSubId"
              />
            </el-select>
          </div>
        </div>
        <!-- 预警类型 目标组合-->
        <div class="box_change">
          <div v-if="isEvent" class="box_line">
            <span class="box_text">事件标签</span>
            <el-cascader
              v-model="event"
              :options="optionsLabel"
              :props="{ multiple: true, checkStrictly: true, value: 'label' }"
              clearable
              filterable
            >
            </el-cascader>
          </div>
        </div>
        <div class="box_change">
          <div class="box_btn">
            <el-button type="primary" size="mini" class="search" @click="queryFrom"
              >查 询</el-button
            >
            <el-button class="search" size="mini" @click="reset">重 置</el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { confdatasourcetype } from '@/api/dashboard'
import {
  listByEventName,
  listByTypeName,
  getTransmitList,
  getThreeLevelLabels,
} from '@/api/public_sentiment/public_sentiment_page'
import { system, systemDept } from '@/api/analysis/hot_analysis'
import { listByCompanyName } from '@/api/public_sentiment/public_sentiment_page'
import { confCompanyCombinationSubscribe } from '@/api/enterprise/enterpriseTotal'

export default {
  name: 'Popover',
  props: {
    queryforms: {
      type: Object,
      default: function () {
        return {
          pageNo: 1,
          pageSize: 10,
          deptId: '',
          orgId: '',
          targetCompany: '', //目标公司
          contentGrades: [], //预警级别
          emotionTypes: [], //情感类型
          sourceTypes: [], //数据类型
          startTime: '',
          endTime: '',
          deduplicate: '', //是否去重
          analysisTimeSort: false, //是否按分析时间排序
          signals: [], //预警类型
          eventTypes: [], //事件类型 一级
          eventNames: [], //事件名称  二级
          eventWords: [], // 三级
          transmission: [], //传导关系编码
          keyword: '', //关键词查询
        }
      },
    },
    isEvent: {
      type: Boolean,
      default: true,
    },
    isDept: {
      type: Boolean,
      default: false,
    },
    isCompany: {
      type: Boolean,
      default: true,
    },
    isChuandao: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      activeName: 1,
      loadingEvent: false,
      queryform: this.queryforms,
      optionContentGrade: {
        零级: '0',
        一级: '1',
        二级: '2',
        三级: '3',
        四级: '4',
        五级: '5',
      },
      radio: '0',
      time: '',
      optionsSource: [],
      options: {
        正面: 1,
        中性: 0,
        负面: -1,
      },
      optionsCompanyCombSub: [], // 组合预警
      optionsEventTypes: [], // 预警类型
      optionsEventNames: [], // 事件标签
      optionsTransmission: [], // 传导关系
      optionsSystem: [], // 机构
      optionsSystemDept: [], //部门
      optionsLabel: [],
      event: [],
    }
  },
  watch: {
    queryforms: {
      // 深度监听，可监听到对象、数组的变化
      handler(val) {
        // do something, 可使用this
        this.queryform = val
      },
      deep: true,
    },
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    if (this.userInfo.orgId !== '0') {
      this.queryform.orgId = this.userInfo.orgId
      this.queryform.deptId = this.userInfo.deptId
    }
    this.getCreat()
  },
  methods: {
    async getCreat() {
      if (this.userInfo.orgId === '0' && this.isDept) {
        await this.systemOrg()
      }
      if (this.userInfo.deptId !== '0' && !this.userInfo.isAdmin) {
        await this.getSub()
      }
      // 获取页面数据
      this.getLabel()
      this.sourceData()
      setTimeout(() => {
        this.getTransmitList()
      }, 1000)
    },
    // 标准的时间格式转为时间戳
    dateToMs(date) {
      const result = new Date(date).getTime()
      return result
    },
    // 部门
    systemDept() {
      const orgId = { orgIds: [this.queryform.orgId] }
      systemDept(orgId).then((res) => {
        this.optionsSystemDept = res.rows
        this.queryform.deptId = res.rows[0].id
      })
    },
    // 机构
    systemOrg() {
      const data = {}
      system(data).then((res) => {
        this.optionsSystem = res.rows
        this.queryform.orgId = res.rows[0].id
        this.systemDept()
      })
    },
    // 监控组合
    getSub() {
      confCompanyCombinationSubscribe({}).then((res) => {
        this.optionsCompanyCombSub = res.rows
        this.queryform.companyCombSubId = res.rows[0].companyCombSubId
      })
    },
    // 数据类型
    sourceData() {
      const solutionForm = {
        deptId: this.userInfo.deptId,
        pageNo: 1,
        pageSize: 100,
      }
      if (!this.visibleData) {
        confdatasourcetype(solutionForm).then((res) => {
          this.optionsSource = res.rows
        })
      }
    },
    // 传导关系
    getTransmitList() {
      getTransmitList().then((res) => {
        this.optionsTransmission = res.data
        if (this.isChuandao) {
          this.queryform.transmission = res.data
        }
        this.$emit('RefreshData', this.queryform)
      })
    },
    // 事件标签
    getLabel() {
      getThreeLevelLabels().then((res) => {
        this.optionsLabel = res.data
      })
    },
    // 公司名提示
    querySearchAsync(val, cb) {
      const queryString = val.trim()
      if (queryString.trim().length > 1) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          this.getCompanyName(queryString, cb)
        }, 100)
      } else {
        this.restaurants = []
        cb(this.restaurants)
      }
    },
    getCompanyName(name, cb) {
      this.loadingEvent = true
      this.restaurants = []
      const data = {
        companyName: name,
        pageNo: 1,
        pageSize: 5,
      }
      listByCompanyName(data).then((res) => {
        this.restaurants = res.rows
        const reg = new RegExp(name, 'g')
        this.restaurants.forEach((item) => {
          item.companyName = item.companyName.replace(
            reg,
            `<span style="color: #ff4949">${name}</span>`
          )
        })
        this.loadingEvent = false
        cb(this.restaurants)
      })
    },
    searchSelect() {
      this.queryform.targetCompany = this.queryform.targetCompany
        .replace(/<[^>]*>/g, '')
        .trim()
    },
    queryFrom(val) {
      this.queryform.pageNo = 1
      // 时间
      const today = new Date(
        new Date(new Date().toLocaleDateString()).getTime()
      )
      if (this.radio === '0') {
        this.time = ''
        this.queryform.startTime = ''
        this.queryform.endTime = ''
      } else if (this.radio === '1') {
        this.time = ''
        this.queryform.startTime = this.dateToMs(today)
        this.queryform.endTime = new Date().getTime()
      } else if (this.radio === '2') {
        this.time = ''
        this.queryform.startTime =
          this.dateToMs(today) - 2 * 24 * 60 * 60 * 1000
        this.queryform.endTime = new Date().getTime()
      } else if (this.radio === '3') {
        this.time = ''
        this.queryform.startTime =
          this.dateToMs(today) - 6 * 24 * 60 * 60 * 1000
        this.queryform.endTime = new Date().getTime()
      } else if (this.radio === '4') {
        this.queryform.startTime = this.dateToMs(this.time[0])
        this.queryform.endTime =
          this.dateToMs(this.time[1]) + 24 * 60 * 60 * 1000
      }
      // 事件标签
      this.queryform.eventTypes = []
      this.queryform.eventNames = []
      this.queryform.eventWords = []
      this.event.forEach((item) => {
        if (item.length === 1) {
          this.queryform.eventTypes.push(item[0])
        } else if (item.length === 2) {
          this.queryform.eventNames.push(item[1])
        } else if (item.length === 3) {
          this.queryform.eventWords.push(item[2])
        }
      })
      this.RefreshData()
    },
    reset() {
      this.queryform.pageNo = 1
      this.queryform.pageSize = 10
      if (this.optionsSystemDept.length > 0) {
        this.queryform.deptId = this.optionsSystemDept[0].id
      }
      if (this.optionsSystem.length > 0) {
        this.queryform.orgId = this.optionsSystem[0].id
      }
      if (this.userInfo.deptId !== '0' && !this.userInfo.isAdmin) {
        this.queryform.companyCombSubId = this.optionsCompanyCombSub[0].companyCombSubId
      }
      this.radio = '0'
      this.time = ''
      if (this.isCompany) {
        this.queryform.targetCompany = ''
      }
      this.queryform.contentGrades = [] //预警级别
      this.queryform.emotionTypes = [] //情感类型
      this.queryform.sourceTypes = [] //数据类型
      this.queryform.startTime = ''
      this.queryform.endTime = ''
      this.queryform.deduplicate = false //是否去重
      this.queryform.eventTypes = []
      this.queryform.eventNames = []
      this.queryform.eventWords = []
      this.event = []
      this.queryform.analysisTimeSort = false //是否按分析时间排序
      if (this.isChuandao) {
        this.queryform.transmission = this.optionsTransmission //传导关系编码
      }
      this.queryform.keyword = ''
      this.RefreshData()
    },
    RefreshData() {
      this.$emit('RefreshData', this.queryform)
    },
  },
}
</script>

<style lang="scss" scoped>
.app {
  margin-top: 0.1rem;
  .el-collapse {
    border-top: 0;
  }
  /deep/ .el-collapse-item__content {
    padding-bottom: 0.2rem;
  }
  .el-collapse-item {
    border-radius: 0.05rem;
    overflow: hidden;
  }
  /deep/.el-collapse-item__wrap {
    border-bottom: 0;
  }
  /deep/ .el-collapse-item__header {
    // background: #f8f8f9;
    background: #fff;
    font-size: 0.14rem;
    padding-left: 0.3rem;
    height: 0.3rem;
    color: #409eff;
    border-bottom: 0;
  }
  .box_change {
    padding: 0.05rem 0;
    margin: 0 0.3rem;
    // border-bottom: 1px solid #eee;
    .box_text {
      display: inline-block;
      width: 85px;
      box-sizing: border-box;
      padding-right: 15px;
      text-align: right;
    }
    .box_btn {
      // text-align: center;
      .search {
        font-size: 0.16rem;
      }
      .search:first-child {
        margin-left: 800px;
      }
    }
  }
  .box_line {
    display: inline-block;
    margin-right: 20px;
  }
  .box_sx {
    display: inline-block;
    min-width: 5rem;
  }
  .el-input,
  .el-select,
  .el-autocomplete {
    display: inline-block;
    width: 300px;
  }
  .el-cascader {
    display: inline-block;
    width: 705px;
  }
  /deep/.el-cascader__tags {
    max-height: 100px;
    overflow: hidden;
    overflow-y: scroll;
  }
}
</style>
