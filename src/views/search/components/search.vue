<template>
  <div class="app-container">
    <div class="search_bg">
      <div class="search_box">
        <div class="search_btns">
          <el-button
            v-for="(item,index) in btn"
            :key="index"
            :type="item.type"
            @click="tabBtn(item.name)"
          >{{ item.name }}</el-button>
        </div>
        <div class="search_pt">
          <el-autocomplete
            v-model="companyName"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入内容"
            value-key="companyName"
            class="search_inpt"
            @select="search"
            @keyup.enter.native="search"
          >
            <template slot-scope="{item}">
              <div class="compare-name" v-html="item.companyName" />
            </template>
            <el-button slot="append" class="search_btn" @click="search">搜索</el-button>
          </el-autocomplete>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { listByCompanyName } from '@/api/public_sentiment/public_sentiment_page'
// import { searchByCompany, searchEventByEvent } from '@/api/search/index'
export default {
  name: 'Search',
  props: {
    name: {
      type: String,
      default: ''
    },
    btnnames: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      btnName: this.btnnames,
      btn: [
        {
          type: 'primary',
          name: '公司'
        },
        // {
        //   type: 'info',
        //   name: '资讯',
        // },
        {
          type: 'info',
          name: '事件'
        }
      ],
      companyName: this.name,
      restaurants: [],
      loadingEvent: false,
      timer: null
    }
  },
  watch: {
    name: function(e) {
      this.companyName = this.name
    },
    btnnames: function(e) {
      this.btnName = this.btnnames
    }
  },
  created() {
    this.tabBtn(this.btnName)
  },
  methods: {
    tabBtn(name) {
      this.btn.forEach((it, i) => {
        if (it.name === name) {
          it.type = 'primary'
          this.btnName = name
          this.$emit('tabBtn', this.companyName, this.btnName)
        } else {
          it.type = 'info'
        }
      })
    },
    querySearchAsync(val, cb) {
      const queryString = val.trim()
      if (queryString.trim().length > 1) {
        if (this.btnName === '资讯') {
          this.$message('功能暂未开放')
        } else {
          if (this.timer) {
            clearTimeout(this.timer)
          }
          this.timer = setTimeout(() => {
            this.getCompanyName(queryString, cb)
          }, 100)
        }
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
    search() {
      this.companyName = this.companyName.replace(/<[^>]*>/g, '').trim()
      if (this.companyName.length > 0) {
        this.$emit('search_company', this.companyName, this.btnName)
      } else {
        this.$message('搜索内容不能为空！')
        return
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 0 !important;
  .search_bg {
    position: relative;
    width: 100%;
    height: 120px;
    box-sizing: border-box;
    background: #ebeef5;
  }
  .search_box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .el-button {
      border-radius: 0;
    }
    .search_btns {
      margin-left: 1px;
    }
  }
  .search_pt {
    width: 655px;
    .search_inpt {
      width: 100%;
      height: 48px;
    }
    .search_btn {
      width: 100px;
      text-align: center;
      font-size: 18px;
    }
  }

  /deep/.el-input__inner {
    height: 48px !important;
    line-height: 48px !important;
    border-radius: 0;
    border: 1px solid #fff;
  }
  /deep/ .el-input-group__append {
    background-color: #1890ff !important;
    color: #fff !important;
    border: 1px solid #1890ff;
    text-align: center;
  }
  /deep/ .el-input-group__append:hover {
    background-color: #409eff !important;
  }
}
</style>
