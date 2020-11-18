<template>
  <div>
    <!-- 搜索查询 -->
    <listFilters ref="listFilter" :options="filterOption" @change="queryQuanIndex" />
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 新增与编辑的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="规则类型"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <el-form
        ref="addRuleForm"
        :model="addRuleForm"
        :rules="addRules"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="规则类型：" prop="ruleTypeName">
          <el-input v-model.trim="addRuleForm.ruleTypeName" />
        </el-form-item>
        <el-form-item label="规则类别：" prop="ruleClassifyCode">
          <el-select
            v-model="addRuleForm.ruleClassifyCode"
            :disabled="isEdite"
            placeholder="请选择"
          >
            <el-option
              v-for="(val, key, i) in options"
              :key="i"
              :label="val"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型编码：" prop="ruleTypeCode">
          <el-input v-model.trim="addRuleForm.ruleTypeCode" />
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
  getRulesClassify,
} from '@/api/regulations/type_filtering'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'
import { parseTime } from '@/utils'

export default {
  name: 'TypeFilteringRegulations',
  components: { listFilters, listTable },

  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-select',
          label: '规则类别',
          paramsName: 'ruleClassifyCode',
          placeholder: '全部',
          options: [],
          // defaultValue:""
        },
        {
          componentsName: 'el-input',
          label: '规则类型',
          paramsName: 'queryWord',
          placeholder: '规则类型/类型编码',
          // defaultValue:""
        },
      ],
      tableData: {
        title: '规则类型管理',
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
            label: '规则类别', // 表头名称
            propName: 'ruleClassifyName', // 查询返回的字段名
          },
          {
            label: '规则类型',
            propName: 'ruleTypeName',
          },
          {
            label: '类型编码',
            propName: 'ruleTypeCode',
          },
          {
            label: '新增时间',
            propName: 'createTime',
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
        ruleClassifyCode: '',
        queryWord: '',
      },
      // 新增数据
      addDialogVisible: false,
      addRuleForm: {},
      options: {},
      // 新增验证规则
      addRules: {
        ruleTypeName: {
          required: true,
          message: '请输入规则类型名称',
          trigger: 'blur',
        },
        ruleClassifyCode: {
          required: true,
          message: '请选择规则类别',
          trigger: 'blur',
        },
        ruleTypeCode: {
          required: true,
          message: '请输入规则类型编码',
          trigger: 'blur',
        },
      },
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
    getRulesClassify().then((res) => {
      this.options = res.data
      this.filterOption[0].options = []
      for (let key in res.data) {
        let option = { value: key, label: res.data[key] }
        this.filterOption[0].options.push(option)
      }
    })
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
      this.queryForm.ruleClassifyCode = v.ruleClassifyCode
      this.queryForm.queryWord = v.queryWord
      this.getQuanIndex()
    },
    // 新增
    addQuanIndex() {
      this.addRuleForm = {
        ruleTypeName: '',
        ruleClassifyCode: '',
        ruleTypeCode: '',
        remark: '',
        ruleClassifyCode: '',
      }
      this.isEdite = false
      this.addRuleForm.ruleClassifyCode = Object.keys(this.options)[0]
      this.addDialogVisible = true
    },
    // 根据id编辑数据
    async handleAddOrUpdate(res) {
      this.isEdite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(res))
    },
    addQuanIndexFrom() {
      // console.log(this.addRuleForm);
      this.$refs.addRuleForm.validate(async (valid) => {
        if (!valid) return
        // 成功了调用接口;
        var res = {}
        if (!this.isEdite) {
          res = await save(this.addRuleForm)
        } else {
          res = await editeQuanIndexFrom(this.addRuleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs.listFilter.filterParams.queryWord = ''
          this.$refs.listFilter.filterParams.ruleClassifyCode = ''
          this.addDialogVisible = false
          this.queryQuanIndex(this.$refs.listFilter.filterParams)
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
      let id = [ids.ruleTypeId]
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
