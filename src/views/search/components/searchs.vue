<template>
  <div class="search_bg">
    <div class="search_box">
      <el-select v-model="btnName" class="select_btn" @change="tabBtn">
        <el-option v-for="btn in btns" :key="btn" :label="btn" :value="btn" />
      </el-select>
      <el-select
        v-model="companyName"
        multiple
        filterable
        remote
        reserve-keyword
        placeholder="请输入关键词"
        :remote-method="querySearchAsync"
        :loading="loadingEvent"
        class="select_input"
        @change="searchSelect"
        :multiple-limit="20"
      >
        <el-option
          v-for="item in restaurants"
          :key="item.companyName"
          :value="item.companyName"
        >
          <template>
            <label v-html="item.companyName"></label>
          </template>
        </el-option>
      </el-select>
      <el-button class="search_btn" @click="search">搜 索</el-button>
      <!-- <el-autocomplete
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
      </el-autocomplete> -->
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
      companyName: [],
      restaurants: [],
      loadingEvent: false,
      timer: null,
      listItem: {},
      list: [],
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
    tabBtn(name) {
      this.companyName = ''
    },
    querySearchAsync(val) {
      const queryString = val.trim()
      if (this.btnName !== '全部' && queryString.trim().length > 1) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
          if (this.btnName === '公司') {
            this.getCompanyName(queryString)
          } else if (this.btnName === '标签') {
            this.getlabelName(queryString)
          }
        }, 100)
      } else {
        this.restaurants = []
        // cb(this.restaurants)
      }
    },
    getCompanyName(name) {
      this.loadingEvent = true
      this.restaurants = []
      const data = {
        companyName: name,
        pageNo: 1,
        pageSize: 5,
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
        console.log(this.restaurants)
      })
    },
    getlabelName(name) {
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
      })
    },

    searchSelect(e) {
      let names = []
      e.forEach((item) => {
        item = item.replace(/<[^>]*>/g, '')
        console.log(item)
        names.push(item)
      })
      this.companyName = names
      console.log(names)

      // this.companyName = this.companyName.replace(/<[^>]*>/g, '')
      // e.companyName = e.companyName.replace(/<[^>]*>/g, '')
      // this.listItem = e
    },
    search() {
      console.log(this.companyName, this.btnName, this.listItem)
      return
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
  width: 772px;
  .el-button {
    width: 108px;
    height: 46px;
    text-align: center;
    font-size: 18px;
    border: 1px solid #3B99FB;
    border-left: 0;
    border-radius: 0 5px 5px 0;
    background: #3B99FB;
    color: #fff;
    vertical-align: top;
  }
  .select_input {
    vertical-align: top;
    width: 548px;
    border: 1px solid #3B99FB;
    // border-radius: 0 0 5px 5px;
    overflow: hidden;
  }
}
.select_btn {
  vertical-align: top;
  width: 108px;
  background: #fff;
  border-right: 0;
  border-radius: 5px 0 0 5px;
  color: #333;
  border: 1px solid #3B99FB;
  border-right: 0;
  overflow: hidden;
}
/deep/.el-input--medium .el-input__inner {
  min-height: 44px !important;
  line-height: 44px;
  border: 0;
  // border-right: 1px solid #3B99FB;
  border-radius: 0;
}
</style>
