<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="关键词查询:">
          <el-input
            v-model.trim="queryForm.subName"
            placeholder="订阅名"
            size="medium"
            @keyup.enter.native="queryQuanIndex"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <div class="app-head">
        目标监控列表
        <div class="fr">
          <el-button type="primary" @click="addEventFrom">新增</el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="订阅名" prop="subName" />
        <el-table-column label="新增时间" prop="createTime" />
        <el-table-column label="选择" width="240">
          <template slot-scope="scope">
            <el-button
              type="success"
              size="small"
              @click="handleAddOrUpdate(scope.row)"
            >详情</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete([scope.row.companyCombSubId])"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="queryForm.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 新增与修改订阅公司 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="addDialogVisible"
      width="50%"
      :before-close="clearDialog"
    >
      <el-form
        ref="eventFrom"
        :model="eventFrom"
        :rules="eventRules"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="订阅名称:" prop="subName">
          <el-input
            v-model.trim="eventFrom.subName"
            placeholder="订阅名称"
            size="medium"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 订阅公司的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="订阅公司"
      :visible.sync="dialogVisible"
      width="75%"
      :before-close="clearDialog"
    >
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="关键词查询:">
          <el-input
            v-model.trim="queryLable.companyName"
            placeholder="公司名"
            size="medium"
            @keyup.enter.native="seaschcompanyName"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="seaschcompanyName">查询</el-button>
          <el-button type="primary" @click="addcompanyName">新增</el-button>
          <el-button
            type="primary"
            @click="ImportCompanyNameFiles"
          >导入</el-button>
          <el-button
            type="primary"
            @click="ImportCompanyNameModle"
          >模板下载</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="load1" :data="ruleForm" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="公司名" prop="companyName" />
        <el-table-column label="新增时间" prop="createTime" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="选择" width="240">
          <template slot-scope="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete([scope.row.companyCombSubRelId])"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="queryLable.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryLable.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalLable"
          @size-change="handleSizeChangelable"
          @current-change="handleCurrentChangeLable"
        />
      </div>
    </el-dialog>
    <!-- 新增与修改公司名 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="companyNameTitle"
      :visible.sync="addWordDialogVisible"
      width="50%"
    >
      <el-form
        ref="companyNameFrom"
        :model="companyNameFrom"
        :rules="eventRules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="公司名:">
          <!-- <el-input v-model.trim="companyNameFrom.companyName" placeholder="公司名" size="medium" /> -->
          <!-- <Autocomplete :targetcompany="companyName" @RefreshData="RefreshData"/> -->
          <el-autocomplete
            ref="autoComplete"
            v-model="companyName"
            :fetch-suggestions="querySearchAsync"
            placeholder="目标公司"
            clearable
            class="search_inpt"
            value-key="companyName"
            @select="RefreshData"
          >
            <template slot-scope="{ item }">
              <div class="compare-name" v-html="item.companyName" />
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addWordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addcompanyNameFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 导入 -->
    <ImportantFlies
      :action="action"
      :dialog-visible="DialogVisible"
      @handleClose="handleClose"
    />
  </div>
</template>

<script>
import {
  confCompanyCombinationSubscribe,
  confCompanyCombinationSubscribeSave,
  confCompanyCombinationSubscribeUpdate,
  confCompanyCombinationSubscribeDelete,
  confcompanyNameList,
  confcompanyNameSave,
  confcompanyNameDelete,
  // confcompanyNameUpdate,
  companyNameDomnLoadModel
} from '@/api/enterprise/enterpriseTotal'
import { DomnLoadFile } from '@/utils/exportFiles'
import ImportantFlies from '@/components/Upload/ImportantFlies'
import { companyModelUpload } from '@/utils/url'
// import Autocomplete from '@/views/components/autocomplete'
import { listByCompanyName } from '@/api/public_sentiment/public_sentiment_page'

