<template>
  <div>
    <!-- 搜索查询 -->
    <listFilters ref="listFilter" :options="filterOption" @change="queryQuanIndex" />
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 新增与编辑订阅公司 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="addDialogVisible"
      width="30%"
    >
      <el-form
        ref="eventFrom"
        :model="eventFrom"
        :rules="eventRules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="订阅名称:" prop="subName">
          <el-input
            v-model.trim="eventFrom.subName"
            placeholder="订阅名称"
            size="medium"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 订阅公司的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogTable"
      width="75%"
    >
      <listFilters ref="companyFilter" :options="companyOption" @change="seaschcompanyName" />
      <list-table
        ref="companyTable"
        :options="companyTable"
        @command="listCommand"
      />
    </el-dialog>
    <!-- 新增与编辑公司名 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="companyNameTitle"
      :visible.sync="addWordDialogVisible"
      width="30%"
    >
      <el-form
        ref="companyNameFrom"
        :model="companyNameFrom"
        :rules="eventRules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="公司名">
          <el-autocomplete
            ref="autoComplete"
            v-model="companyName"
            :fetch-suggestions="querySearchAsync"
            placeholder="目标公司"
            clearable
            class="search_inpt"
            value-key="companyName"
            @select="RefreshData"
          >
            <template slot-scope="{ item }">
              <div class="compare-name" v-html="item.companyName" />
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addWordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addcompanyNameFrom">确 定</el-button>
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
  confCompanyCombinationSubscribe,
  confCompanyCombinationSubscribeSave,
  confCompanyCombinationSubscribeUpdate,
  confCompanyCombinationSubscribeDelete,
  confcompanyNameList,
  confcompanyNameSave,
  confcompanyNameDelete,
  // confcompanyNameUpdate,
  companyNameDomnLoadModel,
} from '@/api/enterprise/enterpriseTotal'
import { DomnLoadFile } from '@/utils/exportFiles'
import ImportantFlies from '@/components/Upload/ImportantFlies'
import { companyModelUpload } from '@/utils/url'
// import Autocomplete from '@/views/components/autocomplete'
import { listByCompanyName } from '@/api/public_sentiment/public_sentiment_page'
import listTable from '@/components/table/listTable'
import listFilters from '@/components/filter/listFilters'
export default {
  name: 'EnterpriseTotal',
  components: { ImportantFlies, listFilters, listTable },

  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-input',
          label: '关键词查询',
          paramsName: 'subName',
          placeholder: '订阅名',
        },
      ],
      tableData: {
        title: '目标监控列表',
        listBtns: [
          {
            label: '新增',
            commandName: 'addEventFrom',
            type: 'primary',
          },
        ],
        listApi: {
          serviceFN: confCompanyCombinationSubscribe, // 获取表格的查询接口
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
            label: '订阅名', // 表头名称
            propName: 'subName', // 查询返回的字段名
          },
          {
            label: '编辑时间',
            propName: 'createTime',
          },
          {
            label: '操作',
            btns: [
              {
                label: '详情',
                commandName: 'handleAddOrUpdate',
                type: 'primary',
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
      companyOption: [
        {
          componentsName: 'el-input',
          label: '关键词查询',
          paramsName: 'companyName',
          placeholder: '公司名',
        },
      ],
      companyTable: {
        title: '订阅公司名',
        listBtns: [
          {
            label: '新增',
            commandName: 'addcompanyName',
            type: 'primary',
          },
          {
            label: '导入',
            commandName: 'ImportCompanyNameFiles',
          },
          {
            label: '模板',
            commandName: 'ImportCompanyNameModle',
          },
        ],
        listApi: {
          serviceFN: confcompanyNameList, // 获取表格的查询接口
        },
        // multipleTable: true, // 是否显示复选框
        index: {
          // 序号配置项
          num: true, // 是否显示序号
          width: 60,
        },
        header: [
          {
            label: '公司名', // 表头名称
            propName: 'companyName', // 查询返回的字段名
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
        subName: '',
      },
      queryLable: {
        companyCombSubId: '',
        companyName: '',
      },
      eventFrom: {},
      title: '新增',
      companyNameTitle: '新增公司名',
      // 编辑
      dialogTable: false,
      addDialogVisible: false,
      addWordDialogVisible: false,
      companyName: '',
      loadingEvent: false,
      restaurants: [],
      timer: null,
      companyNameFrom: {
        companyCombSubId: '',
        companyName: '',
      },
      eventRules: {
        subName: {
          required: true,
          message: '请输入订阅公司名称',
          trigger: 'blur',
        },
      },
      action: '', // 导入
      DialogVisible: false,
    }
  },
  created() {
    // 获取页面数据
    this.getQuanIndex()
  },
  methods: {
    querySearchAsync(val, cb) {
      const queryString = val.trim()
      if (queryString && queryString.length > 1) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          this.getCompanyName(queryString, cb)
        }, 100)
      } else {
        this.restaurants = []
        cb(this.restaurants)
      }
    },
    getCompanyName(name, cb) {
      this.loadingEvent = true
      this.restaurants = []
      const data = {
        companyName: name,
        pageNo: 1,
        pageSize: 5,
      }
      listByCompanyName(data).then((res) => {
        this.restaurants = res.rows
        const reg = new RegExp(name, 'g')
        this.restaurants.forEach((item) => {
          item.companyName = item.companyName.replace(
            reg,
            `<span style="color: #ff4949">${name}</span>`
          )
        })
        this.loadingEvent = false
        cb(this.restaurants)
      })
    },
    RefreshData(val) {
      this.$refs['autoComplete'].suggestions = []
      this.companyName = this.companyName.replace(/<[^>]*>/g, '').trim()
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
      this.queryForm.subName = v.subName
      this.getQuanIndex()
    },
    // 根据id新增编辑数据
    addEventFrom() {
      this.addDialogVisible = true
      this.title = '新增'
      this.eventFrom = { subName: '' }
    },
    handleUpdate(row) {
      this.addDialogVisible = true
      this.title = '编辑'
      this.eventFrom = JSON.parse(JSON.stringify(row))
    },
    handleAddFrom() {
      this.$refs.eventFrom.validate(async (valid) => {
        if (!valid) return
        var confevent = null
        if (this.title === '新增') {
          confevent = confCompanyCombinationSubscribeSave(this.eventFrom)
        }
        if (this.title === '编辑') {
          confevent = confCompanyCombinationSubscribeUpdate(this.eventFrom)
        }
        confevent.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs.listFilter.filterParams.subName = ''
          this.addDialogVisible = false
          this.queryQuanIndex(this.$refs.listFilter.filterParams)
        })
      })
    },
    // 详情订阅公司
    handleAddOrUpdate(res) {
      this.queryLable.companyCombSubId = res.companyCombSubId
      this.companyNameFrom.companyCombSubId = res.companyCombSubId
      this.dialogTable = true
      this.getEventLableDetail()
    },
    seaschcompanyName(v) {
      this.queryLable.companyName = v.companyName
      this.getEventLableDetail()
    },
    getEventLableDetail() {
      this.$nextTick(() => {
        this.$refs['companyTable'].search(this.queryLable)
      })
    },
    // 新增公司名
    addcompanyName() {
      this.addWordDialogVisible = true
      this.companyNameTitle = '新增公司名'
      this.companyNameFrom.companyName = ''
      this.companyNameFrom.remark = ''
      this.companyName = ''
    },
    addcompanyNameFrom() {
      if (this.companyName.trim().length > 1) {
        var confcompanyName = null
        if (this.companyNameTitle === '新增公司名') {
          this.companyNameFrom.companyName = this.companyName
          confcompanyName = confcompanyNameSave(this.companyNameFrom)
        }
        confcompanyName.then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.$refs.listFilter.filterParams.companyName = ''
          this.addWordDialogVisible = false
          this.seaschcompanyName(this.$refs.listFilter.filterParams)
        })
      } else {
        this.$message('公司名称错误，请重新填写')
      }
    },
    // 根据id删除数据
    handleDelete(ids) {
      let id = []
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          if (this.dialogTable) {
            id.push(ids.companyCombSubRelId)
            confcompanyNameDelete(id).then((res) => {
              this.$message({
                type: 'success',
                message: '删除成功!',
              })
              this.getEventLableDetail()
            })
          } else {
            id.push(ids.companyCombSubId)
            confCompanyCombinationSubscribeDelete(id).then((res) => {
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
    ImportCompanyNameModle() {
      const File = companyNameDomnLoadModel()
      const fname = `公司名文档模板`
      DomnLoadFile(File, fname)
    },
    ImportCompanyNameFiles() {
      this.queryLable.pageNo = 1
      this.DialogVisible = true
      this.action = companyModelUpload() + this.companyNameFrom.companyCombSubId
    },
    handleClose() {
      this.DialogVisible = false
      this.getEventLableDetail()
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/.el-dialog__body {
  padding: 10px 15px;
}
.el-autocomplete {
  width: 100%;
}
</style>
