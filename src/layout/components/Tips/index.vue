<template>
  <div v-if="userInfo.deptId != 0" class="header-tips">
    <el-popover v-model="visible" width="400" trigger="manual">
      <div>
        <div class="pop_mess clearfix">
          <div class="fl">消息中心</div>
          <div class="fr">
            <el-switch
              v-model="value"
              active-color="#13ce66"
              active-text="关"
              inactive-text="开"
              inactive-color="#ff4949"
            />
            <span class="pop_tz">消息通知</span>
          </div>
        </div>
        <div
          v-for="(item,index) in infoList"
          :key="index"
          class="pop_YQ clearfix"
          @click="detailsPage(item.id)"
        >
          <div class="title">
            <el-tag v-if="item.emotionType === 1" effect="dark" type="success" size="mini">正</el-tag>
            <el-tag v-if="item.emotionType === -1" effect="dark" type="danger" size="mini">负</el-tag>
            <span style="margin-right: 10px">{{ item.title }}</span>

          </div>
          <!-- <el-row class="text">
            <el-col :span="11">{{ item.companyName.slice(0,12) }}</el-col>
            <el-col :span="5">{{ item.source }}</el-col>
            <el-col :span="8">{{ item.releaseTimeStr }}</el-col>
          </el-row> -->
          <div class="text clearfix">
            <div class="fl">{{ item.companyName }}</div>
            <div class="fr" style="margin-right: 10px">{{ item.source }}</div>
          </div>
          <div class="text clearfix">
            <div class="fr">{{ item.releaseTimeStr }}</div>
          </div>
        </div>
        <div class="pop_YQ pop_gd">
          <el-button type="text" @click="more">查看更多</el-button>
        </div>
      </div>

      <el-badge slot="reference" :value="valNum" :max="9" class="item">
        <svg-icon class-name="tips-icon" icon-class="bell" @click.stop="click" />
      </el-badge>
    </el-popover>
  </div>
</template>

<script>
import { distributeRecord } from '@/api/public_sentiment/alert_public_sentiment'
import { Notification } from 'element-ui'
import merge from 'webpack-merge'
import { mapGetters } from 'vuex'
import { yqSearchInfo } from '@/api/public_sentiment/public_sentiment_page'
export default {
  // name: 'Tips',
  data() {
    return {
      visible: false,
      valNum: null,
      timer: null,
      value: true,
      userInfo: {},
      infoList: []
    }
  },
  computed: {
    ...mapGetters(['isDot'])
  },
  watch: {

  },
  mounted() {
    this.userInfo = this.$store.getters.userInfo
    if (this.userInfo.deptId === '0') {
      return
    }
    this.handdleMsg(JSON.stringify(this.userInfo))
    this.getDistributeRecord()
  },

  beforeDestroy() {
    window.localStorage.removeItem('isTrue')
    // this.WebSocket.ws.close()
    // this.WebSocket.ws.onclose = function (evt) {
    //   console.log('Connection closed.')
    // }
  },
  methods: {
    handleIsDot() {
      this.$store.dispatch('app/isDot', true)
    },
    click() {
      this.visible = !this.visible
      this.valNum = null
    },
    getDistributeRecord() {
      const data = {
        deptId: this.userInfo.deptId,
        orgId: this.userInfo.orgId,
        pageNo: 1,
        pageSize: 8,
        deduplicate: false,
        analysisTimeSort: true
      }
      distributeRecord(data).then((res) => {
        this.infoList = res.rows
      })
    },
    // 发送和接收消息
    handdleMsg(msg) {
      if (this.userInfo.deptId === '0') {
        return
      }
      const _this = this
      if (_this.WebSocket.ws && _this.WebSocket.ws.readyState === 1) {
        console.log('连接开启...')
        _this.WebSocket.ws.send(msg)
      }
      _this.WebSocket.ws.onmessage = function(res) {
        if (_this.value) {
          _this.getyuQing(res.data)
        }
        if (!_this.visible) {
          _this.valNum += 1
        }
        // 首页舆情数据刷新
        if (_this.timer) {
          clearTimeout(_this.timer)
        }
        _this.timer = setTimeout(() => {
          _this.getDistributeRecord()
          _this.handleIsDot()
        }, 1000)
      }
    },
    getyuQing(data) {
      yqSearchInfo(data).then((res) => {
        var noty = document.querySelector('.el-notification')
        if (noty) {
          Notification.closeAll()
        }
        var _this = this
        const item = res.data
        var box = ''
        if (item.emotionType === 1) {
          box = `<div style="display: inline-block;padding: 0 3px;color: #fff;margin-right: 2px;background: #13ce66;border-radius: 4px;">正</div>`
        } else if (item.emotionType === -1) {
          box = `<div style="display: inline-block;padding: 0 3px;color: #fff;margin-right: 2px;background: #ff4949;border-radius: 4px;">负</div>`
        }
        const message = `
          <div style="cursor: pointer">
            <h4 style="margin: 5px 0">${box}${item.title}
            </h4>
            <div><b>摘要：</b>${item.abstracts.slice(0, 80)}</div>
            <div  style="font-size: 12px;color: #999" class="clearfix">
              <div class="fl">${item.source}</div>  
              <div class="fr">${item.releaseTimeStr}</div>
            </div>
          </div>`
        const list = this.$notify({
          dangerouslyUseHTMLString: true,
          message: message,
          duration: 5000,
          customClass: 'notify',
          position: 'bottom-right',
          onClick(e) {
            _this.detailsPage(item.id, list)
          }
        })
      })
    },
    // 跳转到详情页
    detailsPage(val, list) {
      this.visible = false
      // const { href } = this.$router.resolve({
      //   path: '/configuration/public_sentiment/details_page/alert_public_page',
      //   query: { id: val }
      // })
      // window.open(href, '_blank')
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/alert_public_page',
        query: merge({ id: val })
      })
      if (list) {
        list.close()
      }
    },
    more() {
      if (this.userInfo.isAdmin) {
        this.$router.push({
          path: '/configuration/public_sentiment/alert_public_sentiment'
        })
      } else {
        this.$router.push({
          path: '/configuration/public_sentiment/positive_public_sentiment'
        })
      }
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.header-tips {
  font-size: 0 !important;
  .item {
    height: 24px;
  }
  /deep/ .is-dot {
    height: 13px !important;
    width: 13px !important;
  }
  .tips-icon {
    cursor: pointer;
    font-size: 20px;
    vertical-align: middle;
    margin-top: -24px;
  }
}
.pop_mess {
  font-size: 16px;
  font-weight: 550;
  margin-bottom: 10px;
}
.pop_tz {
  font-size: 14px;
  font-weight: 400;
  margin-left: 10px;
}
.pop_YQ {
  cursor: pointer;
  border-top: 1px solid #eee;
  padding: 10px 5px;
  .title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  .text {
    font-size: 12px;
    color: #999;
  }
}
.pop_gd {
  text-align: center;
  padding: 0;
}
/deep/ .el-switch__label.is-active {
  color: transparent;
}
/deep/ .el-switch__label--left {
  margin-right: -19px;
  z-index: 1;
  color: #fff;
}
/deep/ .el-switch__label--right {
  margin-left: -19px;
  z-index: 1;
  color: #fff;
}
</style>
