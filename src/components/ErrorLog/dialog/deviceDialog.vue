<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :before-close="handleCancle"
    width="800px"
  >
    <div style="padding-bottom: 10px">
      <el-button type="primary" @click="changeType">{{isAdd?'返回已添加列表':'添加设备'}}</el-button>
    </div>
    <listFilters ref="listFilter" v-if="isAdd" :options="filterOption" @change="search"></listFilters>
    <listTable ref="listTable" :options="listOption" @command="listCommand"/>
    <div style="text-align:right;">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import listFilters from '@/components/filter/listFilters'
import listTable from '@/components/table/listTable'

import { selectAllDevices } from '@/api/deviceView'
import { selectTemplateDevices, addTemplateDevices, deleteDeviceById } from '@/api/deviceTemplate'
import dateFormat from '@/assets/Date'

export default {
  name: 'FormDialog',
  props: ['title', 'formOption'],
  components: { listFilters, listTable },
  data() {
    return {
      formData: {},
      dialogVisible: false,
      formOptionList: [],
      dialogTitle: '',
      isAdd: false,
      ctId: '',
      filterOption: [
        {
          componentsName: 'el-input',
          label: '设备名称',
          paramsName: 'name'
          // defaultValue:""
        }, {
          componentsName: 'el-select',
          label: '设备类型',
          paramsName: 'type',
          options: [{ label: '全部', value: '' }, { label: '理疗设备', value: '02' }]
          // dict_meterial_type: getDictByTypeCode,
          // params: 'dict_meterial_type',
          // formatter: { label: 'name', value: 'code' }
          // defaultValue:""
        }
      ],
      listOption: {
        // 列表api
        listApi: {
          serviceFN: selectTemplateDevices,
          params: {}
        },
        // 表头设置
        // multipleTable: true,
        index: {
          // 序号配置项
          num: false,
          width: 60
        },
        header: [
          {
            label: '设备名称',
            propName: 'name',
            align: 'center'
          },
          {
            label: '加入时间',
            propName: 'createTime',
            align: 'center',
            showHeader: () => {
              return !this.isAdd
            },
            formatter: row => {
              if (!row) {
                return '--'
              }
              const date = new Date(row)
              return dateFormat.formatDate(date, 'yyyy-MM-dd hh:mm:ss')
            }
            // commandName: 'handleView'
          },
          {
            label: '设备类型',
            propName: 'type',
            align: 'center',
            formatter: (type) => {
              return type === '01' ? '检测设备' : '理疗设备'
            },
            showHeader: () => {
              return this.isAdd
            }
            // commandName: 'handleView'
          },
          {
            label: '支持个性化',
            propName: 'personalize',
            align: 'center',
            formatter: (type) => {
              return type === 1 ? '是' : '否'
            },
            showHeader: () => {
              return this.isAdd
            }
          },
          {
            label: '支持个性化',
            propName: 'status',
            align: 'center',
            formatter: (type) => {
              return type === 1 ? '是' : '否'
            },
            showHeader: () => {
              return !this.isAdd
            }
          },
          {
            label: '操作',
            // width: '200',
            btns: [
              {
                label: '加入',
                commandName: 'handleAdd',
                type: 'primary',
                show: () => {
                  return this.isAdd
                }
              },
              {
                label: '删除',
                commandName: 'handleDelete',
                type: 'danger',
                show: () => {
                  return !this.isAdd
                }
              }
            ],
            btnGroups: false,
            align: 'center'
          }
        ]
      }
    }
  },
  mounted() {
    this.dialogTitle = this.title
  },
  methods: {
    search(params) {
      this.listTable(params)
    },
    async handleAdd(row) {
      const data = {
        ctId: this.ctId,
        deviceId: row.id,
        deviceType: row.type,
        name: row.name,
        status: row.personalize
      }
      const res = await addTemplateDevices(data)
      if (res.code === 200) {
        this.$message({
          type: 'success',
          message: '添加成功'
        })
        // this.listTable()
        // this.$refs.formDialog.close()
      } else {
        this.$message({
          type: 'error',
          message: res.msg
        })
      }
    },
    changeType() {
      this.isAdd = !this.isAdd
      this.listOption.listApi.serviceFN = this.isAdd ? selectAllDevices : selectTemplateDevices
      const params = {
        ctId: this.ctId
      }
      this.listTable(params)
    },
    listCommand(command, row, index) {
      if (command && this[command]) {
        this[command](row, index)
      }
    },
    handleDelete(row) {
      this.$confirm('确定删除此条数据?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const res = await deleteDeviceById([row.id])
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.listTable({ ctId: this.ctId })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    listTable(params) {
      this.$refs.listTable.initPage().search(params || {})
    },
    confirm() {
      // 验证表单

    },
    close() {
      this.initFrom()
      this.dialogVisible = false
    },
    initData(data) {
      if (!data) {
        return
      }
      this.ctId = data
      setTimeout(() => {
        this.listTable({ ctId: data })
      }, 200)
    },
    initFrom() {
      this.isAdd = false
    },
    open() {
      this.dialogVisible = true
      return this
    },
    handleCancle() {
      this.$emit('cancle')
      this.close()
    }
  }
}
</script>

<style scoped></style>
