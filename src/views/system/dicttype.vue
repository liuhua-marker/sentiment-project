<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAdd">新增</el-button>

    <el-table
      :data="dictTypeList"
      style="width: 100%;margin-top:30px;"
      border
      row-key="id"
      :expand-row-keys="expandKeys"
      @expand-change="toggleRowExpansion"
    >
      <el-table-column type="expand">
        <template>
          <el-table :data="dictList" border>
            <el-table-column label="字典ID" prop="id" />
            <el-table-column label="字典编码" prop="code" />
            <el-table-column label="字典名称" prop="name" />
            <el-table-column label="排序" prop="orderBy" />
            <el-table-column label="状态">
              <template slot-scope="scopeChild">
                <el-switch
                  v-model="scopeChild.row.status"
                  active-color="#00A854"
                  active-text="启用"
                  active-value="true"
                  inactive-color="#F04134"
                  inactive-text="禁用"
                  inactive-value="false"
                  @change="changeDictSwitch(scopeChild.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scopeChild">
                <el-button type="primary" size="small" @click="handleEditDict(scopeChild)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDeleteDict(scopeChild)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="类型">
        <template slot-scope="scope">{{ scope.row.typeClass === 1 ? '业务类型' : '系统类型' }}</template>
      </el-table-column>
      <el-table-column label="编码" prop="typeCode" />
      <el-table-column label="名称" prop="typeName" />
      <el-table-column label="描述" prop="typeDesc" />
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
      <el-table-column label="操作" width="320">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleAddDict(scope)">新增</el-button>
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :total="queryForm.total"
      :page.sync="queryForm.pageNo"
      :limit.sync="queryForm.pageSize"
      @pagination="getDictTypes"
    />

    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?'编辑字典类型 ':'新增字典类型 '"
    >
      <el-form :model="dictType" label-width="80px" label-position="left">
        <el-form-item label="类型">
          <el-select v-model="dictType.typeClass" placeholder="请选择">
            <el-option
              v-for="item in typeClassOpts"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model.trim="dictType.typeCode" placeholder="编码" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model.trim="dictType.typeName" placeholder="名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model.trim="dictType.typeDesc" placeholder="字典描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="dictType.status"
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
        <el-button type="primary" @click="confirmDictType">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="dialogDictVisible"
      :title="dialogDictType==='edit'?'编辑字典 ':'新增字典 '"
    >
      <el-form :model="dict" label-width="80px" label-position="left">
        <el-form-item label="编码">
          <el-input v-model.trim="dict.code" placeholder="编码" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model.trim="dict.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dict.orderBy" placeholder="排序，数值越大越靠前" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="dict.status"
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
        <el-button type="danger" @click="dialogDictVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmDict">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDictTypes,
  addDictType,
  deleteDictType,
  updateDictType,
  getDictType,
  getDicts,
  addDict,
  updateDict,
  deleteDict
} from '@/api/dicttype'
import { deepClone } from '@/utils'
import Pagination from '@/components/Pagination'

const defaultDictType = {
  id: '',
  typeClass: '',
  typeCode: '',
  typeName: '',
  typeDesc: '',
  status: 'true'
}
const defaultDict = {
  id: '',
  typeCode: '',
  code: '',
  name: '',
  orderBy: '',
  status: 'true'
}

export default {
  name: 'Dict',
  components: { Pagination },
  data() {
    return {
      dictType: Object.assign({}, defaultDictType),
      dict: Object.assign({}, defaultDict),
      queryForm: {
        total: 0,
        pageNo: 1,
        pageSize: 20
      },
      typeClassOpts: [
        {
          value: 1,
          label: '业务类型'
        },
        {
          value: 2,
          label: '系统类型'
        }
      ],
      dictTypeList: [],
      dictList: [],
      dialogVisible: false,
      dialogType: 'new',
      dialogDictVisible: false,

      dialogDictType: 'new',
      showTable: false,
      expandKeys: [] /** 新增 **/
    }
  },
  computed: {},
  created() {
    this.getDictTypes()
  },
  methods: {
    getDictTypes() {
      // 自动执行分页查询
      const _this = this
      const params = { pageSize: this.pageSize, pageNo: this.pageNo }

      getDictTypes(params).then(function(response) {
        _this.dictTypeList = response.rows
        _this.queryForm.total = response.total
      })
    },
    getDictsWin(typeCode) {
      const self = this
      getDicts(typeCode).then(function(res) {
        const resData = res.data
        resData.forEach((e, i) => {
          // 创建需要滑动的多个变量
          self.$set(self.dictList, i, resData[i])
        })
      })
    },
    toggleRowExpansion(row, expanded) {
      this.dictList = []
      this.expandKeys = [row.id] // 展开行
      this.getDictsWin(row.typeCode)
    },
    async confirmDict() {
      // 新增
      const isEdit = this.dialogDictType === 'edit'
      if (isEdit) {
        await updateDict(this.dict)
      } else {
        await addDict(this.dict)
      }
      this.getDictsWin(this.dict.typeCode)

      this.dialogDictVisible = false
    },
    async confirmDictType() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateDictType(this.dictType)
      } else {
        await addDictType(this.dictType)
      }
      this.getDictTypes()
      this.dialogVisible = false
    },
    handleAddDict(scope) {
      this.dict = Object.assign({}, defaultDict)
      this.dict.typeCode = scope.row.typeCode
      this.dialogDictType = 'new'
      this.dialogDictVisible = true
    },
    handleEditDict(scope) {
      this.dict = deepClone(scope.row)
      this.dialogDictType = 'edit'
      this.dialogDictVisible = true
    },
    handleDeleteDict({ $index, row }) {
      this.$confirm('确定删除此条数据?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: '提示'
      })
        .then(() => {
          const parentId = { id: this.expandKeys[0], typeCode: row.typeCode }
          deleteDict([row.id]).then(res => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
          this.toggleRowExpansion(parentId)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    changeDictSwitch(data) {
      const dict = {
        id: data.id,
        status: data.status
      }
      updateDict(dict)
    },
    changeSwitch(data) {
      const dictType = {
        id: data.id,
        status: data.status
      }
      updateDictType(dictType)
    },
    handleAdd() {
      this.dictType = Object.assign({}, defaultDictType)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      getDictType(scope.row.id).then(res => {
        this.dialogType = 'edit'
        this.dialogVisible = true
        this.dictType = res.data
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除此条数据?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteDictType([row.id]).then(res => {
            this.getDictTypes()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
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
  background: #fff;
  .dictTypes-table {
    margin-top: 30px;
  }
}
</style>
