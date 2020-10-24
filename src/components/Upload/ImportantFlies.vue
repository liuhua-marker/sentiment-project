<template>
  <div>
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
import { getToken } from '@/utils/auth'
// import { Message } from 'element-ui'
// import { request } from '@/utils/request'
export default {
  name: 'ImportantFlies',
  props: {
    dialogVisible: {
      type: Boolean
    },
    action: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ImportDialogVisible: this.dialogVisible,
      actions: this.action,
      tokenHeader: {
        Authorization: getToken()
      },
      fileList: []
    }
  },
  computed: {},
  watch: {
    // 绑定监听数据
    dialogVisible: function(e) {
      this.ImportDialogVisible = this.dialogVisible
    },
    action: function(e) {
      this.actions = this.action
    }
  },
  created() {},
  destroyed() {},
  methods: {
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
</style>
