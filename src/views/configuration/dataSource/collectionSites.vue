<template>
  <div>
    <!-- 搜索查询 -->
    <listFilters ref="listFilter" :options="filterOption" @change="queryQuanIndex" />
    <!-- 表格 -->
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 新增与编辑的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="数据源管理"
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
        <el-form-item label="数据源名称 ：" prop="sourceName">
          <el-input v-model.trim="addRuleForm.sourceName" />
        </el-form-item>
        <el-form-item label="URL：" prop="sourceUrl">
          <el-input v-model.trim="addRuleForm.sourceUrl" size="medium" />
        </el-form-item>
        <el-form-item label="选择类型：" prop="sourceTypeName">
          <el-select v-model="addRuleForm.sourceTypeName" placeholder="请选择">
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.typeName"
              :value="item.typeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级：" prop="sourceSort">
          <el-input v-model.trim.number="addRuleForm.sourceSort" />
        </el-form-item>
        <el-form-item label="包含板块：" prop="sourceSection">
          <el-input v-model.trim="addRuleForm.sourceSection" />
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
    <!-- 导入对话框 -->
    <ImportantFlies
      :action="action"
      :dialog-visible="ImportDialogVisible"
      @handleClose="handleClose"
    />
  </div>
</template>

<script>
import {
  page,
  list,
  save,
  editeQuanIndexFrom,
  handleDelete,
  domnLoadFile,
  domnLoadModel,
} from '@/api/dataSource/collectionSites'
import { confDataSource } from '@/utils/url'
import { DomnLoadFile } from '@/utils/exportFiles'
import listFilters from '@/components/filter/listFilters'
import listTable from '@/components/table/listTable'
import { parseTime } from '@/utils'
import ImportantFlies from '@/components/Upload/ImportantFlies'

export default {
  name: 'CollectionSites',
  components: { listFilters, listTable, ImportantFlies },
  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-input',
          label: '数据源名称查询',
          paramsName: 'sourceName',
          placeholder: '词条名',
          // defaultValue:""
        },
      ],
      tableData: {
        title: '数据源管理',
        listBtns: [
          {
            label: '新增',
            commandName: 'addQuanIndex',
            type: 'primary',
          },
          {
            label: '导入信息',
            commandName: 'ImportFiles',
          },
          {
            label: '模板下载',
            commandName: 'ImportModle',
          },
          {
            label: '导出',
            commandName: 'exportFiles',
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
            label: '数据源名称', // 表头名称
            propName: 'sourceName', // 查询返回的字段名
          },
          {
            label: '数据源类型',
            propName: 'sourceTypeName',
          },
          {
            label: 'URL', // 表头名称
            propName: 'sourceUrl', // 查询返回的字段名
          },
          {
            label: '优先级',
            propName: 'sourceSort',
          },
          {
            label: '包含版块',
            propName: 'sourceSection',
          },
          {
            label: '备注',
            propName: 'remark',
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
      isEadite: false,
      // 表单数据
      queryForm: {
        sourceName: '',
      },
      // 新增数据
      addDialogVisible: false,
      addRuleForm: {},
      options: [],
      // 新增验证规则
      addRules: {
        sourceUrl: { required: true, message: '请输入URL', trigger: 'blur' },
        sourceName: {
          required: true,
          message: '请填写数据源名称',
          trigger: 'blur',
        },
        sourceSort: [
          { required: true, message: '请填写优先级', trigger: 'blur' },
          { type: 'number', message: '优先级必须为数字值' },
        ],
      },
      // 导入
      action: confDataSource(),
      ImportDialogVisible: false,
    }
  },
  created() {
    // 获取页面数据
    this.getTypeList()
    this.getQuanIndex()
  },
  methods: {
    // 获取页面数据
    getQuanIndex() {
      this.$nextTick(() => {
        this.$refs['listTable'].search(this.queryForm)
      })
    },
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    getTypeList() {
      let typeList = {
        deptId: 0,
        pageNo: 1,
        pageSize: 9999999,
      }
      list(typeList).then((res) => {
        this.options = res.rows
      })
    },
    // 查询
    queryQuanIndex(v) {
      this.queryForm.pageNo = 1
      this.queryForm.sourceName = v.sourceName
      this.getQuanIndex()
    },
    // 导入
    ImportFiles() {
      this.ImportDialogVisible = true
    },
    handleClose() {
      this.ImportDialogVisible = false
      this.getQuanIndex()
    },
    // 导出
    exportFiles() {
      const File = domnLoadFile()
      const fname = `数据源文档`
      DomnLoadFile(File, fname)
    },
    // 导出模板
    ImportModle() {
      const File = domnLoadModel()
      const fname = `数据源文档模板`
      DomnLoadFile(File, fname)
    },
    // 新增
    addQuanIndex() {
      this.addRuleForm = {
        sourceName: '',
        sourceUrl: '',
        sourceSort: 0,
        sourceSection: '',
        sourceTypeName: '',
        sourceTypeId: '',
        remark: '',
      }
      this.isEadite = false
      this.addDialogVisible = true
    },
    // 根据id编辑数据
    async handleAddOrUpdate(res) {
      this.isEadite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(res))
    },
    addQuanIndexFrom() {
      this.options.forEach((item) => {
        if (this.addRuleForm.sourceTypeName === item.typeName) {
          this.addRuleForm.sourceTypeId = item.sourceTypeId
        }
      })
      this.$refs.addRuleForm.validate(async (valid) => {
        console.log(this.$refs.listFilter.filterParams);
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEadite) {
          res = await save(this.addRuleForm)
        } else {
          res = await editeQuanIndexFrom(this.addRuleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.addDialogVisible = false
          this.$refs.listFilter.filterParams.sourceName = ''
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
      let id = [ids.sourceId]
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
