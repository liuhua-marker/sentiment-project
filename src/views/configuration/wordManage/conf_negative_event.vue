<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item v-if="userInfo.orgId === '0'" label="所属方案:">
          <el-select v-model="queryForm.solutionId" @change="queryQuanIndex">
            <el-option
              v-for="item in solutionOption"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="userInfo.orgId === '0'" label="情感类型:">
          <el-select
            v-model="queryForm.eventEmotion"
            clearable
            placeholder="全部"
            @change="eventEmotionChang"
          >
            <el-option
              v-for="(v, k, i) in options"
              :key="i"
              :label="k"
              :value="v"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="userInfo.orgId === '0'" label="事件类型:">
          <el-select
            v-model="queryForm.eventTypeId"
            filterable
            clearable
            reserve-keyword
            placeholder="事件类型"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="item in optionsEventType"
              :key="item.eventTypeId"
              :label="item.eventType"
              :value="item.eventTypeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词查询:">
          <el-input
            v-model.trim="queryForm.queryWord"
            placeholder="事件名称/事件信号"
            size="medium"
            @keyup.enter.native="queryQuanIndex"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <div class="app-head">
        事件列表
        <div class="fr">
          <el-button type="primary" @click="addEventFrom">新增</el-button>
          <el-button type="primary" @click="ImportFiles">导入</el-button>
          <el-button type="primary" @click="ImportModle">模板</el-button>
          <el-button
            type="primary"
            @click="ImportEventFiles"
          >导入事件词</el-button>
          <el-button
            type="primary"
            @click="ImportEventModle"
          >事件词模板</el-button>
          <!-- <el-button type="primary" @click="exportFiles">导出</el-button> -->
        </div>
      </div>
      <el-table v-loading="loading" :data="quanWordList" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="所属类型" prop="eventType" />
        <el-table-column label="标签名称" prop="eventName" />
        <el-table-column label="标签编码" prop="eventSignal" />
        <el-table-column label="情感类型" prop="eventEmotionName" />
        <!-- <el-table-column label="事件描述" prop="eventDescription" width="200" /> -->
        <el-table-column label="新增时间" prop="createTime" width="180" />
        <el-table-column label="备注" prop="remark" width="120" />
        <el-table-column label="选择" width="240">
          <template slot-scope="scope">
            <el-button
              type="success"
              size="small"
              @click="handleAddOrUpdate(scope.row)"
            >详情</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete([scope.row.eventId])"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="queryForm.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 新增与修改事件 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="addDialogVisible"
      width="75%"
      :before-close="clearDialog"
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
        <el-form-item label="事件类型:" prop="eventTypeId">
          <el-select v-model="eventFrom.eventTypeId" placeholder="请选择">
            <el-option
              v-for="item in optionsEventType"
              :key="item.eventTypeId"
              :label="item.eventType"
              :value="item.eventTypeId"
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
      title="事件词详情"
      :visible.sync="dialogVisible"
      width="75%"
      :before-close="clearDialog"
    >
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="关键词查询:">
          <el-input
            v-model.trim="queryLable.eventWord"
            placeholder="事件词"
            size="medium"
            @keyup.enter.native="seaschEventWord"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="seaschEventWord">查询</el-button>
          <el-button type="primary" @click="addEventWord">新增</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="load1" :data="ruleForm" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="事件词" prop="eventWord" />
        <el-table-column label="事件词编码" prop="eventWordCode" />
        <el-table-column label="事件词分数" prop="eventWordScore" />
        <el-table-column label="新增时间" prop="createTime" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="选择" width="240">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="EventWordUpdate(scope.row)"
            >修改</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete([scope.row.eventWordId])"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="queryLable.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryLable.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalLable"
          @size-change="handleSizeChangelable"
          @current-change="handleCurrentChangeLable"
        />
      </div>
    </el-dialog>
    <!-- 新增与修改事件词 -->
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
  eventWordDomnLoadModel
} from '@/api/configuration/event'
import {
  eventTypeList,
  selectNowSolution
} from '@/api/configuration/event_type'
import { page } from '@/api/programme/programme'
import { DomnLoadFile } from '@/utils/exportFiles'
import ImportantFlies from '@/components/Upload/ImportantFlies'
import { confEventImportExcel, confEventWordImportExcel } from '@/utils/url'

