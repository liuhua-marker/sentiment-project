<template>
  <div class="app-container">
    <div class="app-filters box">
      <el-form :inline="true" class="serach-form-inline">
        <el-form-item label="用户名">
          <el-input
            v-model.trim="queryForm.username"
            placeholder="用户名"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model.trim="queryForm.name"
            placeholder="姓名"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="box" style="margin-top: 10px">
      <el-row>
        <el-col :span="4">
          <h3>组织机构</h3>
          <el-tree
            ref="queryTree"
            :props="props"
            :load="loadNode"
            node-key="id"
            :expand-on-click-node="false"
            :default-expanded-keys="expandedKey"
            :default-checked-keys="checkedKey"
            check-strictly
            lazy
            show-checkbox
            @check="handleUserClick"
          />
        </el-col>
        <el-col :span="20" style="padding: 8px">
          <el-table :data="userList" style="margin-top:22px;" border>
            <el-table-column label="用户ID" width="225" prop="id" />
            <el-table-column label="用户名" width="180" prop="username" />
            <el-table-column label="姓名" prop="name" />
            <el-table-column label="昵称" prop="nickname" />
            <el-table-column label="邮箱" prop="email" />
            <el-table-column label="性别">
              <template slot-scope="scope">{{ sexs[scope.row.sex] }}</template>
            </el-table-column>
            <el-table-column label="手机号码" prop="telephone" />
            <el-table-column label="状态">
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
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
                <el-button
                  v-if="scope.row.id !== userInfo.id"
                  type="danger"
                  size="small"
                  @click="handleDelete(scope)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <pagination
        :total="queryForm.total"
        :page.sync="queryForm.pageNo"
        :limit.sync="queryForm.pageSize"
        @pagination="getUsers"
      />
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?'编辑用户':'新增用户'"
      :before-close="clearDialog"
    >
      <el-row>
        <el-col :span="7">
          <h3>组织机构</h3>
          <el-tree
            ref="tree"
            :props="props"
            :load="loadDetailNode"
            node-key="id"
            :expand-on-click-node="false"
            :default-expanded-keys="expandedKeys"
            :default-checked-keys="checkedKeys"
            check-strictly
            lazy
            show-checkbox
            @check="handleClick"
          />
        </el-col>
        <el-col :span="17" class="addUser">
          <el-form
            ref="user"
            :model="user"
            :rules="Rules"
            :inline="true"
            label-width="80px"
            label-position="left"
          >
            <el-tabs v-model="activeName" type="border-card">
              <el-tab-pane label="基础信息" name="基础信息">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model.trim="user.username" :disabled="nameEnabled" placeholder="用户名" />
                </el-form-item>
                <el-form-item v-if="dialogType==='new'" label="密码" prop="password">
                  <el-input v-model.trim="user.password" show-password placeholder="填写密码" />
                </el-form-item>
                <el-form-item v-if="dialogType==='edit'" label="密码">
                  <el-input v-model.trim="user.password" show-password placeholder="填写密码则更新密码" />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                  <el-input v-model.trim="user.name" placeholder="姓名" />
                </el-form-item>
                <el-form-item label="昵称">
                  <el-input v-model.trim="user.nickname" placeholder="昵称" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model.trim="user.email" placeholder="邮箱" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio v-model="user.sex" :label="1">男</el-radio>
                  <el-radio v-model="user.sex" :label="2">女</el-radio>
                </el-form-item>
                <el-form-item label="手机号码">
                  <el-input v-model.trim="user.telephone" placeholder="手机号码" />
                </el-form-item>
                <el-form-item label="省份">
                  <el-input v-model.trim="user.province" placeholder="省份" />
                </el-form-item>
                <el-form-item label="城市">
                  <el-input v-model.trim="user.city" placeholder="城市" />
                </el-form-item>
                <el-form-item label="职位">
                  <el-input v-model.trim="user.position" placeholder="职位" />
                </el-form-item>
                <el-form-item label="类型">
                  <DictSelect
                    :dict-type-code="dictTypeCode"
                    :select-dict-code="user.type"
                    @getSelectedCode="getSelectedCode"
                  />
                </el-form-item>
                <el-form-item label="状态">
                  <el-switch
                    v-model="user.status"
                    active-color="#00A854"
                    active-text="启用"
                    active-value="true"
                    inactive-color="#F04134"
                    inactive-text="禁用"
                    inactive-value="false"
                  />
                </el-form-item>
                <el-form-item label="管理员">
                  <el-switch
                    v-model="user.isAdmin"
                    active-color="#00A854"
                    active-text="是"
                    active-value="true"
                    inactive-color="#F04134"
                    inactive-text="否"
                    inactive-value="false"
                    @change="handleIsAdmin(user.isAdmin)"
                  />
                </el-form-item>
                <el-form-item v-if="user.id !== userInfo.id" label="部门" prop="deptId">
                  <el-radio-group v-if="depts.length > 0" v-model="user.deptId">
                    <div v-for="dept in depts" :key="dept.id">
                      <el-radio :label="dept.id" style="margin-bottom: 10px;">{{ dept.deptName }}</el-radio>
                    </div>
                  </el-radio-group>
                  <span v-if="depts.length <= 0">暂无数据</span>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane v-if="user.id !== userInfo.id" label="角色信息" name="角色信息">
                <el-form-item label="角色信息：" prop="roles" label-width="200">
                  <el-radio-group v-model="user.roles" style="min-width: 100px">
                    <el-radio
                      v-for="role in roles"
                      :key="role.id"
                      :label="role.id"
                      style="margin-bottom: 10px;"
                    >{{ role.name }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer" style="text-align:center">
        <el-button type="danger" @click="clearDialog">取消</el-button>
        <el-button type="primary" @click="confirmUser">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  updateStatus,
  getUser
} from '@/api/user'
import { queryAllDept } from '@/api/dept'
import { getRoles } from '@/api/role'
import Pagination from '@/components/Pagination'
import { getChild } from '@/api/business'
import DictSelect from '@/components/Dict/dictSelect'
import { mapGetters } from 'vuex'

