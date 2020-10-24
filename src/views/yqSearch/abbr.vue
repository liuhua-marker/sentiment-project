<template>
  <div class="app-container">
    <div class="app-filters">
      <el-form :inline="true" class="serach-form-inline">
        <el-form-item label="公司名称">
          <el-input v-model.trim="queryForm.compName" placeholder="公司名称" />
        </el-form-item>
        <el-button type="primary" size="small" @click="findCompNames">查询</el-button>
      </el-form>
    </div>

    <el-button type="primary" @click="handleUpload">上传名单</el-button>
    <el-button type="primary" @click="upTemplateVisible=true">上传名单模板</el-button>
    <el-table :data="companyList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="header-center" label="获取公司名称时间" width="220">
        <template slot-scope="scope">{{ scope.row.timestamp }}</template>
      </el-table-column>
      <el-table-column align="header-center" label="公司名称">
        <template slot-scope="scope">{{ scope.row.target }}</template>
      </el-table-column>
      <el-table-column align="left" label="公司简称">
        <template slot-scope="scope">{{ scope.row.abbs }}</template>
      </el-table-column>
    </el-table>

    <pagination
      :total="queryForm.total"
      :page.sync="queryForm.pageNo"
      :limit.sync="queryForm.pageSize"
      @pagination="findCompNames"
    />

    <el-dialog :close-on-click-modal="false" :visible.sync="dialogVisible" title="上传" width="25%">
      <el-upload
        :headers="tokenHeader"
        drag
        accept=".txt"
        action="/api/yuqing-visualize/yqSearch/uploadCompanys"
        :on-success="uploadSuccess"
        :on-error="uploadError"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div slot="tip" class="el-upload__tip">只能上传txt文件，且不超过500kb</div>
      </el-upload>
      <div style="text-align:center;margin-top:10px;">
        <el-button type="danger" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="upTemplateVisible"
      title="上传文件模板"
      width="30%"
    >
      <img src="@/comp_name_temp.png">
      <div style="text-align:center;margin-top:10px;">
        <el-button type="danger" @click="upTemplateVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { findCompNames, uploadCompanys } from '@/api/abbr'
import Pagination from '@/components/Pagination'
import { getToken } from '@/utils/auth'

export default {
  components: { Pagination },
  data() {
    return {
      queryForm: {
        total: 0,
        pageNo: 1,
        pageSize: 20,
        compName: ''
      },
      tokenHeader: {
        Authorization: getToken()
      },
      baseUrl: process.env.VUE_APP_BASE_API,
      companyList: [],
      dialogVisible: false,
      upTemplateVisible: false
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.findCompNames()
  },
  methods: {
    async findCompNames() {
      const res = await findCompNames(this.queryForm)
      this.companyList = res.rows
      this.queryForm.total = res.total
    },
    async uploadCompanys(id) {
      const res = await uploadCompanys(id)
      return res.data
    },
    handleUpload() {
      this.dialogVisible = true
    },
    uploadError() {
      this.$message({
        type: 'error',
        message: '上传失败!'
      })
    },
    uploadSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.$message({
          type: 'success',
          message: '上传成功!'
        })
        this.findCompNames()
      } else {
        this.$message({
          type: 'error',
          dangerouslyUseHTMLString: true,
          message: response.msg
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
