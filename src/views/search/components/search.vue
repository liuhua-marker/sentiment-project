<template>
  <div class="search_bg">
    <div class="search_box">
      <el-autocomplete
        v-model="companyName"
        :fetch-suggestions="querySearchAsync"
        placeholder="请输入关键字"
        value-key="companyName"
        @select="searchSelect"
        class="input-with-select"
        @keyup.enter.native="search"
      >
        <el-select v-model="btnName" slot="prepend" @change="tabBtn">
          <el-option v-for="btn in btns" :key="btn" :label="btn" :value="btn" />
        </el-select>
        <template slot-scope="{ item }">
          <div class="compare-name" v-html="item.companyName" />
        </template>
        <el-button slot="append" class="search_btn" @click="search"
          >搜 索</el-button
        >
      </el-autocomplete>
    </div>
  </div>
</template>

<script>
import {
  listByCompanyName,
  getAllLabelsByLikeLabel,
} from '@/api/public_sentiment/public_sentiment_page'
export default {
  name: 'Search',
  props: {
    name: {
      type: String,
      default: '',
    },
    btnnames: {
      type: String,
      default: '',
    },
    btns: {
      type: Array,
      default: function () {
        return ['全部', '公司', '标签']
      },
    },
  },
  data() {
    return {
      btnName: '全部',
      companyName: '',
      restaurants: [],
      loadingEvent: false,
      timer: null,
      listItem: {},
    }
  },
  watch: {
    name: function (e) {
      this.companyName = e
    },
    btnnames: function (e) {
      this.btnName = e
    },
  },
  created() {},
  methods: {
    getName() {
      return {
        companyName: this.companyName,
        listItem: this.listItem,
        btnName: this.btnName,
      }
    },
    tabBtn(name) {
      this.companyName = ''
    },
    querySearchAsync(val, cb) {
      const queryString = val.trim()
      if (this.btnName !== '全部' && queryString.trim().length > 1) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          if (this.btnName === '公司') {
            this.getCompanyName(queryString, cb)
          } else if (this.btnName === '标签') {
            this.getlabelName(queryString, cb)
          }
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
        pageSize: 5,
      }
      listByCompanyName(data).then((res) => {
        this.restaurants = res.rows
        const pattern = /[`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/
        const R = name.replace(pattern, '')
        const reg = new RegExp(R, 'g')
        // console.log(reg);
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
    getlabelName(name, cb) {
      this.loadingEvent = true
      this.restaurants = []
      getAllLabelsByLikeLabel(name).then((res) => {
        this.restaurants = []
        const reg = new RegExp(name, 'g')
        res.data.forEach((item) => {
          item.labelName = item.labelName.replace(
            reg,
            `<span style="color: #ff4949">${name}</span>`
          )
          this.restaurants.push({
            companyName: item.labelName,
            level: item.level,
          })
        })
        this.loadingEvent = false
        cb(this.restaurants)
      })
    },
    searchSelect(e) {
      this.companyName = this.companyName.replace(/<[^>]*>/g, '').trim()
      e.companyName = e.companyName.replace(/<[^>]*>/g, '').trim()
      this.listItem = e
    },
    search() {
      if (this.companyName.length > 0) {
        this.$router.push({
          query: {
            companyName: this.companyName,
            btnName: this.btnName,
            level: this.listItem.level,
          },
        })
        this.$emit('search', this.companyName, this.btnName, this.listItem)
      } else {
        this.$message('搜索内容不能为空！')
        return
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.search_bg {
  position: relative;
  width: 100%;
  height: 110px;
  box-sizing: border-box;
  border-radius: 5px;
}
.search_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  // background: #3b99fb;
  .search_btn {
    width: 108px;
    text-align: center;
    font-size: 18px;
  }
}
.el-select {
  width: 108px;
  background: #fff;
  border-right: 0;
  height: 44px;
  border-radius: 5px 0 0 5px;
  color: #333;
}
.el-autocomplete {
  width: 740px;
  border: 1px solid #3b99fb;
  border-radius: 5px;
  overflow: hidden;
  background: #3b99fb;
}
/deep/.el-input__inner {
  height: 44px !important;
  line-height: 44px !important;
  border-radius: 0;
  border: 0;
  border-left: 1px solid #3b99fb;
}
/deep/ .el-input-group__append {
  background-color: #3b99fb !important;
  color: #fff !important;
  border: 0;
  text-align: center;
  font-size: 18px;
}
/deep/ .el-input-group__append:hover {
  background-color: #409eff !important;
}
/deep/.el-input__icon {
  line-height: 44px;
}
</style>
