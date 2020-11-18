<template>
  <div>
    <!-- 搜索查询 -->
    <listFilters ref="listFilter" :options="filterOption" @change="queryQuanIndex" />
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 新增与编辑的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="方案管理"
      :visible.sync="addDialogVisible"
      width="30%"
    >
      <el-form
        ref="addRuleForm"
        :model="addRuleForm"
        :rules="addRules"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="方案名称：" prop="solutionName">
          <el-input v-model.trim="addRuleForm.solutionName" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model.trim="addRuleForm.remark" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addQuanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  page,
  save,
  editeQuanIndexFrom,
  handleDelete,
} from '@/api/programme/programme'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'
import { parseTime } from '@/utils'

export default {
  name: 'Programme',
  components: { listFilters, listTable },

  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-input',
          label: '方案名称',
          paramsName: 'queryWord',
          placeholder: '词条名',
        },
      ],
      tableData: {
        title: '方案管理',
        listBtns: [
          {
            label: '新增',
            commandName: 'addQuanIndex',
            type: 'primary',
          },
        ],
        listApi: {
          serviceFN: page, // 获取表格的查询接口
          params: {},
        },
        // multipleTable: true, // 是否显示复选框
        index: {
          // 序号配置项
          num: true, // 是否显示序号
          width: 60,
        },
        header: [
          {
            label: '方案名称', // 表头名称
            propName: 'solutionName', // 查询返回的字段名
            width: '300px'
          },
          {
            label: '新增时间',
            propName: 'createTime',
            width: '240px',
            formatter: (value, row) => {
              // 格式化当前表格数据    参数value 为当前列的值  row为当前行数据
              const date = new Date(value)
              return parseTime(date)
            },
          },
          {
            label: '备注',
            propName: 'remark',
          },
          {
            label: '操作',
            btns: [
              {
                label: '编辑',
                commandName: 'handleAddOrUpdate',
                type: 'primary',
              },
              {
                label: '删除',
                commandName: 'handleDelete',
                type: 'danger',
              },
            ],
            btnGroups: false,
          },
        ],
      },

      // 表单数据
      isEdite: false,
      queryForm: {
        solutionName: '',
      },
      // 新增与编辑数据
      addDialogVisible: false,
      addRuleForm: {},
      // 验证规则
      addRules: {
        solutionName: {
          required: true,
          message: '请输入方案名称名称',
          trigger: 'blur',
        },
      },
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
  },
  methods: {
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    // 获取页面数据
    getQuanIndex() {
      this.$nextTick(() => {
        this.$refs['listTable'].search(this.queryForm)
      })
    },
    // 查询
    queryQuanIndex(v) {
      this.queryForm.solutionName = v.queryWord
      this.queryForm.pageNo = 1
      this.getQuanIndex()
    },
    // 新增
    addQuanIndex() {
      this.addRuleForm = {
        solutionName: '',
        remark: '',
      }
      this.isEdite = false
      this.addDialogVisible = true
    },
    // 根据id编辑数据
    handleAddOrUpdate(res) {
      this.isEdite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(res))
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async (valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          // 新增
          res = await save(this.addRuleForm)
        } else {
          // 编辑
          res = await editeQuanIndexFrom(this.addRuleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs.listFilter.filterParams.queryWord = ''
          this.addDialogVisible = false
          this.queryQuanIndex(this.$refs.listFilter.filterParams) // 刷新列表
        } else {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            message: res.data,
          })
        }
      })
    },
    // 根据id删除数据
    handleDelete(ids) {
      let id = [ids.solutionId]
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          handleDelete(id).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功!',
            })
            this.getQuanIndex()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
