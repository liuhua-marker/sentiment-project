<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :before-close="handleCancle"
    width="850px"
  >
    <el-tabs type="border-card" v-model="activeName">
      <el-tab-pane :label="`图片 (${imgSize})`" name="DMT1">
        <el-upload
          class="upload-demo"
          :action="action"
          :file-list="fileListImg"
          :headers="headers"
          :data="{type:activeName,userId:userInfo.id}"
          :on-success="uploadSuccess"
          accept="image/*"
          :before-upload="beforeUpload"
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传1280*800像素大小图片，且不超过5M</div>
        </el-upload>
        <listTable @loadComplete="(res)=>loadComplete(res,'DMT1')" ref="listTableDMT1" :options="listOptionImg"
                   @command="listCommand"></listTable>
      </el-tab-pane>
      <el-tab-pane :label="`视频 (${videoSize})`" name="DMT2">
        <el-upload
          class="upload-demo"
          :action="action"
          :file-list="fileListImg"
          :headers="headers"
          :data="{type:activeName,userId:userInfo.id}"
          :on-success="uploadSuccess"
          accept="video/*"
          :before-upload="beforeUpload"
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">视频大小不能超过50M</div>
        </el-upload>
        <listTable ref="listTableDMT2" :options="listOptionRadio"
                   @command="listCommand" @loadComplete="(res)=>loadComplete(res,'DMT2')"></listTable>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { uploadUrl, selectMaterial, deleteMaterial, downloadMaterial } from '@/api/materialCenter'
import listTable from '@/components/table/listTable'
import dateFormat from '@/assets/Date'

