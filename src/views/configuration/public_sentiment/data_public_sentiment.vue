<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div class="app-search">
      <el-form :inline="true" class="demo-form-inline clearfix">
        <el-form-item v-if="userInfo.orgId === '0'" label="机构:" content-width="100">
          <el-select v-model="queryForm.orgId" @change="changeSystem(queryForm.orgId)">
            <el-option
              v-for="item in optionsSystem"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="userInfo.deptId === '0'" label="部门:">
          <el-select v-model="queryForm.deptId" placeholder="全部" @change="changeDept">
            <el-option
              v-for="item in optionsSystemDept"
              :key="item.id"
              :label="item.deptName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- 根据标题或内容查询 -->
        <el-form-item>
          <el-input
            v-model="queryForm.keyword"
            placeholder="请输入关键字"
            @keyup.enter.native="queryQuanIndex"
          />
          <el-button type="primary" @click="queryQuanIndex">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="数据源类型:">
          <el-select v-model="queryForm.sourceType" clearable @change="queryQuanIndex">
            <el-option
              v-for="item in optionSourceType"
              :key="item.sourceTypeId"
              :label="item.typeName"
              :value="item.typeCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间:">
          <el-date-picker
            v-model="time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 400px"
            @change="queryQuanIndex"
          />
        </el-form-item>
      </el-form>
    </div>
    <div v-loading="loading" class="app-table">
      <ul v-if="quanWordList.length > 0" class="table-ul">
        <li v-for="(item,index) in quanWordList" :key="index" class="table">
          <div style="display: inline-block; width:95%">
            <a target="_blank" :href="item.sourceUrl">
              <h3 style="margin: 10px 0">
                <span>{{ index + 1 }}.</span>
                <span>{{ item.title }}</span>
              </h3>
            </a>
            <p class="content">
              <b>摘要：</b>
              <span v-html="item.content" />
            </p>
            <p class="content">
              <b>数据类型：</b>
              <span>{{ item.sourceType }}</span>
              <span v-if="item.companyName" style="margin-left: 20px;">
                <b>目标公司：</b>
                <el-button type="text" @click="details(item)">{{ item.companyName }}</el-button>
              </span>
              <b style="margin-left: 20px;">来源：</b>
              <span>{{ item.source === '' ? '未知' : item.source }}</span>
              <b style="margin-left: 20px;">作者：</b>
              <span>{{ item.nickname === '' ? '未知' : item.nickname }}</span>
              <b style="margin-left: 20px;">时间：</b>
              <span>{{ Number(item.releaseTime) | parseTime() }}</span>
            </p>
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
import { findEsAllSentimentWarning } from '@/api/public_sentiment/alert_public_sentiment'
import { system, systemDept } from '@/api/analysis/hot_analysis'
// import { parseTime } from '@/utils/index'
import { confdatasourcetype } from '@/api/dashboard'

export default {
  name: 'DataPublicSentiment',
  data() {
    return {
      loading: true,
      // 表单数据
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        deptId: '',
        orgId: '',
        sourceType: '',
        startTime: '',
        endTime: '',
        deduplicate: false,
        analysisTimeSort: false,
        keyword: ''
      },
      quanWordList: [],
      optionsSystem: [],
      optionsSystemDept: [],
      optionSourceType: [],
      value: '',
      userInfo: {},
      time: ''
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
    // 获取选择框数据
    async getWordsTypeId() {
      if (this.userInfo.orgId === '0') {
        // 机构
        const data = {}
        const res = await system(data)
        this.optionsSystem = res.rows
        this.queryForm.orgId = this.optionsSystem[0].id
      } else {
        this.queryForm.orgId = this.userInfo.orgId
      }
      // 部门
      if (this.userInfo.deptId === '0') {
        this.systemDept(this.queryForm.orgId)
      } else {
        this.queryForm.deptId = this.userInfo.deptId
        this.getDistribute()
        this.sourceData()
      }
      // 数据类型
      if (this.userInfo.deptId !== '0') {
        this.queryForm.deptId = this.userInfo.deptId
      }
      this.changeDept()
    },
    async systemDept(id) {
      const orgId = { orgIds: [id] }
      const row = await systemDept(orgId)
      this.optionsSystemDept = row.rows
      if (this.optionsSystemDept.length > 0) {
        this.queryForm.deptId = this.optionsSystemDept[0].id
      }
      this.getDistribute()
      this.sourceData()
    },
    changeSystem(val) {
      this.queryForm.pageNo = 1
      this.loading = true
      this.systemDept(val)
    },
    changeDept() {
      this.queryForm.pageNo = 1
      this.loading = true
      if (this.queryForm.deptId) {
        this.getDistribute()
        this.sourceData()
      }
    },
    // 数据类型
    sourceData() {
      const solutionForm = {
        deptId: this.queryForm.deptId,
        pageNo: 1,
        pageSize: 100
      }
      confdatasourcetype(solutionForm).then((res) => {
        this.optionSourceType = res.rows
      })
    },
    // 页面数据
    async getDistribute() {
      const res = await findEsAllSentimentWarning(this.queryForm)
      this.total = res.total
      this.quanWordList = res.rows
      this.loading = false
    },
    // 查询
    queryQuanIndex() {
      this.loading = true
      this.queryForm.pageNo = 1
      if (this.time && this.time.length !== 0) {
        this.queryForm.startTime = new Date(this.time[0]).getTime()
        this.queryForm.endTime =
          new Date(this.time[1]).getTime() + 24 * 60 * 60 * 1000 - 1
      } else {
        this.queryForm.startTime = ''
        this.queryForm.endTime = ''
      }
      this.getDistribute()
    },
    // // 跳转到详情页
    // detailsPage(val) {
    //   this.$router.push({
    //     path: '/configuration/public_sentiment/details_page/alert_public_page',
    //     query: { id: val },
    //   })
    // },
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
    }
  }
}
</script>

<style lang="scss" scoped>
.el-select,
.el-input {
  width: 300px;
}
.search_inpt {
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
