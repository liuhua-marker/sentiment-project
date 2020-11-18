<template>
  <div>
    <!-- 搜索查询 -->
    <listFilters ref="listFilter" :options="filterOption" @change="changeOrg" />
    <list-table ref="listTable" :options="tableList" @command="listCommand" />

    <!-- 配置源数据源 -->
    <el-dialog
      :close-on-click-modal="false"
      title="配置源数据源"
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
        <el-form-item label="机构名称：">
          <el-input v-model.trim="addRuleForm.orgName" :disabled="true" />
        </el-form-item>
        <el-form-item label="部门：">
          <el-input v-model.trim="addRuleForm.deptName" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据源：" prop="sourceTypeIds">
          <el-checkbox-group v-model="addRuleForm.sourceTypeIds">
            <el-checkbox
              v-for="item in dataOptions"
              :key="item.sourceTypeId"
              :label="item.sourceTypeId"
              >{{ item.typeName }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button type="primary" @click="addQuanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 数据源订阅 -->
    <el-dialog
      :close-on-click-modal="false"
      title="订阅数据源"
      :visible.sync="KeyDialogVisible"
      width="77%"
      :before-close="clearDialog"
    >
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="数据源类型:">
          <el-select
            v-model="queryData.sourceTypeId"
            clearable
            placeholder="全部"
            @change="getPageData"
          >
            <el-option
              v-for="item in optionData"
              :key="item.sourceTypeId"
              :label="item.typeName"
              :value="item.sourceTypeId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="data_box">
        <click-list-table
          class="data_box_item"
          ref="clickListTable"
          :options="tableData"
          @command="listCommand"
        />
        <el-card v-loading="load2" class="data_box_item">
          <div v-for="(item, index) in optionData" :key="index">
            <div v-if="item.sourceIds && item.sourceIds.length > 0">
              <p class="typeNames">{{ item.typeName }}数据源</p>
              <div>
                <el-tag
                  v-for="(source, i) in item.sourceIds"
                  :key="i"
                  closable
                  type="primary"
                  @close="tagClose(index, i)"
                  >{{ source.sourceName }}</el-tag
                >
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button type="primary" @click="dataQuanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  confdeptsourcesubscribeconfig, // 获取列表信息
  // saveOrUpdateSubscribeConfig, // 队列配置
  listGroupBySourceType, // 以配置的数据源
  configureDataSource, // 配置数据源
  configuration, // 配置源数据源
  configurationList, // 配置数据源列表
} from '@/api/dataSource/dataSourceSubscribe'
import { confdatasourcetype } from '@/api/dashboard'
import { getBusinesss } from '@/api/business'
import { page } from '@/api/dataSource/collectionSites'
import { systemDept } from '@/api/analysis/hot_analysis'
import listTable from '@/components/table/listTable'
import clickListTable from '@/components/table/clickListTable'
import listFilters from '@/components/filter/listFilters'
import { parseTime, deepClone } from '@/utils'
export default {
  name: 'DataSourceSubscribe',
  components: { listFilters, listTable, clickListTable },
  data() {
    return {
      filterOption: [
        {
          componentsName: 'el-select',
          label: '机构',
          paramsName: 'orgId',
          placeholder: '全部',
          options: [],
          // defaultValue:""
        },
      ],
      tableList: {
        title: '数据源订阅列表',
        listApi: {
          serviceFN: confdeptsourcesubscribeconfig, // 获取表格的查询接口
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
            label: '订阅源数量', // 表头名称
            propName: 'subSourceSize', // 查询返回的字段名
          },
          {
            label: '操作',
            btns: [
              {
                label: '订阅',
                commandName: 'handledata',
                type: 'primary',
              },
              {
                label: '配置',
                commandName: 'handleDeploy',
                type: 'danger',
              },
            ],
            btnGroups: false,
          },
        ],
      },
      tableData: {
        title: '数据源列表',
        listApi: {
          serviceFN: page, // 获取表格的查询接口
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
        ],
      },

      load2: true,
      // 表单数据
      queryForm: {
        orgId: '',
        deptId: '',
      },
      queryData: {
        sourceTypeId: '',
      },
      deptId: '',
      // 新增数据
      addDialogVisible: false,
      KeyDialogVisible: false,
      addRuleForm: { sourceTypeIds: [] },
      optionData: [],
      dataOptions: [],
      sourceTypeIds: [],
      // 新增验证规则
      addRules: {
        sourceTypeIds: {
          required: true,
          message: '请选择数据源',
          trigger: 'change',
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
    getTypeList() {
      getBusinesss({}).then((res) => {
        this.filterOption[0].options = []
        res.rows.forEach((item) => {
          let option = { value: item.id, label: item.name }
          this.filterOption[0].options.push(option)
        })
      })
    },
    // 选择机构
    changeOrg(v) {
      this.queryForm.pageNo = 1
      this.queryForm.orgId = v.orgId
      this.getQuanIndex()
    },
    // 配置源数据源
    handleDeploy(val) {
      this.getDataSource(val.deptId)
      this.addRuleForm.deptId = val.deptId
      this.addRuleForm.deptName = val.deptName
      this.addRuleForm.orgName = val.orgName
      this.addDialogVisible = true
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate((valid) => {
        if (!valid) return
        // 成功了调用接口
        configuration(
          this.addRuleForm.deptId,
          this.addRuleForm.sourceTypeIds
        ).then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.clearDialog() // 关闭表单
          this.getQuanIndex() // 刷新列表
        })
      })
    },
    clearDialog() {
      this.queryData.sourceTypeId = ''
      this.KeyDialogVisible = false
      this.addDialogVisible = false
    },
    getDataSource(deptId) {
      this.addRuleForm.sourceTypeIds = []
      const data = {
        deptId: '0',
        pageNo: 1,
        pageSize: 99999,
      }
      confdatasourcetype(data).then((res) => {
        this.dataOptions = res.rows
      })
      configurationList(deptId).then((res) => {
        res.data.forEach((item) => {
          this.addRuleForm.sourceTypeIds.push(item.parentSourceId)
        })
      })
    },
    // 订阅数据源
    async handledata(row) {
      this.KeyDialogVisible = true
      this.load2 = true
      this.deptId = row.deptId
      await confdatasourcetype({ deptId: 0 }).then((res) => {
        this.optionData = res.rows
      })
      await listGroupBySourceType(row.deptId).then((res) => {
        this.load2 = false
        const rows = Object.keys(res.data)
        this.optionData.forEach((item) => {
          item.sourceIds = []
          rows.forEach((row) => {
            if (row === item.sourceTypeId) {
              item.sourceIds = res.data[row]
            }
          })
        })
      })
      this.getPageData()
    },
    // 获取订阅数据源列表
    getPageData() {
      this.$refs['clickListTable'].search(this.queryData)
    },
    tableSelecteRow(row, rows) {
      this.optionData.forEach((item, index) => {
        if (row.sourceTypeId === item.sourceTypeId) {
          if (item.sourceIds.length === 0) {
            item.sourceIds.push(row)
          } else {
            const vals = []
            item.sourceIds.forEach((val) => {
              vals.push(val.sourceId)
            })
            const t = vals.indexOf(row.sourceId)
            if (t === -1) {
              item.sourceIds.push(row)
            } else {
              this.$message({
                type: 'warning',
                message: '该标签已配置，请重新选择...',
              })
            }
          }
        }
        this.$set(this.optionData, index, item)
      })
    },
    tagClose(index, i) {
      this.optionData[index].sourceIds.splice(i, 1)
      this.optionData = deepClone(this.optionData)
    },
    dataQuanIndexFrom() {
      const data = []
      this.optionData.forEach((item) => {
        item.sourceIds.forEach((source) => {
          data.push(source.sourceId)
        })
      })
      configureDataSource(this.deptId, data).then((res) => {
        this.clearDialog()
        this.$message({
          type: 'success',
          message: '订阅数据源成功',
        })
        this.getQuanIndex()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-tag {
    margin-right: 10px;
    margin-bottom: 8px;
  }
  .typeNames {
    padding: 8px 0;
    border-bottom: 1px solid #ccc;
  }
  .data_box {
    display: flex;
    height: 625px;
    vertical-align: middle;
    overflow: auto;
    overflow-x: hidden;
  }
  .data_box_item {
    flex: 12;
    margin-right: 15px;
    
  }
  .data_box_item:last-child {
    margin-right: 0;
  }
}
</style>
