<template>
  <div v-loading="loading" class="table_box">
    <template v-show="dataLength > 0">
      <div class="total">
        共筛选出<span>{{ page.total }}</span
        >条
      </div>
      <ul class="table-ul">
        <li v-for="(item, index) in listData" :key="index" class="table">
          <div class="tag">
            <span v-if="item.emotionType === 1" class="green">正</span>
            <span v-if="item.emotionType === -1" class="red">负</span>
            <span v-if="item.emotionType === 0" class="blue">源</span>
          </div>
          <div style="display: inline-block; width: 95%">
            <div class="title">
              <a
                v-if="item.emotionType == 0"
                :href="item.sourceUrl"
                target="_blank"
              >
                <span>{{ index + 1 }}. </span>
                <span>{{ item.title }}</span>
              </a>
              <a v-else href="javascript:;" @click="detailsPage(item.id)">
                <span>{{ index + 1 }}. </span>
                <span>{{ item.title }}</span>
              </a>
            </div>
            <p class="content">
              <b>摘要：</b>
              <span v-if="item.abstracts" v-html="item.abstracts" />
              <span v-else v-html="item.content" />
            </p>
            <p
              v-if="
                item.emotionType === -1 ||
                item.companyName ||
                item.transmitTarget
              "
              class="content"
            >
              <span v-if="item.emotionType === -1">
                <b>预警级别：</b>
                <span>{{ item.contentGrade }}</span>
              </span>
              <span
                v-if="item.companyName"
                :style="item.emotionType === -1 ? 'margin-left: 20px;' : ''"
              >
                <b>目标公司：</b>
                <span>
                  <span
                    v-if="item.deptId"
                    class="company_btn"
                    @click="detailsCompany(item)"
                  >
                    {{ item.companyName }}
                  </span>
                  <span v-else>{{ item.companyName }}</span>
                </span>
                <span
                  v-if="hotLevel"
                  class="hotLevel"
                  @click="eventSentiment(item)"
                >
                  事件脉络
                  <!-- <span :class="item.hotLevel >= 1 ? 'isHot' : ''">
                    <svg-icon icon-class="hot" /> {{ item.hotLevel }}
                  </span> -->
                </span>
              </span>
              <span v-if="item.transmitTarget" style="margin-left: 20px">
                <b>关联方：</b>
                <span>{{ item.transmitTarget }}</span>
              </span>
            </p>
            <p v-if="item.labelNames || item.signalNames" class="content">
              <span v-if="item.labelNames">
                <b>事件标签：</b>
                <span v-for="(val, j) in item.labelNames" :key="j">{{
                  val
                }}</span>
              </span>
              <span v-if="item.signalNames">
                <b style="margin-left: 20px">预警类型：</b>
                <span v-for="name in item.signalNames" :key="name">{{
                  name
                }}</span>
              </span>
            </p>
            <p class="content">
              <b>发表时间：</b>
              <span>{{ Number(item.releaseTime) | parseTime() }}</span>
              <b style="margin-left: 20px">数据类型：</b>
              <span>{{ item.sourceTypeName }}</span>
              <b style="margin-left: 20px">来源：</b>
              <span>{{ item.source === '' ? '未知' : item.source }}</span>
              <b style="margin-left: 20px">作者：</b>
              <span>{{ item.nickname === '' ? '未知' : item.nickname }}</span>
            </p>
            <div v-if="isEdit" class="icon">
              <edit-tag :yuqingtag="item" @RefreshData="search" />
            </div>
          </div>
        </li>
      </ul>
      <!-- 分页 -->
      <div class="pagination_box">
        <Pagination
          :total="page.total"
          :pageSize="10"
          :pageNum="page.pageNo"
          @pageNumChange="handleCurrentChange"
        />
      </div>
    </template>
    <div v-if="!loading && dataLength <= 0" class="no_text">
      <img :src="noPng" alt="暂无内容" />
    </div>
  </div>
</template>

