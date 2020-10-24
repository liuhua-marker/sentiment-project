<template>
  <div class="app-container">
    <div class="app-tabs">
      <span class="text">筛选</span>
      <!-- 时间 -->
      <el-popover v-model="visibleTime" placement="bottom-start" trigger="click">
        <div class="tab-body">
          <div>
            <el-radio v-model="radio" label="0" @change="queryFrom">全部</el-radio>
            <el-radio v-model="radio" label="1" @change="queryFrom">当天</el-radio>
            <el-radio v-model="radio" label="2" @change="queryFrom">近3天</el-radio>
            <el-radio v-model="radio" label="3" @change="queryFrom">近7天</el-radio>
            <el-radio v-model="radio" label="4">自定义时间</el-radio>
            <span v-if="radio==='4'" style="margin-top: 20px">
              <el-date-picker
                v-model="time"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="queryFrom"
                @focus="dateFocus"
                @blur="dateBlur"
              />
            </span>
          </div>
        </div>
        <el-button slot="reference" type="text">
          <b class="demonstration">时间</b>
          <span>{{ radioName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
          <span>|</span>
        </el-button>
      </el-popover>
      <!-- 预警级别 -->
      <el-popover v-model="visibleLevel" placement="bottom-start" trigger="click">
        <div>
          <el-radio
            v-for="(v, k, i) in optionContentGrade"
            :key="i"
            v-model="queryform.contentGrade"
            :label="v"
            @change="queryFrom"
          >{{ k }}</el-radio>
        </div>
        <el-button slot="reference" type="text">
          <b class="demonstration">等级选择</b>
          <span>{{ contentName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
          <span>|</span>
        </el-button>
      </el-popover>
      <!-- 数据源类型 -->
      <el-popover v-model="visibleData" placement="bottom-start" trigger="click">
        <div>
          <el-radio v-model="sourceType" label="0" @change="queryData">全部</el-radio>
          <el-radio
            v-for="item in optionsSource"
            :key="item.sourceTypeId"
            v-model="sourceType"
            :label="item.typeCode"
            @change="queryData(item.typeName)"
          >{{ item.typeName }}</el-radio>
        </div>
        <el-button slot="reference" type="text" @click="sourceData">
          <b class="demonstration">数据源类型</b>
          <span>{{ dataName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
          <span>|</span>
        </el-button>
      </el-popover>
      <!-- 倾向性查询 -->
      <el-popover v-model="visibleType" placement="bottom-start" trigger="click">
        <div>
          <el-radio
            v-for="(val, key ,i) in options"
            :key="i"
            v-model="queryform.emotionType"
            :label="val"
            @change="queryFrom"
          >{{ key }}</el-radio>
        </div>
        <el-button slot="reference" type="text" @click="sourceData">
          <b class="demonstration">倾向性</b>
          <span>{{ typeName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
          <span>|</span>
        </el-button>
      </el-popover>
      <!-- 去重 -->
      <el-popover v-model="visibleRepeat" placement="bottom-start" trigger="click">
        <div>
          <el-radio v-model="removal" label="0" @change="queryFrom">重复</el-radio>
          <el-radio v-model="removal" label="1" @change="queryFrom">不重复</el-radio>
        </div>
        <el-button slot="reference" type="text">
          <b class="demonstration">重复信息</b>
          <span>{{ removalName }}</span>
          <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { confdatasourcetype } from '@/api/dashboard'
// import { parseTime } from '@/utils/index'

export default {
  name: 'PopoverPublic',
  props: {
    queryforms: {
      type: Object,
      default: function() {
        return {
          pageNo: 1,
          pageSize: 10,
          deptId: '',
          orgId: '',
          targetCompany: '',
          contentGrade: '',
          emotionType: '',
          sourceType: '',
          startTime: '',
          endTime: '',
          deduplicate: false
        }
      }
    }
  },
  data() {
    return {
      visibleTime: false,
      visibleLevel: false,
      visibleData: false,
      visibleRepeat: false,
      visibleType: false,
      // 表单数据
      queryform: this.queryforms,
      optionContentGrade: {
        全部: '',
        零级: '0',
        一级: '1',
        二级: '2',
        三级: '3',
        四级: '4',
        五级: '5'
      },
      radio: '0',
      radioName: '全部',
      radioTime: '0',
      sourceType: '0',
      dataName: '全部',
      removal: '1',
      removalName: '不重复',
      contentName: '全部',
      typeName: '全部',
      time: '',
      optionsSource: [],
      options: {
        全部: '',
        正面: 1,
        中性: 0,
        负面: -1
      }
    }
  },
  watch: {
    queryforms: function(e) {
      this.queryform = this.queryforms
    }
  },
  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // 获取页面数据
    if (this.queryform.deduplicate === '') {
      this.removal = '0'
      this.removalNmae = '重复'
    } else {
      this.removal = '1'
      this.removalNmae = '不重复'
    }
  },
  methods: {
    // 标准的时间格式转为时间戳
    dateToMs(date) {
      const result = new Date(date).getTime()
      return result
    },
    // 数据类型
    sourceData() {
      const solutionForm = {
        deptId: this.queryform.deptId,
        pageNo: 1,
        pageSize: 100
      }
      if (!this.visibleData) {
        confdatasourcetype(solutionForm).then(res => {
          this.optionsSource = res.rows
        })
      }
    },
    // remoteMethod(query) {
    //   if (query !== '') {
    //     this.loading = true
    //     setTimeout(() => {
    //       this.loading = false
    //     }, 200)
    //   } else {
    //     this.optionsCompanyCombSub = []
    //   }
    // },
    dateFocus() {
      this.visibleTime = true
    },
    dateBlur() {
      // this.visibleTime = true
      if (this.time.length <= 0) {
        this.time = ''
        if (this.radioName === '全部') {
          this.radio = '0'
        } else if (this.radioName === '当天') {
          this.radio = '1'
        } else if (this.radioName === '近3天') {
          this.radio = '2'
        } else if (this.radioName === '近7天') {
          this.radio = '3'
        }
      }
    },
    queryData(val) {
      if (this.sourceType === '0') {
        this.queryform.sourceType = ''
        this.dataName = '全部'
      } else {
        this.queryform.sourceType = this.sourceType
        this.dataName = val
      }
      this.RefreshData()
      this.loading = true
      this.visibleData = false
    },
    queryFrom(val) {
      this.queryform.pageNo = 1
      // 预警级别
      for (const key in this.optionContentGrade) {
        if (this.queryform.contentGrade === this.optionContentGrade[key]) {
          this.contentName = key
        }
      }
      for (const key in this.options) {
        if (this.queryform.emotionType === this.options[key]) {
          this.typeName = key
        }
      }
      if (this.radio === '0') {
        this.radioName = '全部'
        this.time = ''
        this.queryform.startTime = ''
        this.queryform.endTime = ''
      } else if (this.radio === '1') {
        this.radioName = '当天'
        this.time = ''
        const today = new Date(
          new Date(new Date().toLocaleDateString()).getTime()
        )
        this.queryform.startTime = this.dateToMs(today)
        this.queryform.endTime = new Date().getTime()
      } else if (this.radio === '2') {
        this.radioName = '近3天'
        this.time = ''
        const today = new Date(
          new Date(new Date().toLocaleDateString()).getTime()
        )
        this.queryform.startTime =
          this.dateToMs(today) - 2 * 24 * 60 * 60 * 1000
        this.queryform.endTime = new Date().getTime()
      } else if (this.radio === '3') {
        this.radioName = '近7天'
        this.time = ''
        const today = new Date(
          new Date(new Date().toLocaleDateString()).getTime()
        )
        this.queryform.startTime =
          this.dateToMs(today) - 6 * 24 * 60 * 60 * 1000
        this.queryform.endTime = new Date().getTime()
      } else if (this.radio === '4') {
        this.radioName = '自定义时间'
        this.queryform.startTime = this.dateToMs(this.time[0])
        this.queryform.endTime =
          this.dateToMs(this.time[1]) + 24 * 60 * 60 * 1000
      }
      if (this.removal === '0') {
        this.queryform.deduplicate = ''
        this.removalName = '重复'
      } else {
        this.queryform.deduplicate = false
        this.removalName = '不重复'
      }
      this.RefreshData()
      this.visibleTime = false
      this.visibleLevel = false
      this.visibleRepeat = false
      this.visibleType = false
    },
    RefreshData() {
      this.$emit('RefreshData')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .app-tabs {
    .text {
      color: #409eff;
      font-size: 16px;
      font-weight: 600;
    }
    .app-label {
      margin: 0 45px;
    }
    .tab-body {
      .tab-time {
        margin-right: 20px;
        font-size: 14px;
      }
    }
    .demonstration {
      font-size: 14px;
      margin: 20px;
    }
  }
}
</style>
