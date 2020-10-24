<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div class="app-search">
      <el-form :inline="true" class="demo-form-inline">
        <!-- 目标组合 -->
        <el-form-item>
          <el-select
            v-model="queryForm.companyCombSubId"
            clearable
            placeholder="请选择目标组合"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="item in optionsCompanyCombSub"
              :key="item.companyCombSubId"
              :label="item.subName"
              :value="item.companyCombSubId"
            />
          </el-select>
        </el-form-item>
        <!-- 事件类型 -->
        <el-form-item>
          <el-select
            v-model="queryForm.eventTypes"
            :loading="loadingEvent"
            multiple
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="预警类型"
            :remote-method="remoteMethod"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="item in optionsEventTypes"
              :key="item.eventTypeId"
              :label="item.eventType"
              :value="item.eventType"
            />
          </el-select>
        </el-form-item>
        <!-- 事件名称 -->
        <el-form-item>
          <el-select
            v-model="queryForm.eventNames"
            :loading="loadingEvent"
            multiple
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="事件标签"
            :remote-method="remoteEventNames"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="item in optionsEventNames"
              :key="item.eventId"
              :label="item.eventName"
              :value="item.eventName"
            />
          </el-select>
        </el-form-item>
        <!-- 目标公司 -->
        <el-form-item>
          <Autocomplete
            :targetcompany="queryForm.targetCompany"
            @RefreshData="RefreshData"
          />
        </el-form-item>
        <el-form-item>
          <!-- <el-button type="primary" @click="queryQuanIndex">查询</el-button> -->
          <el-button type="primary" @click="exportFiles">导出</el-button>
          <el-button type="info" round @click="queryReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <Popover :queryforms="queryForm" @RefreshData="queryQuanIndex" />
    <div v-loading="loading" class="app-table">
      <ul v-if="quanWordList.length > 0" class="table-ul">
        <li v-for="(item, index) in quanWordList" :key="index" class="table">
          <div
            style="
              display: inline-block;
              width: 3%;
              vertical-align: top;
              padding-top: 10px;
            "
          >
            <el-tag v-if="item.emotionType === 1" effect="dark" type="success" size="mini">正</el-tag>
            <el-tag v-if="item.emotionType === -1" effect="dark" type="danger" size="mini">负</el-tag>
          </div>
          <div style="display: inline-block; width: 95%">
            <a href="javascript:;" @click="detailsPage(item.id)">
              <h3 style="margin: 10px 0">
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
                :style="item.emotionType === -1 ? 'margin-left: 20px;' : ''"
              >目标公司：</b>
              <el-button type="text" @click="details(item)">{{
                item.companyName
              }}</el-button>
              <span v-if="item.transmitTarget" style="margin-left: 20px">
                <b>控股企业：</b>
                <span>{{ item.transmitTarget }}</span>
              </span>
              <el-tag
                size="mini"
                type="warning"
                style="margin-left: 20px; cursor: pointer"
                @click="eventSentiment(item)"
              >事件脉络</el-tag>
            </p>
            <p class="content">
              <b>事件标签：</b>
              <span v-for="(val, j) in item.labelNames" :key="j">{{
                val
              }}</span>
              <b style="margin-left: 20px">预警类型：</b>
              <span v-for="name in item.signalNames" :key="name">{{
                name
              }}</span>
            </p>
            <p class="content">
              <b>发表时间：</b>
              <span>{{ Number(item.releaseTime) | parseTime() }}</span>
              <b style="margin-left: 20px">分析时间：</b>
              <span>{{ Number(item.analysisTime) | parseTime() }}</span>
              <b style="margin-left: 20px">数据类型：</b>
              <span>{{ item.dataTypeName }}</span>
              <b style="margin-left: 20px">来源：</b>
              <span>{{ item.source === '' ? '未知' : item.source }}</span>
              <b style="margin-left: 20px">作者：</b>
              <span>{{ item.nickname === '' ? '未知' : item.nickname }}</span>
            </p>
            <div class="icon">
              <PopoverTag
                :yuqingtag="item"
                :deptid="queryForm.deptId"
                @RefreshData="getDistribute"
              />
            </div>
          </div>
        </li>
      </ul>
      <!-- 分页 -->
      <div v-if="quanWordList.length > 0" class="pagination">
        <el-pagination
          v-if="quanWordList.length > 0"
          :current-page="queryForm.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      <div v-if="!loading && quanWordList.length <= 0">暂无数据</div>
    </div>
  </div>
</template>

<script>
import { confCompanyCombinationSubscribe } from '@/api/enterprise/enterpriseTotal'
import {
  findTargetCombinationWarning,
  listByEventName,
  listByTypeName,
  domnLoadFile
} from '@/api/public_sentiment/public_sentiment_page'
import { ExportFiles } from '@/utils/exportFiles'
import { parseTime } from '@/utils/index'
import PopoverTag from './compoments/popover_tag'
import Popover from './compoments/popover'
import Autocomplete from './compoments/autocomplete'

