<template>
  <div class="app-container box">
    <!-- 导航 -->
    <div class="app-filters">
      <el-radio-group v-model="queryForm.configTypeId" @change="switchLexicon">
        <el-radio-button
          v-for="item in radioLable"
          :key="item.configTypeId"
          :label="item.configTypeId"
        >{{ item.configTypeName }}</el-radio-button>
      </el-radio-group>
    </div>
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item v-if="userInfo.orgId === '0'" label="所属方案:">
          <el-select
            v-model="queryForm.solutionId"
            clearable
            placeholder="请选择方案"
            @change="queryQuanIndex"
          >
            <el-option
              v-for="item in options"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词查询:">
          <el-input
            v-model.trim="queryForm.queryWord"
            placeholder="起始值/终止值/级别"
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
        指标配置表
        <div class="fr">
          <el-button type="primary" @click="addQuanIndex">新增</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="起始值" prop="indexStartValue" />
        <el-table-column label="终止值" width="220" prop="indexEndValue" />
        <el-table-column label="级别" width="220" prop="indexLevel" />
        <el-table-column label="所属方案" width="200" prop="solutionName" />
        <el-table-column label="新增时间" width="200">
          <template slot-scope="scope">{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
        </el-table-column>
        <el-table-column label="备注" width="220" prop="remark" />
        <el-table-column label="选择" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete([scope.row.indexConfigId])"
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

    <!-- 新增、修改的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      title="指标配置"
      :visible.sync="dialogVisible"
      width="55%"
      :before-close="clearDialog"
    >
      <el-form
        ref="ruleForm"
        :model="ruleForm"
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item v-if="userInfo.orgId === '0'" label="所属方案：" prop="solutionId">
          <el-select v-model="ruleForm.solutionId" :disabled="isEdite" placeholder="请选择方案">
            <el-option
              v-for="item in options"
              :key="item.solutionId"
              :label="item.solutionName"
              :value="item.solutionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="起始值：" prop="indexStartValue">
          <el-input v-model.number="ruleForm.indexStartValue" placeholder="请输入起始值(数字)" />
        </el-form-item>
        <el-form-item label="终止值：" prop="indexEndValue">
          <el-input v-model.number="ruleForm.indexEndValue" placeholder="请输入终止值(数字)" />
        </el-form-item>
        <el-form-item label="级别：" prop="indexLevel">
          <el-input v-model.number="ruleForm.indexLevel" placeholder="请输入级别(数字)" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model.trim="ruleForm.remark" type="textarea" :rows="2" placeholder="备注说明" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
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
  handleDelete
  // domnLoadFile,
  // domnLoadModel
} from '@/api/configuration_item/index_configuration'
import { list, selectNowSolution } from '@/api/configuration/ruls'
import { getToken } from '@/utils/auth'

export default {
  name: 'IndexConfiguration',

  data() {
    return {
      // 表单数据
      loading: true,
      isEdite: false,
      quanWordList: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        queryWord: '',
        solutionId: '',
        configTypeId: ''
      },
      solutionForm: {
        pageNo: 1,
        pageSize: 1000
      },
      type: {
        pageNo: 1,
        pageSize: 1000,
        configClassifyCode: 'index'
      },
      total: 0,
      options: [],
      radioLable: [],
      // 验证规则
      rules: {
        indexStartValue: [
          { required: true, message: '请输入起始值', trigger: 'blur' },
          { type: 'number', message: '起始值必须为数字值', trigger: 'blur' }
        ],
        indexEndValue: [
          { required: true, message: '请输入终止值', trigger: 'blur' },
          { type: 'number', message: '终止值必须为数字值', trigger: 'blur' }
        ],
        indexLevel: [
          { required: true, message: '请输入级别', trigger: 'blur' },
          { type: 'number', message: '级别必须为数字值', trigger: 'blur' }
        ],
        solutionId: {
          required: true,
          message: '请选择所属方案',
          trigger: 'change'
        }
      },
      // 修改
      dialogVisible: false,
      ruleForm: {
        indexStartValue: '',
        indexEndValue: '',
        indexLevel: '',
        remark: '',
        solutionId: '',
        configTypeId: ''
      },
      userInfo: {},
      isHidden: false,
      // 导入
      tokenHeader: {
        Authorization: getToken()
      }
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    this.get()
  },
  methods: {
    async get() {
      await this.getconfigTypeId()
      await this.getQuanIndex()
    },
    // 获取页面数据
    async getconfigTypeId() {
      const arr = await confwordstype(this.type)
      const res = await list(this.solutionForm)
      const ress = await selectNowSolution(this.userInfo.deptId)
      this.radioLable = arr.rows
      this.options = res.rows
      this.queryForm.configTypeId = this.radioLable[0].configTypeId
      this.fangan = ress
      if (this.userInfo.orgId === '0') {
        this.queryForm.solutionId = ''
      } else {
        if (ress.data === undefined) {
          this.queryForm.solutionId = 0
          this.isHidden = true
        } else {
          this.queryForm.solutionId = ress.data.solutionId
        }
      }
    },
    async getQuanIndex() {
      const data = await page(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    switchLexicon(label) {
      this.queryForm.pageNo = 1
      this.queryForm.configTypeId = label
      this.getQuanIndex()
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
      this.dialogVisible = true
      this.ruleForm.solutionId = this.queryForm.solutionId
      this.ruleForm.configTypeId = this.queryForm.configTypeId
    },
    // 根据id修改数据
    handleAddOrUpdate(res) {
      this.isEdite = true
      this.dialogVisible = true
      this.ruleForm = JSON.parse(JSON.stringify(res))
    },
    quanIndexFrom() {
      this.$refs.ruleForm.validate(async(valid) => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          // 新增
          res = await save(this.ruleForm)
        } else {
          // 修改
          res = await editeQuanIndexFrom(this.ruleForm)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.getQuanIndex() // 刷新列表
        } else {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            message: res.data
          })
        }
        this.clearDialog() // 关闭表单
      })
    },
    clearDialog() {
      this.ruleForm.solutionId = ''
      this.ruleForm.indexStartValue = ''
      this.ruleForm.indexEndValue = ''
      this.ruleForm.indexLevel = ''
      this.ruleForm.remark = ''
      // 刷新列表
      this.dialogVisible = false
      this.$refs.ruleForm.clearValidate()
    },
    // 根据id删除数据
    handleDelete(ids) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          handleDelete(ids).then((res) => {
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
  .app-title {
    margin: 10px;
  }
  .app-tabs {
    margin-top: 20px;
  }
  .app-table {
    border: 1px solid #ccc;
    margin-top: 20px;
    padding: 10px;
    .el-table {
      width: 100%;
      margin: 10px 0;
    }
  }
  .pagination {
    text-align: right;
  }
}
</style>
