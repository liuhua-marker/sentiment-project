<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="情感类型:">
          <el-select
            v-model="queryForm.emotionType"
            clearable
            placeholder="请选择"
            @change="queryQuanIndex"
          >
            <el-option v-for="(val, key ,i) in options" :key="i" :label="key" :value="val" />
          </el-select>
          <!-- <el-input
            v-model.trim="queryForm.emotionType"
            placeholder="事件类型"
            size="medium"
            @keyup.enter.native="queryQuanIndex"
          />-->
        </el-form-item>
        <el-form-item label="事件类型:">
          <el-input
            v-model.trim="queryForm.eventType"
            placeholder="事件类型"
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
      <h4 class="fl">事件类型管理</h4>
      <div class="fr">
        <el-button type="primary" @click="addQuanIndex">新增</el-button>
        <el-button type="primary" @click="ImportFiles">导入</el-button>
        <el-button type="primary" @click="ImportModle">模板下载</el-button>
      </div>
      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="类型编码" prop="eventTypeCode" />
        <el-table-column label="类型名称" prop="eventType" />
        <el-table-column label="情感类型" prop="emotionType" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="新增时间" width="220" prop="createTime" />
        <el-table-column label="选择" width="220">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete([scope.row.eventTypeId])">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
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

    <!-- 新增与修改的对话框 -->
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
        <el-form-item label="备注：" prop="remark">
          <el-input v-model.trim="addRuleForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addQuanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 导入 -->
    <ImportantFlies :action="action" :dialog-visible="DialogVisible" @handleClose="handleClose" />
  </div>
</template>

<script>
import {
  eventTypeList,
  eventTypeSave,
  eventTypeUpdate,
  eventTypeDelete,
  domnLoadModel
} from '@/api/configuration/event_type'
import { getEventTypeMap } from '@/api/configuration/event'
import { DomnLoadFile } from '@/utils/exportFiles'
import ImportantFlies from '@/components/Upload/ImportantFlies'
import { EventTypeImportExcel } from '@/utils/url'
// import { getToken } from '@/utils/auth'

export default {
  name: 'EventType',
  components: { ImportantFlies },

  data() {
    return {
      loading: true,
      // 表单数据
      isEdite: false,
      isShow: false,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        eventType: '',
        emotionType: ''
      },
      options: {},
      total: 0,
      // 新增与修改数据
      addDialogVisible: false,
      addRuleForm: {},
      // 验证规则
      addRules: {
        eventType: {
          required: true,
          message: '请输入事件类型',
          trigger: 'blur'
        }
      },
      action: '', // 导入
      DialogVisible: false
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
    getEventTypeMap().then((res) => {
      this.options = res.data
    })
  },
  methods: {
    // 获取页面数据
    async getQuanIndex() {
      const data = await eventTypeList(this.queryForm)
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
    // 新增
    addQuanIndex() {
      this.isEdite = false
      this.addDialogVisible = true
      this.addRuleForm = {
        eventType: '',
        remark: ''
      }
    },
    // 根据id修改数据
    handleAddOrUpdate(data) {
      this.isEdite = true
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(data))
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async(valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          res = await eventTypeSave(this.addRuleForm) // 新增
        } else {
          res = await eventTypeUpdate(this.addRuleForm) // 修改
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.addDialogVisible = false // 关闭表单
          this.getQuanIndex() // 刷新列表
        } else {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            message: res.data
          })
        }
      })
    },
    // 根据id删除数据
    handleDelete(ids) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          eventTypeDelete(ids).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getQuanIndex()
          })
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
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .app-tabs {
    margin-top: 20px;
  }
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
    .app-table-list {
      width: 100%;
      margin: 20px 0;
    }
  }
}
</style>
