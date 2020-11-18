<template>
  <div class="app-container">
    <div class="gaoji">
      <el-button type="text" @click="gaoSearch">高级筛选</el-button>
    </div>
    <div class="search_bg">
      <Search :name="companyName" :btnnames="btnName" @search="search" />
    </div>
    <div class="hot_box">
      <div v-for="(item, index) in hotData" :key="index" class="topic">
        <span :class="item.hotScore > 1 ? 'hot' : ''" class="index">
          {{ index + 1 }}.</span
        >
        <span class="topic_text" @click="detailsPage(item.topicId)">
          {{ item.topic }}
        </span>
        <svg-icon v-if="item.hotScore > 1" icon-class="hot" class="hot" />
      </div>
    </div>
  </div>
</template>

<script>
// import Search from '@/views/search/components/searchs'
import Search from '@/views/search/components/search'
import { findHotTopicTop } from '@/api/search/index'
export default {
  name: 'SearchIndex',
  components: { Search },
  data() {
    return {
      btnName: '公司',
      companyName: '',
      hotData: [],
    }
  },
  created() {
    findHotTopicTop().then((res) => {
      this.hotData = res.data
    })
  },
  methods: {
    search(name, btn, item) {
      this.companyName = name
      this.btnName = btn
      if (this.companyName.length > 0) {
        this.$router.push({
          path: '/search/searchByCompany',
          query: {
            companyName: this.companyName,
            btnName: this.btnName,
            level: item.level,
          },
        })
      } else {
        this.$message('搜索内容不能为空！')
        return
      }
    },
    gaoSearch() {
      this.$router.push({
        path: '/search/searchByCompany',
      })
    },
    // 跳转到详情页
    detailsPage(val) {
      // const { href } = this.$router.resolve({
      //   path: '/configuration/analysis/hot/hot_analysis_page',
      //   query: { id: val }
      // })
      // window.open(href, '_blank')
      this.$router.push({
        path: '/configuration/analysis/hot/hot_analysis_page',
        query: { id: val },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.gaoji {
  text-align: right;
  padding-right: 0.2rem;
}
.search_bg {
  margin-top: 2rem;
}
.hot_box {
  width: 740px;
  margin: 0 auto;
  padding: 0 0.2rem;
  .topic {
    line-height: 28px;
    font-size: 14px;
  }
  .topic_text {
    display: inline-block;
    max-width: 601px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }
  .topic_text:hover {
    color: #3b99fb;
    cursor: pointer;
  }
  .index {
    display: inline-block;
    width: 24px;
  }
  .hot {
    color: #e96863;
  }
}
</style>