export default {
  name: 'materialCenteDialog',
  components: { listTable },
  data() {
    return {
      dialogTitle: '素材中心',
      dialogVisible: false,
      activeName: 'DMT1',
      fileListImg: [],
      action: uploadUrl,
      headers: {
        Authorization: ''
      },
      validWidth: 1280,
      validHeight: 800,
      imgSize: 0,
      videoSize: 0,
      listOptionImg: {
        // 列表api
        listApi: {
          serviceFN: selectMaterial,
          params: { type: 'DMT1' }
        },
        // 表头设置
        // multipleTable: true,
        index: {
          // 序号配置项
          num: false,
          width: 60
        },
        header: [
          {
            label: '中文标题',
            propName: 'cname',
            align: 'center'
          },
          {
            label: '文件大小',
            propName: 'materialSize',
            align: 'center',
            width: '100'
            // commandName: 'handleView'
          },
          {
            label: '上传时间',
            propName: 'createdTime',
            align: 'center',
            formatter: row => {
              if (!row) {
                return '--'
              }
              const date = new Date(row)
              return dateFormat.formatDate(date, 'yyyy-MM-dd hh-mm-ss')
            }
          },
          {
            label: '操作',
            // width: '200',
            btns: [
              {
                label: '下载',
                commandName: 'downloadFile',
                type: 'primary'
              },
              {
                label: '选择',
                commandName: 'choice',
                type: 'primary'
              },
              {
                label: '删除',
                commandName: 'deleteMaterial',
                type: 'danger'
              }
            ],
            btnGroups: false,
            align: 'center'
          }
        ]
      },
      listOptionRadio: {
        // 列表api
        listApi: {
          serviceFN: selectMaterial,
          params: { type: 'DMT2' }
        },
        // 表头设置
        // multipleTable: true,
        index: {
          // 序号配置项
          num: false,
          width: 60
        },
        header: [
          {
            label: '中文标题',
            propName: 'cname',
            align: 'center'
          },
          {
            label: '文件大小',
            propName: 'materialSize',
            align: 'center',
            width: '100'
            // commandName: 'handleView'
          },
          {
            label: '上传时间',
            propName: 'createdTime',
            align: 'center',
            formatter: row => {
              if (!row) {
                return '--'
              }
              const date = new Date(row)
              return dateFormat.formatDate(date, 'yyyy-MM-dd hh-mm-ss')
            }
          },
          {
            label: '操作',
            // width: '200',
            btns: [
              {
                label: '下载',
                commandName: 'downloadFile',
                type: 'primary'
              },
              {
                label: '选择',
                commandName: 'choice',
                type: 'primary'
              }
              // {
              //   label: '删除',
              //   commandName: 'deleteMaterial',
              //   type: 'danger'
              // }
            ],
            btnGroups: false,
            align: 'center'
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  mounted() {
    // console.log(this.userInfo)
    this.headers.Authorization = this.userInfo.token
    this.listOptionRadio.listApi.params.userId = this.userInfo.id
    this.listOptionImg.listApi.params.userId = this.userInfo.id
  },
  methods: {
    deleteMaterial(row) {
      this.$confirm('确定删除此条数据?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteMaterial([row.materialId]).then(res => {
            if (res.code === 200) {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.listTable()
            }
          })
        })
    },
    loadComplete(res, type) {
      type === 'DMT1' ? this.imgSize = res.total : this.videoSize = res.total
    },
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    downloadFile(row) {
      const fileName = row.path.split('/')[row.path.split('/').length - 1]
      downloadMaterial({ path: row.path }).then((res) => {
        this.downLoadFile(fileName, res, res.type)
      })
    },
    downLoadFile(name, ret, type) {
      // alert(!!window.ActiveXObject || "ActiveXObject" in window)
      // return
      var filename = name
      console.error(name, ret, type)
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        // IE浏览器保存文本框内容

        var type = type || 'application/pdf;charset=utf-8'
        console.log('blob', ret)
        var blob =
          typeof File === 'function'
            ? new File([ret], filename, { type: type })
            : new Blob([ret], { type: type })
        // console.log('blob', blob)
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename)
        } else {
          var URL = window.URL || window.webkitURL
          var downloadUrl = URL.createObjectURL(blob)

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement('a')
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl
            } else {
              a.href = downloadUrl
              a.download = filename
              document.body.appendChild(a)
              a.click()
            }
          } else {
            window.location = downloadUrl
          }
        }
      } else {
        var blob = new Blob([ret], {
          type: type
        })
        let a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display: none'
        const url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = name
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      }
    },
    choice(row) {
      this.close()
      this.$emit('hanldChoice', row, this.isEdit)
    },
    open() {
      this.dialogVisible = true
      setTimeout(() => {
        this.$refs.listTableDMT1.search()
        this.$refs.listTableDMT2.search()
      }, 200)
      return this
    },
    initData(isEdit) {
      this.isEdit = isEdit
    },
    close() {
      this.fileListImg = []
      this.activeName = 'DMT1'
      this.dialogVisible = false
    },
    handleCancle() {
      this.close()
    },
    listTable() {
      this.$refs['listTable' + this.activeName].search({ type: this.activeName })
    },
    beforeUpload(file, fileList) {
      // console.log(file)
      const size = this.activeName === 'DMT1' ? 5 : 50
      const isLt2M = file.size / 1024 / 1024 < size
      if (!isLt2M) {
        this.$message({
          message: `上传文件大小不能超过 ${size}MB!`,
          type: 'warning'
        })
        this.fileListEn = []
        return
      }
      if (this.activeName === 'DMT1') {
        return this.valWidthAndHeight(file)
      }
    },
    valWidthAndHeight: function(file) {
      var _this = this
      return new Promise(function(resolve, reject) {
        var width = _this.validWidth // 图片宽度
        var height = _this.validHeight // 图片高度
        var _URL = window.URL || window.webkitURL
        var image = new Image()
        image.src = _URL.createObjectURL(file)
        image.onload = function() {
          var valid = image.width === width && image.height === height
          valid ? resolve() : reject()
        }
      }).then(
        () => {
          return file
        },
        () => {
          this.$message.error('上传图片尺寸不符合,只能是' + _this.validWidth + '*' + _this.validHeight + '!')
          return Promise.reject()
        }
      )
    },
    uploadSuccess(res) {
      // console.log(res)
      if (res.code === 200) {
        this.$message({
          type: 'success',
          message: '上传成功'
        })
        this.listTable()
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        })
        this.fileListImg = []
      }
    }
  }
}
</script>

<style scoped>

</style>
