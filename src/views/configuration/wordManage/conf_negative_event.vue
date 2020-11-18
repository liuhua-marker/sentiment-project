<template>
  <div>
    <listFilters
      ref="listFilter"
      :options="filterOption"
      @change="queryQuanIndex"
      @handleChange="eventEmotionChang"
    />
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 新增与编辑事件 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="addDialogVisible"
      width="75%"
    >
      <el-form
        ref="eventFrom"
        :model="eventFrom"
        :rules="eventRules"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="事件名称:" prop="eventName">
          <el-input
            v-model.trim="eventFrom.eventName"
            placeholder="事件"
            size="medium"
          />
        </el-form-item>
        <el-form-item label="事件信号:" prop="eventSignal">
          <el-input
            v-model.trim="eventFrom.eventSignal"
            placeholder="事件"
            size="medium"
          />
        </el-form-item>
        <el-form-item label="所属方案:" prop="solutionId">
          <el-select v-model="eventFrom.solutionId" placeholder="请选择">
            <el-option
              v-for="item in solutionOption"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="事件情感类型:" prop="eventEmotion">
          <el-select v-model="eventFrom.eventEmotion" placeholder="请选择">
            <el-option
              v-for="(v, k, i) in options"
              :key="i"
              :label="k"
              :value="v"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :hidden="!eventFrom.eventEmotion"
          label="事件类型:"
          prop="eventTypeId"
        >
          <el-select v-model="eventFrom.eventTypeId" placeholder="请选择">
            <el-option
              v-for="item in optionsEventType"
              :key="item.eventTypeId"
              :label="item.eventType"
              :value="item.eventTypeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input
            v-model.trim="eventFrom.remark"
            type="textarea"
            autosize
            placeholder="备注"
            size="medium"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 事件词详情的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="75%"
    >
      <listFilters
        ref="keyFilter"
        :options="keyOption"
        @change="seaschEventWord"
      />
      <list-table ref="keyTable" :options="keyData" @command="listCommand" />
    </el-dialog>
    <!-- 新增与编辑事件词 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="eventWordTitle"
      :visible.sync="addWordDialogVisible"
      width="50%"
    >
      <el-form
        ref="eventWordFrom"
        :model="eventWordFrom"
        :rules="eventRules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="事件词:" prop="eventWord">
          <el-input
            v-model.trim="eventWordFrom.eventWord"
            placeholder="事件词"
            size="medium"
          />
        </el-form-item>
        <el-form-item label="事件词编码:" prop="eventWordCode">
          <el-input
            v-model.trim="eventWordFrom.eventWordCode"
            placeholder="事件词编码"
            size="medium"
          />
        </el-form-item>
        <el-form-item label="事件词分数:" prop="eventWordScore">
          <el-input
            v-model.trim="eventWordFrom.eventWordScore"
            placeholder="事件词分数"
            size="medium"
          />
        </el-form-item>
        <el-form-item label="备注:">
          <el-input
            v-model.trim="eventWordFrom.remark"
            placeholder="备注"
            size="medium"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addWordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addEventWordFrom">确 定</el-button>
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
  confeventList,
  confeventSave,
  confeventUpdate,
  confeventDelete,
  getEventTypeMap,
  confeventwordList,
  confeventwordSave,
  confeventwordDelete,
  confeventwordUpdate,
  domnLoadModel,
  eventWordDomnLoadModel,
} from '@/api/configuration/event'
import {
  eventTypeList,
  selectNowSolution,
} from '@/api/configuration/event_type'
import { page } from '@/api/programme/programme'
import { DomnLoadFile } from '@/utils/exportFiles'
import ImportantFlies from '@/components/Upload/ImportantFlies'
import { confEventImportExcel, confEventWordImportExcel } from '@/utils/url'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'