<script>
import EditTag from '@/views/search/components/editTag'
import noPng from '@/assets/no-repect.png'
import Pagination from '@/components/Pagination/pagination'
export default {
  name: 'Sentiment',
  components: { EditTag, Pagination },
  props: ['options', 'isEdit', 'hotLevel'],
  data() {
    return {
      noPng: noPng,
      listData: [],
      dataLength: 0,
      loading: true,
      page: {
        total: 0,
        pageSize: 10,
        pageNo: 1,
        pageSizes: [10, 20, 50],
        pageCount: 6,
      },
      params: {},
      routerName: '',
    }
  },
  watch: {},
  created() {
    this.routerName = this.$router.currentRoute.name
  },
  methods: {
    // 获取页面数据
    search(_params) {
      // 清除status的检测
      if (window.intelVal) {
        clearInterval(window.intelVal)
      }

      if (_params) {
        this.params = {
          ..._params,
        }
      }
      // 获取列表数据
      if (this.options) {
        this.loading = true
        if (_params) {
          this.params.pageSize = this.page.pageSize
          this.params.pageNo = 1
          this.page.pageNo = 1
        } else {
          this.params.pageSize = this.page.pageSize
          this.params.pageNo = this.page.pageNo
        }
        this.getDataByFN(this.params)
      }
    },
    getDataByFN(params) {
      this.options(params)
        .then((ret) => {
          document.documentElement.scrollTop = 0
          if (ret.code !== 200) {
            this.$message({
              type: 'error',
              message: ret.msg || '未知错误',
            })
            this.listData = []
            return
          }
          this.serviceCallBack(ret, '', params)
        })
        .catch((err) => {
          this.loading = false
          console.error(err)
        })
    },
    serviceCallBack(ret, isOutSideRet, params) {
      // 处理列表数据
      this.loading = false
      if (ret.row || ret.data || ret.rows) {
        var arr = ret.row || ret.data || ret.rows
        this.page.total = ret.total
        this.quanWordListData(arr)
      } else {
        this.$message({
          type: 'error',
          message: ret.message || '未知错误',
        })
      }
    },
    quanWordListData(res) {
      res.forEach((itemParent, index) => {
        if (!itemParent.yuqingEvaluationReq) {
          itemParent.yuqingEvaluationReq = this.sentiment
        }
        if (itemParent.abbs) {
          itemParent.abbs.forEach((item) => {
            const pattern = /[`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/
            if (item === '公司') return
            const name = item.replace(pattern, '')
            const replaceReg = new RegExp(item, 'g')
            itemParent.abstracts = itemParent.abstracts.replace(
              replaceReg,
              `<span style="color: #0984ff">${item}</span>`
            )
          })
        }
        const Reg = /【/g
        const Reg2 = /】/g
        if (itemParent.abstracts) {
          if (itemParent.emotionType === 1) {
            itemParent.abstracts = itemParent.abstracts.replace(
              Reg,
              '【<span style="color: #13ce66">'
            )
          }
          if (itemParent.emotionType === -1) {
            itemParent.abstracts = itemParent.abstracts.replace(
              Reg,
              '【<span style="color: #ff4949">'
            )
          }
          itemParent.abstracts = itemParent.abstracts.replace(Reg2, '</span>】')
        }
      })
      this.listData = res
      this.dataLength = this.listData.length
    },
    // 跳转到详情页
    detailsPage(val) {
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/alert_public_page',
        query: { id: val, name: this.routerName },
      })
    },
    // 跳转舆情脉络详情
    detailsCompany(val) {
      this.$router.push({
        path:
          '/configuration/public_sentiment/details_page/company_public_page',
        query: {
          deptId: val.deptId,
          targetCompany: decodeURIComponent(val.companyName),
          orgId: val.orgId,
          name: this.routerName
        },
      })
    },
    //  跳转事件脉络
    eventSentiment(val) {
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/event_public_page',
        query: {
          id: val.id,
        },
      })
    },
    handleCurrentChange(pageNo, isAdd) {
      this.page.pageNo = pageNo
      this.search()
    },
  },
}
</script>

<style lang="scss" scoped>
.table_box {
  min-height: 60vh;
}
.total {
  font-size: 0.14rem;
  color: #666;
  margin-top: 0.1rem;
  span {
    color: #3b99fb;
  }
}
.table-ul {
  font-size: 0.14rem;
  padding: 0;
  margin: 0.1rem 0;
  .tag {
    display: inline-block;
    width: 0.6rem;
    vertical-align: top;
    margin-top: 0.06rem;
    span {
      padding: 0.04rem 0.15rem;
      color: #fff;
      border-radius: 0.05rem;
      font-size: 0.14rem;
    }
    .red {
      background: #e96863;
    }
    .green {
      background: #13ce66;
    }
    .blue {
      background: #3b99fb;
    }
  }

  .hotLevel {
    margin-left: 0.2rem;
    border: 0.01rem solid #ff4949;
    cursor: pointer;
    color: #ff4949;
    padding: 0.02rem 0.05rem 0;
    border-radius: 0.04rem;
    display: inline-block;
    font-size: 0.14rem;
    line-height: 0.2rem;
    vertical-align: middle;
    span {
      color: #999;
      display: inline-block;
      border-left: 1px solid #ff4949;
      padding-left: 0.05rem;
      margin-left: 0.05rem;
      font-size: 0.14rem;
    }
    .isHot {
      color: #ff4949;
    }
  }
}
.hotLevel:hover {
  color: #f88585;
  border-color: #f88585;
  span {
    border-color: #f88585;
  }
}
.table {
  position: relative;
  box-sizing: border-box;
  list-style: none;
  border-bottom: 1px dashed #ccc;
  padding: 0.1rem 0;
  .title {
    font-size: 0.17rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
}
.content {
  font-size: 0.14rem;
  line-height: 0.24rem;
  margin: 0;
  margin-top: 0.05rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  b {
    font-size: 0.15rem;
  }
}
.company_btn {
  cursor: pointer;
  color: #3b99fb;
}
.icon {
  position: absolute;
  bottom: 0.2rem;
  right: 0.5rem;
}

.pagination_box {
  margin-top: 0.2rem;
  text-align: right;
}
.no_text {
  text-align: center;
  width: 4rem;
  margin: 0 auto;
  margin-top: 0.6rem;
  img {
    width: 100%;
    height: auto;
  }
}
</style>
