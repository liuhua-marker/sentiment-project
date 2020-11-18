<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :before-close="handleCancle"
    :close-on-click-modal="false"
    width="1000px"
  >
    <el-steps :active="active" align-center finish-status="success">
      <el-step title="机构基本信息" description="设置机构基本信息关系"></el-step>
      <el-step title="结算关系设置" description="设置信息及结算层次关系维护"></el-step>
      <el-step title="分销设置" description="分销关系层次设置"></el-step>
    </el-steps>
    <base-form v-show="active === 0" ref="baseMessage" :formOption="formOption"></base-form>
    <base-form v-if="active === 1" ref="settlement" :formOption="secendFrom"></base-form>
    <template v-if="active === 2">
      <addListTable v-if="formData.businessEntity.type ==='市场拓展中心'||formData.businessEntity.type ==='运营服务中心'
||formData.businessEntity.type ==='运营顾问'||formData.businessEntity.type ==='市场代理商'" :options="optionsTop"
                    :tableData="tableDataTop"></addListTable>
      <addListTable :options="options" :tableData="tableData"
                    @changeInput="(data)=>{this.tableData=data}"></addListTable>
      <div style="text-align: center">
        <el-button type="primary" @click="submit">提交完毕</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import baseForm from '@/components/form'
import addListTable from '@/components/table/addListTable'
import { findAll } from '@/api/fundscheme'
import {
  queryAllByType,
  selectDetails,
  getOperationService,
  getAllAgency,
  getUserByBusinessId
} from '@/api/institutionalConfig'

