<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="数据源名称查询:">
          <el-input
            v-model.trim="queryList"
            placeholder="词条名"
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
        <el-form-item>
          <el-button type="primary" @click="ImportFiles">导入信息</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="ImportModle">模板下载</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="exportFiles">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <h4>数据源管理</h4>

      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="数据源名称" prop="sourceName" />
        <el-table-column label="数据源类型" width="100" prop="sourceTypeName" />
        <el-table-column label="URL" prop="sourceUrl" />
        <el-table-column label="优先级" width="80" prop="sourceSort" />
        <el-table-column label="包含版块" width="100" prop="sourceSection" />
        <el-table-column label="新增时间" width="180">
          <template slot-scope="scope">{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="备注" width="80" prop="remark" />
        <el-table-column label="选择" width="180">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete([scope.row.sourceId])">删除</el-button>
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
      title="数据源管理"
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
        <el-form-item label="数据源名称 ：" prop="sourceName">
          <el-input v-model.trim="addRuleForm.sourceName" />
        </el-form-item>
        <el-form-item label="URL：" prop="sourceUrl">
          <el-input v-model.trim="addRuleForm.sourceUrl" size="medium" />
        </el-form-item>
        <el-form-item label="选择类型：" prop="sourceTypeName">
          <el-select v-model="addRuleForm.sourceTypeName" placeholder="请选择">
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.typeName"
              :value="item.typeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级：" prop="sourceSort">
          <el-input v-model.trim.number="addRuleForm.sourceSort" />
        </el-form-item>
        <el-form-item label="包含板块：" prop="sourceSection">
          <el-input v-model.trim="addRuleForm.sourceSection" />
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
  list,
  save,
  editeQuanIndexFrom,
  handleDelete,
  domnLoadFile,
  domnLoadModel
} from '@/api/dataSource/collectionSites'
import { getToken } from '@/utils/auth'
import { confDataSource } from '@/utils/url'
import { DomnLoadFile } from '@/utils/exportFiles'

export default {
  name: 'CollectionSites',

  data() {
    return {
      loading: true,
      isEadite: false,
      // 表单数据
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        sourceName: ''
      },
      tokenHeader: {
        Authorization: getToken()
      },
      typeList: {
        deptId: 0,
        pageNo: 1,
        pageSize: 9999999,
        typeName: ''
      },
      queryList: '',
      total: 0,
      // 新增数据
      addDialogVisible: false,
      addRuleForm: {
        sourceName: '',
        sourceUrl: '',
        sourceSort: 0,
        sourceSection: '',
        sourceTypeName: '新闻',
        sourceTypeId: '',
        remark: ''
      },
      options: [],
      // 新增验证规则
      addRules: {
        sourceUrl: { required: true, message: '请输入URL', trigger: 'blur' },
        sourceName: {
          required: true,
          message: '请填写数据源名称',
          trigger: 'blur'
        },
        sourceSort: [
          { required: true, message: '请填写优先级', trigger: 'blur' },
          { type: 'number', message: '优先级必须为数字值' }
        ]
      },
      // 导入
      action: confDataSource(),
      ImportDialogVisible: false,
      fileList: [] // 文件上传列表
    }
  },
  created() {
    // 获取页面数据
    this.getTypeList()
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
    getTypeList() {
      list(this.typeList).then((res) => {
        this.options = res.rows
      })
    },
    // 查询
    queryQuanIndex(v) {
      this.loading = true
      this.queryForm.pageNo = 1
      this.queryForm.sourceName = this.queryList
      this.getQuanIndex()
    },
    // 导入
    ImportFiles() {
      this.ImportDialogVisible = true
    },
    // 文件上传
    submitUpload() {
      this.$refs.upload.submit()
    },
    // 文件上传成功
    handleSuccess(res) {
      if (res.code === 200) {
        this.$message.success('文件上传成功')
        this.getQuanIndex()
        this.ImportDialogVisible = false
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
      const File = domnLoadFile()
      const fname = `数据源文档`
      DomnLoadFile(File, fname)
    },
    // 导出模板
    ImportModle() {
      const File = domnLoadModel()
      const fname = `数据源文档模板`
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
      this.isEadite = false
      this.addDialogVisible = true
    },
    // 根据id修改数据
    async handleAddOrUpdate(res) {
      this.isEadite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(res))
    },
    addQuanIndexFrom() {
      this.options.forEach((item) => {
        if (this.addRuleForm.sourceTypeName === item.typeName) {
          this.addRuleForm.sourceTypeId = item.sourceTypeId
        }
      })
      this.$refs.addRuleForm.validate(async(valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEadite) {
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
      this.addRuleForm.sourceName = ''
      this.addRuleForm.sourceUrl = ''
      this.addRuleForm.sourceTypeName = '新闻'
      this.addRuleForm.sourceSort = ''
      this.addRuleForm.sourceSection = ''
      this.addRuleForm.remark = ''
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
