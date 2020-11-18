<template>
  <div style="display: inline-block">
    <el-select :size="size" @change="change" v-model="val" filterable clearable>
      <el-option
        v-for="optionItem in options"
        :key="optionItem.id"
        :label="optionItem.name"
        :value="optionItem.id "
      ></el-option>
    </el-select>
    <el-button style="margin-left: 10px" type="primary" @click="add">新增</el-button>

  </div>

</template>

<script>
  import {
    list,
    save
  } from '@/api/mediaTools'
  export default {
    name: 'mediaTools',
    props: ['value', 'serviceObj', 'size',],
    data() {
      return {
        options: [],
        val: '',
        allOptions: [],
        bid:0
      }
    },
    watch: {
      value: {
        deep: true,
        immediate: true,
        handler(val) {
          this.val = val
        }
      },
      // serviceObj: {
      //   deep: true,
      //   immediate: true,
      //   handler(val) {
      //     if(!val){
      //       return
      //     }
      //     this.getOptionsByService()
      //   }
      // }
    },
    mounted() {
      this.val = this.value
      this.getOptionsByService()  //注释该行，确保只调用一次接口
    },
    activated() {
      this.getOptionsByService()  //注释该行，确保只调用一次接口
      },
    methods: {
      getOptionsByService() {
        list({"bid":this.bid}).then(res => {
          if (res.code === 200) {
            this.options=this.allOptions = res.data
            // this.options = res.data.map(item => {
            //   return {
            //     label: item[this.serviceObj.formatter.label],
            //     value: item[this.serviceObj.formatter.value]
            //   }
            // })
            this.serviceObj.isShowAll ? this.options.unshift({ label: '全部', value: '' }) : null
          } else {
            console.error(res)
          }
        })
      },
      change(val) {
        var obj = {}
        this.allOptions.some(item => {
          if (item.id === val) {
            obj = item
          }
        })
        this.$emit('input', val)
        this.$emit('change', val, obj)
      },
      add(){
        this.$prompt('请输入分类名称', '添加分类', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal:false,
          inputPattern: /\S/,
          inputErrorMessage: '类型名称不能空',
          inputValidator:function(v) {
            if(v.length>30){
              return '最多输入30个字符'
            }
          }
        }).then(({ value }) => {
          let loading = this.$loading()
          save({bid:this.bid,name:value}).then(res=>{
            loading.close()
            if(res.code === 200){
              this.$message({
                message:'添加成功',
                type:'info'
              })
            }
            this.getOptionsByService()
            this.$emit('change','add_type')
          }).catch(error=>{
            loading.close()
          })
        }).catch(() => {
          // this.$message({
          //   type: 'info',
          //   message: '取消输入'
          // });
        });
      }
    }
  }
</script>

<style scoped>

</style>