export default {
  name: 'FormDialog',
  props: ['title'],
  components: { baseForm, addListTable },
  data() {
    return {
      optionsTop: {},
      tableDataTop: [],
      formData: {},
      dialogVisible: false,
      formOptionList: [],
      dialogTitle: '',
      isEdit: false,
      active: 0,
      formOption: {
        labelWidth: '100px',
        formList: [
          {
            label: '机构名称',
            commandName: 'name',
            componentsName: 'el-input',
            type: 'text',
            rules: [{ required: true, message: '请输入机构名称', trigger: 'blur' }]
          },
          {
            label: '机构类型',
            commandName: 'type',
            componentsName: 'el-select',
            options: [
              {
                label: '市场代理商',
                value: '市场代理商'
              },
              {
                label: '运营部',
                value: '运营部'
              },
              {
                label: '市场部',
                value: '市场部'
              },
              {
                label: '市场拓展中心',
                value: '市场拓展中心'
              },
              {
                label: '运营服务中心',
                value: '运营服务中心'
              },
              {
                label: '管理门店',
                value: '管理门店'
              },
              {
                label: '运营门店',
                value: '运营门店'
              },
              {
                label: '运营顾问',
                value: '运营顾问'
              }],
            rules: [{ required: true, message: '请选择机构类型', trigger: 'change' }]
          },
          {
            label: '负责人',
            commandName: 'contacts',
            componentsName: 'el-input',
            type: 'text',
            // placeholder: '请输入连锁模板名称',
            rules: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
          },
          {
            label: '联系方式',
            commandName: 'contactPhone',
            componentsName: 'number',
            maxlength:11,
            minlength:11,
            showWordLimit:true,
            rules: [
              { required: true, message: '请输入联系方式', trigger: 'blur' },
              { min: 11, max: 11, message: '手机号码必须为11位' }
            ]
          },
          {
            label: '所在地',
            commandName: 'region',
            componentsName: 'cascader',
            type: 'city'
            // de:['北京市', '北京城区', '东城区']
            // rules: [{ required: true, message: '请输入完整', trigger: 'blur' }]
          },
          {
            label: '详细地址',
            commandName: 'address',
            componentsName: 'el-input',
            type: 'text'
            // rules: [{ required: true, message: '请输入完整', trigger: 'blur' }]
          },
          {
            label: '签约日期',
            commandName: 'createdTime',
            componentsName: 'el-date-picker',
            type: 'date',
            valueFormat: ''
            // rules: [{ required: true, message: '请输入完整', trigger: 'blur' }]
          },
          {
            label: '',
            // commandName: 'bottom',
            componentsName: 'el-button',
            type: 'primary',
            labelText: '下一步',
            isSubmit: true,
            handClick: (formData) => {
              // console.log(formData.type)

              this.formData.businessEntity = formData
              this.formatData(formData.type)
            }
            // valueFormat: 'yyyy-mm-dd'
            // rules: [{ required: true, message: '请输入完整', trigger: 'blur' }]
          }
        ]
      },
      secendFrom: { labelWidth: '140px', formList: [] },
      topForm: [],
      globalArr: [
        {
          label: '结算信息',
          commandName: 'bankName'
        },
        {
          label: '结算银行',
          commandName: 'bankName',
          componentsName: 'el-input',
          type: 'text'
          // placeholder: '请输入连锁模板名称',
          // rules: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
        },
        {
          label: '开户支行',
          commandName: 'bankBrachName',
          componentsName: 'el-input',
          type: 'text'
          // rules: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
        },
        {
          label: '开户名',
          commandName: 'acountName',
          componentsName: 'el-input',
          type: 'text'
        },
        {
          label: '账号',
          commandName: 'acountNum',
          componentsName: 'number',
          minlength:16,
          maxlength:19,
          showWordLimit:true,
          rules: [
            { required: true, message: '请输入银行卡账号', trigger: 'blur' },
            { min: 16, max: 19, message: '银行卡账号必须为16位-19位' }
          ]
          // rules: [{ type: 'number', message: '账号必须为数字值' }]
        },
        {
          label: '',
          // commandName: 'bottom',
          componentsName: 'el-button',
          type: 'primary',
          labelText: '下一步',
          isSubmit: true,
          handClick: (formData) => {
            console.log(formData)
            this.formData.accountMessageEntity = formData
            this.formData.businessEntity.parentId = formData.parentId
            this.formData.businessEntity.procurementChannel = this.formData.accountMessageEntity.procurementChannel
            // console.log(this.formData.businessEntity.type)
            debugger
            const type = this.formData.businessEntity.type
            if (type === '市场部' || type === '运营部') {
              this.findAll(type)
            } else if (type === '市场拓展中心' || type === '运营服务中心' || type === '运营顾问' || type === '市场代理商') {
              this.getTableData(formData)
            } else if (type === '管理门店' || type === '运营门店') {
              this.setData(formData)
            }
          }
          // valueFormat: 'yyyy-mm-dd'
          // rules: [{ required: true, message: '请输入完整', trigger: 'blur' }]
        }],
      options: {
        header: [{
          label: '方案',
          propName: 'distributionProject'
        }, {
          label: '运营部费用',
          propName: '运营部费用',
          isInput: true
        }, {
          label: '运营中心指导费用',
          propName: '运营中心指导费用',
          isInput: true
        }
        ],
        isAddList: true
        // addTemplate: {
        //   'distributionProject': '',
        //   '运营部费用': '',
        //   '运营中心指导费用': ''
        // }
      },
      tableData: []
    }
  },
  mounted() {
    this.dialogTitle = this.title
    this.formOptionList = this.formOption.formList
  },
  methods: {
    formatData(type) {
      if (type === '运营部' || type === '市场部') {
        this.topForm = [{
          label: '上级归属机构',
          commandName: 'parentId',
          componentsName: 'el-select',
          defaultValue: '0',
          options: [{
            label: '公司直属',
            value: '0'
          }
          ],
          disabled: true,
          rules: [{ required: true, message: '请输入机构名称', trigger: 'blur' }]
        }]
      } else if (type === '市场代理商' || type === '运营顾问') {
        this.topForm = [{
          label: type === '市场代理商' ? '归属市场拓展中心' : '归属运营服务中心',
          commandName: 'parentId',
          componentsName: 'baseSelect',
          multiple: true,
          serviceObject: {
            service: queryAllByType,
            params: { type: type === '市场代理商' ? '市场拓展中心' : '运营服务中心' },
            formatter: { label: 'name', value: 'id' }
          },
          disabled: true,
          rules: [{ required: true, message: '请选择', trigger: 'blur' }]
        }]
      } else if (type === '市场拓展中心' || type === '运营服务中心') {
        this.topForm = [
          {
            label: type === '市场拓展中心' ? '归属市场中心部' : '归属运营中心部',
            commandName: 'parentId',
            componentsName: 'baseSelect',
            multiple: true,
            serviceObject: {
              service: queryAllByType,
              params: { type: type === '市场拓展中心' ? '市场部' : '运营部' },
              formatter: { label: 'name', value: 'id' }
            },
            change: (val, data) => {
              selectDetails(val).then(res => {
                const fundDistributionEntities = res.data.fundDistributionEntities
                var optionsSC = []
                var optionsYY = []
                var obj = {}
                fundDistributionEntities.forEach(item => {
                  if (!obj[item.distributionProject]) {
                    if (item.distributionType === 'jm') {
                      optionsSC.push({
                        label: item.distributionProject,
                        value: item.distributionProject,
                        type: item.distributionType
                      })
                    } else if (item.distributionType === 'yz') {
                      optionsYY.push({
                        label: item.distributionProject,
                        value: item.distributionProject,
                        type: item.distributionType
                      })
                    }

                    obj[item.distributionProject] = true
                  }
                })
                this.topForm[2].options = optionsSC
                this.topForm[3].options = optionsYY
              })
            },
            rules: [{ required: true, message: '请选择归属市场中心部', trigger: 'blur' }]
          },
          {
            componentsName: 'el-input',
            label: '拓展中心指导',
            commandName: 'name'
            // defaultValue:""
          },
          {
            label: '配置加盟方案',
            commandName: 'jm',
            componentsName: 'el-select',
            multiple: true,
            options: [],
            rules: [{ required: true, message: '请选择加盟方案', trigger: 'blur' }]
          }, {
            label: '配置月租方案',
            commandName: 'yz',
            componentsName: 'el-select',
            multiple: true,
            options: []
            // rules: [{ required: true, message: '请选择月租方案', trigger: 'blur' }]
          }, {
            label: '采购渠道',
            commandName: 'procurementChannel',
            componentsName: 'el-select',
            options: [{ label: '在线订购', value: 1 }, { label: '分级发货', value: 2 }],
            rules: [{ required: true, message: '请选择采购渠道', trigger: 'blur' }]
          }
        ]
        if (this.isEdit) {
          var flagObj = {}
          var jm = []
          var yz = []
          this.formData.fundDistributionEntities.forEach(item => {
            if (!flagObj[item.distributionProject]) {
              if (item.distributionType === 'jm') {
                jm.push(item.distributionProject)
              } else if (item.distributionType === 'yz') {
                yz.push(item.distributionProject)
              }
              flagObj[item.distributionProject] = true
            }
          })
          this.formData.accountMessageEntity.jm = jm
          this.formData.accountMessageEntity.yz = yz
        }
      } else if (type === '管理门店' || type === '运营门店') {
        findAll().then(res => {
          var jmOption = []
          var yzOption = []
          res.data.forEach((item) => {
            if (item.type === 'jm') {
              jmOption.push({
                label: item.name,
                value: item.name
              })
            } else if (item.type === 'yz') {
              yzOption.push({
                label: item.name,
                value: item.name
              })
            }
          })
          var showOption = [
            {
              label: '加盟方案',
              commandName: 'jm',
              componentsName: 'el-select',
              multiple: true,
              options: jmOption,
              rules: [{ required: true, message: '请选择加盟方案', trigger: 'blur' }]
            }, {
              label: '月租方案',
              commandName: 'yz',
              componentsName: 'el-select',
              multiple: true,
              options: yzOption
              // rules: [{ required: true, message: '请选择月租方案', trigger: 'blur' }]
            },
            {
              label: '市场开发代理',
              commandName: 'marketId',
              componentsName: 'baseSelect',
              serviceObject: {
                service: getAllAgency,
                params: {},
                formatter: { label: 'name', value: 'id' }
              },
              change: (val) => {
                this.formData.businessConnectEntity = { marketId: val }
                showOption[3].serviceObject.params.id = val
              },
              rules: [{ required: true, message: '加盟方案', trigger: 'blur' }]
            }, {
              label: '代理服务人员',
              commandName: 'marketContacts',
              componentsName: 'baseSelect',
              serviceObject: {
                service: getUserByBusinessId,
                params: { id: this.formData.businessConnectEntity ? this.formData.businessConnectEntity.marketId || '' : '' },
                formatter: { label: 'name', value: 'id' }
              }
            }, {
              label: '运营顾问',
              commandName: 'operateId',
              componentsName: 'baseSelect',
              serviceObject: {
                service: getOperationService,
                params: {},
                formatter: { label: 'name', value: 'id' }
              },
              change: (val) => {
                this.formData.businessConnectEntity = { marketId: val }
                showOption[5].serviceObject.params.id = val
              },
              rules: [{ required: true, message: '加盟方案', trigger: 'blur' }]
            }, {
              label: '运营服务人员',
              commandName: 'operateContacts',
              componentsName: 'baseSelect',
              serviceObject: {
                service: getUserByBusinessId,
                params: { id: this.formData.businessConnectEntity ? this.formData.businessConnectEntity.operateId || '' : '' },
                formatter: { label: 'name', value: 'id' }
              }
            }]
          var gloablOptions = [
            {
              label: type === '管理门店' ? '归属管理门店' : '归属管理门店',
              commandName: 'parentId',
              componentsName: 'el-select',
              defaultValue: '0',
              options: [{
                label: '公司直属',
                value: '0'
              }
              ],
              disabled: true,
              rules: [{ required: true, message: '请输入机构名称', trigger: 'blur' }]
            },
            {
              componentsName: 'el-checkbox',
              label: '结算金额',
              labelText: '设置后该机构下的门店所有介绍依赖于该管理',
              change: (val) => {
                // console.log(val)
                if (val) {
                  this.topForm = [...gloablOptions, ...showOption]
                  this.secendFrom.formList = [...this.topForm, ...this.globalArr]
                  this.$refs.settlement.changeOption(this.secendFrom.formList)
                } else {
                  this.secendFrom.formList = gloablOptions
                  this.$refs.settlement.changeOption(this.secendFrom.formList, true)
                }
              },
              commandName: ''
              // defaultValue:""
            }
          ]
          this.topForm = gloablOptions
          // console.log(this.formData.businessConnectEntity)

          this.secendFrom.formList = [...this.topForm]
          if (this.isEdit) {
            if (this.formData.businessConnectEntity.marketId) {
              gloablOptions[1].defaultValue = true
              this.topForm = [...gloablOptions, ...showOption]
              this.secendFrom.formList = [...this.topForm, ...this.globalArr]
            }
            setTimeout(() => {
              this.$refs.settlement.initData({
                ...this.formData.accountMessageEntity,
                parentId: this.formData.businessEntity.parentId,
                ...this.formData.businessConnectEntity
              })
            }, 200)
          }
          this.active = 1
        })
        return
      }
      this.active = 1
      this.secendFrom.formList = [...this.topForm, ...this.globalArr]
      if (this.isEdit) {
        setTimeout(() => {
          this.$refs.settlement.initData({
            ...this.formData.accountMessageEntity,
            parentId: this.formData.businessEntity.parentId,
            procurementChannel: this.formData.businessEntity.procurementChannel
          })
        }, 200)
      }
    },
    submit() {
      console.error('tableData', this.tableData)
    //   debugger
      var fundDistributionEntities = []
      this.tableData.forEach(item => {
        for (const key in item) {
          var obj = {}
          if (key !== 'distributionProject') {
            if (key !== 'distributionType') {
              obj.distributionProject = item.distributionProject
              obj.distributionType = item.distributionType
              obj.distributionName = key
              obj.projectValue = item[key]
              fundDistributionEntities.push(obj)
            }
          }
        }
      })
      console.log(fundDistributionEntities)
      this.formData.fundDistributionEntities = fundDistributionEntities
      this.$emit('confirm', this.formData, this.isEdit)
    },
    setData(formData) {
      this.formData.businessConnectEntity = formData
      this.options = {
        header: [{
          label: '费用科目',
          propName: 'distributionProject'
        }, {
          label: '管理门店',
          propName: '管理门店',
          isInput: true
        }, {
          label: '运营门店',
          propName: '运营门店',
          isInput: true
        }, {
          label: '员工',
          propName: '员工',
          isInput: true
        }, {
          label: '一级分销',
          propName: '一级分销',
          isInput: true
        }, {
          label: '二级分销',
          propName: '二级分销',
          isInput: true
        }
        ],
        isAddList: false
      }
      this.formartTableData([{
        name: '电商销售',
        type: 'cg'
      }], this.isEdit ? this.formData.fundDistributionEntities : [], 'tableData')
    },
    async getTableData(formData) {
      var type = this.formData.businessEntity.type
      const typeObject = {
        '市场拓展中心': { top: '市场部费用', bottom1: '市场部利润', bottom2: '拓展中心费用' },
        '运营服务中心': { top: '运营部费用', bottom1: '运营部利润', bottom2: '服务运营中心费用' },
        '运营顾问': { top: '服务运营中心费用', bottom1: '拓展中心利润', bottom2: '拓展顾问费用' },
        '市场代理商': { top: '拓展中心费用', bottom1: '一级代理利润', bottom2: '二级代理利润' }
      }
      this.optionsTop = {
        height: 200,
        header: [{
          label: '方案',
          propName: 'distributionProject'
        }, {
          label: typeObject[type].top,
          propName: 'distributionValue'
        }
        ],
        isAddList: false
      }
      this.options = {
        height: 200,
        header: [{
          label: '方案',
          propName: 'distributionProject'
        }, {
          label: typeObject[type].bottom1,
          propName: typeObject[type].bottom1,
          isInput: true
        }, {
          label: typeObject[type].bottom2,
          propName: typeObject[type].bottom2,
          isInput: true,
          disabled:true,
        }
        ],
        isAddList: false
      }
      if (type === '市场拓展中心') {
        var optionSC = [
          {
            label: '拓展中心利润',
            propName: '拓展中心利润',
            isInput: true
          }, {
            label: '市场代理费用',
            propName: '市场代理费用',
            isInput: true,
            disabled:true,
          }, {
            label: '一级代理利润',
            propName: '一级代理利润',
            isInput: true,
            disabled:true,
          }, {
            label: '二级代理利润',
            propName: '二级代理利润',
            isInput: true
          }
        ]
        this.options.header = [...this.options.header, ...optionSC]
      }
      await selectDetails(formData.parentId).then(res => {
        // console.log(res)
        debugger
        this.createTableData(res.data.fundDistributionEntities, 'tableDataTop', true)
        if (type === '运营顾问' || type === '市场代理商') {
          this.createTableData(this.isEdit ? this.formData.fundDistributionEntities : res.data.fundDistributionEntities, 'tableData', this.isEdit)
          return
        }
      })
      await findAll().then(res => {
        var resData = []
        res.data.forEach(item => {
          if (item.type === 'cg') {
            resData.push(item)
          }
        })
        var jm = formData.jm.map(item => {
          // console.log(formData)
          debugger
          return {
            name: item,
            type: 'jm'
          }
        })
        var yz = formData.yz.map(item => {
          debugger
          return {
            name: item,
            type: 'yz'
          }
        })
        resData = [...jm, ...yz, ...resData]
        if (!this.isEdit) {
          // console.log(resData)
          debugger
          this.tableData = resData.map(item => {
            return {
              distributionProject: item.name,
              distributionType: item.type
            }
          })
        } else {
          debugger
          this.createTableData(resData, this.formData.fundDistributionEntities, 'tableData')
        }
        this.active = 2
      })
    },
    createTableData(data, keyName, isSHowData) {
      debugger
      var tableData = []
      var obj = {}
      data.forEach((item) => {
        if (!obj[item.distributionProject]) {
          tableData.push({
            name: item.distributionProject,
            type: item.distributionType
          })
          obj[item.distributionProject] = true
        }
      })
      // console.log('tableData', tableData)
      this.formartTableData(tableData, isSHowData ? data : [], keyName)
    },
    async findAll(type) {
      // console.log(type)
      debugger
      this.options = {
        header: [{
          label: '方案',
          propName: 'distributionProject'
        }, {
          label: type === '市场部' ? '市场部费用' : '运营部费用',
          propName: type === '市场部' ? '市场部费用' : '运营部费用',
          isInput: true
        }, {
          label: type === '市场部' ? '拓展中心指导费用' : '运营中心指导费用',
          propName: type === '市场部' ? '拓展中心指导费用' : '运营中心指导费用',
          isInput: true
        }
        ],
        isAddList: true
        // addTemplate: {
        //   'distributionProject': '',
        //   '运营部费用': '',
        //   '运营中心指导费用': ''
        // }
      }
      const res = await findAll()
      if (!this.isEdit) {
        debugger
        this.tableData = res.data.map(item => {
          return {
            distributionProject: item.name,
            distributionType: item.type
          }
        })
      } else {
        debugger
        this.formartTableData(res.data, this.formData.fundDistributionEntities, 'tableData')
      }
      this.active = 2
    },
    formartTableData(data, fundDistributionEntities, keyName) {
      // console.log(data, fundDistributionEntities, keyName)
      debugger
      var tableData = []
      data.forEach(item => {
        var tableObj = {
          distributionProject: item.name,
          distributionType: item.type
        }
        fundDistributionEntities.forEach((funItem, idx) => {
          if (item.name === funItem.distributionProject) {
            tableObj['distributionValue'] = funItem.projectValue
          }
        })
        tableData.push(tableObj)
      })
      this[keyName] = tableData
      // console.log(this[keyName],this.tableData,tableData)
      this.active = 2
    },
    close() {
      this.initFrom()
      this.dialogVisible = false
    },
    initData(data, isEdit) {
      if (!data) {
        return
      }
      this.isEdit = isEdit
      this.formData = { ...this.formData, ...data }
    //   console.log('formData', this.formData)
      setTimeout(() => {
        this.$refs.baseMessage.initData(this.formData.businessEntity)
      }, 200)
    },
    initFrom() {
      this.isEdit = false
      this.active = 0
      this.tableData = []
      this.formData = {}
      for (const key in this.formData) {
        this.formData[key] = ''
      }
      // console.log(this.$refs.baseMessage)
      this.$refs.baseMessage ? this.$refs.baseMessage.initFrom() : null
      // this.$refs.settlement.initFrom()
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

<style scoped>

</style>