export default {
  name: 'ConfNegativeWordRuls',
  components: { ImportantFlies },

  data() {
    return {
      // 表单数据
      loading: true,
      load1: true,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        queryWord: '',
        eventTypeId: '',
        solutionId: ''
      },
      queryLable: {
        eventId: '',
        eventWord: '',
        pageNo: 1,
        pageSize: 10
      },
      totalLable: 0,
      eventFrom: {},
      total: 0,
      options: {},
      solutionOption: [],
      optionsEventType: [],
      title: '新增事件',
      eventWordTitle: '新增事件词',
      // 修改
      dialogVisible: false,
      addDialogVisible: false,
      addWordDialogVisible: false,
      ruleForm: [],
      eventWordFrom: {
        solutionId: '',
        eventId: '',
        eventWord: '',
        eventWordCode: '',
        eventWordScore: '',
        remark: ''
      },
      userInfo: {},
      eventRules: {
        eventName: {
          required: true,
          message: '请输入事件名称',
          trigger: 'blur'
        },
        eventSignal: {
          required: true,
          message: '请输入事件信号',
          trigger: 'blur'
        },
        eventTypeId: {
          required: true,
          message: '请选择事件类型',
          trigger: 'change'
        },
        eventEmotion: {
          required: true,
          message: '请选择事件情感类型',
          trigger: 'change'
        },
        solutionId: {
          required: true,
          message: '请选择所属方案',
          trigger: 'change'
        },
        eventWord: {
          required: true,
          message: '请输入事件词',
          trigger: 'blur'
        },
        eventWordCode: {
          required: true,
          message: '请输入事件词编码',
          trigger: 'blur'
        },
        eventWordScore: {
          required: true,
          message: '请输入事件词分数',
          trigger: 'blur'
        }
      },
      action: '', // 导入
      DialogVisible: false
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
        })
        page({}).then((res) => {
          this.solutionOption = res.rows
          this.queryForm.solutionId = res.rows[0].solutionId
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
        emotionType: this.queryForm.eventEmotion,
        pageNo: 1,
        pageSize: 1000
      }
      // console.log(data)
      eventTypeList(data).then((res) => {
        this.optionsEventType = res.rows
      })
    },
    async getQuanIndex() {
      const data = await confeventList(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    // 查询
    queryQuanIndex(v) {
      this.loading = true
      this.queryForm.pageNo = 1
      this.getQuanIndex()
    },
    eventEmotionChang() {
      this.queryQuanIndex()
      this.getEventTypeList()
    },
    // 分页
    handleSizeChange(val) {
      this.loading = true
      this.queryForm.pageSize = val
      this.getQuanIndex()
    },
    handleCurrentChange(val) {
      this.loading = true
      this.queryForm.pageNo = val
      this.getQuanIndex()
    },
    // 根据id新增修改数据
    addEventFrom() {
      this.addDialogVisible = true
      this.title = '新增事件'
      this.eventFrom = {
        // eventDescription: '',
        eventName: '',
        eventSignal: '',
        eventTypeId: '',
        solutionId: '',
        remark: ''
      }
    },
    handleUpdate(row) {
      this.addDialogVisible = true
      this.title = '修改事件'
      this.eventFrom = JSON.parse(JSON.stringify(row))
    },
    handleAddFrom() {
      this.$refs.eventFrom.validate(async(valid) => {
        if (!valid) return
        var confevent = null
        if (this.title === '新增事件') {
          confevent = confeventSave(this.eventFrom)
        }
        if (this.title === '修改事件') {
          confevent = confeventUpdate(this.eventFrom)
        }
        confevent.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.getQuanIndex()
          this.clearDialog()
        })
      })
    },
    // 详情
    handleAddOrUpdate(res) {
      this.load1 = true
      this.ruleForm = []
      this.queryLable.pageNo = 1
      this.queryLable.eventId = res.eventId
      this.eventWordFrom.eventId = res.eventId
      this.eventWordFrom.solutionId = res.solutionId
      this.getEventLableDetail()
      this.dialogVisible = true
    },
    seaschEventWord() {
      this.queryLable.pageNo = 1
      this.getEventLableDetail()
    },
    getEventLableDetail() {
      confeventwordList(this.queryLable).then((res) => {
        this.ruleForm = res.rows
        this.totalLable = res.total
        this.load1 = false
      })
    },
    // 详情分页
    handleSizeChangelable(val) {
      this.load1 = true
      this.queryLable.pageSize = val
      this.getEventLableDetail()
    },
    handleCurrentChangeLable(val) {
      this.load1 = true
      this.queryLable.pageNo = val
      this.getEventLableDetail()
    },
    // 新增事件词
    addEventWord() {
      this.addWordDialogVisible = true
      this.eventWordTitle = '新增事件词'
      this.eventWordFrom.eventWord = ''
      this.eventWordFrom.eventWordCode = ''
      this.eventWordFrom.eventWordScore = ''
      this.eventWordFrom.remark = ''
    },
    EventWordUpdate(row) {
      this.addWordDialogVisible = true
      this.eventWordTitle = '修改事件词'
      this.eventWordFrom = JSON.parse(JSON.stringify(row))
    },
    addEventWordFrom() {
      this.$refs.eventWordFrom.validate(async(valid) => {
        if (!valid) return
        var confeventWord = null
        if (this.eventWordTitle === '新增事件词') {
          confeventWord = confeventwordSave(this.eventWordFrom)
        }
        if (this.eventWordTitle === '修改事件词') {
          confeventWord = confeventwordUpdate(this.eventWordFrom)
        }
        confeventWord.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.getEventLableDetail()
          this.addWordDialogVisible = false
        })
      })
    },
    clearDialog() {
      // 刷新列表
      this.dialogVisible = false
      this.addDialogVisible = false
    },
    // 根据id删除数据
    handleDelete(ids) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (this.dialogVisible) {
            confeventwordDelete(ids).then((res) => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getEventLableDetail()
            })
          } else {
            confeventDelete(ids).then((res) => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getQuanIndex()
            })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 导出模板
    ImportModle() {
      const File = domnLoadModel()
      const fname = `事件文档模板`
      DomnLoadFile(File, fname)
    },
    ImportEventModle() {
      const File = eventWordDomnLoadModel()
      const fname = `事件词文档模板`
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
    ImportEventFiles() {
      if (this.queryForm.solutionId === '') {
        this.$message('请选择导入方案')
      } else {
        this.queryLable.pageNo = 1
        this.DialogVisible = true
        this.action = confEventWordImportExcel() + this.queryForm.solutionId
      }
    },
    handleClose() {
      this.DialogVisible = false
      this.getQuanIndex()
      this.getEventLableDetail()
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .signal {
    border: 1px solid #ccc;
    padding: 0 20px;
  }
  .app-head {
    height: 36px;
    line-height: 36px;
    font-weight: 700;
    font-size: 14px;
  }
  .app-tabs {
    margin-top: 20px;
  }
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
  }
  .el-table {
    width: 100%;
    margin: 10px 0;
  }
  .pagination {
    text-align: right;
  }
}
</style>