const defaultUser = {
  id: '',
  username: '',
  password: '',
  name: '',
  nickname: '',
  email: '',
  sex: '',
  telephone: '',
  province: '',
  city: '',
  position: '',
  deptId: '0',
  type: '',
  status: 'true',
  roles: [],
  isAdmin: 'false',
  orgId: 0
}

export default {
  name: 'User',
  components: { Pagination, DictSelect },
  data() {
    return {
      activeName: '基础信息',
      user: Object.assign({}, defaultUser),
      queryForm: {
        total: 0,
        pageNo: 1,
        pageSize: 20,
        orgIds: []
      },
      roles: [],
      userList: [],
      sexs: {
        '0': '未知',
        '1': '男',
        '2': '女'
      },
      dialogVisible: false,
      dialogType: 'new',
      nameEnabled: false,
      checkStrictly: false,
      rootNode: {
        id: '0',
        name: '平台'
      },
      expandedKeys: ['0'],
      checkedKeys: [],
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      deptProps: {
        label: 'deptName',
        children: 'children'
      },
      depts: [],
      dictTypeCode: 'USER_TYPE',
      userInfo: {},
      expandedKey: [],
      checkedKey: [],
      Rules: {
        username: { required: true, message: '请输入用户名', trigger: 'blur' },
        name: { required: true, message: '请输入姓名', trigger: 'blur' },
        password: { required: true, message: '请输入密码', trigger: 'blur' },
        roles: { required: true, message: '请选择角色信息', trigger: 'change' },
        deptId: { required: true, message: '请选择部门', trigger: 'blur' }
      }
    }
  },
  computed: {
    ...mapGetters(['bId'])
  },
  created() {
    this.userInfo = this.$store.getters.userInfo
    this.rootNode.id = this.userInfo.orgId
    this.queryForm.orgIds = [this.rootNode.id]
    this.rootNode.name = this.userInfo.orgName
    this.getUsers()
    this.queryAllDept(this.userInfo.orgId)
    this.expandedKey = [this.rootNode.id]
    this.checkedKey = [this.rootNode.id]
    if (this.userInfo.orgId === '0') {
      this.rootNode.name = '平台'
    }
  },
  methods: {
    handleSearch() {
      this.queryForm.pageNo = 1
      this.getUsers()
    },
    async queryAllDept(bId) {
      const res = await queryAllDept(bId)
      this.depts = res.data
    },
    async getUsers() {
      if (this.$refs.queryTree) {
        this.queryForm.orgIds = this.$refs.queryTree.getCheckedKeys()
      }
      const res = await getUsers(this.queryForm)
      this.userList = res.rows
      this.queryForm.total = res.total
    },
    async getRoles(id) {
      this.roles = []
      const data = { orgId: id }
      const res = await getRoles(data)
      if (res.code === 200) {
        this.roles = res.rows
      }
    },
    getSelectedCode(val) {
      this.user.type = val
    },
    changeSwitch(data) {
      const user = {
        id: data.id,
        status: data.status
      }
      updateStatus(user)
    },
    handleIsAdmin(isAdmin) {
      this.$set(this.user, 'deptId', '0')
      if (isAdmin === 'true') {
        this.Rules.deptId.required = false
      } else {
        this.Rules.deptId.required = true
      }
    },
    loadNode(node, resolve) {
      // 懒加载先保存当前选中的节点key, 展开后再设置一遍解决展开某选中节点后选中被取消的问题
      // if (this.$refs.tree !== undefined && this.checkedKeys.length < 1) this.checkedKeys = this.$refs.tree.getCheckedKeys()
      if (node.level === 0) {
        return resolve([this.rootNode])
      } else {
        getChild(node.data.id).then((res) => {
          resolve(res.data)
          // if (this.$refs.tree !== undefined) this.$refs.tree.setCheckedKeys(this.checkedKeys)
        })
      }
    },
    loadDetailNode(node, resolve) {
      // 懒加载先保存当前选中的节点key, 展开后再设置一遍解决展开某选中节点后选中被取消的问题
      // if (this.$refs.tree !== undefined && this.checkedKeys.length < 1) {
      //   this.checkedKeys = this.$refs.tree.getCheckedKeys()
      // }
      if (node.level === 0) {
        return resolve([this.rootNode])
      } else {
        getChild(node.data.id).then((res) => {
          resolve(res.data)
          if (this.$refs.tree !== undefined) {
            this.$refs.tree.setCheckedKeys(this.checkedKeys)
          }
        })
      }
    },
    handleClick(data, checked, node) {
      this.user.roles = ''
      this.user.isAdmin = false
      const arr = [data.id]
      this.$refs.tree.setCheckedKeys(arr)
      this.user.orgId = data.id
      this.queryAllDept(data.id)
      this.getRoles(data.id)
      if (data.id !== '0') {
        this.Rules.deptId.required = true
      } else {
        this.Rules.deptId.required = false
      }
    },
    handleUserClick(data, checked) {
      const arr = [data.id]
      this.$refs.queryTree.setCheckedKeys(arr)
      this.getUsers()
    },
    handleAdd() {
      this.user = Object.assign({}, defaultUser)
      this.activeName = '基础信息'
      this.dialogType = 'new'
      this.dialogVisible = true
      this.nameEnabled = false
      this.expandedKeys = [this.rootNode.id]
      this.checkedKeys = [this.rootNode.id]
      const id = '0'
      this.getRoles(id)
      if (this.$refs.tree !== undefined) {
        this.$refs.tree.setCheckedKeys(this.checkedKeys)
      }
      if (this.user.isAdmin === 'true') {
        this.Rules.deptId.required = false
      } else {
        this.Rules.deptId.required = true
      }
    },
    handleEdit(scope) {
      const orgId = scope.row.orgId
      this.activeName = '基础信息'
      this.queryAllDept(orgId)
      this.getRoles(orgId)
      getUser(scope.row.id).then((res) => {
        this.dialogType = 'edit'
        this.dialogVisible = true
        this.nameEnabled = true
        this.user = res.data
        this.checkedKeys = [this.user.orgId]
        if (this.$refs.tree !== undefined) {
          this.$refs.tree.setCheckedKeys(this.checkedKeys)
        }
        this.user.roles = this.user.roles[0]
        if (this.user.isAdmin === 'true') {
          this.Rules.deptId.required = false
        } else {
          this.Rules.deptId.required = true
        }
      })
    },
    clearDialog() {
      this.dialogVisible = false
      this.user = Object.assign({}, defaultUser)
      this.depts = []
      this.$refs.user.clearValidate()
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除此用户?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteUser([row.id]).then((res) => {
            this.getUsers()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        })
        .catch((err) => {
          console.error(err)
        })
    },
    async confirmUser() {
      this.$refs.user.validate(async(valid, obj) => {
        if (!valid) {
          for (var item in obj) {
            this.$message({
              message: obj[item][0].message,
              type: 'error'
            })
            return
          }
        }
        // 成功了调用接口
        this.user.roles = [this.user.roles]
        const isEdit = this.dialogType === 'edit'
        if (isEdit) {
          await updateUser(this.user)
        } else {
          await addUser(this.user)
        }
        this.dialogVisible = false
        this.getUsers()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .users-table {
    margin-top: 30px;
  }
  .el-form-item {
    margin-top: 22px;
  }
  .el-tree {
    width: 99%;
  }
  .addUser {
    .el-input,
    .el-switch {
      width: 200px;
    }
  }
}
</style>
