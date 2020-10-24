<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="机构:">
          <el-select v-model="queryForm.orgId" clearable placeholder="全部" @change="changeOrg">
            <el-option
              v-for="item in optionOrg"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门:">
          <el-select v-model="queryForm.deptId" clearable placeholder="全部" @change="getQuanIndex">
            <el-option
              v-for="item in optionDept"
              :key="item.id"
              :label="item.deptName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <h4>方案配置列表</h4>

      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="机构名称" prop="orgName" />
        <el-table-column label="部门名称" prop="deptName" />
        <el-table-column label="方案名称" prop="solutionName" />
        <el-table-column label="选择" width="220">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">配置</el-button>
            <el-button type="danger" size="small" @click="handleReset(scope.row)">重置</el-button>
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
      title="方案管理："
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
        <el-form-item label="部门名称：" prop="deptName">
          <el-input v-model.trim="addRuleForm.deptName" :disabled="true" />
        </el-form-item>
        <el-form-item label="方案名称：" prop="solutionId">
          <el-select v-model="addRuleForm.solutionId" placeholder="请选择" @change="changSolution">
            <el-option
              v-for="item in optionSoultion"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button
          :loading="loadBtn"
          type="primary"
          :disabled="isSolution"
          @click="addQuanIndexFrom"
        >{{ loadBtnName }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  solutionList,
  configuration,
  resetSolution
} from '@/api/programme/programmeSolution'
import { getBusinesss } from '@/api/business'
import { systemDept } from '@/api/analysis/hot_analysis'
import { page } from '@/api/programme/programme'
// import Pagination from '@/components/Pagination'
// import { getToken } from '@/utils/auth'

export default {
  name: 'ProgrammeSolution',
  // components: { Pagination },

  data() {
    return {
      loadBtnName: '确 定',
      loadBtn: false,
      loading: true,
      isSolution: true,
      // 表单数据
      quanWordList: [],
      optionOrg: [],
      optionDept: [],
      optionSoultion: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        orgId: '',
        deptId: ''
      },
      total: 0,
      // 新增与修改数据
      addDialogVisible: false,
      addRuleForm: { solutionId: '' },
      // 验证规则
      addRules: {
        solutionId: {
          required: true,
          message: '请选择方案',
          trigger: 'change'
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
        this.optionOrg = res.rows
      })
      page({}).then((res) => {
        this.optionSoultion = res.rows
      })
    },
    // 选择机构
    changeOrg(v) {
      this.loading = true
      this.queryForm.pageNo = 1
      this.queryForm.deptId = ''
      this.getDept()
      this.getQuanIndex()
    },
    getDept() {
      const orgId = { orgIds: [this.queryForm.orgId] }
      systemDept(orgId).then((res) => [(this.optionDept = res.rows)])
    },
    // 获取页面数据
    async getQuanIndex() {
      const data = await solutionList(this.queryForm)
      this.quanWordList = data.rows
      this.quanWordList.forEach((item) => {
        item.id = item.solutionId
        item.solutionId = item.parentSolutionId
      })

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
    // 配置
    handleAddOrUpdate(res) {
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(res))
    },
    changSolution() {
      this.isSolution = false
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async(valid) => {
        this.loadBtn = true
        this.loadBtnName = '加载中'
        if (!valid) return
        // 成功了调用接口
        configuration(
          this.addRuleForm.deptId,
          this.addRuleForm.solutionId
        ).then((res) => {
          this.loadBtn = false
          this.loadBtnName = '确 定'
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.clearDialog() // 关闭表单
          this.getQuanIndex() // 刷新列表
        })
      })
    },
    // 重置
    handleReset(row) {
      this.$confirm('确定重置方案吗?重置后内容不可恢复', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetSolution(row.id).then((res) => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '方案重置成功'
            })
          }
        })
      })
    },
    clearDialog() {
      this.addDialogVisible = false
      this.isSolution = true
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
