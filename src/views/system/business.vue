<template>
  <div class="app-container">
    <div class="app-filters box">
      <el-form :inline="true" class="serach-form-inline">
        <el-form-item label="名称">
          <el-input
            v-model.trim="queryForm.name"
            placeholder="机构名称"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <DictSelect
            :dict-type-code="dictTypeCode"
            :select-dict-code="queryForm.type"
            :null-opt-label="'全部'"
            @getSelectedCode="getSearchCode"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" @change="handleSearch">
            <el-option
              v-for="item in statusOpts"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="box" style="margin-top:30px;">
      <el-table :data="businessList" style="width: 100%;" border>
        <el-table-column label="机构ID" prop="id" />
        <el-table-column label="机构名称" prop="name" />
        <el-table-column label="联系人" prop="contacts" />
        <el-table-column label="联系电话" prop="contactPhone" />
        <el-table-column label="地址" prop="address" />
        <el-table-column label="机构类型" prop="typeName" />
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#00A854"
              active-text="启用"
              :active-value="true"
              inactive-color="#F04134"
              inactive-text="禁用"
              :inactive-value="false"
              @change="changeSwitch(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320">
          <template slot-scope="scope">
            <el-button type="success" :loading="isload[scope.$index]" size="small" @click="handleOrgSet(scope)">机构配置</el-button>
            <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        :total="queryForm.total"
        :page.sync="queryForm.pageNo"
        :limit.sync="queryForm.pageSize"
        @pagination="getBusinesss"
      />
    </div>

    <el-dialog :close-on-click-modal="false" :visible.sync="dialogVisible" :title="dialogType">
      <el-form
        ref="business"
        :model="business"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="机构名称" prop="name">
          <el-input
            v-model.trim="business.name"
            :disabled="dialogType === '机构配置' ? true :false"
            placeholder="机构名称"
          />
        </el-form-item>
        <el-form-item v-if="dialogType !== '机构配置'" label="联系人">
          <el-input v-model.trim="business.contacts" placeholder="联系人" />
        </el-form-item>
        <el-form-item v-if="dialogType !== '机构配置'" label="联系电话">
          <el-input v-model.trim="business.contactPhone" placeholder="联系电话" />
        </el-form-item>
        <el-form-item v-if="dialogType !== '机构配置'" label="地址">
          <el-input v-model.trim="business.address" placeholder="地址" />
        </el-form-item>
        <el-form-item v-if="dialogType !== '机构配置'" label="机构类型" prop="type">
          <DictSelect
            :dict-type-code="dictTypeCode"
            :select-dict-code="business.type"
            @getSelectedCode="getSelectedCode"
          />
        </el-form-item>
        <el-form-item v-if="dialogType !== '机构配置'" label="状态">
          <el-switch
            v-model="business.status"
            active-color="#00A854"
            active-text="启用"
            active-value="true"
            inactive-color="#F04134"
            inactive-text="禁用"
            inactive-value="false"
          />
        </el-form-item>
        <el-form-item v-if="dialogType === '机构配置'" label="集合名称：" prop="collectionName">
          <el-input v-model.trim="business.collectionName" size="medium" />
        </el-form-item>
        <el-form-item v-if="dialogType === '机构配置'" label="数据队列名称：" prop="dataQueue">
          <el-input v-model.trim="business.dataQueue" />
        </el-form-item>
        <el-form-item v-if="dialogType === '机构配置'" label="备注：">
          <el-input v-model.trim="business.remark" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmBusiness">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBusinesss,
  addBusiness,
  deleteBusiness,
  updateBusiness,
  getBusiness,
  getChild,
  orgBasicConfig,
  orgBasicConfigSave
} from '@/api/business'
import Pagination from '@/components/Pagination'
import DictSelect from '@/components/Dict/dictSelect'
// import DictName from '@/components/Dict/dictName'
// import { log } from 'util'

const defaultBusiness = {
  id: '',
  parentId: '',
  parentName: 0,
  name: '',
  contacts: '',
  contactPhone: '',
  address: '',
  type: '',
  status: 'true'
}

