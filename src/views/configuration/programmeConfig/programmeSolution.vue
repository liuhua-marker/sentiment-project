<template>
  <div>
    <!-- 搜索查询 -->
    <listFilters ref="listFilter" :options="filterOption" @change="queryQuanIndex" />
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 配置对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="方案管理："
      :visible.sync="addDialogVisible"
      width="30%"
      :before-close="clearDialog"
    >
      <el-form
        ref="addRuleForm"
        :model="addRuleForm"
        :rules="addRules"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="机构名称：" prop="orgName">
          <el-input v-model.trim="addRuleForm.orgName" :disabled="true" />
        </el-form-item>
        <el-form-item label="部门名称：" prop="deptName">
          <el-input v-model.trim="addRuleForm.deptName" :disabled="true" />
        </el-form-item>
        <el-form-item label="方案名称：" prop="solutionId">
          <el-select
            v-model="addRuleForm.solutionId"
            placeholder="请选择"
            @change="isSolution = false"
          >
            <el-option
              v-for="item in optionSoultion"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button
          :loading="loadBtn"
          type="primary"
          :disabled="isSolution"
          @click="addQuanIndexFrom"
          >{{ loadBtnName }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  solutionList,
  configuration,
  resetSolution,
} from '@/api/programme/programmeSolution'
import { getBusinesss } from '@/api/business'
import { systemDept } from '@/api/analysis/hot_analysis'
import { page } from '@/api/programme/programme'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'

export default {
  name: 'ProgrammeSolution',
  components: { listFilters, listTable },

  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-select',
          label: '机构',
          paramsName: 'orgId',
          placeholder: '全部',
          options: [],
        },
      ],
      tableData: {
        title: '方案配置列表',
        listApi: {
          serviceFN: solutionList, // 获取表格的查询接口
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
            label: '机构名称', // 表头名称
            propName: 'orgName', // 查询返回的字段名
          },
          {
            label: '部门名称',
            propName: 'deptName',
          },
          {
            label: '方案名称',
            propName: 'solutionName',
          },
          {
            label: '操作',
            btns: [
              {
                label: '配置',
                commandName: 'handleAddOrUpdate',
                type: 'primary',
              },
              {
                label: '重置',
                commandName: 'handleReset',
                type: 'danger',
              },
            ],
            btnGroups: false,
          },
        ],
      },

      loadBtnName: '确 定',
      loadBtn: false,
      isSolution: true,
      // 表单数据
      optionSoultion: [],
      queryForm: {
        orgId: '',
        deptId: '',
      },
      // 新增与编辑数据
      addDialogVisible: false,
      addRuleForm: { solutionId: '' },
      // 验证规则
      addRules: {
        solutionId: {
          required: true,
          message: '请选择方案',
          trigger: 'blur',
        },
      },
    }
  },
  created() {
    // 获取页面数据
    this.getTypeList()
    this.getQuanIndex()
  },
  methods: {
    getTypeList() {
      getBusinesss({}).then((res) => {
        this.filterOption[0].options = []
        res.rows.forEach((item) => {
          let option = { value: item.id, label: item.name }
          this.filterOption[0].options.push(option)
        })
      })
      page({}).then((res) => {
        this.optionSoultion = res.rows
      })
    },
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
      this.queryForm.orgId = v.orgId
      this.queryForm.deptId = v.deptId
      this.getQuanIndex()
    },
    // 配置
    handleAddOrUpdate(res) {
      if (res.parentSolutionId) {
        res.solutionId = res.parentSolutionId
      } else {
        res.solutionId = ''
      }
      this.addRuleForm = JSON.parse(JSON.stringify(res))
      this.addDialogVisible = true
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async (valid) => {
        this.loadBtn = true
        this.loadBtnName = '加载中'
        if (!valid) return
        // 成功了调用接口
        configuration(
          this.addRuleForm.deptId,
          this.addRuleForm.solutionId
        ).then((res) => {
          this.loadBtn = false
          this.loadBtnName = '确 定'
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '操作成功',
            })
            this.clearDialog() // 关闭表单
            this.getQuanIndex() // 刷新列表
          }
        })
      })
    },
    // 重置
    handleReset(row) {
      this.$confirm('确定重置方案吗?重置后内容不可恢复', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        resetSolution(row.solutionId).then((res) => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '方案重置成功',
            })
          }
        })
      })
    },
    clearDialog() {
      this.addDialogVisible = false
      this.isSolution = true
      this.loadBtn = false
      this.loadBtnName = '确 定'
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
