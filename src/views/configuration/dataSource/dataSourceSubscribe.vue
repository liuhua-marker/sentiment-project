<template>
  <div class="app-container box">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="机构:">
          <el-select v-model="queryForm.orgId" clearable placeholder="全部" @change="changeOrg">
            <el-option
              v-for="item in optionOrg"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <h4>数据源订阅列表</h4>
      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="机构名称" prop="orgName" />
        <el-table-column label="部门名称" prop="deptName" />
        <el-table-column label="订阅源数量" prop="subSourceSize" />
        <!-- <el-table-column label="预警队列" prop="warningQueue" /> -->
        <!-- <el-table-column label="热点队列" prop="topicQueue" /> -->
        <!-- <el-table-column label="备注" prop="remark" /> -->
        <el-table-column label="选择" width="300">
          <template slot-scope="scope">
            <!-- <el-button type="primary" @click="handleAddOrUpdate(scope.row)">队列配置</el-button> -->
            <el-button type="success" @click="handledata(scope.row)">订阅数据源</el-button>
            <el-button type="primary" @click="handleDeploy(scope.row)">配置源数据源</el-button>
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
            >{{ item.typeName }}</el-checkbox>
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
            @change="changeData"
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
      <div v-loading="load1" class="data_box">
        <h4>数据源列表</h4>
        <el-table
          :data="tableData"
          class="app-table-list"
          border
          height="485"
          @row-click="hangleTable"
        >
          <el-table-column label="序号" type="index" width="50" />
          <el-table-column label="数据源名称" prop="sourceName" />
          <el-table-column label="数据源类型" prop="sourceTypeName" />
        </el-table>
        <!-- 分页 -->
        <el-pagination
          :current-page="queryData.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalData"
          @size-change="handleSizeChangeData"
          @current-change="handleCurrentChangeData"
        />
      </div>
      <div v-loading="load2" class="data_box">
        <div v-for="(item,index) in optionData" :key="index">
          <div v-if="item.sourceIds && item.sourceIds.length > 0">
            <p class="typeNames">{{ item.typeName }}数据源</p>
            <div>
              <el-tag
                v-for="(source,i) in item.sourceIds"
                :key="i"
                closable
                type="primary"
                @close="tagClose(index,i)"
              >{{ source.sourceName }}</el-tag>
            </div>
          </div>
        </div>
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
  configurationList // 配置数据源列表
} from '@/api/dataSource/dataSourceSubscribe'
import { confdatasourcetype } from '@/api/dashboard'
import { getBusinesss } from '@/api/business'
import { page } from '@/api/dataSource/collectionSites'
import { systemDept } from '@/api/analysis/hot_analysis'
import { deepClone } from '../../../utils'
export default {
  name: 'DataSourceSubscribe',

  data() {
    return {
      loading: true,
      load1: true,
      load2: true,
      // 表单数据
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        orgId: '',
        deptId: ''
      },
      queryData: {
        pageNo: 1,
        pageSize: 10,
        sourceTypeId: ''
      },
      total: 0,
      totalData: 0,
      deptId: '',
      // 新增数据
      addDialogVisible: false,
      KeyDialogVisible: false,
      addRuleForm: { sourceTypeIds: [] },
      optionOrg: [],
      optionDept: [],
      optionData: [],
      tableData: [],
      dataOptions: [],
      sourceTypeIds: [],
      // 新增验证规则
      addRules: {
        sourceTypeIds: {
          required: true,
          message: '请选择数据源',
          trigger: 'change'
        }
      }
    }
  },
  created() {
    // 获取页面数据
    this.getTypeList()
    this.getQuanIndex()
  },
  methods: {
    // 获取页面数据
    async getQuanIndex() {
      const data = await confdeptsourcesubscribeconfig(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    getTypeList() {
      getBusinesss({}).then((res) => {
        this.optionOrg = res.rows
      })
    },
    // 选择机构
    changeOrg(v) {
      this.loading = true
      this.queryForm.pageNo = 1
      this.queryForm.deptId = ''
      this.getDept()
      this.getQuanIndex()
    },
    getDept() {
      const orgId = { orgIds: [this.queryForm.orgId] }
      systemDept(orgId).then((res) => [(this.optionDept = res.rows)])
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
    // // 队列配置
    // handleAddOrUpdate(res) {
    //   this.addDialogVisible = true
    //   this.addRuleForm = JSON.parse(JSON.stringify(res))
    // },
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
            message: '操作成功'
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
        pageSize: 99999
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
    // 订阅数据源分页
    handleSizeChangeData(val) {
      this.load1 = true
      this.queryData.pageSize = val
      this.getPageData()
    },
    handleCurrentChangeData(val) {
      this.load1 = true
      this.queryData.pageNo = val
      this.getPageData()
    },
    // 订阅数据源
    async handledata(row) {
      this.KeyDialogVisible = true
      this.load1 = true
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
      page(this.queryData).then((res) => {
        this.tableData = res.rows
        this.totalData = res.total
        this.load1 = false
      })
    },
    hangleTable(row) {
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
                message: '该标签已配置，请重新选择...'
              })
            }
          }
        }
        this.$set(this.optionData, index, item)
      })
    },
    changeData(id) {
      this.getPageData(id)
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
          message: '订阅数据源成功'
        })
        this.getQuanIndex()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-tag {
    margin-right: 10px;
    margin-bottom: 8px;
  }
  .app-tabs {
    margin-top: 20px;
  }
  .typeNames {
    padding: 8px 0;
    border-bottom: 1px solid #ccc;
  }
  .el-pagination {
    width: 100%;
    overflow: hidden;
    white-space: normal;
    word-break: break-all;
    line-height: 30px;
    text-align: right;
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
  .data_box {
    display: inline-block;
    width: 45%;
    margin-right: 2%;
    padding: 10px;
    border: 2px solid #ccc;
    height: 625px;
    vertical-align: middle;
    overflow: auto;
    overflow-x: hidden;
  }
}
</style>
