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
          <el-select v-model="queryForm.solutionId" clearable placeholder="全部" @change="queryQuanIndex">
            <el-option
              v-for="item in options"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词查询:">
          <el-input v-model.trim="queryForm.queryWord" placeholder="名称/标签" size="medium" @keyup.enter.native="queryQuanIndex" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <div class="app-head">
        标签列表
        <div class="fr">
          <el-button type="primary" @click="addQuanIndex">新增</el-button>
          <!-- <el-button type="primary" :disabled="isShow" @click="ImportFiles">导入</el-button>
          <el-button type="primary" @click="ImportModle">模板下载</el-button>
          <el-button type="primary" @click="exportFiles">导出</el-button>-->
        </div>
      </div>

      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="名称" prop="sourceLabelClassify" />
        <el-table-column label="标签" prop="sourceLabel" />
        <el-table-column label="所属方案" width="220" prop="solutionName" />
        <el-table-column label="新增时间" width="200">
          <template slot-scope="scope">{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="备注" width="200" prop="remark" />
        <el-table-column label="选择" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete([scope.row.sourceLabelId])"
            >删除</el-button>
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
      title="标签管理"
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
        <el-form-item label="名称：" prop="sourceLabelClassify">
          <el-input v-model.trim="ruleForm.sourceLabelClassify" placeholder="请输名称" />
        </el-form-item>
        <el-form-item label="标签：" prop="sourceLabel">
          <el-input v-model="ruleForm.sourceLabel" placeholder="请输入标签" />
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
    <!-- <el-dialog
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
    </el-dialog>-->
  </div>
</template>

<script>
import {
  confsourcelabelList,
  confsourcelabelSave,
  confsourcelabelUpdate,
  handleDelete,
  domnLoadFile,
  domnLoadModel
} from '@/api/configuration/word'
import {
  list,
  confwordstype,
  selectNowSolution
} from '@/api/configuration/ruls'
import { confsourceLabels } from '@/utils/url'
import { getToken } from '@/utils/auth'

export default {
  name: 'ConfNegativeWordMapping',

  data() {
    return {
      // 表单数据
      loading: true,
      isEdite: false,
      isShow: false,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        queryWord: '',
        solutionId: '',
        labelTypeId: ''
      },
      solutionForm: {
        pageNo: 1,
        pageSize: 100
      },
      type: {
        pageNo: 1,
        pageSize: 100,
        labelTypeClassifyCode: 'source'
      },
      total: 0,
      options: [],
      radioLable: [],
      // 验证规则
      rules: {
        sourceLabel: {
          required: true,
          message: '请输入名称',
          trigger: 'blur'
        },
        sourceLabelClassify: {
          required: true,
          message: '请输入标签',
          trigger: 'blur'
        },
        solutionId: {
          required: true,
          message: '请选择所属方案',
          trigger: 'change'
        }
      },
      // 修改
      dialogVisible: false,
      ruleForm: {
        sourceLabel: '',
        sourceLabelClassify: '',
        remark: '',
        solutionId: '',
        labelTypeId: ''
      },
      userInfo: {},
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
    // 获取页面数据
    async getQuanIndex() {
      const data = await confsourcelabelList(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    switchLexicon(label) {
      this.queryForm.pageNo = 1
      this.queryForm.labelTypeId = label
      this.action = this.action + '/' + this.queryForm.labelTypeId
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
      this.action = confsourceLabels() + this.queryForm.labelTypeId
    },
    // 文件上传
    submitUpload() {
      this.$refs.upload.submit()
    },
    // 文件上传成功
    handleSuccess(res) {
      if (res.code === 200) {
        this.$message.error('文件上传成功')
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
      var programme = this.queryForm.solutionId
      domnLoadFile(programme, this.queryForm.labelTypeId).then(res => {
        if (res) {
          var blob = res
          var objectUrl = URL.createObjectURL(blob)
          var link = document.createElement('a')
          var fname = `推理词文档` // 下载文件的名字
          link.href = objectUrl
          link.setAttribute('download', fname + '.xlsx')
          document.body.appendChild(link)
          link.click()
        } else {
          this.$message({
            type: 'error',
            message: '导出失败'
          })
        }
      })
    },
    // 导出模板
    ImportModle() {
      domnLoadModel().then(res => {
        if (res) {
          var blob = res
          var objectUrl = URL.createObjectURL(blob)
          var link = document.createElement('a')
          var fname = `推理词文档模板` // 下载文件的名字
          link.href = objectUrl
          link.setAttribute('download', fname + '.xlsx')
          document.body.appendChild(link)
          link.click()
        } else {
          console.error(res)
          this.$message({
            type: 'error',
            message: '导出失败'
          })
        }
      })
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
      this.ruleForm.labelTypeId = this.queryForm.labelTypeId
    },
    // 根据id修改数据
    handleAddOrUpdate(res) {
      this.isEdite = true
      this.dialogVisible = true
      this.ruleForm = JSON.parse(JSON.stringify(res))
    },
    quanIndexFrom() {
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          // 新增
          res = await confsourcelabelSave(this.ruleForm)
        } else {
          // 修改
          res = await confsourcelabelUpdate(this.ruleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          // 关闭表单
          this.clearDialog()
          // 刷新列表
          this.getQuanIndex()
        }
      })
    },
    clearDialog() {
      this.ruleForm = {
        sourceLabel: '',
        sourceLabelClassify: '',
        remark: '',
        solutionId: '',
        labelTypeId: ''
      }
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
