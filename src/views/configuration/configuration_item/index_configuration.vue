<template>
  <div>
    <el-tabs
      type="border-card"
      v-model="queryForm.configTypeId"
      @tab-click="getQuanIndex"
    >
      <el-tab-pane
        v-for="item in radioLable"
        :key="item.configTypeId"
        :label="item.configTypeName"
        :name="item.configTypeId"
      >
        <listFilters :ref="'filter' + item.configTypeId" :options="filterOption" @change="queryQuanIndex" />
        <list-table
          :ref="item.configTypeId"
          :options="tableData"
          @command="listCommand"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 新增、编辑的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="指标配置"
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
        <el-form-item label="起始值：" prop="indexStartValue">
          <el-input
            v-model.number="ruleForm.indexStartValue"
            placeholder="请输入起始值(数字)"
          />
        </el-form-item>
        <el-form-item label="终止值：" prop="indexEndValue">
          <el-input
            v-model.number="ruleForm.indexEndValue"
            placeholder="请输入终止值(数字)"
          />
        </el-form-item>
        <el-form-item label="级别：" prop="indexLevel">
          <el-input
            v-model.number="ruleForm.indexLevel"
            placeholder="请输入级别(数字)"
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
  </div>
</template>

<script>
import {
  page,
  confwordstype,
  save,
  editeQuanIndexFrom,
  handleDelete,
  // domnLoadFile,
  // domnLoadModel
} from '@/api/configuration_item/index_configuration'
import { list, selectNowSolution } from '@/api/configuration/ruls'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'

export default {
  name: 'IndexConfiguration',
  components: { listFilters, listTable },
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
          placeholder: '起始值/终止值/级别',
        },
      ],
      tableData: {
        title: '指标配置表',
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
            label: '起始值', // 表头名称
            propName: 'indexStartValue', // 查询返回的字段名
          },
          {
            label: '终止值',
            propName: 'indexEndValue',
          },
          {
            label: '级别',
            propName: 'indexLevel',
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
        solutionId: '',
        configTypeId: '',
      },
      solutionForm: {
        pageNo: 1,
        pageSize: 1000,
      },
      type: {
        pageNo: 1,
        pageSize: 1000,
        configClassifyCode: 'index',
      },
      options: [],
      radioLable: [],
      // 验证规则
      rules: {
        indexStartValue: [
          { required: true, message: '请输入起始值', trigger: 'blur' },
          { type: 'number', message: '起始值必须为数字值', trigger: 'blur' },
        ],
        indexEndValue: [
          { required: true, message: '请输入终止值', trigger: 'blur' },
          { type: 'number', message: '终止值必须为数字值', trigger: 'blur' },
        ],
        indexLevel: [
          { required: true, message: '请输入级别', trigger: 'blur' },
          { type: 'number', message: '级别必须为数字值', trigger: 'blur' },
        ],
        solutionId: {
          required: true,
          message: '请选择所属方案',
          trigger: 'change',
        },
      },
      // 编辑
      dialogVisible: false,
      ruleForm: {},
      userInfo: {},
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.getconfigTypeId()
  },
  methods: {
    // 获取页面数据
    getconfigTypeId() {
      // 导航栏数据
      confwordstype(this.type).then((res) => {
        this.radioLable = res.rows

        this.queryForm.configTypeId = res.rows[0].configTypeId
        this.getQuanIndex()
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
        this.$refs[this.queryForm.configTypeId][0].search(this.queryForm)
      })
    },
    // 查询
    queryQuanIndex(v) {
      this.queryForm.solutionId = v.solutionId
      this.queryForm.queryWord = v.queryWord
      this.getQuanIndex()
    },
    // 新增
    addQuanIndex() {
      this.isEdite = false
      this.ruleForm = {
        indexStartValue: '',
        indexEndValue: '',
        indexLevel: '',
        remark: '',
        solutionId: '',
        configTypeId: '',
      }
      this.ruleForm.solutionId = this.queryForm.solutionId
      this.ruleForm.configTypeId = this.queryForm.configTypeId
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
        let filter = 'filter' + this.queryForm.configTypeId
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
      let id = [ids.indexConfigId]
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
