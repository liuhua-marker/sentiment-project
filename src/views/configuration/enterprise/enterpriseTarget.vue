<template>
  <div>
    <!-- 搜索查询 -->
    <el-card class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="目标类型">
          <el-select
            v-model="queryForm.companyTypeId"
            clearable
            placeholder="全部"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="(item, index) in options"
              :key="index"
              :label="item.companyTypeName"
              :value="item.companyTypeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <Autocomplete
            :targetcompany="queryForm.companyName"
            @RefreshData="RefreshData"
          />
        </el-form-item>
        <el-form-item>
          <!-- <el-button type="primary" @click="queryQuanIndex">查询</el-button> -->
          <el-popover
            v-model="visibleTime"
            placement="bottom"
            width="240"
            trigger="manual"
            @show="timeday = 1"
          >
            <el-input-number
              v-model="timeday"
              controls-position="right"
              :min="1"
              :max="365"
              style="width: 100px"
              @keyup.enter.native="historicalData"
            />天
            <el-button type="info" class="fr" @click="historicalData"
              >确认</el-button
            >
            <!-- <el-button
              slot="reference"
              type="primary"
              @click="visibleTime = !visibleTime"
              >历史数据分发</el-button
            > -->
          </el-popover>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 全量目标管理 -->
    <list-table ref="listTable" :options="tableData" @command="listCommand" />
    <!-- 新增与编辑对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="目标信息"
      :visible.sync="addDialogVisible"
      width="50%"
      :before-close="clearDialog"
    >
      <el-form
        ref="addRuleForm"
        :model="addRuleForm"
        :rules="addRules"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="目标名称：" prop="companyName">
          <el-input v-model="addRuleForm.companyName" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="目标类型：" prop="companyTypeIds">
          <el-checkbox-group v-model="addRuleForm.companyTypeIds">
            <el-checkbox
              v-for="(item, index) in options"
              :key="index"
              :label="item.companyTypeId"
              >{{ item.companyTypeName }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input
            v-model.trim="addRuleForm.remark"
            type="textarea"
            autosize
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button type="primary" :loading="loadAdd" @click="addQuanIndexFrom"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 关键词 -->
    <el-dialog
      :close-on-click-modal="false"
      title="关键词"
      :visible.sync="keyDialogVisible"
      width="78%"
    >
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="关键词查询">
          <el-input
            v-model.trim="queryKey.keyword"
            placeholder="关键词"
            size="medium"
            @keyup.enter.native="queryKeyIndex"
          />
        </el-form-item>
        <el-form-item label="关键词类型">
          <el-select
            v-model="queryKey.keywordType"
            placeholder="全部"
            clearable
            @change="queryKeyIndex"
          >
            <el-option
              v-for="(item, index) in keywordTypeOpts"
              :key="index"
              :label="item.keyTypeName"
              :value="item.keyType"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryKeyIndex">查询</el-button>
        </el-form-item>
      </el-form>
      <div class="app-table">
        <div class="table-title">
          <div class="fl">关键词列表</div>
          <el-button type="primary" @click="addKeyIndex">新增</el-button>
        </div>
        <el-table
          v-loading="loadKey"
          :data="keyWordTable"
          border
          stripe
          class="app-table-list"
        >
          <el-table-column label="序号" type="index" width="50" />
          <el-table-column label="关键词" prop="keyword" />
          <el-table-column label="关键词类型" prop="keywordTypeName" />
          <el-table-column label="是否校验">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.isValid == 1" type="success" effect="dark"
                >是</el-tag
              >
              <el-tag v-if="scope.row.isValid == 0" type="warning" effect="dark"
                >否</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="关联度" prop="relatedIndex" />
          <el-table-column label="置信度" prop="beliefIndex" />
          <el-table-column label="是否确认">
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.isAffirm == 0"
                type="warning"
                effect="dark"
                >否</el-tag
              >
              <el-tag
                v-if="scope.row.isAffirm == 1"
                type="success"
                effect="dark"
                >正确</el-tag
              >
              <el-tag v-if="scope.row.isAffirm == 2" type="danger" effect="dark"
                >错误</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" />
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="small"
                @click="
                  handleAffirm(scope.$index, scope.row.companyKeywordId, 1)
                "
                >正确</el-button
              >
              <el-button
                type="danger"
                size="small"
                @click="
                  handleAffirm(scope.$index, scope.row.companyKeywordId, 2)
                "
                >错误</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          :current-page="queryKey.pageNo"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="queryKey.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalKey"
          @size-change="handleSizeChangeKey"
          @current-change="handleCurrentChangeKey"
        />
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      width="50%"
      title="新增关键词"
      :visible.sync="keyInnerVisible"
      :before-close="clearDialog"
    >
      <el-form
        ref="addKeyRuleForm"
        :model="addKeyRuleForm"
        :rules="addKeyRule"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="关键词：" prop="keyword">
          <el-input v-model="addKeyRuleForm.keyword" />
        </el-form-item>
        <el-form-item label="关键词类型：" prop="keywordType">
          <el-select v-model="addKeyRuleForm.keywordType" placeholder="请选择">
            <el-option
              v-for="(item, index) in keywordTypeOpts"
              :key="index"
              :label="item.keyTypeName"
              :value="item.keyType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input
            v-model.trim="addKeyRuleForm.remark"
            type="textarea"
            autosize
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取消</el-button>
        <el-button type="primary" @click="addKeyIndexFrom">确定</el-button>
      </span>
    </el-dialog>
    <!-- 导入对话框 -->
    <UploadFile
      :action="action"
      :dialog-visible="DialogVisible"
      :imports="imports"
      @handleClose="handleClose"
    />
  </div>
</template>

<script>
import listTable from '@/components/table/listTable'
import { parseTime } from '@/utils'
import { page } from '@/api/enterprise/enterpriseType'
import {
  confcompanyList,
  confcompanySave,
  handleDelete,
  confcompanyUpdate,
  confcompanyKeywordList,
  affirm,
  companykeywordSave,
  domnLoadModel,
  domnLoadFile,
  // selectUploadInfo,
  // selectUploadInfoByType,
  selectExcelIsExist,
  downloadExcel,
  informAICompanyAdd,
} from '@/api/enterprise/enterpriseTarget'
import UploadFile from '@/components/Upload/UploadFile'
import { confcompany, uploadKeyWords } from '@/utils/url'
import { DomnLoadFile, UplodLoadFile } from '@/utils/exportFiles'
import Autocomplete from '@/views/configuration/public_sentiment/compoments/autocomplete'
export default {
  name: 'EnterpriseTarget',
  components: { UploadFile, Autocomplete, listTable },
  data() {
    return {
      tableData: {
        title: '全量目标管理',
        listBtns: [
          {
            label: '新增',
            commandName: 'addQuanIndex',
            type: 'primary',
          },
          {
            label: '补充关键词',
            commandName: 'ImportKeyword',
            type: '',
          },
          {
            label: '导入文件',
            commandName: 'ImportFiles',
            type: '',
          },
          {
            label: '模板下载',
            commandName: 'ImportModle',
            type: '',
          },
        ],
        listApi: {
          serviceFN: confcompanyList, // 获取表格的查询接口
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
            label: '目标名称', // 表头名称
            propName: 'companyName', // 查询返回的字段名
          },
          {
            label: '目标类型',
            propName: 'companyTypeNames',
            formatter: (value, row) => {
              let text = ''
              value.forEach((val, index) => {
                if (index < value.length - 1) {
                  text = text + val + ' | '
                } else {
                  text = text + val
                }
              })
              return text
            },
          },
          {
            label: '新增时间',
            propName: 'createTime',
            formatter: (value, row) => {
              // 格式化当前表格数据    参数value 为当前列的值  row为当前行数据
              const date = new Date(value)
              return parseTime(date)
            },
          },
          {
            label: '备注',
            propName: 'remark',
          },
          {
            label: '操作',
            btns: [
              {
                label: '关键词',
                commandName: 'handleWordKey',
                type: 'success',
              },
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
      loadAdd: false,
      value: true,
      loading: true,
      loadKey: true,
      isEdit: false,
      exportLoad: false,
      visibleTime: false,
      addDialogVisible: false,
      keyDialogVisible: false,
      keyInnerVisible: false,
      total: 0,
      totalKey: 0,
      timeday: 1,
      quanWordList: [],
      options: [],
      keywordTypeOpts: [
        {
          keyType: 'abb',
          keyTypeName: '简称',
        },
        {
          keyType: 'people',
          keyTypeName: '高管 ',
        },
        {
          keyType: 'product',
          keyTypeName: '产品',
        },
        {
          keyType: 'stock',
          keyTypeName: '股票代码',
        },
        {
          keyType: 'region',
          keyTypeName: '区域',
        },
        {
          keyType: ' key',
          keyTypeName: '关键词',
        },
      ],
      keyWordTable: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        companyName: '',
        companyTypeId: '',
      },
      queryKey: {
        pageNo: 1,
        pageSize: 10,
        companyId: '',
        keyword: '',
        keywordType: '',
      },
      addRuleForm: {
        companyName: '',
        companyTypeIds: [],
        remark: '',
      },
      addKeyRuleForm: {
        companyId: '',
        keywordType: '',
        keyword: '',
        remark: '',
      },
      // 新增验证规则
      addRules: {
        companyTypeIds: {
          required: true,
          message: '请选择目标类型',
          trigger: 'change',
        },
        companyName: {
          required: true,
          message: '目标名称',
          trigger: 'blur',
        },
      },
      addKeyRule: {
        keywordType: {
          required: true,
          message: '请选择关键词类型',
          trigger: 'change',
        },
        keyword: {
          required: true,
          message: '请输入关键词',
          trigger: 'blur',
        },
      },
      DialogVisible: false,
      action: '',
      imports: '',
      exportName: '导出',
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    this.getQuanIndex()
    this.getPageType()
  },
  methods: {
    // 导入
    ImportFiles() {
      this.DialogVisible = true
      this.imports = 'UPLOAD_COMPANY'
      this.action = confcompany()
    },
    ImportKeyword() {
      this.action = uploadKeyWords()
      this.imports = 'UPLOAD_KEYWORD'
      this.DialogVisible = true
    },
    handleClose() {
      this.DialogVisible = false
      this.getQuanIndex()
    },
    //   目标类型
    getPageType() {
      page({}).then((res) => {
        this.options = res.rows
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
    queryQuanIndex() {
      this.loading = true
      this.queryForm.pageNo = 1
      this.getQuanIndex()
    },
    RefreshData(companyName) {
      companyName ? (this.queryForm.companyName = companyName) : ''
      this.queryQuanIndex()
    },
    // 关键词查询
    queryKeyIndex() {
      this.queryKey.pageNo = 1
      this.getCompanyKeywordList()
    },
    // 新增
    addQuanIndex() {
      this.isEdit = false
      this.addDialogVisible = true
    },
    // 编辑
    handleAddOrUpdate(row) {
      this.isEdit = true
      this.addRuleForm = row
      this.addDialogVisible = true
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async (valid) => {
        if (!valid) return
        this.loadAdd = true
        // 成功了调用接口
        var res = {}
        if (!this.isEdit) {
          res = await confcompanySave(this.addRuleForm)
        } else {
          res = await confcompanyUpdate(this.addRuleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.queryForm.companyTypeId = ''
          this.queryForm.companyName = ''
          this.loadAdd = false
          // 刷新列表
          this.getQuanIndex()
        } else {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            message: res.data,
          })
        }
        this.clearDialog()
      })
    },
    // 关键词
    handleWordKey(row) {
      this.queryKey.pageNo = 1
      this.queryKey.companyId = row.companyId
      this.getCompanyKeywordList()
      this.keyDialogVisible = true
    },
    getCompanyKeywordList() {
      confcompanyKeywordList(this.queryKey).then((res) => {
        this.keyWordTable = res.rows
        this.totalKey = res.total
        this.loadKey = false
      })
    },
    handleAffirm(index, keywordId, isAffirm) {
      affirm(keywordId, isAffirm).then((res) => {
        this.keyWordTable[index].isAffirm = isAffirm
      })
    },
    // 关键词新增
    addKeyIndex() {
      this.keyInnerVisible = true
      this.addKeyRuleForm.companyId = this.queryKey.companyId
    },
    addKeyIndexFrom() {
      this.$refs.addKeyRuleForm.validate(async (valid) => {
        if (!valid) return
        companykeywordSave(this.addKeyRuleForm).then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
          this.queryKey.keyword = ''
          this.queryKey.keywordType = ''
          this.getCompanyKeywordList()
          this.clearDialog()
        })
      })
    },
    clearDialog() {
      if (this.addDialogVisible) {
        this.addRuleForm = {
          companyName: '',
          companyTypeIds: [],
          remark: '',
        }
        this.$refs.addRuleForm.clearValidate()
      }
      if (this.keyInnerVisible) {
        this.addKeyRuleForm = {
          companyId: '',
          keywordType: '',
          keyword: '',
          remark: '',
        }
        this.$refs.addKeyRuleForm.clearValidate()
      }
      this.keyInnerVisible = false
      this.addDialogVisible = false
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
    handleSizeChangeKey(val) {
      this.loadKey = true
      this.queryKey.pageSize = val
      this.getCompanyKeywordList()
    },
    handleCurrentChangeKey(val) {
      this.loadKey = true
      this.queryKey.pageNo = val
      this.getCompanyKeywordList()
    },
    // 删除
    handleDelete(ids) {
      let id = [ids.companyId]
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
          this.loading = false
        })
    },
    // 导出模板
    ImportModle() {
      const File = domnLoadModel()
      const fname = `目标文档模板`
      DomnLoadFile(File, fname)
    },
    historicalData() {
      informAICompanyAdd(this.timeday)
        .then((res) => {
          this.$message({
            type: 'success',
            message: '操作成功',
          })
        })
        .catch((req) => {
          this.$message({
            type: 'error',
            message: '操作失败',
          })
        })
      this.visibleTime = false
    },
  },
}
</script>

<style lang="scss" scoped>
.app-tabs {
  /deep/.el-form-item {
    margin-bottom: 0;
  }
}

.table-title {
  height: 36px;
  line-height: 36px;
  font-weight: 700;
}
.app-table {
  border: 1px solid #ccc;
  margin-top: 20px;
  padding: 10px;
  text-align: right;
  .app-table-list {
    width: 100%;
    margin: 10px 0;
  }
}
.el-progress {
  width: 150px;
  position: fixed;
  top: 155px;
  right: 40px;
}
.pagination {
  text-align: right;
}
</style>
