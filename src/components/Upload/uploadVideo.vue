<template>
  <div style="width: 400px">
    <el-upload
      action="#"
      :accept="accept"
      :disabled="disabled"
      :limit="1"
      :http-request="uploadVideo"
      :before-upload="beforeUploadVideo"
      :on-exceed="handleExceed"
      :show-file-list="false"
      list-type="picture-card"
      v-if="!src"
    >
<!--      <el-button :disabled="disabled" :loading="loading" class="button-uploader" size="small" type="primary">-->
<!--        <i class="fa fa-upload" />-->
<!--        上传视频-->
<!--      </el-button>-->
      <i slot="default" class="el-icon-plus"></i>
    </el-upload>
    <div v-if="src" class="video_panel">
      <video width="350"
               height="180"
               controls="controls"
               :src="src"></video>
    </div>
    <el-progress v-if="loading" :percentage="progress" />
  </div>
</template>

<script>
  import { getSignature } from '@/api/upload.js'
  // import { sendVideoResource } from '@/api/learning'
  // import moment from 'moment'
  import TcVod from 'vod-js-sdk-v6'
  export default {
    name: 'UploadVideo',
    props: {
      accept: {
        type: String,
        default: 'video/mp4'
      },
      title: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
      watermarkFlag: {
        type: String,
        default: '1'
      },
      value: {
        type: String,
        default: ''
      },

    },
    data() {
      return {
        resourceType: '',
        videoDuration: 1000,
        uploaderInfo: {},
        progress: 0,
        percentageImage: 0,
        loading: false,
        src:''
      }
    },
    watch:{
      value(val){
        this.src=val
      }
    },
    created() {
      this.src = this.value || ''
    },
    methods: {
      // 视频处理
      handleExceed(files, fileList) {
        this.$message.error(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
      },
      beforeUploadVideo(file) {
        // if (this.title === '') {
        //   this.popMessage('视频上传前，请先填写课程标题')
        //   return false
        // }
        // if (this.classId === '') {
        //   this.popMessage('视频上传前，请先选择科目并确定是否添加水印')
        //   return false
        // }
        console.log(file)
        if (['video/mp4'].indexOf(file.type) === -1) {
          this.popMessage('请上传正确的音频或视频格式')
          return false
        }
        if (file.type === 'video/mp4') {
          const isLt1G = file.size / 1024 / 1024 < 50
          if (!isLt1G) {
            this.popMessage('上传视频大小不能超过50M')
            return false
          }
          this.resourceType = '1'
        }
        // if (file.type === 'audio/mp3') {
        //   const isLt100M = file.size / 1024 / 1024 < 100
        //   if (!isLt100M) {
        //     this.popMessage('上传音频大小不能超过100M')
        //     return false
        //   }
        //   this.resourceType = '2'
        // }
      },
      popMessage(message) {
        this.$message.error(message)
        this.loading = false
      },
      uploadVideo(event) {
        this.loading = true
        this.start(event.file)
      },
      // 自定义上传
      async start(file) {
        try {
          // eslint-disable-next-line no-irregular-whitespace
          // const userName = this.$store.getters.name
          // const currentTime = moment(Date.now()).format('YYYYMMDDHHmmss')
          const type = file.type.split('/')[1]
          const copyFile = file
          const _this = this

          const tcVod = new TcVod({ getSignature: this.getSignature })
          // 视频，类型为 File

          const uploader = tcVod.upload({
            mediaFile: copyFile
          })
          // 视频上传进度
          uploader.on('media_progress', info => {

            this.progress = parseInt(info.percent * 100)
            // uploaderInfo.progress = parseInt(info.percent * 100)
          })
          // 视频上传完成
          uploader.on('media_upload', function(info) {

            // uploaderInfo.isVideoUploadSuccess = true
          })
          // this.uploaderInfo = uploaderInfo
          uploader.done().then(function(videoUrl) {

            _this.src = videoUrl.video.url
            _this.$emit('change', videoUrl,file)
            _this.$emit('input', _this.src)
            _this.loading = false
          })
        } catch (error) {
          this.loading = false
          this.$emit('change', '')
        }
      },
      async getSignature() {
        const res = await getSignature()
        if (res.code === 200) {
          return res.data
        } else this.$message({ message: res.msg, type: 'error' })
      },
      async getAntiLeechUrl(url, duration) {
        const query = {
          originalUrl: url,
          duration: duration
        }
        const res = await getAntiLeechUrl(query)
        if (res.code === 0) {
          this.videoUrl = res.data
          return res.data
        } else this.$message({ message: res.msg, type: 'error' })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .clear-margin-top {
    margin-top: 0;
  }
  .button-uploader {
    background: #EEF5FF;
    border: 1px solid #CFE3FD;
    color: #5E9FF8;
  }
  .video_panel{
    border:1px solid #dcdcdc;
    padding:10px;
  }
</style>
