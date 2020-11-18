<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    @closed="handleCancle"
    :width="formOptionList.dialogWidth || '750px'"
    :destroy-on-close="true"
    :top="formOptionList.top || '15vh'"
    :modal="formOptionList.modal"
  >
    <base-form width="100%" ref="formData" :formOption="formOptionList"></base-form>
    <slot></slot>
    <div style="text-align:right;">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import cascader from '@/components/cascader'
import baseSelect from '@/components/select'
import baseForm from '@/components/form'

export default {
  name: 'FormDialog',
  props: ['title', 'formOption'],
  components: { cascader, baseSelect, baseForm },
  data() {
    return {
      formData: {},
      dialogVisible: false,
      formOptionList: [],
      dialogTitle: '',
      isEdit: false
    }
  },
  watch:{
    //深度监听一下，在父组件改变标题子组件才会改变
    title: {
        deep: true,
        immediate:true,
        handler (val) {
        this.dialogTitle = this.title
        }
    },
  },
  created() {
    this.formOptionList = this.formOption
    this.dialogTitle = this.title
    // this.initFromData()
  },
  mounted() {
  },
  methods: {
    handleDefaultValue(commandName,value){
      this.$refs.formData.handleDefaultValue(commandName,value)
    },
    initFromData() {
      this.formOptionList.forEach((item) => {
        if (item.componentsArr) {
          this.formData[item.commandName] = []
          var obj = {}
          item.componentsArr.forEach((cItem) => {
            obj[cItem.commandName] = null
          })
          this.formData[item.commandName][0] = obj
          return
        }
        this.formData[item.commandName] = ''
      })
      // console.log(this.formData)
    },
    confirm() {
      // 验证表单
      this.$refs.formData.confirm((data, isEdit) => {
        this.$emit('confirm', data, this.isEdit)
      },this.formOption.isArr)
      // this.$refs.formData.validate(valid => {
      //   console.log(valid)
      //   if (valid) {
      //     // 验证通过
      //
      //   }
      // })
    },
    close() {
      this.initFrom()
      this.dialogVisible = false
    },
    initData(data, isEdit) {
      if(isEdit){
        this.dialogTitle = '编辑'
      }else {
        this.dialogTitle = '新增'
      }
      if (!data) {
        return
      }
      this.isEdit = isEdit
      this.formData = { ...this.formData, ...data }
      // console.log(this.$refs.formData)
      setTimeout(() => {
        this.$refs.formData.initData(this.formData)
      }, 200)
    },
    initFrom() {
      this.isEdit = false
      // console.log(this.$refs.formData)
      this.$refs.formData.initFrom()
    },
    open() {
      this.dialogVisible = true
      return this
    },
    handleCancle() {
      console.log(111)
      this.initFrom()
      this.$emit('cancle')
      this.close()
    }
  }
}
</script>

<style>
  .set_icon_size [class^="el-icon-"] {
    font-size: 18px;
    vertical-align: middle;
  }
</style>
