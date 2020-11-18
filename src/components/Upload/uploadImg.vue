<template>
  <el-upload
    ref="img_upload"
    class="avatar-uploader"
    action="#"
    :accept="accept"
    :disabled="disabled"
    :limit="2"
    :auto-upload="false"
    :show-file-list="false"
    :on-change="chengeImg"
    :before-upload="beforeAvatarUpload">
    <img v-if="imageUrl" :src="imageUrl" class="avatar">
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
  </el-upload>
</template>

<script>
  export default {
    name: 'uploadImg',
    props: ['value', 'disabled'],
    data() {
      return {
        imageUrl: '',
        accept: 'image/jpeg,image/png,image/gif'
      }
    },
    watch: {
      value(val) {
        this.imageUrl = val
      }
    },
    created() {
      this.imageUrl = this.value
    },
    methods: {
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg'
        const isLt2M = file.size / 1024 / 1024 < 2
        console.log(file)
        // if (!isJPG) {
        //   this.$message.error('上传头像图片只能是 JPG 格式!');
        // }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }
        return isJPG && isLt2M
      },
      chengeImg(file, fileList) {
        var _this = this
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 2MB!')
          return
        }
        console.log(file)
        this.getBase64(file.raw).then(resBase64 => {
          console.log(resBase64)
          // console.log(resBase64.split(',')[1])

          let img = new Image()
          img.src = resBase64
          img.id = 'test_img'
          img.onload=function(){
            var width = img.width;
              console.log(width)
            if(width>1080){
              _this.$message({
                type:'error',
                message:'上传图片宽度不能大于1080'
              })
              _this.$refs.img_upload.clearFiles()
            return
            }
            _this.imageUrl = resBase64　//直接拿到base64信息
            _this.$emit('change', resBase64, file)
            _this.$emit('input', resBase64)
          };

        })

      },
      getBase64(file) {
        return new Promise((resolve, reject) => {
          let reader = new FileReader()
          let fileResult = ''
          reader.readAsDataURL(file)
          //开始转
          reader.onload = function() {
            fileResult = reader.result
          }
          //转 失败
          reader.onerror = function(error) {
            reject(error)
          }
          //转 结束  咱就 resolve 出去
          reader.onloadend = function() {
            resolve(fileResult)
          }
        })
      }
    }
  }

</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader .el-upload:hover .el-icon-plus {
    color: #409EFF
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
