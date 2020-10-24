<template>
  <div>
    <!-- 进度条 -->
    <el-progress v-if="isShow" :text-inside="true" :stroke-width="16" :percentage="progress" />
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
        :action="actions"
        accept=".xlsx, .xls"
        :multiple="false"
        :headers="tokenHeader"
        :file-list="fileList"
        :limit="1"
        :on-success="handleSuccess"
        :on-error="uploadOnError"
        :before-upload="beforeUpload"
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
  selectUploadInfo,
  selectUploadInfoByType,
  selectExcelIsExist,
  downloadExcel
} from '@/api/enterprise/enterpriseTarget'
import { getToken } from '@/utils/auth'
import { UplodLoadFile } from '@/utils/exportFiles'
import { Notification, Message } from 'element-ui'
// import { request } from '@/utils/request'
export default {
  name: 'UploadFile',
  props: {
    dialogVisible: {
      type: Boolean
    },
    action: {
      type: String,
      default: ''
    },
    imports: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShow: false,
      selectTime: null,
      ImportDialogVisible: this.dialogVisible,
      actions: this.action,
      tokenHeader: {
        Authorization: getToken()
      },
      fileList: [],
      progress: 0
    }
  },
  computed: {},
  watch: {
    // 监听属性
    // 绑定监听数据
    dialogVisible: function(e) {
      this.ImportDialogVisible = this.dialogVisible
    },
    action: function(e) {
      this.actions = this.action
    }
  },
  created() {
    this.selectUpload('UPLOAD_COMPANY')
    this.selectUpload('UPLOAD_KEYWORD')
  },
  destroyed() {
    clearInterval(this.selectTime)
    this.selectTime = null
  },
  methods: {
    // 查询是否正在上传
    selectUpload(upload_type) {
      selectUploadInfoByType(upload_type).then(res => {
        const uploadId = res.data
        if (res.data) {
          selectUploadInfo(uploadId).then(res => {
            this.progress = (res.data.finishRatio * 100).toFixed(2) - 0
            if (res.data.length !== 0) {
              this.getProgress(uploadId, upload_type)
            }
          })
        }
      })
    },
    getProgress(uploadId, upload_type) {
      this.isShow = true
      this.selectTime = setInterval(() => {
        selectUploadInfo(uploadId).then(res => {
          this.progress = (res.data.finishRatio * 100).toFixed(2) - 0
          if (res.data.finishRatio === '1.0000') {
            clearInterval(this.selectTime)
            this.selectTime = null
            Message.closeAll()
            this.$message.success('文件上传完成')
            const message = `<p>重复上传 ${res.data.repeatRecordNum}</p><p>失败上传 ${res.data.errorRecordNum}</p>`
            this.$notify({
              showClose: true,
              duration: 60000,
              dangerouslyUseHTMLString: true,
              message: message,
              position: 'bottom-right'
            })
            this.handleClose()
            if (upload_type === 'UPLOAD_KEYWORD') {
              const data = localStorage.data
              const fname = `补充关键词文档`
              this.loadKeyWords(data, fname)
            }
            this.isShow = false
          }
        })
      }, 1000)
    },
    loadKeyWords(data, fname) {
      var date = new Date().getTime() + 180000
      const message = `<p>表格正在生成中...</p><p>请勿关闭页面！</p>`
      this.$notify({
        showClose: true,
        duration: 180000,
        dangerouslyUseHTMLString: true,
        message: message,
        type: 'warning'
      })
      this.time = setInterval(() => {
        if (new Date().getTime() >= date) {
          this.$message.error('表格生成失败！')
          Notification.closeAll()
          clearInterval(this.time)
          this.time = null
          return
        }
        selectExcelIsExist(data).then(res => {
          if (res.code && res.code === 200) {
            setTimeout(() => {
              Notification.closeAll()
            }, 3000)
            clearInterval(this.time)
            this.time = null
            const file = downloadExcel(data)
            UplodLoadFile(file, fname)
          }
        })
      }, 5000)
      localStorage.removeItem('data')
    },
    beforeUpload(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const extension = testmsg === 'xls'
      const extension2 = testmsg === 'xlsx'
      const isLt2M = file.size / 1024 / 1024 < 10 // 这里做文件大小限制
      if (!extension && !extension2) {
        this.$message({
          message: '上传文件只能是 xls、xlsx格式!',
          type: 'warning'
        })
      }
      if (!isLt2M) {
        this.$message({
          message: '上传文件大小不能超过 100MB!',
          type: 'warning'
        })
      }
      return extension || (extension2 && isLt2M)
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
        localStorage.data = res.data
        this.getProgress(res.data, this.imports)
        this.handleClose()
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
      this.$emit('handleClose')
      this.fileList = []
    }
  }
}
</script>

<style lang="scss" scoped>
.el-progress {
  width: 150px;
  position: fixed;
  top: 155px;
  right: 40px;
}
</style>
