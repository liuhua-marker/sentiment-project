<template>
  <div>
    <!-- 搜索查询 -->
    <listFilters ref="listFilter" :options="filterOption" @change="queryQuanIndex" />
    <list-table ref="listTable" :options="tableData" @command="listCommand" />

    <!-- 新增与编辑的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="事件类型管理:"
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
        <el-form-item label="事件类型：" prop="eventType">
          <el-input v-model.trim="addRuleForm.eventType" />
        </el-form-item>
        <el-form-item label="类型编码：" prop="eventTypeCode">
          <el-input v-model.trim="addRuleForm.eventTypeCode" />
        </el-form-item>
        <el-form-item label="情感类型：" prop="emotionType">
          <el-select v-model="addRuleForm.emotionType" placeholder="请选择">
            <el-option
              v-for="(k, v, i) in options"
              :key="i"
              :label="v"
              :value="k"
            >
            </el-option>
          </el-select>
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
    <!-- 导入 -->
    <ImportantFlies
      :action="action"
      :dialog-visible="DialogVisible"
      @handleClose="handleClose"
    />
  </div>
</template>

<script>
import {
  eventTypeList,
  eventTypeSave,
  eventTypeUpdate,
  eventTypeDelete,
  domnLoadModel,
} from '@/api/configuration/event_type'
import { getEventTypeMap } from '@/api/configuration/event'
import { DomnLoadFile } from '@/utils/exportFiles'
import ImportantFlies from '@/components/Upload/ImportantFlies'
import { EventTypeImportExcel } from '@/utils/url'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'

export default {
  name: 'EventType',
  components: { ImportantFlies, listFilters, listTable },

  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-input',
          label: '事件类型',
          paramsName: 'eventType',
          placeholder: '事件类型',
        },
        {
          componentsName: 'el-select',
          label: '情感类型',
          paramsName: 'emotionType',
          placeholder: '全部',
          options: [],
        },
      ],
      tableData: {
        title: '事件类型管理',
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
        ],
        listApi: {
          serviceFN: eventTypeList, // 获取表格的查询接口
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
            label: '类型名称',
            propName: 'eventType',
          },
          {
            label: '类型编码', // 表头名称
            propName: 'eventTypeCode', // 查询返回的字段名
          },
          {
            label: '情感类型',
            propName: 'emotionType',
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
        eventType: '',
        emotionType: '',
      },
      // 新增与编辑数据
      addDialogVisible: false,
      addRuleForm: {},
      // 验证规则
      addRules: {
        eventType: {
          required: true,
          message: '请输入事件类型',
          trigger: 'blur',
        },
        eventTypeCode: {
          required: true,
          message: '请输入类型编码',
          trigger: 'blur',
        },
        emotionType: {
          required: true,
          message: '请选择情感类型',
          trigger: 'change',
        },
      },
      action: '', // 导入
      DialogVisible: false,
      options: {}
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
    getEventTypeMap().then((res) => {
      this.options = res.data
      this.filterOption[1].options = []
      for (let key in res.data) {
        let option = { value: res.data[key], label: key }
        this.filterOption[1].options.push(option)
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
      this.queryForm.emotionType = v.emotionType
      this.queryForm.eventType = v.eventType
      this.getQuanIndex()
    },
    // 新增
    addQuanIndex() {
      this.isEdite = false
      this.addRuleForm = {
        eventType: '',
        eventTypeCode: '',
        emotionTypeL: '',
        remark: '',
      }
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
          res = await eventTypeSave(this.addRuleForm) // 新增
        } else {
          res = await eventTypeUpdate(this.addRuleForm) // 编辑
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs.listFilter.filterParams.emotionType = ''
          this.$refs.listFilter.filterParams.eventType = ''
          this.addDialogVisible = false // 关闭表单
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
      let id = [ids.eventTypeId]
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          eventTypeDelete(id).then((res) => {
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
    // 导出模板
    ImportModle() {
      const File = domnLoadModel()
      const fname = `事件类型模板`
      DomnLoadFile(File, fname)
    },
    // 导入
    ImportFiles() {
      this.DialogVisible = true
      this.action = EventTypeImportExcel()
    },
    handleClose() {
      this.DialogVisible = false
      this.getQuanIndex()
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