export default {
  name: 'EnterpriseTotal',
  components: { ImportantFlies },

  data() {
    return {
      // 表单数据
      loading: true,
      load1: true,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        subName: ''
      },
      queryLable: {
        companyCombSubId: '',
        companyName: '',
        pageNo: 1,
        pageSize: 10
      },
      totalLable: 0,
      eventFrom: {},
      total: 0,
      title: '新增',
      companyNameTitle: '新增公司名',
      // 修改
      dialogVisible: false,
      addDialogVisible: false,
      addWordDialogVisible: false,
      ruleForm: [],
      companyName: '',
      loadingEvent: false,
      restaurants: [],
      timer: null,
      companyNameFrom: {
        companyCombSubId: '',
        companyName: ''
      },
      eventRules: {
        subName: {
          required: true,
          message: '请输入订阅公司名称',
          trigger: 'blur'
        },
        companyName: {
          required: true,
          message: '请输入公司名',
          trigger: 'blur'
        }
      },
      action: '', // 导入
      DialogVisible: false
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
  },
  methods: {
    querySearchAsync(val, cb) {
      const queryString = val.trim()
      if (queryString && queryString.length > 1) {
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
        pageSize: 5
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
    RefreshData(val) {
      this.$refs['autoComplete'].suggestions = []
      this.companyName = this.companyName.replace(/<[^>]*>/g, '').trim()
    },
    async getQuanIndex() {
      const data = await confCompanyCombinationSubscribe(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    // 查询
    queryQuanIndex(v) {
      this.loading = true
      this.queryForm.pageNo = 1
      this.getQuanIndex()
    },
    // 分页
    handleSizeChange(val) {
      this.loading = true
      this.queryForm.pageSize = val
      this.getQuanIndex()
    },
    handleCurrentChange(val) {
      this.loading = true
      this.queryForm.pageNo = val
      this.getQuanIndex()
    },
    // 根据id新增修改数据
    addEventFrom() {
      this.addDialogVisible = true
      this.title = '新增'
      this.eventFrom = { subName: '' }
    },
    handleUpdate(row) {
      this.addDialogVisible = true
      this.title = '修改'
      this.eventFrom = JSON.parse(JSON.stringify(row))
    },
    handleAddFrom() {
      this.$refs.eventFrom.validate(async(valid) => {
        if (!valid) return
        var confevent = null
        if (this.title === '新增') {
          confevent = confCompanyCombinationSubscribeSave(this.eventFrom)
        }
        if (this.title === '修改') {
          confevent = confCompanyCombinationSubscribeUpdate(this.eventFrom)
        }
        confevent.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.getQuanIndex()
          this.clearDialog()
        })
      })
    },
    // 详情
    handleAddOrUpdate(res) {
      this.load1 = true
      this.ruleForm = []
      this.queryLable.pageNo = 1
      this.queryLable.companyCombSubId = res.companyCombSubId
      this.companyNameFrom.companyCombSubId = res.companyCombSubId
      this.getEventLableDetail()
      this.dialogVisible = true
    },
    seaschcompanyName() {
      this.load1 = true
      this.queryLable.pageNo = 1
      this.getEventLableDetail()
    },
    getEventLableDetail() {
      confcompanyNameList(this.queryLable).then((res) => {
        this.ruleForm = res.rows
        this.totalLable = res.total
        this.load1 = false
      })
    },
    // 详情分页
    handleSizeChangelable(val) {
      this.load1 = true
      this.queryLable.pageSize = val
      this.getEventLableDetail()
    },
    handleCurrentChangeLable(val) {
      this.load1 = true
      this.queryLable.pageNo = val
      this.getEventLableDetail()
    },
    // 新增公司名
    addcompanyName() {
      this.addWordDialogVisible = true
      this.companyNameTitle = '新增公司名'
      this.companyNameFrom.companyName = ''
      this.companyNameFrom.remark = ''
      this.companyName = ''
    },
    addcompanyNameFrom() {
      if (this.companyName.trim().length > 1) {
        this.load1 = true
        var confcompanyName = null
        if (this.companyNameTitle === '新增公司名') {
          this.companyNameFrom.companyName = this.companyName
          confcompanyName = confcompanyNameSave(this.companyNameFrom)
        }
        confcompanyName.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.getEventLableDetail()
          this.addWordDialogVisible = false
        })
      } else {
        this.$message('公司名称错误，请重新填写')
      }
    },
    clearDialog() {
      // 刷新列表
      this.dialogVisible = false
      this.addDialogVisible = false
    },
    // 根据id删除数据
    handleDelete(ids) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.load1 = true
          if (this.dialogVisible) {
            confcompanyNameDelete(ids).then((res) => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getEventLableDetail()
            })
          } else {
            confCompanyCombinationSubscribeDelete(ids).then((res) => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getQuanIndex()
            })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 导出模板
    ImportCompanyNameModle() {
      const File = companyNameDomnLoadModel()
      const fname = `公司名文档模板`
      DomnLoadFile(File, fname)
    },
    ImportCompanyNameFiles() {
      this.queryLable.pageNo = 1
      this.DialogVisible = true
      this.action = companyModelUpload() + this.companyNameFrom.companyCombSubId
    },
    handleClose() {
      this.DialogVisible = false
      this.getEventLableDetail()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  background: #fff;
  .app-head {
    height: 36px;
    line-height: 36px;
    font-weight: 700;
    font-size: 14px;
  }
  .app-tabs {
    margin-top: 20px;
  }
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
  }
  .el-table {
    width: 100%;
    margin: 10px 0;
  }
  .pagination {
    text-align: right;
  }
  .search_inpt {
    width: 564px;
  }
}
</style>
