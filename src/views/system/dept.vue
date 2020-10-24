<template>
  <div class="app-container">
    <div class="app-filters">
      <el-form :inline="true" class="serach-form-inline">
        <el-button type="primary" @click="handleAddDept">新增</el-button>
      </el-form>
    </div>

    <el-row class="box" style="margin-top: 10px;">
      <el-col :span="4">
        <h3>组织机构</h3>
        <el-tree
          ref="queryTree"
          :props="props"
          :load="loadNode"
          node-key="id"
          :default-expanded-keys="expandedKeys"
          :default-checked-keys="checkedKeys"
          :expand-on-click-node="false"
          check-strictly
          lazy
          show-checkbox
          @check="handleClick"
        />
      </el-col>
      <el-col :span="20" style="padding: 8px;">
        <el-table v-loading="loading" :data="deptList" row-key="id" style="margin-top:22px;" border>
          <el-table-column label="部门ID" width="225" prop="id" />
          <el-table-column label="部门名称" prop="deptName" />
          <el-table-column label="部门排序" prop="orderBy" />
          <el-table-column label="操作" width="400">
            <template slot-scope="scope">
              <el-button type="success" size="small" @click="handleAddChild(scope)">部门配置</el-button>
              <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-dialog :close-on-click-modal="false" :visible.sync="dialogVisible" :title="dialogType">
      <el-form
        ref="dept"
        :rules="rulesDept"
        :model="dept"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="名称" prop="deptName">
          <el-input
            v-model.trim="dept.deptName"
            :disabled="dialogType === '部门配置' ? true :false"
            placeholder="部门名称"
          />
        </el-form-item>
        <el-form-item v-if="dialogType !== '编辑部门'" label="机构选择" prop="orgId">
          <el-select
            v-model="dept.orgId"
            :disabled="dialogType === '部门配置' ? true :false"
            placeholder="请选择"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >{{ item.name }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType !== '部门配置'" label="描述">
          <el-input
            v-model="dept.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="部门描述"
          />
        </el-form-item>
        <el-form-item v-if="dialogType !== '部门配置'" label="排序">
          <el-input-number v-model="dept.orderBy" placeholder="部门排序，数值越小越靠前" />
        </el-form-item>
        <el-form-item v-if="dialogType === '部门配置'" label="热点队列：" prop="topicQueue">
          <el-input v-model.trim="dept.topicQueue" />
        </el-form-item>
        <el-form-item v-if="dialogType === '部门配置'" label="预警队列：" prop="warningQueue">
          <el-input v-model.trim="dept.warningQueue" />
        </el-form-item>
        <el-form-item v-if="dialogType === '部门配置'" label="数据队列：" prop="dataQueue">
          <el-input v-model.trim="dept.dataQueue" />
        </el-form-item>
        <el-form-item v-if="dialogType === '部门配置'" label="备注：">
          <el-input v-model.trim="dept.remark" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmDept">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  queryAllDept,
  addDept,
  getDept,
  deleteDept,
  updateDept,
  deptBasicConfig,
  deptBasicConfigSave
} from '@/api/dept'
import { getChild } from '@/api/business'
import { mapGetters } from 'vuex'

const defaultDept = {
  id: '',
  orgId: '',
  parentId: 0,
  parentName: '根目录',
  deptName: '',
  remark: '',
  orderBy: ''
}

