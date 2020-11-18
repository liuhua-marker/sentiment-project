<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    @close="handleCancle"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @open="openDialog"
    width="1000px"
  >
    <el-steps :active="active" align-center finish-status="success">
      <el-step title="机构基本信息" description="设置机构基本信息关系"></el-step>
      <el-step title="结算关系设置" description="设置信息及结算层次关系维护"></el-step>
      <el-step title="分销设置" description="分销关系层次设置"></el-step>
    </el-steps>
    <base-form v-show="active === 1" ref="baseMessage" :formOption="formOption.oneOption||{}"></base-form>
    <base-form v-show="active === 2" ref="settlement" :formOption="formOption.twoOption[type]||{}"></base-form>
    <template v-if="active === 3">
      <addListTable
        v-for="(item,index) in formOption.threeOption[type]" :key="index"
        :options="item"
        :tableData.sync="tableData">
      </addListTable>
      <!-- <addListTable
        :options="options" :
        tableData="tableData"
        @changeInput="(data)=>{this.tableData=data}">
      </addListTable> -->
      <!-- <base-form v-if="active === 3" ref="tableForm" :formOption="formOption.threeOption.threeStep"></base-form> -->
      <div style="text-align: center">
        <el-button type="primary" @click="handleReturn(2)">返回第二步</el-button>
        <el-button type="primary" @click="submit">提交完毕</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import baseForm from '@/components/form'
import addListTable from '@/components/table/addListTable'
import { findAll } from '@/api/fundscheme'
import {
  queryAllByType,
  selectDetails,
  getOperationService,
  getAllAgency,
  getUserByBusinessId
} from '@/api/institutionalConfig'

export default {
  name: 'FormDialog',
  props: ['title','formOptionDialog','fuFormData'],
  components: { baseForm, addListTable },
  data() {
    return {
      dialogVisible: false,
      formOption: {},
      dialogTitle: '',
      isEdit: false,
      active: 1,
      type:"",
      tableData:[],
      formData:{},
    }
  },
  watch: {
    formOptionDialog: {
      deep: true,
      immediate: true,
      handler(val) {
        this.formOption = this.formOptionDialog || {}
        console.log(this.formOption,this.type,this.$refs,this.active)
        this.$nextTick(()=>{
          if (this.$refs.settlement) {
            this.$refs.settlement.seeFormOption()
          }
        })
      }
    },
    fuFormData: {
      deep: true,
      immediate: true,
      handler(val) {
        this.formData = val
      }
    }
  },
  mounted() {
    this.dialogTitle = this.title
    this.formOption = this.formOptionDialog
    this.formData = this.fuFormData
  },
  methods: {
    openDialog(){
      this.active = 1
    },
    handleStep(index,type,tableData,){
      console.log(index,type,this.$refs)
      this.active = index;
      this.type = type;
      this.tableData = tableData
      console.log('this.tableData',this.tableData,this.formOption)
    },
    handleReturn(index){
      if (this.active === 1) {
        return
      }
      if (index === 1) {
        this.$refs.settlement.handleInit() //确保formData重新生成
        this.$refs.settlement.initFrom()  //重置form表单
      }
      if (index === 2) {
        this.active = index
        this.$nextTick(()=>{
          if (this.$refs.settlement) {
            // console.log(this.formData.businessAssistBO)
            // debugger
            this.$refs.settlement.initData(this.formData.businessAssistBO)
          }
        })
        return
      }
      this.active = index
    },
    submit() {
        console.log('this.formData',this.formData)
        this.$emit('confirm',this.isEdit)
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
    //   console.log('formData', this.formData)
      setTimeout(() => {
        this.$refs.baseMessage.initData(this.formData.businessEntity)
      }, 200)
    },
    initFrom() {
      this.isEdit = false
      this.active = 0
      this.tableData = []
      this.formData = {}
      for (const key in this.formData) {
        this.formData[key] = ''
      }
      console.log(this.$refs.baseMessage)
      this.$refs.baseMessage ? this.$refs.baseMessage.initFrom() : null
      // this.$refs.settlement.initFrom()
    },
    open() {
      this.dialogVisible = true
      return this
    },
    handleCancle() {
      this.$emit('cancle')
      this.close()
      this.active = 1
    }
  }
}
</script>

<style scoped>
.fanhui{
  position: absolute;
  left: 15px;
  top: 65px;
  z-index: 100;
}
</style>
