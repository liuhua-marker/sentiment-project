<template>
  <div class="app-container">
    <div class="app-filters">
      <el-form :inline="true" class="serach-form-inline">
        <el-form-item label="公司名称">
          <el-input v-model.trim="queryForm.compName" placeholder="公司名称" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="queryForm.startTime"
            align="right"
            type="datetime"
            placeholder="选择分析开始时间"
            value-format="timestamp"
            default-time="00:00:00"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="queryForm.endTime"
            align="right"
            type="datetime"
            placeholder="选择分析结束时间"
            value-format="timestamp"
            default-time="23:59:59"
          />
        </el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="confirmSearch">搜索</el-button>
        <!-- <el-button type="primary" icon="el-icon-setting" @click="handlerSearch">筛选设置</el-button> -->
      </el-form>
    </div>

    <el-table :data="resultList" style="width: 100%;margin-top:30px;" border>
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column align="header-center" label="分析时间" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">{{ scope.row.analysisTime | timeFormat }}</template>
      </el-table-column>
      <el-table-column
        align="header-center"
        label="文章发布时间"
        :show-overflow-tooltip="true"
        width="110"
      >
        <template slot-scope="scope">{{ scope.row.timestamp | timeFormat }}</template>
      </el-table-column>
      <el-table-column align="header-center" label="公司名称" :show-overflow-tooltip="true" width="172">
        <template slot-scope="scope">{{ scope.row.abbs[0] }}</template>
      </el-table-column>
      <el-table-column align="left" label="文章作者" width="80">
        <template slot-scope="scope">{{ scope.row.nickname }}</template>
      </el-table-column>
      <el-table-column align="left" label="文章来源" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">{{ scope.row.source }}</template>
      </el-table-column>
      <el-table-column align="left" label="标题" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.title }}</template>
      </el-table-column>
      <el-table-column align="left" label="原文链接" :show-overflow-tooltip="true" width="120">
        <template slot-scope="scope">{{ scope.row.sourceUrl }}</template>
      </el-table-column>
      <el-table-column align="left" label="负面词" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.wordsNeg }}</template>
      </el-table-column>
      <el-table-column align="left" label="负面句" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">
          <el-popover
            placement="top-start"
            title
            width="400"
            trigger="hover"
            popper-class="popperClass"
            :content="scope.row.sentsNeg"
          >
            <span slot="reference" style="display:block">{{ scope.row.sentsNeg | ellipsis(8) }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" label="预警等级" width="80">
        <template slot-scope="scope">{{ scope.row.warnLevel }}</template>
      </el-table-column>
      <el-table-column align="left" label="预警类别" :show-overflow-tooltip="true" width="80">
        <template slot-scope="scope">
          <el-popover
            placement="top-start"
            title
            width="200"
            trigger="hover"
            popper-class="popperClass"
          >
            <div v-html="scope.row.warnTypeText" />
            <span slot="reference" style="display:block">{{ scope.row.warnType | ellipsis(6) }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="left" label="摘要" width="150">
        <template slot-scope="scope">
          <el-popover
            placement="top-start"
            title
            width="400"
            trigger="hover"
            popper-class="popperClass"
            :content="scope.row.summary"
          >
            <span slot="reference" style="display:block">{{ scope.row.summary | ellipsis(8) }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" label="标题级别" width="80">
        <template slot-scope="scope">{{ scope.row.titleLevel }}</template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="80">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleDetail(scope)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="resultList.length > 0"
      :total="queryForm.total"
      :page.sync="queryForm.pageNo"
      :limit.sync="queryForm.pageSize"
      @pagination="confirmSearch"
    />

    <!-- <el-dialog
      :close-on-click-modal="false" :visible.sync="dialogVisible" title="筛选条件" center>
      <el-form :model="queryForm" label-width="80px" label-position="left">
        <el-tabs v-model="queryForm.type" type="border-card" @tab-click="handleTypeClick">
          <el-tab-pane label="新闻" name="1">
            <el-tabs v-model="activeName" tab-position="left" @tab-click="handleClick">
              <el-tab-pane
                v-for="item in newWarningList"
                :key="item.indexCode"
                :label="item.warningIndex"
                :name="item.indexCode"
              >
                <a slot="label" :title="item.warningIndex">{{ item.warningIndex | ellipsis(32) }}</a>
                <el-checkbox
                  v-model="checkAll"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                >全选</el-checkbox>
                <el-checkbox-group
                  v-model="queryForm.newwordsNeg"
                  v-loading="loading"
                  @change="handleCheckedCitiesChange"
                >
                  <el-checkbox
                    v-for="mapWord in mappingWordList"
                    :key="mapWord.negativeWord"
                    :label="mapWord.negativeWord"
                  />
                </el-checkbox-group>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
          <el-tab-pane label="公告" name="2">
            <el-tabs v-model="activeName" tab-position="left" @tab-click="handleClick">
              <el-tab-pane
                v-for="item in noticeWarningList"
                :key="item.indexCode"
                :label="item.warningIndex"
                :name="item.indexCode"
              >
                <a slot="label" :title="item.warningIndex">{{ item.warningIndex | ellipsis(32) }}</a>
                <el-checkbox
                  v-model="checkAll"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                >全选</el-checkbox>
                <el-checkbox-group
                  v-model="queryForm.noticwordsNeg"
                  v-loading="loading"
                  @change="handleCheckedCitiesChange"
                >
                  <el-checkbox
                    v-for="mapWord in mappingWordList"
                    :key="mapWord.negativeWord"
                    :label="mapWord.negativeWord"
                  />
                </el-checkbox-group>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align:center">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmSearch">确认</el-button>
      </div>
    </el-dialog>-->

    <el-dialog :close-on-click-modal="false" :visible.sync="dialogDetailVisible" title="详情" center>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="grid-content bg-purple">标题</div>
        </el-col>
        <el-col :span="20">
          <div class="grid-content bg-purple-light">{{ detail.title }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="grid-content bg-purple">爬取时间</div>
        </el-col>
        <el-col :span="20">
          <div class="grid-content bg-purple-light">{{ detail.spiderTime | timeFormat }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="grid-content bg-purple">来源</div>
        </el-col>
        <el-col :span="20">
          <div class="grid-content bg-purple-light">{{ detail.source }}</div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="grid-content bg-purple">源url</div>
        </el-col>
        <el-col :span="20">
          <div class="grid-content bg-purple-light">
            <a :href="detail.sourceUrl" target="_blank">{{ detail.sourceUrl }}</a>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="grid-content bg-purple">内容</div>
        </el-col>
        <el-col :span="20">
          <div class="grid-content bg-purple-light" v-html="detail.content" />
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer" style="text-align:center">
        <el-button type="danger" @click="dialogDetailVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { findZHInternetByParams, findZHNoticeByParams } from '@/api/accurate'
import { warningWords, mappingWords } from '@/api/lexicon'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  filters: {
    ellipsis(value, num) {
      if (!value) return ''
      if (value.length > num) {
        return value.slice(0, num) + '...'
      }
      return value
    },
    timeFormat(value) {
      if (!value) return ''
      const date = new Date(value)
      let fmt = 'yyyy-MM-dd hh:mm:ss'
      const o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds() // 毫秒
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length === 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          )
        }
      }
      return fmt
    }
  },
  data() {
    return {
      queryForm: {
        total: 0,
        pageNo: 1,
        pageSize: 10,
        type: '1',
        newwordsNeg: [],
        noticwordsNeg: [],
        compName: '',
        startTime: '',
        endTime: ''
      },
      activeName: '',
      resultList: [],
      mappingWordList: [],
      dialogVisible: false,
      detail: {},
      dialogDetailVisible: false,
      loading: false,
      checkAll: false,
      isIndeterminate: true,
      newWarningList: [],
      noticeWarningList: [],
      warningCode: {}
    }
  },
  created() {
    this.newWarningWords(1)
    this.noticeWarningWords(2)
    this.confirmSearch()
  },
  methods: {
    viewWarnTypeText(val) {
      let valText = ''
      this.newWarningList.forEach(v => {
        this.warningCode[v.indexCode] = v.warningIndex
      })
      this.noticeWarningList.forEach(v => {
        this.warningCode[v.indexCode] = v.warningIndex
      })
      if (val) {
        const valArr = val.split('|')
        valArr.forEach((v, i) => {
          if (!this.warningCode[v]) {
            this.warningCode[v] = '其他'
          }
          valText += i + 1 + '.' + this.warningCode[v] + '<br/>'
        })
      }
      return valText
    },
    async findZHInternetByParams() {
      this.resultList = []
      const res = await findZHInternetByParams(this.queryForm)
      res.rows.forEach(row => {
        row.warnTypeText = this.viewWarnTypeText(row.warnType)
        this.resultList.push(row)
      })
      this.queryForm.total = res.total
    },
    async findZHNoticeByParams() {
      this.resultList = []
      const res = await findZHNoticeByParams(this.queryForm)
      res.rows.forEach(row => {
        row.warnTypeText = this.viewWarnTypeText(row.warnType)
        this.resultList.push(row)
      })
      this.queryForm.total = res.total
    },
    async newWarningWords(type) {
      const res = await warningWords(type)
      this.newWarningList = res.data
    },
    async noticeWarningWords() {
      const res = await warningWords(this.queryForm.type)
      this.noticeWarningList = res.data
    },
    async mappingWords() {
      this.loading = true
      const params = {}
      params.recordType = this.queryForm.type
      params.indexCode = this.activeName
      params.pageNo = 1
      params.pageSize = 100
      const res = await mappingWords(params)
      this.mappingWordList = res.rows
      this.loading = false
    },
    handleCheckAllChange(val) {
      if (val) {
        this.mappingWordList.forEach(e => {
          if (this.queryForm.type === '1') {
            this.queryForm.newwordsNeg.push(e.negativeWord)
          } else {
            this.queryForm.noticwordsNeg.push(e.negativeWord)
          }
        })
      } else {
        if (this.queryForm.type === '1') {
          this.queryForm.newwordsNeg = []
        } else {
          this.queryForm.noticwordsNeg = []
        }
      }
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.mappingWordList.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.mappingWordList.length
    },
    handleClick(tab, event) {
      this.checkAll = false
      this.queryForm.newwordsNeg = []
      this.queryForm.noticwordsNeg = []
      this.isIndeterminate = true
      this.activeName = tab.name
      this.mappingWords()
    },
    handleTypeClick(tab, event) {
      this.checkAll = false
      this.queryForm.newwordsNeg = []
      this.queryForm.noticwordsNeg = []
      this.isIndeterminate = true
      this.queryForm.type = tab.name
      this.activeName = ''
      // this.handlerSearch()
    },
    // handlerSearch() {
    //   this.activeName = this.newWarningList[0].indexCode
    //   this.mappingWords()
    //   this.dialogVisible = true
    // },
    confirmSearch() {
      // 新闻查询
      if (this.queryForm.type === '1') {
        this.queryForm.wordsNeg = this.queryForm.newwordsNeg
        this.findZHInternetByParams()
      } else if (this.queryForm.type === '2') {
        this.queryForm.wordsNeg = this.queryForm.noticwordsNeg
        this.findZHNoticeByParams()
      }
      this.dialogVisible = false
    },
    handleDetail(scope) {
      this.detail = scope.row
      // 关键句标黄
      const sentence = this.detail.sentsNeg.split('。')
      sentence.forEach(item => {
        // 匹配关键字正则
        const replaceReg = new RegExp(item, 'g')
        // 高亮替换v-html值
        const replaceString = '<span style="color:#c11abc;">' + item + '</span>'
        this.detail.content = this.detail.content.replace(
          replaceReg,
          replaceString
        )
      })
      // 关键词标红
      const wordsNeg = this.detail.wordsNeg.replace(/\s+/g, '').split('|')
      wordsNeg.forEach(item => {
        // 匹配关键字正则
        const replaceReg = new RegExp(item, 'g')
        // 高亮替换v-html值
        const replaceString = '<span style="color:red;">' + item + '</span>'
        this.detail.content = this.detail.content.replace(
          replaceReg,
          replaceString
        )
      })
      this.dialogDetailVisible = true
    }
  }
}
</script>

<style lang="scss">
.app-container {
  .el-checkbox {
    max-width: 20vw !important;
    min-width: 17vw !important;
  }
  .el-tabs--left .el-tabs__header.is-left {
    max-height: 490px !important;
    overflow: auto;
    overflow-x: hidden;
  }
  .el-tabs__item.is-left {
    padding: 0 20px 0px 0px !important;
    text-align: left !important;
    min-width: 200px;
  }
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #f5f5f5;
  }
  .bg-purple-light {
    background: #f5f5f5;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
    line-height: 40px;
    padding: 1px 0px 0px 8px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
  .el-dialog__body {
    max-height: 65vh !important;
    overflow-y: auto !important;
  }
  .el-dialog {
    margin-top: 9vh !important;
    min-width: 70vw;
  }
  .el-table {
    overflow-y: auto;
  }
}
.popperClass {
  background: #303133;
  color: #fff;
  font-size: 12px;
}
.el-popper[x-placement^='top'] .popper__arrow {
  border-top-color: #303133 !important;
}
.el-popper[x-placement^='top'] .popper__arrow::after {
  border-top-color: #303133 !important;
}
</style>

