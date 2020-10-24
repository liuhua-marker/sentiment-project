<template>
  <div class="app-container">
    <!-- 搜索查询 -->
    <div class="app-tabs">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="标签类别:">
          <el-select
            v-model="queryForm.labelTypeClassifyCode"
            clearable
            placeholder="全部"
            @change="queryQuanIndex"
          >
            <el-option v-for="(val, key, i) in options" :key="i" :label="val" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签类型:">
          <el-input
            v-model.trim="queryForm.queryWord"
            placeholder="标签类型/类型编码"
            size="medium"
            @keyup.enter.native="queryQuanIndex"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryQuanIndex">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addQuanIndex">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="app-table">
      <h4>标签类型管理</h4>

      <el-table v-loading="loading" :data="quanWordList" class="app-table-list" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column label="标签类型" prop="labelType" />
        <el-table-column label="标签类别" prop="labelTypeClassifyName" />
        <el-table-column label="类型编码" prop="labelTypeCode" />
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="新增时间" width="220" prop="createTime" />
        <el-table-column label="选择" width="220">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleAddOrUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete([scope.row.labelTypeId])">删除</el-button>
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
      title="标签类型管理:"
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
        <el-form-item label="标签类别：" prop="labelTypeClassifyCode">
          <el-select
            v-model="addRuleForm.labelTypeClassifyCode"
            :disabled="isEdite"
            placeholder="全部"
            @change="chaneLableType"
          >
            <el-option v-for="(val , key, i) in options" :key="i" :label="val" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isShow" label="所属源标签：" prop="sourceLabelTypeId">
          <el-select v-model="addRuleForm.sourceLabelTypeId" placeholder="全部" :disabled="isEdite">
            <el-option
              v-for="item in optionLableType"
              :key="item.labelTypeId"
              :label="item.labelType"
              :value="item.labelTypeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签类型：" prop="labelType">
          <el-input v-model.trim="addRuleForm.labelType" />
        </el-form-item>
        <el-form-item label="类型编码：" prop="labelTypeCode">
          <el-input v-model.trim="addRuleForm.labelTypeCode" />
        </el-form-item>
        <el-form-item label="备注：" prop="remark">
          <el-input v-model.trim="addRuleForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearDialog">取 消</el-button>
        <el-button type="primary" @click="addQuanIndexFrom">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  conflabeltypeList,
  getLabelTypeClassifyMap,
  conflabeltypeSave,
  conflabeltypeUpdate,
  handleDelete
} from '@/api/configuration/configurationType'
// import { getToken } from '@/utils/auth'

export default {
  name: 'ConfNegativeWordSiteFiltering',

  data() {
    return {
      loading: true,
      // 表单数据
      isEdite: false,
      isShow: false,
      quanWordList: [],
      optionLableType: [],
      queryForm: {
        pageNo: 1,
        pageSize: 10,
        queryWord: '',
        labelTypeClassifyCode: ''
      },
      options: [],
      total: 0,
      // 新增与修改数据
      addDialogVisible: false,
      addRuleForm: {
        labelType: '',
        labelTypeClassifyCode: '',
        labelTypeCode: '',
        remark: ''
      },
      // 验证规则
      addRules: {
        labelType: {
          required: true,
          message: '请输入标签类型',
          trigger: 'blur'
        },
        labelTypeClassifyCode: {
          required: true,
          message: '请选择标签类别',
          trigger: 'change'
        },
        sourceLabelTypeId: {
          required: true,
          message: '请选择所属源标签标签',
          trigger: 'change'
        },
        labelTypeCode: {
          required: true,
          message: '请输入类型编码',
          trigger: 'blur'
        }
      }
    }
  },
  created() {
    // 获取页面数据
    this.WordCategoryList()
    this.getQuanIndex()
  },
  methods: {
    // 获取页面数据
    async getQuanIndex() {
      const data = await conflabeltypeList(this.queryForm)
      this.quanWordList = data.rows
      this.total = data.total
      this.loading = false
    },
    WordCategoryList() {
      getLabelTypeClassifyMap().then(res => {
        this.options = res.data
      })
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
      this.isShow = false
      this.addDialogVisible = true
    },
    // 根据id修改数据
    handleAddOrUpdate(data) {
      this.isEdite = true
      if (data.labelTypeClassifyCode === 'event') {
        this.isShow = true
        this.getOptionLableType('source')
      } else {
        this.isShow = false
      }
      this.addDialogVisible = true
      this.addRuleForm = JSON.parse(JSON.stringify(data))
    },
    chaneLableType(val) {
      const key = Object.keys(this.options)
      if (val === 'event') {
        this.isShow = true
        this.getOptionLableType('source')
      } else {
        this.isShow = false
      }
      key.forEach(item => {
        if (item === val) {
          this.addRuleForm.labelTypeClassifyName = this.options[item]
        }
      })
    },
    getOptionLableType(val) {
      const data = { labelTypeClassifyCode: val }
      conflabeltypeList(data).then(res => {
        this.optionLableType = res.rows
      })
    },
    addQuanIndexFrom() {
      this.$refs.addRuleForm.validate(async valid => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (!this.isEdite) {
          res = await conflabeltypeSave(this.addRuleForm) // 新增
        } else {
          res = await conflabeltypeUpdate(this.addRuleForm) // 修改
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.clearDialog() // 关闭表单
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
    clearDialog() {
      this.addDialogVisible = false
      this.addRuleForm = {
        labelType: '',
        labelTypeClassifyCode: '',
        labelTypeCode: '',
        remark: ''
      }
      this.$refs.addRuleForm.clearValidate()
    },
    // 根据id删除数据
    handleDelete(ids) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          handleDelete(ids).then(res => {
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
