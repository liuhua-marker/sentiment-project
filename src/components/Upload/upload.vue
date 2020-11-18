<template>
  <div class="add-gauge-dialog">
    <el-upload
      ref="upload"
      :action="uploadAction"
      class="upload"
      :headers="headers"
      :name="sendFileName"
      :limit="2"
      :data="uploadSendData"
      :on-success="uploadSuccess"
      :on-exceed="handleExceed"
      :on-change="handleChange"
      :before-upload="beforeAvatarUpload"
      :on-remove="handleRemove"
      :accept="accept"
      :auto-upload="false"
      :on-error="uploadFail"
      :file-list="fileList"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <!-- <span class="upload__tip">上传文件后缀为.xlsl的表格文件</span> -->
    </el-upload>

  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'upload-file-dialog',
  props: {
    uploadUrl: {
      // 上传的文件地址
      type: String,
      default: ''
    },
    sendData: {
      // 上传的文件附加参数
      type: Object,
      default: {
        importInstructions: ''
      }
    },
    sendFileName: {
      // 上传的文件参数名称
      type: String,
      default: 'file'
    },
    accept: {
      type: String,
      default: ''
    },
    maxSize: {
      type: Number,
      default: 20
    }
  },
  components: {},
  computed: {
    ...mapGetters(['token'])
  },
  data() {
    return {
      showText: false,
      download: '',
      hidenItem: {
        reasonSelect: true
      },
      headers: {
        Authorization: ''
      },
      canEidt: false,
      fileList: [],
      uploadAction: '',
      downloadFileUrl: '',
      uploadSendData: {}
    }
  },
  mounted() {
    this.uploadAction = this.uploadUrl
    this.uploadSendData = this.sendData
    console.log('downloadFileUrl', this.downloadFileUrl)
    this.headers.Authorization = this.token
  },
  methods: {
    handleExceed(file, fileList) {
      this.$message({
        type: 'info',
        message: '当前只能上传一个文件!',
        showClose: true,
        duration: 2000
      })
    },
    handleRemove() {
      if (this.canEidt) {
        this.showText = true
      } else {
        this.showText = false
      }
    },
    handleDownload() {
      //window.location.href = host + apiUrls.authFile + row.authorizePdf;
      let formData = new FormData()
      formData.append('fileName', row.newFileName)
      formData.append('oldFileName', row.word)
      download(formData).then(ret => {
        console.log('download5', ret)
        if (!ret) {
          this.$message({
            type: 'error',
            message: ret.message || '下载错误'
          })
          return
        }
        this.downLoadFile(row.word, ret)
        this.$message({
          type: 'success',
          message: '下载成功'
        })
      })
        .catch(err => {
          this.$message({
            type: 'error',
            message: ret.message || '未知错误'
          })
        })
    },
    downLoadFile(filename, ret) {
      console.error('ret', ret, filename)
      var blob = ret
      var a = document.createElement('a')
      a.id = 'downloadFtsetBtn'
      a.style.display = 'none'
      a.target = '_blank'
      document.body.appendChild(a)
      try {
        var URL = window.URL || window.webkitURL
        a.href = URL.createObjectURL(blob)
        a.download = filename
        if (typeof navigator.msSaveBlob == 'function') {
          //IE
          navigator.msSaveBlob(blob, filename)
        }
        a.click()
      } catch (e) {
        console.log(e)
      }
    },
    handleChange(file, fileList) {
      this.showText = false
      let fileName = file.name
      const isLt2M = file.size / 1024 / 1024 < this.maxSize
      if (!isLt2M) {
        this.$message({
          message: '上传文件大小不能超过 20MB!',
          type: 'warning'
        })
        this.fileList = []
        this.handleRemove()
        // this.$emit('newChange', this.options.propName, this.fileList[0].raw)
        return
      }
      this.fileList = []
      // this.fileList.push(file);
      this.fileList = fileList.slice(fileList.length - 1)
      // this.$emit('newChange', this.options.propName, this.fileList[0].raw)
    },
    beforeAvatarUpload(file) {
      console.log('file', file, this.uploadAction)
    },
    initData(data, canEidt) {
      console.log(this.sendData)
      this.uploadSendData = data.sendData || this.sendData
      this.uploadAction = host + data.uploadUrl
      this.downloadFileUrl = data.downloadFileUrl
      this.headers.Authorization = this.userMsg.token
      return this
    },
    handleShowText(data, canEidt) {
      console.error(data, canEidt)
      this.download = data.word
      this.canEidt = canEidt
      if (canEidt) {
        this.showText = true
      } else {
        this.showText = false
      }
    },
    //  表单重置
    initFrom() {
      this.uploadSendData = this.sendData
      this.canEidt = false
      this.isUpdate = false
      this.showText = false,
        this.download = '',
        this.$refs.upload.clearFiles()
      setTimeout(() => {
        for (let i in this.$refs) {
          let ref = this.$refs[i]
          if (ref.reset) {
            ref.reset()
          }
        }
      }, 90)
      return this
    },

    uploadSuccess(response) {
      console.log('response', response)
      this.loading.close()
      this.$refs.upload.clearFiles()
      this.fileList = []
      if (response.code == 200) {
        this.$message({
          type: 'success',
          message: '上传成功!'
        })

        this.$emit('uploadSuccess', response.data)
      } else {
        this.$message({
          type: 'error',
          message: response.message || '上传错误，请检查输入是否正确或下载最新模板重试'
        })
      }
    },
    uploadFail(err) {
      this.loading.close()
      this.$message({
        type: 'error',
        message: '上传失败，请联系管理员'
      })
      console.error(err)
    },
    submit() {
      if (this.fileList.length == 0) {
        this.$message({
          type: 'info',
          message: '请先上传Excel文件'
        })
        return
      }
      this.loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.1)'
      })
      this.$refs.upload.submit()
    }
  }
}
</script>

<style lang="scss">
  //@import "../../../styles/variables.scss";

  .add-gauge-dialog {
    .adress-selects {
      font-size: 0;

      > div {
        margin-right: 10px;
        display: inline-block;
      }
    }
  }

  .upload {
    display: flex;
    // align-content: center;

    .el-upload {
      // width: 35%;
      text-align: left;
      cursor: inherit;
    }

    .el-upload-list__item:first-child {
      margin-top: 0px;
      height: 36px;
      line-height: 36px;
      padding-left: 10px;
    }

    .el-upload-list__item .el-icon-close {
      top: 12px;
    }
  }

  .text {
    color: #1679BD;
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 140px;
  }
</style>
<style scoped lang="scss">
  //@import "../../../styles/siteInformation.scss";
</style>
<style scoped>
</style>
