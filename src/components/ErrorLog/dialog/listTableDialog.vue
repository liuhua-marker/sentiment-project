<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    class="heigth_75vh"
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
    getGoodss,
  } from '@/api/goods'
  import { classifyAll } from '@/api/goodsclassify'
  import dateFormat from '@/assets/Date'

  export default {
    name: 'storeDialog',
    props: [],
    components: { listFilters, listTable },
    data() {
      return {
        title:'产品选择',
        dialogVisible: false,
        selectData: [],
        filterOption: [
          {
            componentsName: 'el-input',
            label: '产品名称',
            paramsName: 'goodsName'
            // defaultValue:""
          }
        ],
        classifyList:[],
        listOption: {
          // 列表api
          listApi: {
            serviceFN: getGoodss,
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
              label: '产品名称',
              propName: 'goodsName',
              align: 'center'
            },
            {
              label: '编号',
              propName: 'goodsNo',
              align: 'center'
              // commandName: 'handleView'
            },
            {
              label: '分类',
              propName: 'goodsClassify',
              align: 'center',
              formatter:val=>{
                let _val=''
                this.classifyList.some(item=>{
                  if(item.id === val){
                    _val = item.classifyName
                  }
                })
                return _val
              },
            },
            {
              label: '售价',
              propName: 'retailPrice',
              align: 'center'
              // commandName: 'handleView'
            },
          ]
        }
      }
    },
    watch: {},
    mounted() {
    this.getClassifyList()

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
          let selectData = JSON.parse(JSON.stringify(this.selectData))
          tableData.forEach((item, i) => {
            selectData.some((itemCont,index) => {
              if (item.id === itemCont.id) {
                selectData.splice(index, 1)
              }
            })
          })
          this.selectData=[...selectData,...v]
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
        this.selectData=[]
        this.$refs.listTable.clearSelection()
        this.dialogVisible = false
      },
      toggleDialog(isOpen) {
        this.dialogVisible = isOpen
        return this
      },
      initData(data,formData) {
        this.formData = formData
        if (!data || data.length===0) {
          return
        }
        this.selectData = JSON.parse(JSON.stringify(data))
        this.$nextTick(()=>{
          this.$refs.listTable.toggleSelection(JSON.parse(JSON.stringify(data)),'id')
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
