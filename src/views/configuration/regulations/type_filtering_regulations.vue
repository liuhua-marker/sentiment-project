<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="规则类别:">
          <el-select
            v-model="queryForm.ruleClassifyCode"
            clearable
            placeholder="全部"
            @change="queryQuanIndex"
          >
            <el-option v-for="(val,key,i) in options" :key="i" :label="val" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则类型:">
          <el-input
            v-model.trim="queryForm.queryWord"
            placeholder="规则类型/类型编码"
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
      <h4>规则类型管理</h4>

      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="规则类别" prop="ruleClassifyName" />
        <el-table-column label="规则类型" prop="ruleTypeName" />
        <el-table-column label="类型编码" prop="ruleTypeCode" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="新增时间">
          <template slot-scope="scope">{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="选择">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete([scope.row.ruleTypeId])">删除</el-button>
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

    <!-- 新增与修改的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="规则类型"
      :visible.sync="addDialogVisible"
      width="50%"
      :before-close="clearDialog"
    >
      <el-form
        ref="addRuleForm"
        :model="addRuleForm"
        :rules="addRules"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="规则类型：" prop="ruleTypeName">
          <el-input v-model.trim="addRuleForm.ruleTypeName" />
        </el-form-item>
        <el-form-item label="规则类别：" prop="ruleClassifyCode">
          <el-select v-model="addRuleForm.ruleClassifyCode" :disabled="isEdite" placeholder="请选择">
            <el-option v-for="(val,key,i) in options" :key="i" :label="val" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型编码：" prop="ruleTypeCode">
          <el-input v-model.trim="addRuleForm.ruleTypeCode" />
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
  handleDelete,
  getRulesClassify
} from '@/api/regulations/type_filtering'
// import Pagination from '@/components/Pagination'
// import { getToken } from '@/utils/auth'

export default {
  name: 'TypeFilteringRegulations',
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
        ruleClassifyCode: '',
        queryWord: ''
      },
      total: 0,
      // 新增数据
      addDialogVisible: false,
      addRuleForm: {
        ruleTypeName: '',
        ruleClassifyCode: '',
        ruleTypeCode: '',
        remark: ''
      },
      options: {},
      // 新增验证规则
      addRules: {
        ruleTypeName: {
          required: true,
          message: '请输入规则类型名称',
          trigger: 'blur'
        },
        ruleClassifyCode: {
          required: true,
          message: '请选择规则类别',
          trigger: 'blur'
        },
        ruleTypeCode: {
          required: true,
          message: '请输入规则类型编码',
          trigger: 'blur'
        }
      }
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
    getRulesClassify().then(res => {
      this.options = res.data
    })
  },
  methods: {
    // 获取页面数据
    async getQuanIndex() {
      const data = await page(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
      // console.log(data);
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
      // console.log(val)
    },
    // 新增
    addQuanIndex() {
      this.isEdite = false
      this.addDialogVisible = true
      this.addRuleForm.ruleClassifyCode = Object.keys(this.options)[0]
    },
    // 根据id修改数据
    async handleAddOrUpdate(res) {
      this.isEdite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(res))
    },
    addQuanIndexFrom() {
      // console.log(this.addRuleForm);
      this.$refs.addRuleForm.validate(async valid => {
        if (!valid) return
        // 成功了调用接口;
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
          this.getQuanIndex() // 刷新列表
          this.clearDialog() // 关闭表单
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
      this.addRuleForm.ruleTypeName = ''
      this.addRuleForm.ruleClassifyCode = ''
      this.addRuleForm.ruleTypeCode = ''
      this.addRuleForm.remark = ''
      this.addDialogVisible = false
      this.$refs.addRuleForm.clearValidate()
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
