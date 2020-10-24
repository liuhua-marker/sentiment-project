<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">新增</el-button>
    <div class="box" style="padding-top: 10px;margin-top:30px;">
      <el-table :data="rolesList" style="width: 100%;" border>
        <el-table-column align="center" label="角色ID" width="220" prop="id" />
        <el-table-column align="center" label="角色名称" width="220" prop="name" />
        <el-table-column align="header-center" label="角色编码" prop="code" />
        <el-table-column align="header-center" label="所属机构" prop="orgId" />
        <el-table-column align="header-center" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#00A854"
              active-text="启用"
              active-value="true"
              inactive-color="#F04134"
              inactive-text="禁用"
              inactive-value="false"
              @change="changeSwitch(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column align="header-center" label="描述" prop="remark" />
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
            <el-button
              v-if="scope.row.id != 1"
              type="danger"
              size="small"
              @click="handleDelete(scope)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination :total="total" :page.sync="pageNo" :limit.sync="pageSize" @pagination="getRoles" />
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      :title="dialogType === 'edit' ? '编辑角色' : '新增角色'"
    >
      <el-form ref="role" :model="role" :rules="Rules" label-width="80px" label-position="left">
        <el-form-item label="名称" prop="name">
          <el-input v-model.trim="role.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model.trim="role.code" placeholder="角色编码" />
        </el-form-item>
        <el-form-item v-if="dialogType === 'new'" label="机构选择">
          <el-select v-model="role.orgId" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >{{ item.name }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.remark"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="role.status"
            active-color="#00A854"
            active-text="启用"
            active-value="true"
            inactive-color="#F04134"
            inactive-text="禁用"
            inactive-value="false"
          />
        </el-form-item>
        <el-form-item label="菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import {
  getMenus,
  getRoleMenus,
  getRoles,
  addRole,
  deleteRole,
  updateRole
} from '@/api/role'
import Pagination from '@/components/Pagination'
import { getChild } from '@/api/business'

const defaultRole = {
  id: '',
  orgId: '',
  name: '',
  remark: '',
  status: 'true',
  menuIds: []
}

export default {
  name: 'Role',
  components: { Pagination },
  data() {
    return {
      role: Object.assign({}, defaultRole),
      total: 0,
      pageNo: 1,
      pageSize: 20,
      routes: [],
      options: '',
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      userInfo: {},
      defaultProps: {
        children: 'children',
        label: 'menuName'
      },
      Rules: {
        name: { required: true, message: '请输入名称', trigger: 'blur' },
        code: { required: true, message: '请输入角色编码', trigger: 'blur' }
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.userInfo = this.$store.getters.userInfo
    // Mock: get all routes and roles list from server
    this.getRoles()
    this.getMenus()
  },
  methods: {
    getMenus() {
      // const res = await getMenus()
      getMenus()
        .then(res => {
          this.routes = res.data
        })
        .catch(error => {
          console.error(error)
        })
    },
    // getRoleMenus(id) {
    //   getRoleMenus(id);
    //   console.log(res);
    //   // this.roleMenuId = res.data
    //   return res.data;
    // },
    // async getRoles() {
    //   const res = await getRoles({
    //     pageSize: this.pageSize,
    //     pageNo: this.pageNo
    //   })
    //   this.rolesList = res.rows
    //   this.total = res.total
    // },
    getRoles() {
      const params = { pageSize: this.pageSize, pageNo: this.pageNo }
      getRoles(params)
        .then(res => {
          this.rolesList = res.rows
          this.total = res.total
        })
        .catch(error => {
          console.error(error)
        })
    },
    changeSwitch(data) {
      const role = {
        id: data.id,
        status: data.status
      }
      updateRole(role)
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      getChild(this.userInfo.orgId).then(res => {
        this.options = res.data
      })
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        getRoleMenus(scope.row.id).then(res => {
          // console.log(res)
          this.$refs.tree.setCheckedKeys(res.data)
          // set checked state of a node not affects its father and child nodes
          this.checkStrictly = false
        })
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除此角色?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteRole([row.id])
            .then(res => {
              if (res.code === 200) {
                this.getRoles()
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
              } else {
                this.$message({
                  type: 'error',
                  dangerouslyUseHTMLString: true,
                  message: res.msg
                })
              }
            })
            .catch(err => {
              console.error(err)
            })
        })
        .catch(err => {
          console.error(err)
        })
    },
    confirmRole() {
      this.$refs.role.validate(async valid => {
        if (!valid) return
        // 成功了调用接口
        const isEdit = this.dialogType === 'edit'
        const checkedKeys = this.$refs.tree.getCheckedKeys()
        const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
        this.role.menuIds = checkedKeys.concat(halfCheckedKeys)
        if (this.role.orgId === '') {
          this.role.orgId = '0'
        }
        if (isEdit) {
          updateRole(this.role)
            .then(res => {
              if (res.code === 200) {
                this.getRoles()
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg
                })
              }
            })
            .catch(error => {
              console.log(error)
            })
        } else {
          addRole(this.role)
            .then(res => {
              if (res.code === 200) {
                this.getRoles()
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg
                })
              }
            })
            .catch(error => {
              console.log(error)
            })
        }
        this.dialogVisible = false
      })
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