export default {
  name: 'AlertPublicSentiment',
  components: { PopoverTag, Popover, Autocomplete },
  data() {
    return {
      loading: true,
      loadingEvent: false,
      // 表单数据
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        targetCompany: '',
        contentGrade: '',
        emotionType: '',
        sourceType: '',
        startTime: '',
        endTime: '',
        deduplicate: false,
        analysisTimeSort: false,
        companyCombSubId: '',
        eventTypes: [],
        eventNames: [],
        transmission: []
      },
      optionsCompany: [],
      optionsCompanyCombSub: [],
      quanWordList: [],
      optionsSystem: [],
      optionsSystemDept: [],
      optionsSource: [],
      options: {},
      value: '',
      userInfo: {},
      sentiment: {
        aiMarkList: [],
        analysisId: '',
        analysisType: '',
        evaluationId: '',
        evaluationResult: '',
        grade: '',
        spiderMarkList: []
      },
      optionsEventTypes: [],
      optionsEventNames: []
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.getWordsTypeId()
  },
  methods: {
    // 标准的时间格式转为时间戳
    dateToMs(date) {
      const result = new Date(date).getTime()
      return result
    },
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
    remoteEventNames(query) {
      if (query !== '') {
        this.loadingEvent = true
        const data = {
          pageNo: 1,
          pageSize: 100,
          eventName: query,
          eventTypes: this.queryForm.eventTypes,
          deptId: this.queryForm.deptId
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
    // 获取选择框数据
    async getWordsTypeId() {
      this.restaurants = []
      this.queryForm.deptId = this.userInfo.deptId
      await confCompanyCombinationSubscribe({}).then((res) => {
        this.optionsCompanyCombSub = res.rows
      })
      await this.getDistribute()
    },
    visibleChange() {
      this.restaurants = []
      this.optionsEventTypes = []
      this.optionsEventNames = []
    },
    // 页面数据
    async getDistribute() {
      const res = await findTargetCombinationWarning(this.queryForm)
      this.quanWordList = res.rows
      this.total = res.total
      this.loading = false
      this.quanWordList.forEach((itemParent, index) => {
        if (!itemParent.yuqingEvaluationReq) {
          itemParent.yuqingEvaluationReq = this.sentiment
        }
        if (itemParent.abbs) {
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
    },
    // 查询
    queryQuanIndex() {
      this.loading = true
      this.queryForm.pageNo = 1
      this.getDistribute()
    },
    RefreshData(targetCompany) {
      this.queryForm.targetCompany = targetCompany
      this.queryQuanIndex()
    },
    // 跳转到详情页
    detailsPage(val) {
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/alert_public_page',
        query: { id: val }
      })
    },
    // // 舆情脉络详情
    details(val) {
      this.$router.push({
        path:
          '/configuration/public_sentiment/details_page/company_public_page',
        query: {
          deptId: val.deptId,
          targetCompany: decodeURIComponent(val.companyName),
          orgId: val.orgId,
          deduplicate: this.queryForm.deduplicate
        }
      })
    },

    // 重置
    queryReset() {
      this.queryForm.pageNo = 1
      this.queryForm.pageSize = 10
      this.queryForm.targetCompany = ''
      this.queryForm.contentGrade = ''
      this.queryForm.sourceType = ''
      this.queryForm.startTime = ''
      this.queryForm.endTime = ''
      this.queryForm.deduplicate = false
      this.radio = '0'
      this.radioName = '全部'
      this.contentName = '全部'
      this.sourceType = '0'
      this.dataName = '全部'
      this.removal = '1'
      this.removalName = '不重复'
      this.loading = true
      this.getDistribute()
    },
    // 分页
    handleSizeChange(val) {
      this.loading = true
      this.queryForm.pageSize = val
      this.getDistribute()
    },
    handleCurrentChange(val) {
      this.loading = true
      this.queryForm.pageNo = val
      this.getDistribute()
    },
    // 导出
    exportFiles() {
      let endTime = ''
      let startTime = ''
      if (this.queryForm.endTime || this.queryForm.startTime) {
        endTime = parseTime(this.queryForm.endTime)
        startTime = parseTime(this.queryForm.startTime)
      }
      const DomnLoadFile = domnLoadFile(this.queryForm)
      const fname = `预警文档`
      ExportFiles(DomnLoadFile, fname, startTime, endTime)
    },
    eventSentiment(val) {
      this.$router.push({
        path:
          '/configuration/public_sentiment/details_page/event_public_page',
        query: {
          id: val.id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select {
  width: 300px;
}
.app-container {
  .table-ul {
    padding: 0;
    margin: 0;
    min-height: 500px;
  }
  .app-table {
    margin-top: 10px;
    padding: 10px;
    min-height: 200px;
    .table {
      position: relative;
      box-sizing: border-box;
      list-style: none;
      border-bottom: 1px dashed #ccc;
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
    .icon {
      position: absolute;
      bottom: 0;
      // left: 750px;
      right: 50px;
    }
  }
  .pagination {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
