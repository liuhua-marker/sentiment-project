<template>
  <div>
    <listFilters ref="listFilter" :options="filterOption" @change="queryQuanIndex" />
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 新增与编辑的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="配置类型管理："
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
        <el-form-item label="配置类型：" prop="configTypeName">
          <el-input v-model.trim="addRuleForm.configTypeName" />
        </el-form-item>
        <el-form-item label="配置类别：" prop="configClassifyCode">
          <el-select
            v-model="addRuleForm.configClassifyCode"
            :disabled="isEdite"
            clearable
            placeholder="全部"
          >
            <el-option
              v-for="(val, key, i) in options"
              :key="i"
              :label="val"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型编码：" prop="configTypeCode">
          <el-input v-model.trim="addRuleForm.configTypeCode" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input
            v-model.trim="addRuleForm.remark"
            type="textarea"
            :rows="2"
          />
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
  list,
  save,
  editeQuanIndexFrom,
  handleDelete,
} from '@/api/configuration_item/status_configuration'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'

export default {
  name: 'StatusConfiguration',
  components: { listFilters, listTable },
  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-select',
          label: '配置类别',
          paramsName: 'configClassifyCode',
          placeholder: '请选择方案',
          options: [],
        },
        {
          componentsName: 'el-input',
          label: '配置类型',
          paramsName: 'queryWord',
          placeholder: '配置类型/类型编码',
        },
      ],
      tableData: {
        title: '配置类型管理',
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
            label: '配置类别', // 表头名称
            propName: 'configClassifyName', // 查询返回的字段名
          },
          {
            label: '配置类型',
            propName: 'configTypeName',
          },
          {
            label: '类型编码',
            propName: 'configTypeCode',
          },
          {
            label: '新增时间',
            propName: 'createTime',
          },
          {
            label: '备注',
            propName: 'remark',
            width: '200px',
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
        queryWord: '',
        configClassifyCode: '',
      },
      options: [],
      // 新增与编辑数据
      addDialogVisible: false,
      addRuleForm: {},
      // 验证规则
      addRules: {
        configTypeName: {
          required: true,
          message: '请输入配置类型',
          trigger: 'blur',
        },
        configClassifyCode: {
          required: true,
          message: '请选择配置类别',
          trigger: 'change',
        },
        configTypeCode: {
          required: true,
          message: '请输入类型编码',
          trigger: 'blur',
        },
      },
    }
  },
  created() {
    // 获取页面数据
    list().then((res) => {
      this.options = res.data
      this.filterOption[0].options = []
      for (let key in res.data) {
        let option = { value: key, label: res.data[key] }
        this.filterOption[0].options.push(option)
      }
    })
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
      this.queryForm.configClassifyCode = v.configClassifyCode
      this.queryForm.queryWord = v.queryWord
      this.getQuanIndex()
    },
    // 新增
    addQuanIndex() {
      this.addRuleForm = {
        configTypeName: '',
        configClassifyName: '',
        configClassifyCode: '',
        configTypeCode: '',
        remark: '',
      }
      this.isEdite = false
      this.addDialogVisible = true
    },
    // 根据id编辑数据
    handleAddOrUpdate(data) {
      this.isEdite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(data))
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async (valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          const vals = Object.values(this.options)
          const keys = Object.keys(this.options)
          keys.forEach((item, i) => {
            if (this.addRuleForm.configClassifyCode === item) {
              this.addRuleForm.configClassifyName = vals[i]
            }
          })
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
          this.$refs.listFilter.filterParams.configClassifyCode = ''
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
      let id = [ids.configTypeId]
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
