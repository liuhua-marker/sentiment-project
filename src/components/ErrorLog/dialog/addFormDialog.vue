<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :before-close="handleCancle"
    width="1000px"
  >
    <el-form
      ref="formData"
      :model="formData"
      :label-width="formOption.labelWidth || '100px'"
      :label-position="formOption.labelPosition || 'right'"
      :style="`width:${formOption.width||'750px'};margin: 20px auto`"
    >
      <el-form-item
        :key="index"
        :label="item.label"
        :rules="item.rules"
        :prop="item.commandName"
        v-if="!item.hidden"
      >
        <el-input v-model="formData.list[0].date1"></el-input>
        <el-input v-model="formData.list[0].date2"></el-input>
        <el-input v-model="formData.list[0].date3"></el-input>

      </el-form-item>
    </el-form>
    <div style="text-align:right;">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import baseForm from '@/components/form'

export default {
  name: 'addFormDialog',
  props: ['formOption'],
  components: { baseForm },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '新增标签',
      formData: { list: [{ date1: 0},{ date2: 0},{ date3: 0}] }
    }
  },
  mounted() {
  },
  methods: {
    confirm() {
      // 验证表单
      this.$refs.formData.validate(valid => {
        // console.log(valid)
        if (valid) {
          // 验证通过
          this.$emit('confirm', this.formData, this.isEdit)
        }
      })
    },
    close() {
      this.initFrom()
      this.dialogVisible = false
    },
    initData(data, isEdit) {
      if (!data) {
        return
      }
      this.isEdit = isEdit
      this.formData = { ...this.formData, ...data }
    },
    initFrom() {
      this.isEdit = false
      for (const key in this.formData) {
        this.formData[key] = ''
      }
      this.$refs.formData.clearValidate()
    },
    open() {
      this.dialogVisible = true
      return this
    },
    handleCancle() {
      this.$emit('cancle')
      this.close()
    }
  }
}
</script>

<style scoped>

</style>
