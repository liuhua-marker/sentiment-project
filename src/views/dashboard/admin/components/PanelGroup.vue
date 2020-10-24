<template>
  <el-card class="box-card card">
    <el-row :gutter="30" class="panel-group">
      <el-col v-if="userInfo.orgId === '0'" :xs="6" :sm="4" :lg="4" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('orgCount')">
          <div class="card-panel-icon-wrapper icon-jigou">
            <svg-icon icon-class="jigou" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">机 构</div>
            <count-to
              :start-val="0"
              :end-val="homePageFrom.orgCount"
              :duration="3000"
              class="card-panel-num"
            />
            <span class="card-panel-unit">(家)</span>
          </div>
        </div>
      </el-col>
      <el-col v-if="userInfo.orgId === '0'" :xs="6" :sm="4" :lg="4" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('deptCount')">
          <div class="card-panel-icon-wrapper icon-bumen">
            <svg-icon icon-class="bumen" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">部 门</div>
            <count-to
              :start-val="0"
              :end-val="homePageFrom.deptCount"
              :duration="3200"
              class="card-panel-num"
            />
            <span class="card-panel-unit">(家)</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="6" :sm="lg" :lg="lg" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('companyCount')">
          <div class="card-panel-icon-wrapper icon-qiye">
            <svg-icon icon-class="qiye" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">监控目标总量</div>
            <count-to
              :start-val="0"
              :end-val="homePageFrom.companyCount"
              :duration="3600"
              class="card-panel-num"
            />
            <span class="card-panel-unit">(家)</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="6" :sm="lg" :lg="lg" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('negativeEventCount')">
          <div class="card-panel-icon-wrapper icon-yujing">
            <svg-icon icon-class="yujing" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">当月负面舆情</div>
            <count-to
              :start-val="0"
              :end-val="homePageFrom.negativeEventCount"
              :duration="3600"
              class="card-panel-num"
            />
            <span class="card-panel-unit">(条)</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="6" :sm="lg" :lg="lg" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('negativeCompanyCount')">
          <div class="card-panel-icon-wrapper icon-jinggao">
            <svg-icon icon-class="jinggao" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">当月风险主体</div>
            <count-to
              :start-val="0"
              :end-val="homePageFrom.negativeCompanyCount"
              :duration="3600"
              class="card-panel-num"
            />
            <span class="card-panel-unit">(家)</span>
          </div>
        </div>
      </el-col>
      <el-col v-if="userInfo.orgId !== '0'" :xs="6" :sm="lg" :lg="lg" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('dataCount')">
          <div class="card-panel-icon-wrapper icon-shuju">
            <svg-icon icon-class="shuju" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">当月舆情总量</div>
            <count-to
              :start-val="0"
              :end-val="homePageFrom.dataCount"
              :duration="3600"
              class="card-panel-num"
            />
            <span class="card-panel-unit">(条)</span>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import CountTo from 'vue-count-to'
import { homePageIndex, targetCombinationHomePageIndex } from '@/api/dashboard'
export default {
  components: { CountTo },
  props: {
    homepage: {
      type: Object,
      default: function() {
        return {
          deptId: '',
          orgId: ''
        }
      }
    }
  },
  data() {
    return {
      homePageIndex: this.homepage,
      lg: 5,
      homePageFrom: {
        orgCount: 0,
        deptCount: 0,
        companyCount: 0,
        negativeEventCount: 0,
        negativeCompanyCount: 0,
        dataCount: 0
      },
      userInfo: {}
    }
  },
  watch: {
    homePageFrom() {
      for (var item in this.homePageFrom) {
        this.homePageFrom[item] = this.homePageFrom[item] - 0
      }
    },
    homePage() {
      return (this.homePageIndex = this.homepage)
    }
  },

  created() {
    // 获取管理员身份
    this.userInfo = this.$store.getters.userInfo
    // this.getHomePageIndex()
    if (this.userInfo.orgId === '0') {
      this.lg = 5
    } else {
      this.lg = 6
    }
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },
    async getHomePageIndex(item) {
      if (item) {
        const res = await targetCombinationHomePageIndex(item)
        this.homePageFrom = res.data
      } else {
        var page = {}
        if (this.userInfo.orgId !== '0') {
          page.orgId = this.userInfo.orgId
          page.deptId = ''
        }
        if (this.userInfo.deptId !== '0') {
          page.orgId = this.userInfo.orgId
          page.deptId = this.userInfo.deptId
        }
        const res = await homePageIndex(page)
        this.homePageFrom = res.data
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  .card-panel-col {
    text-align: center;
  }
  .card-panel {
    height: 0.54rem;
    // cursor: pointer;  // 鼠标经过变小手
    font-size: 0.06rem;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    border-radius: 20px;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.1);

    // &:hover {
    //   .card-panel-icon-wrapper {
    //     background: #fff;
    //   }
    //   .icon-jigou {
    //     color: #1fdf6f;
    //   }

    //   .icon-bumen {
    //     color: #36a3f7;
    //   }

    //   .icon-qiye {
    //     color: #fc8906;
    //   }

    //   .icon-yujing {
    //     color: #06eeff;
    //   }
    //   .icon-jinggao {
    //     color: #fc2744;
    //   }
    //   .icon-shuju {
    //     color: #05c078;
    //   }
    // }
    .card-panel-icon-wrapper {
      color: #fff;
    }
    .icon-jigou {
      background: #1fdf6f;
    }

    .icon-bumen {
      background: #36a3f7;
    }

    .icon-qiye {
      background: #fc8906;
    }

    .icon-yujing {
      background: #06eeff;
    }
    .icon-jinggao {
      background: #fc2744;
    }
    .icon-shuju {
      background: #05c078;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 0.07rem 0 0 0.07rem;
      padding: 0.08rem;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 0.24rem;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 0.13rem;
      margin-left: 0px;
      .card-panel-text {
        line-height: 0.09rem;
        color: rgba(0, 0, 0, 0.45);
        font-size: 0.08rem;
        margin-bottom: 0.06rem;
      }
      .card-panel-unit {
        font-size: 0.05rem;
        font-weight: 400;
      }
      .card-panel-num {
        font-size: 0.1rem;
      }
    }
  }
}
@media only screen and (max-width: 768px) {
  .card-panel-description {
    display: none;
  }
}
@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 0.07rem auto !important;
      float: none !important;
    }
  }
}
</style>
