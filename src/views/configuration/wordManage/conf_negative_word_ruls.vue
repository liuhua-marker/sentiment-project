<template>
  <div class="app-container">
    <!-- 导航 -->
    <div class="app-filters">
      <el-radio-group v-model="queryForm.labelTypeId" @change="switchLexicon">
        <el-radio-button
          v-for="item in radioLable"
          :key="item.labelTypeId"
          :label="item.labelTypeId"
        >{{ item.labelType }}</el-radio-button>
      </el-radio-group>
    </div>
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item v-if="userInfo.orgId === '0'" label="所属方案:">
          <el-select
            v-model="queryForm.solutionId"
            clearable
            placeholder="请选择方案"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="item in options"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词查询:">
          <el-input v-model.trim="queryForm.queryWord" placeholder="事件标签/标签类型/信号/分数" size="medium" @keyup.enter.native="queryQuanIndex" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <div class="app-head">事件标签列表</div>
      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="事件标签" prop="eventLabel" />
        <el-table-column label="标签类型" prop="eventLabelClassify" />
        <el-table-column label="信号" prop="signalCode" />
        <el-table-column label="分数" prop="score" />
        <el-table-column label="所属方案" prop="solutionName" />
        <el-table-column label="新增时间" prop="createTime" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="选择" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">详情</el-button>
            <el-button type="danger" size="small" @click="handleDelete([scope.row.eventLabelId])">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
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

    <!-- 新增、修改的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="详情"
      :visible.sync="dialogVisible"
      width="75%"
      :before-close="clearDialog"
    >
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="关键词查询:">
          <el-input v-model.trim="queryLable.eventDetail" placeholder="事件" size="medium" @keyup.enter.native="getEventLableDetail" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getEventLableDetail">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="load1" :data="ruleForm" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="事件" prop="eventDetail" />
        <el-table-column label="事件标签" prop="eventLabel" />
        <el-table-column label="匹配范围" prop="matchRange" />
        <el-table-column label="使用范围" prop="useRange" />
        <el-table-column label="新增时间" prop="createTime" />
        <el-table-column label="备注" prop="remark" />
      </el-table>
      <!-- 分页 -->
      <el-pagination
        :current-page="queryLable.pageNo"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryLable.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalLable"
        @size-change="handleSizeChangelable"
        @current-change="handleCurrentChangeLable"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  confeventlabel,
  list,
  confwordstype,
  confeventlabeldetail,
  handleDelete,
  selectNowSolution
} from '@/api/configuration/ruls'

export default {
  name: 'ConfNegativeWordRuls',
  // components: { Pagination },

  data() {
    return {
      // 表单数据
      loading: true,
      load1: true,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        queryWord: '',
        solutionId: '',
        labelTypeId: ''
      },
      queryLable: {
        eventLabelId: '',
        eventDetail: '',
        pageNo: 1,
        pageSize: 10
      },
      totalLable: 0,
      solutionForm: {
        pageNo: 1,
        pageSize: 100
      },
      type: {
        pageNo: 1,
        pageSize: 100,
        labelTypeClassifyCode: 'event'
      },
      total: 0,
      options: [],
      radioLable: [],
      // 修改
      dialogVisible: false,
      ruleForm: [],
      userInfo: {}
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.get()
  },
  methods: {
    async get() {
      await this.getlabelTypeId()
      await this.getQuanIndex()
    },
    // 获取页面数据
    async getlabelTypeId() {
      await confwordstype(this.type).then(arr => {
        this.radioLable = arr.rows
        this.queryForm.labelTypeId = this.radioLable[0].labelTypeId
      })
      if (this.userInfo.orgId === '0') {
        const res = await list(this.solutionForm)
        this.options = res.rows
      } else {
        await selectNowSolution(this.userInfo.deptId).then(ress => {
          if (ress.data === undefined) {
            this.queryForm.solutionId = 0
            this.$message({
              type: 'warning',
              message: '请联系管理员配置方案'
            })
            return
          } else {
            this.queryForm.solutionId = ress.data.solutionId
          }
        })
      }
    },
    async getQuanIndex() {
      const data = await confeventlabel(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    switchLexicon(label) {
      this.queryForm.pageNo = 1
      this.queryForm.labelTypeId = label
      this.getQuanIndex()
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
    // 根据id修改数据
    handleAddOrUpdate(res) {
      this.queryLable.eventLabelId = res.eventLabelId
      this.getEventLableDetail()
      this.dialogVisible = true
    },
    getEventLableDetail() {
      confeventlabeldetail(this.queryLable).then(res => {
        this.ruleForm = res.rows
        this.totalLable = res.total
        this.load1 = false
      })
    },
    // 详情分页
    handleSizeChangelable(val) {
      this.load1 = true
      this.queryForm.pageSize = val
      this.getEventLableDetail()
    },
    handleCurrentChangeLable(val) {
      this.load1 = true
      this.queryForm.pageNo = val
      this.getEventLableDetail()
    },
    clearDialog() {
      // 刷新列表
      this.dialogVisible = false
    },
    // 根据id删除数据
    handleDelete(ids) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          handleDelete(ids).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getQuanIndex()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .signal {
    border: 1px solid #ccc;
    padding: 0 20px;
  }
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
    .el-table {
      width: 100%;
      margin: 10px 0;
    }
  }
}
</style>
