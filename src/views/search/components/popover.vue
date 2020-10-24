<template>
  <div class="app">
    <el-collapse>
      <el-collapse-item title="高级筛选" name="1">
        <!-- 时间 -->
        <div class="box_change">
          <span class="box_text">时间：</span>
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
          <span class="box_text">是否去重：</span>
          <div class="box_sx">
            <el-radio v-model="queryform.deduplicate" label="">去重</el-radio>
            <el-radio
              v-model="queryform.deduplicate"
              :label="false"
            >不去重</el-radio>
          </div>
        </div>
        <!-- 预警级别 -->
        <div class="box_change">
          <span class="box_text">预警级别：</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.contentGrade">
              <el-checkbox
                v-for="(v, k, i) in optionContentGrade"
                :key="i"
                :label="v"
              >{{ k }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <!-- 数据源类型 -->
        <div class="box_change">
          <span class="box_text">数据源类型：</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.sourceType">
              <el-checkbox
                v-for="item in optionsSource"
                :key="item.sourceTypeId"
                :label="item.typeCode"
              >{{ item.typeName }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <!-- 倾向性查询 -->
        <div class="box_change">
          <span class="box_text">倾向性查询：</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.emotionType">
              <el-checkbox
                v-for="(val, key, i) in options"
                :key="i"
                :label="val"
              >{{ key }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <!-- 传导关系 -->
        <div class="box_change">
          <span class="box_text">传导关系：</span>
          <div class="box_sx">
            <el-checkbox-group v-model="queryform.transmission">
              <el-checkbox
                v-for="item in optionsTransmission"
                :key="item"
                :label="item"
              >{{ item }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <!-- 预警类型 -->
        <div class="box_change">
          <span class="box_text">预警类型：</span>
          <el-select
            v-model="queryform.eventTypeCode"
            :loading="loadingEvent"
            multiple
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="预警类型"
            :remote-method="remoteMethod"
            class="box_sx"
          >
            <el-option
              v-for="item in optionsEventTypes"
              :key="item.eventTypeId"
              :label="item.eventType"
              :value="item.eventCode"
            />
          </el-select>
        </div>
        <!-- 事件名称 -->
        <!-- <div class="box_change">
          <span class="box_text">事件名称：</span>
          <el-select
            v-model="queryform.emotionType"
            :loading="loadingEvent"
            multiple
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="事件名称"
            :remote-method="remoteEventNames"
            class="box_sx"
          >
            <el-option
              v-for="item in optionsEventNames"
              :key="item.eventId"
              :label="item.eventName"
              :value="item.eventName"
            />
          </el-select>
        </div>-->
        <div class="box_change">
          <el-button
            type="primary"
            class="search"
            @click="queryFrom"
          >查 询</el-button>
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
  getTransmitList
} from '@/api/public_sentiment/public_sentiment_page'
// import { parseTime } from '@/utils/index'

export default {
  name: 'Popover',
  props: {
    queryforms: {
      type: Object,
      default: function() {
        return {
          pageNo: 1,
          pageSize: 10,
          companyName: '', // 公司名
          contentGrade: [], // 预警级别
          emotionType: [],
          endTime: 0, // 时间
          eventTypeCode: [], // 事件类型
          sourceType: [], // 数据源类型
          startTime: 0, // 时间
          transmission: []
        }
      }
    }
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
        五级: '5'
      },
      radio: '0',
      time: '',
      optionsSource: [],
      options: {
        正面: 1,
        中性: 0,
        负面: -1
      },
      optionsEventTypes: [],
      optionsEventNames: [],
      optionsTransmission: []
    }
  },
  watch: {
    queryforms: {
      // 深度监听，可监听到对象、数组的变化
      handler(val) {
        // do something, 可使用this
        this.queryform = val
      },
      deep: true
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
        pageSize: 100
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
      })
    },
    // 事件类型查询
    remoteMethod(query) {
      if (query !== '') {
        this.loadingEvent = true
        const data = {
          pageNo: 1,
          pageSize: 100,
          eventType: query
        }
        listByTypeName(data).then((res) => {
          if (res.code === 200) {
            setTimeout(() => {
              this.loadingEvent = false
              this.optionsEventTypes = res.rows.filter((item) => {
                return item.eventType.indexOf(query) > -1
              })
            }, 200)
          }
        })
      } else {
        this.optionsEventTypes = []
      }
    },
    // 事件词
    remoteEventNames(query) {
      if (query !== '') {
        this.loadingEvent = true
        const data = {
          pageNo: 1,
          pageSize: 100,
          eventName: query,
          eventTypes: this.queryForm.eventTypes,
          deptId: this.userInfo.deptId
        }
        listByEventName(data).then((res) => {
          if (res.code === 200) {
            setTimeout(() => {
              this.loadingEvent = false
              this.optionsEventNames = res.rows.filter((item) => {
                return item.eventName.indexOf(query) > -1
              })
            }, 200)
          }
        })
      } else {
        this.optionsEventNames = []
      }
    },
    queryFrom(val) {
      this.queryform.pageNo = 1
      // 时间
      const today = new Date(
        new Date(new Date().toLocaleDateString()).getTime()
      )
      if (this.radio === '0') {
        this.time = ''
        this.queryform.startTime = 0
        this.queryform.endTime = 0
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
    RefreshData() {
      this.$emit('RefreshData', this.queryform)
    }
  }
}
</script>

<style lang="scss" scoped>
.app {
  margin-top: 20px;
  /deep/ .el-collapse-item__content {
    padding-bottom: 0;
  }
  /deep/ .el-collapse-item__header {
    background: #ebeef5;
    font-size: 16px;
    padding-left: 10px;
    height: 40px;
    color: #409eff;
  }
  .box_change {
    padding: 10px 0;
    .box_text {
      display: inline-block;
      width: 80px;
    }
    .search {
      text-align: center;
      font-size: 16px;
      margin-left: 277px;
    }
  }
  .box_sx {
    display: inline-block;
    margin-left: 10px;
    min-width: 500px;
  }
}
</style>
