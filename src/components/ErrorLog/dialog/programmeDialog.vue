<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    class="heigth_75vh"
    :modal="false"
    top="10vh"
    width="1000px"
    @closed="handleClose">

    <listFilters ref="listFilter" :options="filterOption" @change="search"></listFilters>
    <listTable ref="listTable" :options="listOption" @command="listCommand" @loadComplete="tableLoadComplete"/>

    <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="comfrim">确 定</el-button>
  </span>
  </el-dialog>
</template>

<script>
  import listFilters from '@/components/filter/listFilters'
  import listTable from '@/components/table/listTable'
  import {
    getCures,

  } from '@/api/cure'
  import { classifyAll } from '@/api/goodsclassify'
  import dateFormat from '@/assets/Date'

  export default {
    name: 'storeDialog',
    props: [],
    components: { listFilters, listTable },
    data() {
      return {
        title:'方案选择',
        dialogVisible: false,
        selectData: [],
        filterOption: [
          {
            componentsName: 'el-input',
            label: '方案名称',
            paramsName: 'preceptName'
            // defaultValue:""
          }
        ],
        classifyList:[],
        listOption: {
          // 列表api
          listApi: {
            serviceFN: getCures,
            params: {}
          },
          height:'calc(80vh - 250px)',
          loadMore: true,
          noPage: true,
          // 表头设置
          multipleTable: true,
          index: {
            // 序号配置项
            num: false,
            width: 60
          },
          header: [
            {
              label: '方案名称',
              propName: 'preceptName',
              align: 'center'
            },
            {
              label: '调理方案内容',
              propName: 'preceptDetail',
              align: 'center'
              // commandName: 'handleView'
            },
            {
              label: '方案价格(元)',
              propName: 'amount',
              align: 'center',
            },

          ]
        }
      }
    },
    watch: {},
    mounted() {

    },
    methods: {
      async getClassifyList(){
        const ret = await classifyAll()
        this.classifyList = ret.data
      },
      // 表格加载完成
      tableLoadComplete() {
        this.$refs.listTable.toggleSelection(this.selectData,'id')
      },
      comfrim() {

        if (this.selectData.length === 0) {
          this.$message({
            type: 'info',
            message: '请选择后确认'
          })
          return
        }
        this.$emit('comfrim', this.selectData,this.formData)
        this.toggleDialog(false)
      },
      tableSelecteRow(v, tableData) {
        // if(v.length>0){
        //   this.contrast()
        // }
        // // this.contrast
        if(this.selectData.length === 0 ){
          this.selectData = v
        }else {
          tableData.forEach((item, i) => {
            this.selectData.some((itemCont,index) => {
              if (item.id === itemCont.id) {
                this.selectData.splice(index, 1)
              }
            })
          })
          this.selectData=[...this.selectData,...v]
        }
      },
      listCommand(command, row, index) {
        if (command && this[command]) {
          this[command](row, index)
        }
      },
      search(params) {

        this.params = params
        this.$refs.listTable.initPage().search(params)
      },
      handleClose() {
        console.log('handleClose')
        this.selectData=[]
        this.$refs.listTable.clearSelection()
        this.dialogVisible = false
      },
      toggleDialog(isOpen) {
        this.dialogVisible = isOpen
        return this
      },
      initData(data,formData) {
        console.log('initData',data)
        this.formData = formData
        if (!data || data.length===0) {
          return
        }
        this.selectData = [...[],...data]
        this.$nextTick(()=>{
          this.$refs.listTable.toggleSelection(this.selectData,'id')
        })

      }
    }
  }
</script>

<style lang="scss">
  .heigth_75vh {
    .el-dialog {
      height: 80vh;

      .el-dialog__body{
        padding:10px 20px 0 20px
      }


    }
  }
</style>
