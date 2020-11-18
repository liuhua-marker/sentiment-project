<template>
  <div class="app-container box">
    <el-button type="primary" @click="handleAddMenu">新增</el-button>
    <div style="margin-top:30px;">
      <el-table :data="menuList" row-key="id" style="width: 100%;" border>
        <el-table-column label="菜单ID" width="225" prop="id" />
        <el-table-column label="菜单名称" width="180" prop="menuName" />
        <el-table-column label="菜单编码" prop="menuCode" />
        <el-table-column label="菜单模块" prop="menuModule" />
        <el-table-column label="菜单地址" prop="menuUrl" />
        <el-table-column label="菜单类型" width="100">
          <template slot-scope="scope">{{ menuCategorys[scope.row.menuCategory] }}</template>
        </el-table-column>
        <el-table-column label="菜单排序" prop="orderBy" width="100"/>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.menuStatus"
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
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.menuCategory != 'button'"
              type="primary"
              size="small"
              @click="handleAddChild(scope)"
            >增加下级</el-button>
            <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?'编辑菜单':'新增菜单'"
    >
      <el-form :model="menu" label-width="80px" label-position="left">
        <el-form-item label="父级">
          <el-select v-model="menu.parentId">
            <el-option :key="menu.parentId" :label="menu.parentName" :value="menu.parentId" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model.trim="menu.name" placeholder="菜单名称" />
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model.trim="menu.module" placeholder="菜单模块" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model.trim="menu.code" placeholder="菜单编码" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model.trim="menu.url" placeholder="菜单地址" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="menu.category" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="menu.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="菜单描述"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="menu.orderBy" placeholder="菜单排序，数值越小越靠前" />
        </el-form-item>
        <el-form-item label="菜单Icon">
          <el-input v-model.trim="menu.icon" placeholder="菜单Icon" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="menu.status"
            active-color="#00A854"
            active-text="启用"
            active-value="true"
            inactive-color="#F04134"
            inactive-text="禁用"
            inactive-value="false"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmMenu">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  queryAllMenu,
  addMenu,
  getMenu,
  deleteMenu,
  updateMenu
} from '@/api/menu'

const defaultMenu = {
  id: '',
  parentId: 0,
  parentName: '根目录',
  name: '',
  remark: '',
  orderBy: '',
  status: 'true'
}

export default {
  name: 'Menu',
  data() {
    return {
      path: this.$router.path,
      menu: Object.assign({}, defaultMenu),
      menuList: [],
      dialogVisible: false,
      dialogType: 'new',
      menuCategorys: {
        directory: '目录',
        menu: '菜单',
        button: '按钮'
      },
      options: [
        {
          value: 'directory',
          label: '目录'
        },
        {
          value: 'menu',
          label: '菜单'
        },
        {
          value: 'button',
          label: '按钮'
        }
      ]
    }
  },
  created() {
    this.queryAllMenu()
  },
  methods: {
    async queryAllMenu() {
      const res = await queryAllMenu()
      this.menuList = res.data
    },
    changeSwitch(data) {
      const menu = {
        id: data.id,
        status: data.menuStatus
      }
      updateMenu(menu)
    },
    handleAddMenu() {
      this.menu = Object.assign({}, defaultMenu)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAddChild(scope) {
      this.menu = Object.assign({}, defaultMenu)
      this.menu.parentId = scope.row.id
      this.menu.parentName = scope.row.menuName
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      getMenu(scope.row.id).then(res => {
        this.dialogType = 'edit'
        this.dialogVisible = true
        this.menu = res.data
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除此菜单?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteMenu([row.id])
          this.queryAllMenu()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    async confirmMenu() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateMenu(this.menu)
      } else {
        await addMenu(this.menu)
      }
      this.queryAllMenu()
      this.dialogVisible = false
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
