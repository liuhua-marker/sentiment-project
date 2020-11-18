<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    @closed="handleCancle"
    :modal="false"
    fullscreen
    :destroy-on-close="true"
    class="material_dialg"
  >
    <div class="dialog_panel">
      <div class="left_panel">
        <el-row class="border_b">
          <el-col :span="19">
            <span class="type_style">素材类型</span>

          </el-col>

          <el-col :span="5" style="text-align: center">
            <el-button type="text"  @click="addTools()">添加</el-button>
          </el-col>

        </el-row>
        <el-row class="border_b">
          <el-col :span="19" style="line-height: 36px;">
            <el-input size="mini" v-model="searchVal"></el-input>
          </el-col>
          <el-col :span="5" style="text-align: center">
            <el-button type="text" @click="searchTools">搜索</el-button>
          </el-col>
        </el-row>
        <div class="menu_style">
          <div class="no_data" v-if="!options ||options.length===0">暂无数据</div>
          <el-menu
            :default-active="defaultActive"
            class="el-menu-vertical-demo"
            @select="changeTools"
          >
            <template  v-for="(item,index) in options" :key="index">
              <el-menu-item :index="item.id">
                <el-row>
                  <el-col :span="19">
                    <el-tooltip class="item" effect="dark" :content="item.name"
                                placement="bottom">
                      <span class="text_overflow">{{item.name}} </span>
                    </el-tooltip>
                  </el-col>
                  <el-col :span="5" style="text-align: center">
                    <el-button type="text" v-if="item.name !== '全部'" @click="addTools(item)">编辑</el-button>
                  </el-col>
                </el-row>
              </el-menu-item>

            </template>

          </el-menu>
        </div>

      </div>
      <div class="right_panel">
        <div class="type_style">素材列表 <span class="total_style">（共计 {{total}} 个）</span></div>
        <imgList v-if="type === 'image'"
                 type="list"
                 :classTree="classTree"
                 class="list_style"
                 @loadComplete="loadComplete"
                 @changeImg="changeImg"
                 :isAddMore="isAddMore"
                 ref="list_material"
                 @changeType="getOptionsByService"
        ></imgList>
        <video-list1 v-else-if="type === 'video'"
                   type="list"
                     :classTree="classTree"
                   class="list_style"
                   @loadComplete="loadComplete"
                   @changeImg="changeImg"
                     :isAddMore="isAddMore"
                     ref="list_material"
                     @changeType="getOptionsByService"
        ></video-list1>
      </div>
    </div>
    <div style="text-align:right;padding:20px 0;">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import cascader from '@/components/cascader'
  import baseSelect from '@/components/select'
  import imgList from '@/views/person/components/imgList'
  import videoList1 from '@/views/person/components/videoList1'
  import {
    list,
    save,
    update
  } from '@/api/mediaTools'
  export default {
    name: 'materialDialog',
    props: [
      'type',
      'isAddMore', // 是否多选
      'max'  // 最大选择个数
    ],
    components: { cascader, baseSelect,imgList,videoList1  },
    data() {
      return {
        formData: {},
        dialogVisible: false,
        formOptionList: [],
        dialogTitle: '图片素材',
        isEdit: false,
        searchVal: '',
        bid:0,
        options:[],
        allOption:[],
        defaultActive:'',
        classTree:'',
        total:0,
        chooiceObj:{}
      }
    },
    watch: {
      //深度监听一下，在父组件改变标题子组件才会改变
      type: {
          deep: true,
          immediate:true,
          handler (val) {
          this.dialogTitle = val === 'video'?'视频素材':'图片素材'
          //   this.getOptionsByService()
          }
      },
    },
    created() {
      // this.initFromData()
    },
    mounted() {
      this.getOptionsByService()
    },
    methods: {
      changeImg(item){
        console.log(item)
        this.chooiceObj =item
      },
      loadComplete(res){
        this.total = res.total
      },
      changeTools(id){
        this.classTree=id
      },
      searchTools(){
        let option = []
        this.allOption.forEach(item=>{
          if(item.name.match(this.searchVal)){
            option.push(item)
          }
        })
        this.options = option
      },
      getOptionsByService() {
        list({"bid":this.bid}).then(res => {
          if (res.code === 200) {
            this.allOption=this.options = res.data
            this.allOption.unshift({id:'',name:'全部'})
            // this.options = res.data.map(item => {
            //   return {
            //     label: item[this.serviceObj.formatter.label],
            //     value: item[this.serviceObj.formatter.value]
            //   }
            // })
          } else {
            console.error(res)
          }
        })
      },
      addTools(item){
        console.log(item)
        this.$prompt('请输入分类名称', '添加分类', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal:false,
          inputValue:item?item.name :'',
          inputPattern: /\S/,
          inputErrorMessage: '类型名称不能空',
          inputValidator:function(v) {
            if(v.length>30){
              return '最多输入30个字符'
            }
          }
        }).then(({ value }) => {
          let loading = this.$loading()
          if(!item){
            save({bid:this.bid,name:value}).then(res=>{
              loading.close()
              if(res.code === 200){
                this.$message({
                  message:'添加成功',
                  type:'success'
                })
              }
              this.getOptionsByService()
            }).catch(error=>{
              loading.close()
            })
          }else {
            update({bid:this.bid,name:value,id:item.id}).then(res=>{
              loading.close()
              if(res.code === 200){
                this.$message({
                  message:'编辑成功',
                  type:'success'
                })
              }
              this.getOptionsByService()
            }).catch(error=>{
              loading.close()
            })
          }

        }).catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '取消输入'
          // });
        });
      },
      close() {
        this.initFrom()
        this.dialogVisible = false
      },
      initFrom() {
        this.isEdit = false
        // console.log(this.$refs.formData)
        this.chooiceObj={}
        this.searchVal=''
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
      },
      confirm(){
        console.log(this.chooiceObj)
        let max = this.max || 8
        if(this.isAddMore){
          if(this.chooiceObj.length>=8){
            this.$message({
              type:'info',
              message:"最多选择"+max+"个素材"
            })
            return
          }
        }
        this.$emit("confirm",this.chooiceObj)
        !this.isAddMore?this.close():''

      },
      setData(data){
        console.log(2222,data)
        this.$nextTick(()=>{
          this.$refs.list_material.setData(data)
        })
      }
    }
  }
</script>

<style lang="scss">
  @import '../../styles/variables.scss';

  .set_icon_size [class^="el-icon-"] {
    font-size: 18px;
    vertical-align: middle;
  }

  .material_dialg .el-dialog__body {
    height: calc(100% - 100px);
  }

  .dialog_panel {
    display: flex;
    border: 1px solid $borderColor;
    height: 100%;
  }

  .left_panel {
    width: 25%;
    border-right: 1px solid $borderColor;
    height: 100%;
  }
  .right_panel{
    height: 100%;
    padding:10px 20px;
    width: 100%;
  }
  .left_panel .el-menu-item {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid $borderColor;
  }

  .border_b {
    border-bottom: 1px solid $borderColor;
    padding: 0 20px;
  }

  .text_overflow {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
  }

  .type_style {
    line-height: 36px;
    font-size: 16px;
    color: #333;
    font-weight: bold;
  }
  .menu_style{
    height:calc(100% - 80px);
    overflow-y: auto;
  }
  .no_data{
    text-align: center;line-height: 50px;
    color:#666;
  }
  .list_style{
    height:calc(100% - 40px);
    overflow-y: auto;
  }
  .total_style{
    font-size: 14px;
    font-weight: normal;
    color:#666;
  }
</style>
