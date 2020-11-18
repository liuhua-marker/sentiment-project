<template>
  <div>
    <el-autocomplete
      ref="autoComplete"
      v-model="companyName"
      :fetch-suggestions="querySearchAsync"
      placeholder="目标公司"
      clearable
      class="search_inpt"
      value-key="companyName"
      @select="RefreshData"
      @clear="RefreshData"
      @keyup.enter.native="RefreshData"
    >
      <template slot-scope="{item}">
        <div class="compare-name" v-html="item.companyName" />
      </template>
      
    </el-autocomplete>
    <el-button type="primary" @click="RefreshData">查询</el-button>
  </div>
</template>

<script>
import { listByCompanyName } from '@/api/public_sentiment/public_sentiment_page'
// import data from '@/views/pdf/content'
// import { date } from 'jszip/lib/defaults'
export default {
  name: 'Autocomplete',
  props: {
    targetcompany: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      companyName: this.targetcompany,
      loadingEvent: false,
      restaurants: [],
      timer: null
    }
  },
  watch: {
    targetcompany: function(e) {
      this.companyName = this.targetcompany
    }
  },
  created() {},
  methods: {
    querySearchAsync(val, cb) {
      const queryString = val.trim()
      if (queryString && queryString.length > 1) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          this.getCompanyName(queryString, cb)
        }, 100)
      } else {
        this.restaurants = []
        cb(this.restaurants)
      }
    },
    getCompanyName(name, cb) {
      this.loadingEvent = true
      this.restaurants = []
      const data = {
        companyName: name,
        pageNo: 1,
        pageSize: 5
      }
      listByCompanyName(data).then((res) => {
        this.restaurants = res.rows
        const reg = new RegExp(name, 'g')
        this.restaurants.forEach((item) => {
          item.companyName = item.companyName.replace(
            reg,
            `<span style="color: #ff4949">${name}</span>`
          )
        })
        this.loadingEvent = false
        cb(this.restaurants)
      })
    },
    RefreshData() {
      this.$refs['autoComplete'].suggestions = []
      this.companyName = this.companyName.replace(/<[^>]*>/g, '').trim()
      //   console.log(this.companyName)
      this.$emit('RefreshData', this.companyName)
    }
  }
}
</script>

<style lang="scss" scoped>
.search_inpt {
  width: 350px;
}
/deep/ .el-input-group__append {
  background-color: #1890ff !important;
  color: #fff !important;
  border: 1px solid #1890ff;
}
/deep/ .el-input-group__append:hover {
  background-color: #409eff !important;
}
.el-button {
  margin-left: 10px;
}
</style>