export default {
  name: 'Dept',
  data() {
    return {
      loading: true,
      path: this.$router.path,
      dept: Object.assign({}, defaultDept),
      rulesDept: {
        orgId: { required: true, message: '请选择机构', trigger: 'change' },
        deptName: {
          required: true,
          message: '请输入部门名称',
          trigger: 'blur'
        },
        topicQueue: {
          required: true,
          message: '请输入热点队列',
          trigger: 'blur'
        },
        warningQueue: {
          required: true,
          message: '请输入预警队列',
          trigger: 'blur'
        },
        dataQueue: {
          required: true,
          message: '请输入数据队列',
          trigger: 'blur'
        }
      },
      deptList: [],
      dialogVisible: false,
      dialogType: '新增部门',
      options: '',
      rootNode: {
        id: '0',
        name: '全部',
        disabled: true
      },
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      expandedKeys: [],
      checkedKeys: [],
      queryForm: {
        orgId: ''
      },
      userInfo: {}
    }
  },
  computed: {
    ...mapGetters(['bId'])
  },
  created() {
    this.userInfo = this.$store.getters.userInfo
    this.rootNode.id = this.userInfo.orgId
    this.queryForm.orgId = this.userInfo.orgId
    this.expandedKeys = [this.rootNode.id]
  },
  methods: {
    async queryAllDept(orgId) {
      const res = await queryAllDept(orgId)
      this.loading = false
      this.deptList = res.data
    },
    // handleSearch() {
    //   this.queryAllDept()
    // },
    loadNode(node, resolve) {
      // 懒加载先保存当前选中的节点key, 展开后再设置一遍解决展开某选中节点后选中被取消的问题
      // if (this.$refs.tree !== undefined && this.checkedKeys.length < 1) this.checkedKeys = this.$refs.tree.getCheckedKeys()
      if (node.level === 0) {
        return resolve([this.rootNode])
      } else {
        getChild(node.data.id).then(res => {
          resolve(res.data)
          if (res.data.length > 0) {
            this.queryForm.orgId = res.data[0].id
            this.checkedKeys = [res.data[0].id]
          }
          this.queryAllDept(this.queryForm.orgId)
          // if (this.$refs.tree !== undefined) this.$refs.tree.setCheckedKeys(this.checkedKeys)
        })
      }
    },
    handleClick(data, checked) {
      this.loading = true
      const arr = [data.id]
      this.$refs.queryTree.setCheckedKeys(arr)
      this.queryForm.orgId = data.id
      this.queryAllDept(data.id)
    },
    getDeptChild() {
      getChild(this.userInfo.orgId).then(res => {
        this.options = res.data
      })
    },
    handleAddDept() {
      this.dept = Object.assign({}, defaultDept)
      if (this.queryForm.orgId !== '0') {
        this.dept.orgId = this.queryForm.orgId
      }
      this.getDeptChild()
      this.dialogType = '新增部门'
      this.dialogVisible = true
    },
    handleAddChild(scope) {
      this.getDeptChild()
      deptBasicConfig(scope.row.id).then(res => {
        this.dialogVisible = true
        this.dialogType = '部门配置'
        if (res.data) {
          this.dept = res.data
          this.dept.deptName = scope.row.deptName
        } else {
          this.dept = {
            topicQueue: '',
            warningQueue: '',
            dataQueue: '',
            deptName: scope.row.deptName,
            deptId: scope.row.id,
            orgId: this.queryForm.orgId,
            remark: ''
          }
        }
      })
    },
    handleEdit(scope) {
      getDept(scope.row.id).then(res => {
        this.dialogType = '编辑部门'
        this.dialogVisible = true
        this.dept = JSON.parse(JSON.stringify(res.data))
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除此部门?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteDept([row.id]).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.queryAllDept(this.queryForm.orgId)
          })

          // this.checkedKeys = [this.queryForm.orgId]
          // this.$refs.queryTree.setCheckedKeys([this.queryForm.orgId])
        })
        .catch(err => {
          console.error(err)
        })
    },
    async confirmDept() {
      this.$refs.dept.validate(async valid => {
        if (!valid) return
        var res = {}
        if (this.dialogType === '编辑部门') {
          res = await updateDept(this.dept)
        } else if (this.dialogType === '新增部门') {
          res = await addDept(this.dept)
        } else {
          res = await deptBasicConfigSave(this.dept)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.queryAllDept(this.dept.orgId)
          this.queryForm.orgId = this.dept.orgId
          this.checkedKeys = [this.dept.orgId]
          this.$refs.queryTree.setCheckedKeys(this.checkedKeys)
          this.dialogVisible = false
        } else {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            message: res.data
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .meuns-table {
    margin-top: 30px;
  }
}
</style>