export default {
  name: 'ConfNegativeWordRuls',
  components: { ImportantFlies, listFilters, listTable },

  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-select',
          label: '所属方案',
          paramsName: 'solutionId',
          options: [],
        },
        {
          componentsName: 'el-select',
          label: '情感类型',
          paramsName: 'eventEmotion',
          placeholder: '全部',
          options: [],
          isChange: true,
        },
        {
          componentsName: 'el-select',
          label: '事件类型',
          paramsName: 'eventTypeId',
          placeholder: '事件类型',
          options: [],
        },
        {
          componentsName: 'el-input',
          label: '关键词',
          paramsName: 'queryWord',
          placeholder: '事件名称/事件信号',
        },
      ],
      tableData: {
        title: '事件列表',
        listBtns: [
          {
            label: '新增',
            commandName: 'addEventFrom',
            type: 'primary',
          },
          {
            label: '导入',
            commandName: 'ImportFiles',
          },
          {
            label: '模板',
            commandName: 'ImportModle',
          },
        ],
        listApi: {
          serviceFN: confeventList, // 获取表格的查询接口
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
            label: '事件类型', // 表头名称
            propName: 'eventType', // 查询返回的字段名
          },
          {
            label: '标签名称',
            propName: 'eventName',
          },
          {
            label: '标签编码',
            propName: 'eventSignal',
          },
          {
            label: '情感类型',
            propName: 'eventEmotionName',
            width: '120px',
          },
          {
            label: '新增时间',
            propName: 'createTime',
            width: '180px',
          },
          {
            label: '备注',
            propName: 'remark',
          },

          {
            label: '操作',
            btns: [
              {
                label: '详情',
                commandName: 'handleAddOrUpdate',
                type: 'success',
              },
              {
                label: '编辑',
                commandName: 'handleUpdate',
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
      keyOption: [
        {
          componentsName: 'el-input',
          label: '关键词查询',
          paramsName: 'eventWord',
          placeholder: '事件词',
        },
      ],
      keyData: {
        title: '事件词详情',
        listBtns: [
          {
            label: '新增',
            commandName: 'addEventWord',
            type: 'primary',
          },
        ],
        listApi: {
          serviceFN: confeventwordList, // 获取表格的查询接口
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
            label: '事件词', // 表头名称
            propName: 'eventWord', // 查询返回的字段名
          },
          {
            label: '事件词编码',
            propName: 'eventWordCode',
          },
          {
            label: '事件词分数',
            propName: 'eventWordScore',
          },
          {
            label: '新增时间',
            propName: 'createTime',
            width: '180px',
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
                commandName: 'EventWordUpdate',
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
      queryForm: {
        queryWord: '',
        eventTypeId: '',
        solutionId: '',
      },
      queryLable: {
        eventId: '',
        eventWord: '',
      },
      eventFrom: {},
      options: {},
      solutionOption: [],
      optionsEventType: [],
      title: '新增事件',
      eventWordTitle: '新增事件词',
      // 编辑
      dialogVisible: false,
      addDialogVisible: false,
      addWordDialogVisible: false,
      eventWordFrom: {},
      userInfo: {},
      eventRules: {
        eventName: {
          required: true,
          message: '请输入事件名称',
          trigger: 'blur',
        },
        eventSignal: {
          required: true,
          message: '请输入事件信号',
          trigger: 'blur',
        },
        eventTypeId: {
          required: true,
          message: '请选择事件类型',
          trigger: 'change',
        },
        eventEmotion: {
          required: true,
          message: '请选择事件情感类型',
          trigger: 'change',
        },
        solutionId: {
          required: true,
          message: '请选择所属方案',
          trigger: 'change',
        },
        eventWord: {
          required: true,
          message: '请输入事件词',
          trigger: 'blur',
        },
        eventWordCode: {
          required: true,
          message: '请输入事件词编码',
          trigger: 'blur',
        },
        eventWordScore: {
          required: true,
          message: '请输入事件词分数',
          trigger: 'blur',
        },
      },
      action: '', // 导入
      DialogVisible: false,
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.getEventType()
  },
  methods: {
    getEventType() {
      if (this.userInfo.deptId === '0') {
        getEventTypeMap().then((res) => {
          this.options = res.data
          this.filterOption[1].options = []
          for (let key in res.data) {
            let option = { value: res.data[key], label: key }
            this.filterOption[1].options.push(option)
          }
        })
        page({}).then((res) => {
          this.solutionOption = res.rows
          this.filterOption[0].options = []
          res.rows.forEach((val) => {
            const option = { value: val.solutionId, label: val.solutionName }
            this.filterOption[0].options.push(option)
          })
          // this.filterOption[0].defaultValue = res.rows[0].solutionId
          // this.queryForm.solutionId = res.rows[0].solutionId
          this.getQuanIndex()
        })
        this.getEventTypeList()
      } else {
        selectNowSolution(this.userInfo.deptId).then((res) => {
          this.queryForm.solutionId = res.data.solutionId
          this.getQuanIndex()
        })
      }
    },
    getEventTypeList(type) {
      const data = {
        emotionType: type,
        pageNo: 1,
        pageSize: 1000,
      }
      eventTypeList(data).then((res) => {
        if (!type) {
          this.optionsEventType = res.rows
        }
        this.filterOption[2].options = []
        res.rows.forEach((val) => {
          const option = { value: val.eventTypeId, label: val.eventType }
          this.filterOption[2].options.push(option)
        })
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
      this.queryForm.eventEmotion = v.eventEmotion
      this.queryForm.eventTypeId = v.eventTypeId
      this.queryForm.queryWord = v.queryWord
      this.queryForm.solutionId = v.solutionId
      this.getQuanIndex()
    },
    eventEmotionChang(v) {
      this.getEventTypeList(v.eventEmotion)
    },
    // 根据id新增编辑数据
    addEventFrom() {
      this.addDialogVisible = true
      this.title = '新增事件'
      this.eventFrom = {
        eventName: '',
        eventSignal: '',
        eventTypeId: this.queryForm.eventTypeId,
        solutionId: this.queryForm.solutionId,
        eventEmotion: this.queryForm.eventEmotion,
        remark: '',
      }
    },
    handleUpdate(row) {
      this.addDialogVisible = true
      this.title = '编辑事件'
      this.eventFrom = JSON.parse(JSON.stringify(row))
    },
    handleAddFrom() {
      this.$refs.eventFrom.validate(async (valid) => {
        if (!valid) return
        var confevent = null
        if (this.title === '新增事件') {
          confevent = confeventSave(this.eventFrom)
        }
        if (this.title === '编辑事件') {
          confevent = confeventUpdate(this.eventFrom)
        }
        confevent.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs.listFilter.filterParams.eventEmotion = ''
          this.$refs.listFilter.filterParams.eventTypeId = ''
          this.$refs.listFilter.filterParams.queryWord = ''
          this.$refs.listFilter.filterParams.solutionId = ''
          this.addDialogVisible = false
          this.queryQuanIndex(this.$refs.listFilter.filterParams)
        })
      })
    },
    // 详情
    handleAddOrUpdate(res) {
      this.dialogVisible = true
      this.queryLable.eventId = res.eventId
      this.eventWordFrom.eventId = res.eventId
      this.eventWordFrom.solutionId = res.solutionId
      this.getEventLableDetail()
    },
    seaschEventWord(v) {
      this.queryLable.eventWord = v.eventWord
      this.getEventLableDetail()
    },
    getEventLableDetail() {
      this.$nextTick(() => {
        this.$refs['keyTable'].search(this.queryLable)
      })
    },
    // 新增事件词
    addEventWord() {
      this.eventWordTitle = '新增事件词'
      let event = {
        eventWord: '',
        eventWordCode: '',
        eventWordScore: '',
        remark: '',
      }
      this.eventWordFrom = { ...this.eventWordFrom, ...event }
      this.addWordDialogVisible = true
    },
    EventWordUpdate(row) {
      this.addWordDialogVisible = true
      this.eventWordTitle = '编辑事件词'
      this.eventWordFrom = JSON.parse(JSON.stringify(row))
    },
    addEventWordFrom() {
      this.$refs.eventWordFrom.validate(async (valid) => {
        if (!valid) return
        var confeventWord = null
        if (this.eventWordTitle === '新增事件词') {
          confeventWord = confeventwordSave(this.eventWordFrom)
        }
        if (this.eventWordTitle === '编辑事件词') {
          confeventWord = confeventwordUpdate(this.eventWordFrom)
        }
        confeventWord.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs.keyFilter.filterParams.eventWord = ''
          this.addWordDialogVisible = false
          this.seaschEventWord(this.$refs.keyFilter.filterParams)
        })
      })
    },
    // 根据id删除数据
    handleDelete(ids) {
      let id = []
      if (ids.eventWordId) {
        id.push(ids.eventWordId)
      } else {
        id.push(ids.eventId)
      }
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          if (this.dialogVisible) {
            confeventwordDelete(id).then((res) => {
              this.$message({
                type: 'success',
                message: '删除成功!',
              })
              this.getEventLableDetail()
            })
          } else {
            confeventDelete(id).then((res) => {
              this.$message({
                type: 'success',
                message: '删除成功!',
              })
              this.getQuanIndex()
            })
          }
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
      const fname = `事件文档模板`
      DomnLoadFile(File, fname)
    },
    // 导入
    ImportFiles() {
      if (this.queryForm.solutionId === '') {
        this.$message('请选择导入方案')
      } else {
        this.queryForm.pageNo = 1
        this.DialogVisible = true
        this.action = confEventImportExcel() + this.queryForm.solutionId
      }
    },
    handleClose() {
      this.DialogVisible = false
      this.getQuanIndex()
      this.getEventLableDetail()
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
