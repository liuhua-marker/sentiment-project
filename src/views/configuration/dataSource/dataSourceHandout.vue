<template>
  <div class="app-container box">
    <div class="app-table">
      <h4>数据源分发列表</h4>
      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="机构名称" prop="orgName" />
        <el-table-column label="集合名称" prop="collectionName" />
        <el-table-column label="分发队列" prop="distributeQueueName" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="选择">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">编辑</el-button>
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

    <!-- 新增与修改的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="数据源分发列表"
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
        <el-form-item label="机构名称：" prop="orgName">
          <el-input v-model.trim="addRuleForm.orgName" :disabled="true" />
        </el-form-item>
        <el-form-item label="集合名称：" prop="collectionName">
          <el-input v-model.trim="addRuleForm.collectionName" size="medium" />
        </el-form-item>
        <el-form-item label="分发队列：" prop="distributeQueueName">
          <el-input v-model.trim.number="addRuleForm.distributeQueueName" />
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
  conforgsourcedistributeconfig,
  saveOrUpdateDistributeConfig
} from '@/api/dataSource/dataSourceHandout'
import { getBusinesss } from '@/api/business'

export default {
  name: 'DataSourceHandout',

  data() {
    return {
      loading: true,
      // 表单数据
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        orgId: ''
      },
      total: 0,
      // 新增数据
      addDialogVisible: false,
      addRuleForm: {},
      options: [],
      // 新增验证规则
      addRules: {
        collectionName: {
          required: true,
          message: '请输入集合名称',
          trigger: 'blur'
        },
        distributeQueueName: {
          required: true,
          message: '请输入分发队列',
          trigger: 'blur'
        }
      }
    }
  },
  created() {
    // 获取页面数据
    this.getTypeList()
    this.getQuanIndex()
  },
  methods: {
    getTypeList() {
      getBusinesss({}).then((res) => {
        this.options = res.rows
      })
    },
    // 获取页面数据
    async getQuanIndex() {
      const data = await conforgsourcedistributeconfig(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
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
    async handleAddOrUpdate(res) {
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(res))
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async(valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        res = await saveOrUpdateDistributeConfig(this.addRuleForm)
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
      this.$refs.addRuleForm.clearValidate()
      this.addDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
    .app-table-list {
      width: 100%;
      margin: 20px 0;
    }
  }
}
</style>
