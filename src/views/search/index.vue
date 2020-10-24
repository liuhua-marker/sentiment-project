<template>
  <div class="app-container">
    <div class="search_bg">
      <div class="search_box">
        <div>
          <el-button
            v-for="(item,index) in btn"
            :key="index"
            :type="item.type"
            @click="tabBtn(index)"
          >{{ item.name }}</el-button>
        </div>
        <div class="search_pt">
          <el-autocomplete
            v-model="companyName"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入企业名称"
            value-key="companyName"
            class="search_inpt"
            @select="search"
            @keyup.enter.native="search"
          >
            <template slot-scope="{item}">
              <div class="compare-name" v-html="item.companyName" />
            </template>
            <el-button slot="append" type="primary" class="search_btn" @click="search">搜索</el-button>
          </el-autocomplete>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { listByCompanyName } from '@/api/public_sentiment/public_sentiment_page'
export default {
  name: 'SearchIndex',
  data() {
    return {
      btnName: '公司',
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
      companyName: '',
      restaurants: [],
      loadingEvent: false,
      timer: null
    }
  },
  created() {},
  methods: {
    tabBtn(index) {
      this.btn.forEach((it, i) => {
        if (i === index) {
          it.type = 'primary'
          this.btnName = this.btn[index].name
        } else {
          it.type = 'info'
        }
      })
    },
    querySearchAsync(val, cb) {
      const queryString = val.trim()
      if (queryString.length > 1) {
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
    search(val) {
      this.companyName = this.companyName.replace(/<[^>]*>/g, '').trim()
      if (this.companyName.length > 0) {
        if (this.btnName === '资讯') {
          this.$message('功能暂未开放')
        } else {
          this.$router.push({
            path: '/search/searchByCompany',
            query: {
              companyName: this.companyName,
              btnName: this.btnName
            }
          })
        }
      } else {
        return
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .search_bg {
    position: relative;
    width: 100%;
    height: 800px;
    box-sizing: border-box;
  }
  .search_box {
    position: absolute;
    left: 50%;
    top: 200px;
    transform: translateX(-50%);
    .el-button {
      border-radius: 0;
    }
  }
  .search_pt {
    width: 675px;
    padding: 10px;
    background: #909399;
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
