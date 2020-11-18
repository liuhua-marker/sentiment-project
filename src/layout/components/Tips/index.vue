<template>
  <el-dropdown @command="handleCommand" placement="bottom" trigger="click">
    <el-badge :value="valNum" :max="9">
      <svg-icon class-name="tips-icon" @click="clickNum" icon-class="bell" />
    </el-badge>
    <el-dropdown-menu slot="dropdown">
      <div class="pop_mess clearfix">
        <div class="fl">消息中心</div>
        <div class="fr">
          <el-switch
            v-model="value"
            active-color="#13ce66"
            active-text="关"
            inactive-text="开"
            inactive-color="#ff4949"
            @change="changeTip"
          />
          <span class="pop_tz">消息通知</span>
        </div>
      </div>
      <el-dropdown-item
        v-for="(item, index) in infoList"
        :key="index"
        class="pop_YQ clearfix"
        @click="detailsPage(item.id)"
        :command="item.id"
      >
        <div style="width: 400px;">
          <div class="title">
            <el-tag
              v-if="item.emotionType === 1"
              effect="dark"
              type="success"
              size="mini"
              >正</el-tag
            >
            <el-tag
              v-if="item.emotionType === -1"
              effect="dark"
              type="danger"
              size="mini"
              >负</el-tag
            >
            <span style="margin-right: 10px">{{ item.title }}</span>
          </div>
          <div class="text clearfix">
            <div class="fl">{{ item.companyName }}</div>
            <div class="fr" style="margin-right: 10px">{{ item.source }}</div>
          </div>
          <div class="text clearfix">
            <div class="fr">{{ item.releaseTimeStr }}</div>
          </div>
        </div>
      </el-dropdown-item>
      <el-dropdown-item class="pop_YQ pop_gd" command="more">
        <el-button type="text">查看更多</el-button>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
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
      valNum: null,
      timer: null,
      value: true,
      userInfo: {},
      infoList: [],
    }
  },
  computed: {
    ...mapGetters(['isDot']),
  },
  watch: {},
  mounted() {
    this.userInfo = this.$store.getters.userInfo
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
    handleCommand(e) {
      if (e === 'more') {
        this.more()
      } else {
        this.detailsPage(e)
      }
    },
    handleIsDot() {
      this.$store.dispatch('app/isDot', true)
    },
    clickNum() {
      this.valNum = null
    },
    getDistributeRecord() {
      const data = {
        deptId: this.userInfo.deptId,
        orgId: this.userInfo.orgId,
        pageNo: 1,
        pageSize: 6,
        deduplicate: false,
        analysisTimeSort: true,
      }
      distributeRecord(data).then((res) => {
        this.infoList = res.rows
      })
    },
    changeTip(e) {
      if (e) {
        this.handdleMsg(JSON.stringify(this.userInfo))
      } else {
        this.WebSocket.ws.close()
        this.WebSocket.ws.onclose = function (evt) {
          console.log('Connection closed.')
        }
      }
    },
    // 发送和接收消息
    handdleMsg(msg) {
      const _this = this
      if (_this.WebSocket.ws && _this.WebSocket.ws.readyState === 1) {
        console.log('连接开启...')
        _this.WebSocket.ws.send(msg)
      }
      _this.WebSocket.ws.onmessage = function (res) {
        if (_this.value) {
          _this.getyuQing(res.data)
        }
        _this.valNum += 1
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
          <div style="cursor: pointer; width:260px;">
            <h4 style="margin: 5px 0;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${box}${item.title}</h4>
            <div style="text-overflow: -o-ellipsis-lastline;overflow: hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;"><b>摘要：</b>${item.abstracts.slice(
              0,
              80
            )}</div>
            <div  style="font-size: 12px;color: #999" class="clearfix">
              <div class="fl">${item.source}</div>  
              <div class="fr">${item.releaseTimeStr}</div>
            </div>
          </div>`
        const list = this.$notify({
          dangerouslyUseHTMLString: true,
          message: message,
          duration: 0,
          customClass: 'notify',
          position: 'bottom-right',
          onClick(e) {
            _this.detailsPage(item.id, list)
          },
        })
      })
    },
    // 跳转到详情页
    detailsPage(val, list) {
      // const { href } = this.$router.resolve({
      //   path: '/configuration/public_sentiment/details_page/alert_public_page',
      //   query: { id: val }
      // })
      // window.open(href, '_blank')
      this.$router.push({
        path: '/configuration/public_sentiment/details_page/alert_public_page',
        query: merge({ id: val }),
      })
      if (list) {
        list.close()
      }
    },
    more() {
      if (this.userInfo.isAdmin) {
        this.$router.push({
          path: '/configuration/public_sentiment/alert_public_sentiment',
        })
      } else {
        this.$router.push({
          path: '/configuration/public_sentiment/positive_public_sentiment',
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/.el-badge__content.is-fixed {
  position: absolute;
  top: 10px;
  right: 8px;
}
.tips-icon {
  cursor: pointer;
}
.pop_mess {
  font-size: 16px;
  font-weight: 550;
  margin-bottom: 10px;
  padding: 0 15px;
  width: 400px;
}
.pop_tz {
  font-size: 14px;
  font-weight: 400;
  margin-left: 10px;
}
.pop_YQ {
  cursor: pointer;
  border-top: 1px solid #eee;
  padding: 0 5px;
  .title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis; /* 文字超出部分省略号显示 */
    white-space: nowrap;
    .el-tag {
      margin-right: 5px;
    }
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
