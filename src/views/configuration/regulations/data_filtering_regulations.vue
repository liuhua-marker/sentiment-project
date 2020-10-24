<template>
  <div class="app-container box">
    <!-- 导航 -->
    <div class="app-filters">
      <el-radio-group v-model="queryForm.ruleTypeId" @change="switchLexicon">
        <el-radio-button
          v-for="item in radioLable"
          :key="item.ruleTypeId"
          :label="item.ruleTypeId"
        >{{ item.ruleTypeName }}</el-radio-button>
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
          <el-input
            v-model.trim="queryForm.queryWord"
            placeholder="规则/分类/备注"
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
        过滤规则表
        <div class="fr">
          <el-button type="primary" @click="addQuanIndex">新增</el-button>
          <el-button type="primary" @click="ImportFiles">导入</el-button>
          <el-button type="primary" @click="ImportModle">模板下载</el-button>
          <el-button type="primary" @click="exportFiles">导出</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="规则" prop="sourceRule" />
        <el-table-column label="分类" prop="sourceRuleClassify" />
        <el-table-column label="所属方案" prop="solutionName" />
        <el-table-column label="新增时间" width="180">
          <template slot-scope="scope">{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="选择" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete([scope.row.sourceRuleId])">删除</el-button>
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

    <!-- 新增、修改的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="数据源规则管理"
      :visible.sync="dialogVisible"
      width="55%"
      :before-close="clearDialog"
    >
      <el-form
        ref="ruleForm"
        :model="ruleForm"
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item v-if="userInfo.orgId === '0'" label="所属方案：" prop="solutionId">
          <el-select v-model="ruleForm.solutionId" :disabled="isEdite" placeholder="请选择方案">
            <el-option
              v-for="item in options"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规则：" prop="sourceRule">
          <el-input v-model.trim="ruleForm.sourceRule" placeholder="请输入规则" />
        </el-form-item>
        <el-form-item label="规则分类：" prop="sourceRuleClassify">
          <el-input v-model.trim="ruleForm.sourceRuleClassify" placeholder="请输入分类信息" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model.trim="ruleForm.remark" type="textarea" :rows="2" placeholder="备注说明" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button type="primary" @click="quanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 导入对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="上传文件"
      :visible.sync="ImportDialogVisible"
      width="40%"
      :before-close="handleClose"
    >
      <el-upload
        ref="upload"
        class="upload-demo"
        :action="action"
        accept=".xlsx, .xls"
        :headers="tokenHeader"
        :file-list="fileList"
        :limit="1"
        :on-success="handleSuccess"
        :on-error="uploadOnError"
        :auto-upload="false"
      >
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button
          style="margin-left: 10px;"
          size="small"
          type="success"
          @click="submitUpload"
        >上传到服务器</el-button>
        <div slot="tip" class="el-upload__tip">只能上传xlsx或者xls文件</div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import {
  page,
  confwordstype,
  save,
  editeQuanIndexFrom,
  handleDelete,
  domnLoadFile,
  domnLoadModel
} from '@/api/regulations/data_filtering'
import { list, selectNowSolution } from '@/api/configuration/ruls'
import { confsourcerules } from '@/utils/url'
import { getToken } from '@/utils/auth'
import { DomnLoadFile } from '@/utils/exportFiles'

export default {
  name: 'DataFilteringRegulations',

  data() {
    return {
      // 表单数据
      isEdite: false,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        queryWord: '',
        ruleTypeId: '',
        solutionId: ''
      },
      solutionForm: {
        pageNo: 1,
        pageSize: 100,
        solutionName: ''
      },
      type: {
        pageNo: 1,
        pageSize: 100,
        ruleClassifyCode: 'SOURCE'
      },
      total: 0,
      options: [],
      radioLable: [],
      // 验证规则
      rules: {
        sourceRule: {
          required: true,
          message: '请输入规则',
          trigger: 'blur'
        },
        solutionId: {
          required: true,
          message: '请选择方案',
          trigger: 'change'
        },
        sourceRuleClassify: {
          required: true,
          message: '请输入内容',
          trigger: 'blur'
        }
      },
      // 修改
      dialogVisible: false,
      ruleForm: {
        sourceRule: '',
        sourceRuleClassify: '',
        remark: '',
        solutionId: '',
        ruleTypeId: ''
      },
      userInfo: {},
      loading: true,
      // 导入
      tokenHeader: {
        Authorization: getToken()
      },
      action: '',
      ImportDialogVisible: false,
      fileList: [] // 文件上传列表
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
      await this.getWordsTypeId()
      await this.getQuanIndex()
    },
    // 获取页面数据
    async getWordsTypeId() {
      // 导航栏数据
      await confwordstype(this.type).then((res) => {
        if (res.rows.length === 0) {
          this.$message({
            type: 'error',
            message: '请 先 到 规 则 类 型 管 理 配 置 数 据 规 则',
            showClose: true,
            duration: 5 * 1000
          })
        } else {
          this.radioLable = res.rows
          this.queryForm.ruleTypeId = this.radioLable[0].ruleTypeId
          this.action = this.action + '/' + this.queryForm.ruleTypeId
        }
      })
      // 方案
      await list(this.solutionForm).then((res) => {
        this.options = res.rows
      })
      if (this.userInfo.orgId !== '0') {
        // 部门已选方案
        await selectNowSolution(this.userInfo.deptId).then((ress) => {
          if (ress.data === undefined) {
            this.$message({
              type: 'warning',
              message: '请联系管理员配置方案...'
            })
          } else {
            this.queryForm.solutionId = ress.data.solutionId
          }
        })
      }
    },
    // 获取页面数据
    async getQuanIndex() {
      const data = await page(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    switchLexicon(label) {
      this.queryForm.pageNo = 1
      this.queryForm.ruleTypeId = label
      this.action = this.action + '/' + this.queryForm.ruleTypeId
      this.getQuanIndex()
    },
    // 查询
    queryQuanIndex(v) {
      this.loading = true
      this.queryForm.pageNo = 1
      this.getQuanIndex()
    },
    // 导入
    ImportFiles() {
      this.ImportDialogVisible = true
      this.action = confsourcerules() + this.queryForm.ruleTypeId
    },
    // 文件上传
    submitUpload() {
      this.$refs.upload.submit()
    },
    // 文件上传成功
    handleSuccess(res) {
      if (res.code === 200) {
        this.$message({
          showClose: true,
          type: 'success',
          message: '文件上传成功'
        })
        this.ImportDialogVisible = false
        this.getQuanIndex()
      } else {
        this.$message({
          showClose: true,
          type: 'error',
          duration: 0,
          dangerouslyUseHTMLString: true,
          message: res.msg
        })
      }
    },
    // 文件上传失败
    uploadOnError() {
      this.$message.error('文件上传出错！')
    },
    handleClose() {
      this.fileList = []
      this.ImportDialogVisible = false
    },
    // 导出
    exportFiles() {
      if (!this.queryForm.solutionId) {
        this.$message({
          type: 'warning',
          message: '请选择方案'
        })
        return
      }
      const File = domnLoadFile(
        this.queryForm.solutionId,
        this.queryForm.ruleTypeId
      )
      const fname = `数据源规则文档`
      DomnLoadFile(File, fname)
    },
    // 导出模板
    ImportModle() {
      const File = domnLoadModel()
      const fname = `数据源规则文档模板`
      DomnLoadFile(File, fname)
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
      this.dialogVisible = true
      this.ruleForm.solutionId = this.queryForm.solutionId
      this.ruleForm.ruleTypeId = this.queryForm.ruleTypeId
    },
    // 根据id修改数据
    handleAddOrUpdate(res) {
      this.isEdite = true
      this.dialogVisible = true
      this.ruleForm = JSON.parse(JSON.stringify(res))
    },
    quanIndexFrom() {
      this.$refs.ruleForm.validate(async(valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          // 新增
          res = await save(this.ruleForm)
        } else {
          // 修改
          res = await editeQuanIndexFrom(this.ruleForm)
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
      this.ruleForm.solutionId = ''
      this.ruleForm.sourceRule = ''
      this.ruleForm.sourceRuleClassify = ''
      this.ruleForm.remark = ''
      // 刷新列表
      this.dialogVisible = false
      this.$refs.ruleForm.clearValidate()
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
  .pagination {
    text-align: right;
  }
}
</style>