export default {
  name: 'Business',
  components: { Pagination, DictSelect },
  data() {
    return {
      isload: [],
      business: Object.assign({}, defaultBusiness),
      queryForm: {
        total: 0,
        pageNo: 1,
        pageSize: 20
      },
      statusOpts: [
        {
          value: '',
          label: '全部'
        },
        {
          value: true,
          label: '启用'
        },
        {
          value: false,
          label: '禁用'
        }
      ],
      businessList: [],
      dialogVisible: false,
      dialogType: 'new',
      parentName: '',
      dialogTreeVisible: false,
      rootNode: {
        id: '0',
        name: '平台'
      },
      checkedKeys: [],
      props: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      // dictTypeCode: 'ORGANIZATION_TYPE',
      dictTypeCode: 'ORGANIZATION_TYPE',
      rules: {
        name: { required: true, message: '请输入机构名称', trigger: 'blur' },
        type: { required: true, message: '请选择机构类型', trigger: 'change' },
        collectionName: {
          required: true,
          message: '请输入集合名称',
          trigger: 'blur'
        },
        dataQueue: {
          required: true,
          message: '请输入数据队列名称',
          trigger: 'blur'
        }
      }
    }
  },
  computed: {},
  created() {
    this.getBusinesss()
  },
  methods: {
    getSelectedCode(val) {
      this.business.type = val
    },
    getSearchCode(val) {
      this.queryForm.type = val
    },
    // 查询
    handleSearch() {
      this.queryForm.pageNo = 1
      this.getBusinesss()
    },
    async getBusinesss() {
      const res = await getBusinesss(this.queryForm)
      this.businessList = res.rows
      this.queryForm.total = res.total
      this.businessList.forEach(item => {
        this.isload.push(false)
      })
    },
    changeSwitch(data) {
      const business = {
        id: data.id,
        status: data.status
      }
      updateBusiness(business)
    },
    showTree() {
      this.dialogTreeVisible = true
    },
    handleClick(data, checked, node) {
      if (checked) {
        const arr = [data.id]
        this.$refs.tree.setCheckedKeys(arr)
      }
    },
    loadNode(node, resolve) {
      // 懒加载先保存当前选中的节点key, 展开后再设置一遍解决展开某选中节点后选中被取消的问题
      if (this.$refs.tree !== undefined && this.checkedKeys.length < 1) {
        this.checkedKeys = this.$refs.tree.getCheckedKeys()
      }
      if (node.level === 0) {
        return resolve([this.rootNode])
      } else {
        getChild(node.data.id).then(res => {
          const children = []
          res.data.forEach(e => {
            // 编辑的时候，树结构中剔除编辑数据本身
            if (e.id !== this.business.id) {
              children.push({ id: e.id, name: e.name })
            }
          })
          resolve(children)
          if (this.$refs.tree !== undefined) {
            this.$refs.tree.setCheckedKeys(this.checkedKeys)
          }
        })
      }
    },
    handleAdd() {
      this.business = JSON.parse(JSON.stringify(defaultBusiness))
      this.business.parentId = '0'
      this.dialogType = '新增机构'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      getBusiness(scope.row.id).then(res => {
        this.dialogType = '编辑机构'
        this.dialogVisible = true
        this.business = JSON.parse(JSON.stringify(res.data))
        this.checkedKeys.push(this.business.parentId)
      })
    },
    handleOrgSet(scope) {
      this.$set(this.isload, scope.$index, true)
      orgBasicConfig(scope.row.id).then(res => {
        this.$set(this.isload, scope.$index, false)
        this.dialogType = '机构配置'
        this.dialogVisible = true
        if (res.data) {
          this.business = res.data
          this.business.name = scope.row.name
        } else {
          this.business = {
            name: scope.row.name,
            orgId: scope.row.id,
            collectionName: '',
            dataQueue: '',
            remark: ''
          }
        }
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定删除此条数据?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBusiness([row.id]).then(res => {
            this.getBusinesss()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    async confirmBusiness() {
      this.$refs.business.validate(async valid => {
        if (!valid) return
        // 成功了调用接口
        var res = {}
        if (this.dialogType === '编辑机构') {
          res = await updateBusiness(this.business)
        } else if (this.dialogType === '新增机构') {
          res = await addBusiness(this.business)
        } else {
          res = await orgBasicConfigSave(this.business)
        }
        if (res.code === 200) {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
        } else {
          this.$message({
            type: 'error',
            dangerouslyUseHTMLString: true,
            message: res.data
          })
        }
        this.getBusinesss()
        this.dialogVisible = false
      })
    },
    async confirmParent() {
      this.dialogTreeVisible = false
      const checkNodes = this.$refs.tree.getCheckedNodes()
      if (checkNodes.length > 0) {
        this.business.parentId = checkNodes[0].id
        this.business.parentName = checkNodes[0].name
      } else {
        this.business.parentId = ''
        this.business.parentName = 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .businesss-table {
    margin-top: 30px;
  }
}
</style>
