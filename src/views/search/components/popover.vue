<template>
  <div class="app">
    <el-collapse v-model="active">
      <el-collapse-item title="高级筛选" :name="1">
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
            <el-radio v-model="queryform.deduplicate" :label="false">去重</el-radio>
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
        <div class="box_change">
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
        <div class="box_change">
          <div class="box_btn">
            <el-button
              type="primary"
              size="mini"
              class="search"
              @click="queryFrom"
              >查 询</el-button
            >
            <el-button class="search" size="mini" @click="reset"
              >重 置</el-button
            >
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
} from '@/api/public_sentiment/public_sentiment_page'
import { system, systemDept } from '@/api/analysis/hot_analysis'

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
          eventTypes: [], //事件类型
          eventNames: [], //事件名称
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
    activeName: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      // 表单数据
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
      optionsTransmission: [], // 传导关系
      active: 0
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
    activeName(e) {
      this.active = e
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.sourceData()
    this.getTransmitList()
  },
  methods: {
    // 标准的时间格式转为时间戳
    dateToMs(date) {
      const result = new Date(date).getTime()
      return result
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
        this.queryform.transmission = res.data
        this.$emit('RefreshData', this.queryform)
      })
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
      this.RefreshData()
    },
    reset() {
      this.queryform.pageNo = 1
      this.queryform.pageSize = 10
      this.radio = '0'
      this.time = ''
      this.queryform.contentGrades = [] //预警级别
      this.queryform.emotionTypes = [] //情感类型
      this.queryform.sourceTypes = []  //数据类型
      this.queryform.startTime = ''
      this.queryform.endTime = ''
      this.queryform.deduplicate = false  //是否去重
      this.queryform.analysisTimeSort = false  //是否按分析时间排序
      this.queryform.transmission = this.optionsTransmission //传导关系编码
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
  margin-top: 0.03rem;
  .el-collapse {
    border-top: 0;
    border-bottom: 1px dashed #ccc;
  }
  /deep/ .el-collapse-item__content {
    padding-bottom: 0.05rem;
    background: #f8f8f9;
  }
  .el-collapse-item {
    border-radius: 0.05rem;
    overflow: hidden;
  }
  /deep/.el-collapse-item__wrap {
    border-bottom: 1px dashed #ccc;
  }
  /deep/ .el-collapse-item__header {
    background: #f8f8f9;
    font-size: 0.16rem;
    padding-left: 0.3rem;
    height: 0.3rem;
    color: #409eff;
    border-top: 0;
    border-bottom: 1px dashed #ccc;
  }
  .box_change {
    padding: 0.05rem 0;
    margin: 0 0.3rem;
    // border-bottom: 1px solid #eee;
    .box_text {
      display: inline-block;
      width: 100px;
      box-sizing: border-box;
      padding-left: 0.06rem;
    }
    .box_btn {
      text-align: center;
    }
  }
  .box_sx {
    display: inline-block;
    margin-left: 0.1rem;
    min-width: 5rem;
  }
}
</style>
