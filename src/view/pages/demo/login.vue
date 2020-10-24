<template>
  <div>
    <div class="login_warp">
      <div class="loginbox fl">
        <div class="login_header">
          <span :class="{active:cur==0}" @click="cur=0">账号登录</span>
        </div>
        <div class="login_content">
          <div v-show="cur==0" class="Cbody_item">
            <div class="form_item">
              <input v-model="loginForm.username" type="text" name="fname" placeholder="用户名">
            </div>
            <div class="form_item">
              <input v-model="loginForm.password" type="password" name="fpassword" placeholder="密码">
            </div>
            <div class="form_item">
              <div class="fl">
                <input type="checkbox">记住密码
              </div>
              <div class="fr">
                <a href="javascript:;">找回密码</a>
              </div>
            </div>
            <div class="clear" />
            <div class="form_item">
              <input type="submit" name value="登录" @click="handleLogin">
            </div>
          </div>
        </div>
      </div>
      <div class="loginrslider fl" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      cur: 0, // 默认选中第一个tab
      loginForm: {
        username: 'sysadmin',
        password: '123456'
      }
    }
  },
  created() {
    this.open5()
  },
  methods: {
    open() {
      this.$message('你拥有系统最高权限^_^')
    },
    open5() {
      this.$notify.info({
        title: '消息',
        message: '欢迎登录',
        offset: 80
      })
    },
    handleLogin() {
      alert()
      // 登陆成功跳转首页
      axios
        .post('https://health.qbjiankang.com/api-auth/jwt/token', {
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        .then(response => {
          const res = response.data
          localStorage.setItem('token', 'Bearer ' + res.data.res.token)
          this.$router.push('/index')
        })
    }
  }
}
</script>

<style lang="scss">
@import '../../../styles/main.scss';
</style>

