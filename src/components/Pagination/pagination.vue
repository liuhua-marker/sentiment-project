<template>
  <ul :total="totals" :pageSize="pageSize" :pageNum="pageNo">
    <li v-if="page > 5" @click="pageClick(1)" class="left" style="width: 48px">
      首页
    </li>
    <li v-if="page > 1" @click="leftRight(1)" class="left">上一页</li>
    <li
      v-for="item in arr"
      :key="item"
      @click="pageClick(item)"
      :class="item === page ? 'page_li' : ''"
    >
      {{ item }}
    </li>
    <li v-if="0 < page && page < length" @click="leftRight(2)" class="left">
      下一页
    </li>
  </ul>
</template>

<script>
name: 'Pagination'
export default {
  props: {
    total: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    pageNum: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      totals: 0,
      length: 0,
      page: 1,
      arr: [],
      pageNo: 1,
    }
  },
  watch: {
    total: {
      deep: true,
      handler(e) {
        // console.log(e)
        this.totals = e
        this.getLength()
      },
    },
    pageNum: {
      handler(val, oldVal) {
        // console.log('pageNo',val);
        this.pageNo = val
        if (val === 1) {
          this.pageClick(val)
        }
      },
      deep: true,
    },
  },
  methods: {
    getLength() {
      //获取页码大小并初始化页面
      let shuzu = []
      if (this.totals % this.pageSize == 0) {
        this.length = this.totals / this.pageSize
      } else {
        this.length = parseInt(this.totals / this.pageSize) + 1
      }
      if (this.length >= 10) {
        shuzu.length = 10
      } else {
        shuzu.length = this.length
      }
      for (let i = 0; i < shuzu.length; i++) {
        if (this.pageNo > 8) {
          shuzu[i] = i + this.pageNo - 5
        } else {
          shuzu[i] = i + 1
        }
      }
      this.arr = shuzu
    },
    getpage(page) {
      let shuzu = []
      let j = 0
      let str = 0
      if (page + 5 <= this.length) {
        str = page + 5
        j = page - 5
      } else {
        str = page + (this.length - page)
        j = str - 10
      }

      for (let i = j + 1; i <= str; i++) {
        shuzu.push(i)
      }
      this.arr = shuzu
    },
    pageClick(page) {
      this.page = page
      if (page <= this.arr.length / 2 || this.length <= 10) {
        this.getLength()
      } else {
        this.getpage(page)
      }
      this.pageNumChange(this.page)
    },
    leftRight(e) {
      switch (e) {
        case 1:
          if (this.page == 1) {
            this.page = 1
          } else {
            this.page -= 1
          }
          this.pageClick(this.page)
          break
        case 2:
          if (this.page == this.length) {
            this.page = this.length
          } else {
            this.page += 1
          }
          this.pageClick(this.page)
          break
      }
    },
    pageNumChange(page) {
      document.documentElement.scrollTop = 0
      this.$emit('pageNumChange', page)
    },
  },
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

ul > li {
  -ms-user-select: none;
  margin: 0 0.02rem;
  display: inline-block;
  background: #fff;
  color: #409eff;
  min-width: 0.3rem;
  /* width: 36px; */
  height: 0.36rem;
  text-align: center;
  line-height: 0.36rem;
  border-radius: 0.02rem;
  cursor: pointer;
  vertical-align: middle;
  padding: 0 0.03rem;
  border-radius: 0.05rem;
  margin-right: 0.1rem;
  overflow: hidden;
  box-sizing: content-box;
}
.page_li {
  background-color: #2790f8;
  color: #fff;
}
.left {
  -ms-user-select: none;
  margin: 0 0.02rem;
  display: inline-block;
  background: #fff;
  color: #409eff;
  width: 0.8rem;
  height: 0.36rem;
  text-align: center;
  line-height: 0.36rem;
  border-radius: 0.02rem;
  cursor: pointer;
  vertical-align: middle;
  border-radius: 0.05rem;
}

li:hover {
  background-color: #409eff;
  color: #fff;
}
</style>
