<template>
    <el-dialog
        :visible.sync="dialogVisible"
        :title="dialogTitle"
        @close="handleClose"
        :close-on-click-modal="true"
        :destroy-on-close="true"
        width="1300px"
        top="5vh"
    >
        <el-steps :active="active" align-center finish-status="success">
            <el-step title="创建订单"></el-step>
            <el-step title="客户支付"></el-step>
            <el-step title="仓库发货"></el-step>
            <el-step title="确认收货"></el-step>
            <el-step title="完成评价"></el-step>
        </el-steps>
        <!-- 创建订单 -->
        <div class="center_style">
            <div class="status_style">
                <div style="font-size: 15px;font-weight: 550;">
                    <span>当前订单状态：</span>
                    <span style="color: blue;">{{formData.status|status}}</span>
                </div>
            </div>

            <div class="block_style">
                <div v-if="active === 2" style="margin-top: 10px;">
                    <span class="title_style">选择物流商：</span>
                    <el-select
                        v-model="selectValue"
                        :disabled="this.formOption.status === 1 ? true : false"
                        clearable
                        placeholder="请选择物流商"
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-input
                        style="margin-left: 10px;width: 200px;"
                        v-model="inputValue"
                        :disabled="this.formOption.status === 1 ? true : false"
                        clearable
                        placeholder="请输入物流单号"
                    ></el-input>
                    <el-button style="margin-left: 10px;" type="primary" @click="handelSave">保存</el-button>
                </div>

                <!-- 物流信息 -->
                <div v-if="active === 3" class="box_style">
                    <div class="title_style">物流信息</div>
                    <table class="table_style" border="solid" style="border-color:#DDDDDD">
                        <tr class="bg">
                            <td style="width:1000px">物流详情</td>
                            <td style="width:200px">到达时间</td>
                        </tr>
                        <template v-if="acceptArr.length>0">
                            <tr class="none" v-for="(item,index) in acceptArr" :key="index">
                                <td>{{item.AcceptStation}}</td>
                                <td>{{item.AcceptTime}}</td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr class="none">
                                <td colspan="2">暂无物流信息！</td>
                            </tr>
                        </template>
                    </table>
                </div>

                <!-- 基础信息 -->
                <div class="box_style">
                    <div class="title_style">基础信息</div>
                    <table class="table_style" border="solid" style="border-color:#DDDDDD">
                        <tr class="bg">
                            <td>订单编号</td>
                            <td>下单账号</td>
                            <td>支付方式</td>
                            <td>订单类型</td>
                        </tr>
                        <tr class="none">
                            <td>{{formData.id}}</td>
                            <td>{{formData.orderno}}</td>
                            <td>{{formData.payType | payType}}</td>
                            <td>{{formData.type | type}}</td>
                        </tr>
                        <tr class="bg">
                            <td>物流商</td>
                            <td>物流单号</td>
                            <td>自动确认收货时间</td>
                            <td></td>
                        </tr>
                        <tr class="none">
                            <td>{{formData.orderExpressList && formData.orderExpressList.length > 0 ? formData.orderExpressList[0].expressName : ''}}</td>
                            <td>{{formData.orderExpressList && formData.orderExpressList.length > 0 ? formData.orderExpressList[0].expressNo : ''}}</td>
                            <td>{{formData.overDate}}</td>
                            <td></td>
                        </tr>
                    </table>
                </div>

                <!-- 收货人信息 -->
                <div class="box_style">
                    <div class="title_style">收货人信息</div>
                    <table class="table_style" border="solid" style="border-color:#DDDDDD">
                        <tr class="bg">
                            <td>收件人</td>
                            <td>手机号码</td>
                            <td style="width:600px">详细地址</td>
                        </tr>
                        <tr class="none">
                            <td>{{formData.ship ? formData.ship.shipname : ''}}</td>
                            <td>{{formData.ship ? formData.ship.phone : ''}}</td>
                            <td>{{formData.ship ? formData.ship.shipaddress : ''}}</td>
                        </tr>
                    </table>
                </div>

                <!-- 商品信息 -->
                <div class="box_style">
                    <div class="title_style">商品信息</div>
                    <el-table :data="tableData" border :header-row-class-name="handleClass">
                        <el-table-column prop="picture" align="center" label="商品图片" width="180">
                            <template slot-scope="scope">
                                <el-image
                                    :src="scope.row.picture"
                                    :fit="'contain'"
                                    style="width: 150px; height: 150px"
                                ></el-image>
                            </template>
                        </el-table-column>
                        <el-table-column prop="productName" align="center" label="商品名称" width="480"></el-table-column>
                        <el-table-column prop="code" align="center" label="价格/规格"></el-table-column>
                        <el-table-column prop="specInfo" align="center" label="属性"></el-table-column>
                        <el-table-column prop="number" align="center" label="数量"></el-table-column>
                        <el-table-column
                            prop="amount"
                            align="center"
                            label="小计"
                            :formatter="tableMoney"
                        ></el-table-column>
                    </el-table>
                    <div class="total_style">
                        <span style="font-weight: 550;">合计：</span>
                        <span
                            style="font-size:15px;font-weight: 550;color:red;"
                        >{{formData.amount}}元</span>
                    </div>
                </div>

                <!-- 费用信息 -->
                <div class="box_style">
                    <div class="title_style">费用信息</div>
                    <table class="table_style" border="solid" style="border-color:#DDDDDD">
                        <tr class="bg">
                            <td>商品合计</td>
                            <td>运费</td>
                            <td>优惠券</td>
                            <td>应付款金额</td>
                        </tr>
                        <tr class="none">
                            <td>{{formData.payAmount | money}}</td>
                            <td>{{formData.fee | money}}</td>
                            <td>{{formData.rebate | money}}</td>
                            <td>{{formData.updateAmount | money}}</td>
                        </tr>
                    </table>
                </div>

                <!-- 操作信息 -->
                <div class="box_style">
                    <div class="title_style">操作信息</div>
                    <table class="table_style" border="solid" style="border-color:#DDDDDD">
                        <tr class="bg">
                            <td style="width:600px">事件</td>
                            <td style="width:600px">操作时间</td>
                        </tr>
                        <tr class="none" v-for="(item,index) in formData.orderlogList" :key="index">
                            <td>{{item.content}}</td>
                            <td>{{item.createDate}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script>
import baseForm from '@/components/form'
import {
    updateView,
    send,
    auditBack,
    getOrderTracesByJson
} from '@/api/orderManagement'
export default {
    name: 'FormDialog',
    props: ['title', 'data'],
    components: { baseForm },
    data() {
        return {
            dialogVisible: false,
            formOption: {},
            dialogTitle: '',
            active: 1,
            formData: {},
            tableData: [],
            acceptArr: [],
            options: [
                {
                    value: 'SF',
                    label: '顺丰速运'
                },
                {
                    value: 'HTKY',
                    label: '百世快递'
                },
                {
                    value: 'ZTO',
                    label: '中通快递'
                },
                {
                    value: 'STO',
                    label: '申通快递'
                },
                {
                    value: 'YTO',
                    label: '圆通速递'
                },
                {
                    value: 'YD',
                    label: '韵达速递'
                },
                {
                    value: 'YZPY',
                    label: '邮政快递包裹'
                },
                {
                    value: 'EMS',
                    label: 'EMS'
                },
                {
                    value: 'HHTT',
                    label: '天天快递'
                },
                {
                    value: 'JD',
                    label: '京东快递'
                },
                {
                    value: 'UC',
                    label: '优速快递'
                },
                {
                    value: 'DBL',
                    label: '德邦快递'
                },
                {
                    value: 'ZJS',
                    label: '宅急送'
                }
            ],
            selectValue: '',
            inputValue: ''
        }
    },
    watch: {
        data: {
            deep: true,
            immediate: true,
            handler(val) {
                this.formData = val
            }
        }
    },
    filters: {
        status(val) {
            switch (val) {
                case 0:
                    return '待支付'
                    break
                case 1:
                    return '待发货'
                    break
                case 2:
                    return '待收货'
                    break
                case 3:
                    return '已验收'
                    break
                case 4:
                    return '已取消'
                    break
                case 5:
                    return '已关闭'
                    break
                default:
                    break
            }
        },
        payType(val) {
            switch (val) {
                case 1:
                    return '钱包'
                    break
                default:
                    break
            }
        },
        type(val) {
            switch (val) {
                case 0:
                    return '普通订单'
                    break
                case 1:
                    return '秒杀订单'
                    break
                case 2:
                    return '加盟订单'
                    break
                default:
                    break
            }
        },
        money(val) {
            if (val) {
                return val + '元'
            } else {
                return '0.00元'
            }
        }
    },
    mounted() {
        this.dialogTitle = this.title
    },
    methods: {
        tableMoney(row, column) {
            return row.amount + '元'
        },
        open(val) {
            if (val) {
                this.dialogVisible = true
            }
            this.$nextTick(() => {
                if (this.formData && this.formData.status === 4) {
                    this.active = 3
                    return
                } else {
                    // console.log('this.formData.status', this.formData.status)
                    this.active = this.formData.status + 1
                }
                if (this.formData.orderdetailList.length > 0) {
                    this.formData.orderdetailList.forEach(el => {
                        this.tableData.push({
                            picture: el.picture.path,
                            productName: el.productName,
                            code: el.price + '元/' + el.code,
                            specInfo: el.specInfo,
                            number: el.number,
                            amount: el.amount
                        })
                    })
                }
                if (this.active === 3) {
                    this.getOrderTracesByJson()
                }
            })
        },
        async handelSave() {
            if (!this.selectValue || !this.inputValue) {
                this.$message({ message: '请填写完整物流信息！' })
                return
            }
            let selectName = ''
            this.options.forEach(el => {
                if (el.value == this.selectValue) {
                    selectName = el.label
                }
            })
            let params = {
                expressCode: this.selectValue,
                expressName: selectName,
                expressNo: this.inputValue,
                orderId: this.formData.id
            }
            const res = await send(params)
            if (res.code === 200) {
                this.$message({
                    type: 'success',
                    message: '保存物流信息成功！'
                })
                this.handleSuccess()
                const res = await updateView(this.formData.id)
                if (res.code === 200) {
                    this.formData = res.data
                    this.tableData = []
                    this.open()
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    })
                }
            } else {
                this.$message({
                    type: 'error',
                    message: res.msg
                })
            }
        },
        async getOrderTracesByJson() {
            let expressCode = ''
            let expressNo = ''
            if (this.formData.orderExpressList.length > 0) {
                expressCode = this.formData.orderExpressList[0].expressCode
                expressNo = this.formData.orderExpressList[0].expressNo
            }
            const ret = await getOrderTracesByJson(expressCode, expressNo)
            if (ret.code === 200) {
                this.acceptArr = ret.data.Traces
            } else {
                this.$message({
                    type: 'error',
                    message: res.msg
                })
            }
        },
        initData() {
            console.log(1)
        },
        handleSuccess() {
            this.$emit('success')
        },
        handleClose() {
            this.dialogVisible = false
            this.formData = {}
            this.tableData = []
            this.acceptArr = []
            this.selectValue = ''
            this.inputValue = ''
            this.active = 1
        },
        handleClass({ row, rowIndex }) {
            // console.log(row, rowIndex)
            if (rowIndex === 0) {
                return 'table_tr'
            }
        }
    }
}
</script>
<style lang="scss">
.table_tr {
    th {
        background: #f5f5f6;
    }
}
</style>
<style lang="scss" scoped>
.center_style {
    overflow-y: scroll;
    height: 600px;
    margin-left: 55px;
    margin-top: 20px;
    border: 1px solid #cccccc;
    .status_style {
        background: #cccccc;
        padding: 20px;
    }
    .block_style {
        width: 100%;
        padding: 15px;
        .box_style {
            margin-bottom: 30px;
            .total_style {
                text-align: right;
                padding: 10px;
            }
        }
    }
}
.title_style {
    font-size: 15px;
    font-weight: 550;
    margin: 5px 0px;
}
.table_style {
    border: 1px solid #dddddd;
    border-collapse: collapse;
    .bg td {
        width: 300px;
        height: 35px;
        padding: 8px;
        font-size: 15px;
        font-weight: 550;
        background: #f5f5f6;
    }
    .none td {
        width: 300px;
        height: 35px;
        padding: 8px;
        font-size: 15px;
    }
}
</style>
