<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="关键词查询:">
          <el-input
            v-model.trim="queryForm.queryWord"
            placeholder="名称/编码/备注"
            size="medium"
            @keyup.enter.native="queryQuanIndex"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addQuanIndex">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <h4>
        目标类型管理
        <!-- <el-button type="danger" size="mini" class="fr" @click="toggleSelection()">批量删除</el-button> -->
      </h4>

      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="类型名称" prop="companyTypeName" />
        <el-table-column label="类型编码" prop="companyTypeCode" />
        <el-table-column label="修改时间">
          <template slot-scope="scope">{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="选择">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete([scope.row.companyTypeId])"
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

    <!-- 新增的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="企业类型管理"
      :visible.sync="addDialogVisible"
      width="30%"
      :before-close="clearDialog"
    >
      <el-form
        ref="addRuleForm"
        :model="addRuleForm"
        :rules="addRules"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="类型名称：" prop="companyTypeName">
          <el-input v-model.trim="addRuleForm.companyTypeName" />
        </el-form-item>
        <el-form-item label="类型编码：" prop="companyTypeCode">
          <el-input v-model.trim="addRuleForm.companyTypeCode" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model.trim="addRuleForm.remark" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button type="primary" @click="addQuanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  page,
  save,
  editeQuanIndexFrom,
  handleDelete
} from '@/api/enterprise/enterpriseType'
// import Pagination from '@/components/Pagination'
// import { getToken } from '@/utils/auth'

export default {
  name: 'EnterpriseType',
  // components: { Pagination },

  data() {
    return {
      loading: true,
      // 表单数据
      isEdite: false,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        queryWord: '',
        remark: ''
      },
      total: 0,
      // 新增数据
      addDialogVisible: false,
      addRuleForm: {
        companyTypeCode: '',
        companyTypeName: '',
        remark: ''
      },
      // 新增验证规则
      addRules: {
        companyTypeName: {
          required: true,
          message: '请输入类型名称',
          trigger: 'blur'
        },
        companyTypeCode: {
          required: true,
          message: '请输入类型编码',
          trigger: 'blur'
        }
      }
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
  },
  methods: {
    // 获取页面数据
    async getQuanIndex() {
      const data = await page(this.queryForm)
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
    // 新增
    addQuanIndex() {
      this.isEdite = false
      this.addDialogVisible = true
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async(valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          res = await save(this.addRuleForm)
        } else {
          res = await editeQuanIndexFrom(this.addRuleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.clearDialog() // 关闭表单
          this.getQuanIndex() // 刷新列表
        } else {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            message: res.data
          })
        }
      })
    },
    clearDialog() {
      this.addRuleForm.companyTypeName = ''
      this.addRuleForm.companyTypeCode = ''
      this.addRuleForm.remark = ''
      this.addDialogVisible = false
    },
    // 根据id修改数据
    async handleAddOrUpdate(id) {
      this.isEdite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(id))
    },
    // 根据id删除数据
    handleDelete(ids) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          handleDelete(ids).then((res) => {
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
  .app-tabs {
    margin-top: 20px;
  }
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
    .app-table-list {
      width: 100%;
      margin: 20px 0;
    }
  }
  .pagination {
    text-align: right;
  }
}
</style>
