<template>
  <div class="add_table_panel">
    <span>{{options.text}}</span>
    <el-table
      border
      :data="listTableData"
      style="width: 100%"
      :height="options.height"
      size="mini">
      <el-table-column
        v-for="(item) in options.header"
        :key="item.label"
        :prop="item.propName"
        :label="item.label"
        :class-name="item.class"
        :width="item.width"
        :align="item.align || 'center'"
        :fixed="item.fixed"
      >
        <template slot-scope="scope">
          <span v-if="!item.isInput">{{scope.row[item.propName]}}</span>
          <el-input v-else
            :disabled="item.disabled"
            v-model="scope.row[item.propName]"
            size="mini"
            @blur="checknumMinusp2($event)"
            @input="(val)=>{item.changeInput?item.changeInput(val,scope.row):null}"
          ></el-input>
        </template>
      </el-table-column>
      <!--      <el-table-column-->
      <!--        v-if="options.isAddList"-->
      <!--        label="操作"-->
      <!--        align="center"-->
      <!--        width="80"-->
      <!--      >-->
      <!--        <template slot-scope="scope">-->
      <!--          <el-button size="mini" palin @click="removeList(scope)">删除</el-button>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
    </el-table>
    <!--    <div style="text-align: center;margin-top: 5px" v-if="options.isAddList">-->
    <!--      <el-button size="mini" palin @click="addList">添加一行</el-button>-->
    <!--      <el-button size="mini" palin @click="addClo">添加一列</el-button>-->
    <!--    </div>-->
  </div>
</template>

<script>
export default {
  name: 'addListTable',
  props: ['options', 'tableData'],
  data() {
    return {
      listTableData: []
    }
  },
  watch: {
    tableData: {
      deep: true,
      immediate: true,
      handler(val) {
        this.listTableData = val
      }
    }
  },
  mounted() {
    this.listTableData = this.tableData
    // console.log(this.options)
  },
  methods: {
    checknumMinusp2(e){
      var reg = /^[0-9][\d+%$/]*$/;
      if(reg.test(e.target.value)){
          e.target.value = e.target.value.match(reg)[0]
      }else{
        if (e.target.value == '') {
          e.target.value = ''
          return
        } else {
          e.target.value = ''
          this.$message({
            type: 'error',
            message: '数据校验错误，只能输入纯数字或者百分数！'
          })
        }
        
      }
    },
    changeInput(val,row) {
      console.log('val,row',val,row)
      row.value3 = Number(row.value1) - Number(row.value2)
      // console.log(this.tableData)
      // this.$emit('changeInput', this.tableData)
    },
    addList() {
      const addTempalte = this.options.addTemplate
      this.tableData.push(addTempalte)
      this.$emit('changeInput', this.tableData)
    },
    initData(data) {
      this.listTableData = data
    },
    addClo() {
    },
    removeList(scope) {
      if (this.tableData.length === 1) {
        this.$message({
          type: 'info',
          message: '至少保留一条数据'
        })
        return
      }
      this.$confirm('确定删除此条数据?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          this.tableData.splice(scope.$index, 1)
          this.$emit('changeInput', this.tableData)
        })
    }
  }
}
</script>

<style scoped>
  .add_table_panel {
    margin: 20px auto;
    width: 750px;
  }
</style>
