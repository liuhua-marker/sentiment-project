<template>
  <div>
    <el-tabs
      type="border-card"
      v-model="queryForm.ruleTypeId"
      @tab-click="getQuanIndex"
    >
      <el-tab-pane
        v-for="item in radioLable"
        :key="item.ruleTypeId"
        :label="item.ruleTypeName"
        :name="item.ruleTypeId"
      >
        <listFilters :ref="'filter' + queryForm.ruleTypeId" :options="filterOption" @change="queryQuanIndex" />
        <list-table
          :ref="item.ruleTypeId"
          :options="tableData"
          @command="listCommand"
        />
      </el-tab-pane>
    </el-tabs>
    <!-- 新增、编辑的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="数据源规则管理"
      :visible.sync="dialogVisible"
      width="55%"
    >
      <el-form
        ref="ruleForm"
        :model="ruleForm"
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item
          v-if="userInfo.orgId === '0'"
          label="所属方案："
          prop="solutionId"
        >
          <el-select
            v-model="ruleForm.solutionId"
            :disabled="isEdite"
            placeholder="请选择方案"
          >
            <el-option
              v-for="item in options"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规则：" prop="sourceRule">
          <el-input
            v-model.trim="ruleForm.sourceRule"
            placeholder="请输入规则"
          />
        </el-form-item>
        <el-form-item label="规则分类：" prop="sourceRuleClassify">
          <el-input
            v-model.trim="ruleForm.sourceRuleClassify"
            placeholder="请输入分类信息"
          />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input
            v-model.trim="ruleForm.remark"
            type="textarea"
            :rows="2"
            placeholder="备注说明"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="quanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 导入 -->
    <ImportantFlies
      :action="action + this.queryForm.ruleTypeId"
      :dialog-visible="ImportDialogVisible"
      @handleClose="handleClose"
    />
  </div>
</template>

<script>
import {
  page,
  confwordstype,
  save,
  editeQuanIndexFrom,
  handleDelete,
  domnLoadFile,
  domnLoadModel,
} from '@/api/regulations/data_filtering'
import { list, selectNowSolution } from '@/api/configuration/ruls'
import { confsourcerules } from '@/utils/url'
import { DomnLoadFile } from '@/utils/exportFiles'
import ImportantFlies from '@/components/Upload/ImportantFlies'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'

export default {
  name: 'DataFilteringRegulations',
  components: { listFilters, listTable, ImportantFlies },
  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-select',
          label: '所属方案',
          paramsName: 'solutionId',
          placeholder: '请选择方案',
          options: [],
          hidden: false,
        },
        {
          componentsName: 'el-input',
          label: '关键词查询',
          paramsName: 'queryWord',
          placeholder: '规则/分类/备注',
        },
      ],
      tableData: {
        title: '数据源规则过滤列表',
        listBtns: [
          {
            label: '新增',
            commandName: 'addQuanIndex',
            type: 'primary',
          },
          {
            label: '导入',
            commandName: 'ImportFiles',
            type: '',
          },
          {
            label: '模板',
            commandName: 'ImportModle',
            type: '',
          },
          {
            label: '导出',
            commandName: 'exportFiles',
            type: '',
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
            label: '规则', // 表头名称
            propName: 'sourceRule', // 查询返回的字段名
          },
          {
            label: '分类',
            propName: 'sourceRuleClassify',
          },
          {
            label: '所属方案',
            propName: 'solutionName',
          },
          {
            label: '新增时间',
            propName: 'createTime',
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
        queryWord: '',
        ruleTypeId: '',
        solutionId: '',
      },
      solutionForm: {
        pageNo: 1,
        pageSize: 100,
      },
      type: {
        pageNo: 1,
        pageSize: 100,
        ruleClassifyCode: 'SOURCE',
      },
      options: [],
      radioLable: [],
      // 验证规则
      rules: {
        sourceRule: {
          required: true,
          message: '请输入规则',
          trigger: 'blur',
        },
        solutionId: {
          required: true,
          message: '请选择方案',
          trigger: 'change',
        },
        sourceRuleClassify: {
          required: true,
          message: '请输入内容',
          trigger: 'blur',
        },
      },
      // 编辑
      dialogVisible: false,
      ruleForm: {},
      userInfo: {},
      action: confsourcerules(),
      ImportDialogVisible: false,
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.getWordsTypeId()
  },
  methods: {
    getWordsTypeId() {
      // 导航栏数据
      confwordstype(this.type).then((res) => {
        if (res.rows.length === 0) {
          this.$message({
            type: 'error',
            message: '请 先 到 规 则 类 型 管 理 配 置 数 据 规 则',
            showClose: true,
            duration: 5 * 1000,
          })
        } else {
          this.radioLable = res.rows
          this.queryForm.ruleTypeId = res.rows[0].ruleTypeId
          this.getQuanIndex()
        }
      })
      // 方案
      list(this.solutionForm).then((res) => {
        this.options = res.rows
        this.filterOption[0].options = []
        this.filterOption[0].hidden = false
        res.rows.forEach((val) => {
          const option = { value: val.solutionId, label: val.solutionName }
          this.filterOption[0].options.push(option)
        })
      })
      if (this.userInfo.orgId !== '0') {
        // 部门已选方案
        selectNowSolution(this.userInfo.deptId).then((ress) => {
          if (ress.data === undefined) {
            this.$message({
              type: 'warning',
              message: '请联系管理员配置方案...',
            })
          } else {
            this.queryForm.solutionId = ress.data.solutionId
            this.filterOption[0].hidden = true
          }
        })
      }
    },
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    // 获取页面数据
    getQuanIndex(index) {
      this.$nextTick(() => {
        this.$refs[this.queryForm.ruleTypeId][0].search(this.queryForm)
      })
    },
    // 查询
    queryQuanIndex(v) {
      this.queryForm.solutionId = v.solutionId
      this.queryForm.queryWord = v.queryWord
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
      if (!this.queryForm.solutionId) {
        this.$message({
          type: 'warning',
          message: '请选择方案',
        })
        return
      }
      const File = domnLoadFile(
        this.queryForm.solutionId,
        this.queryForm.ruleTypeId
      )
      const fname = `数据源规则文档`
      DomnLoadFile(File, fname)
    },
    // 导出模板
    ImportModle() {
      const File = domnLoadModel()
      const fname = `数据源规则文档模板`
      DomnLoadFile(File, fname)
    },
    // 新增
    addQuanIndex() {
      this.isEdite = false
      this.ruleForm = {
        sourceRule: '',
        sourceRuleClassify: '',
        remark: '',
        solutionId: '',
        ruleTypeId: '',
      }
      this.ruleForm.solutionId = this.queryForm.solutionId
      this.ruleForm.ruleTypeId = this.queryForm.ruleTypeId
      this.dialogVisible = true
    },
    // 根据id编辑数据
    handleAddOrUpdate(res) {
      this.isEdite = true
      this.dialogVisible = true
      this.ruleForm = JSON.parse(JSON.stringify(res))
    },
    quanIndexFrom() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (!valid) return
        // 成功了调用接口
        let filter = 'filter' + this.queryForm.ruleTypeId
        var res = {}
        if (!this.isEdite) {
          // 新增
          res = await save(this.ruleForm)
        } else {
          // 编辑
          res = await editeQuanIndexFrom(this.ruleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs[filter][0].filterParams.queryWord = ''
          this.$refs[filter][0].filterParams.solutionId = ''
          this.dialogVisible = false
          this.queryQuanIndex(this.$refs[filter][0].filterParams) // 刷新列表
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
      let id = [ids.sourceRuleId]
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
