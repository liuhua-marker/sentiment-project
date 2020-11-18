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
        <listFilters
          :ref="'filter' + item.configTypeId"
          :options="filterOption"
          @change="queryQuanIndex"
        />
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
        <el-form-item label="名称：" prop="configName">
          <el-input
            v-model.trim="ruleForm.configName"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item label="关键字：" prop="configKey">
          <el-input
            v-model.trim="ruleForm.configKey"
            placeholder="请输入关键字"
          />
        </el-form-item>
        <el-form-item label="值：" prop="configValue">
          <el-input
            v-model.trim="ruleForm.configValue"
            placeholder="请输入值"
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
} from '@/api/configuration_item/basics_configuration'
import { list, selectNowSolution } from '@/api/configuration/ruls'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'

export default {
  name: 'BasicsConfiguration',
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
          placeholder: '名称/关键字/备注',
        },
      ],
      tableData: {
        title: '基础配置表',
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
            label: '名称', // 表头名称
            propName: 'configName', // 查询返回的字段名
          },
          {
            label: '关键字',
            propName: 'configKey',
          },
          {
            label: '值',
            propName: 'configValue',
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
        configClassifyCode: 'basic',
      },
      options: [],
      radioLable: [],
      // 验证规则
      rules: {
        configName: [
          {
            required: true,
            message: '请输入指标名称',
            trigger: 'blur',
          },
        ],
        configKey: [
          {
            required: true,
            message: '请输入指标关键词',
            trigger: 'blur',
          },
        ],
        configValue: [
          {
            required: true,
            message: '请输入指标值',
            trigger: 'blur',
          },
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
      this.ruleForm = {
        configName: '',
        configKey: '',
        configValue: '',
        remark: '',
        solutionId: '',
        configTypeId: '',
      }
      this.isEdite = false
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
      let id = [ids.basicConfigId]
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
