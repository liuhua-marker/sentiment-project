<template>
  <div class="login-container">
    <vue-particles
      color="#fff"
      :particle-opacity="0.6"
      :particles-number="80"
      shape-type="circle"
      :particle-size="5"
      lines-color="#fff"
      :lines-width="1"
      :line-linked="true"
      :line-opacity="0.6"
      :lines-distance="150"
      :move-speed="2"
      :hover-effect="true"
      hover-mode="repulse"
      :click-effect="true"
      click-mode="push"
      class="particles-js"
    />
    <div class="login-box">
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        autocomplete="on"
        label-position="left"
      >
        <div class="title-container">
          <div>
            <h1 style="text-align:center;margin-bottom:10px;color: #ffffff;font-weight: 530;">负面鹰眼系统</h1>
          </div>
        </div>

        <el-form-item prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="用户名"
            name="username"
            type="text"
            tabindex="1"
            autocomplete="on"
          />
        </el-form-item>

        <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="密码"
              name="password"
              tabindex="2"
              autocomplete="on"
              @keyup.native="checkCapslock"
              @blur="capsTooltip = false"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
        </el-tooltip>

        <el-form-item prop="verifyCode" class="verifyCode">
          <el-input
            ref="verifyCode"
            v-model="loginForm.verifyCode"
            placeholder="验证码"
            name="text"
            class="verifyCode_input"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-yzm">
            <img :src="img" class="verifyCode_img" @click="getCreateImg">
          </span>
        </el-form-item>

        <el-button
          :loading="loading"
          type="primary"
          style="width:100%;letter-spacing: 4px;font-size: 16px;"
          @click.native.prevent="handleLogin"
        >登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
// import { userInfo } from 'os'
import { createImg } from '@/api/user'
import { debounce } from '@/utils/index'
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        verifyCode: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur' }],
        password: [{ required: true, trigger: 'blur' }],
        verifyCode: [{ required: true, trigger: 'blur' }]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {},
      img: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    this.getCreateImg()
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    this.WebSocket.ws.close()
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    getCreateImg() {
      createImg().then((res) => {
        // this.img = window.URL.createObjectURL(res)
        function blobToDataURL(blob, callback) {
          var a = new FileReader()
          a.onload = function(e) {
            callback(e.target.result)
          }
          a.readAsDataURL(blob)
          return a
        }
        var that = this
        blobToDataURL(res, function(dataurl) {
          that.img = dataurl
        })
      })
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (
          (shiftKey && key >= 'a' && key <= 'z') ||
          (!shiftKey && key >= 'A' && key <= 'Z')
        ) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin: debounce(function() {
      this.goLoginForm()
    }, 500),
    goLoginForm() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.loginForm)
            .then((res) => {
              this.$router.push({
                path: this.redirect || '/',
                query: this.otherQuery
              })
              this.loading = false
            })
            .catch(() => {
              this.getCreateImg()
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid #efdada !important;
    background: #ece5e52e;
    border-radius: 5px;
    color: #454545;
  }

  input::-webkit-input-placeholder,
  textarea::-webkit-input-placeholder {
    color: #fff;
  }

  input:-moz-placeholder,
  textarea:-moz-placeholder {
    color: #fff;
  }

  input::-moz-placeholder,
  textarea::-moz-placeholder {
    color: #fff;
  }

  input:-ms-input-placeholder,
  textarea:-ms-input-placeholder {
    color: #fff;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #fff;
$light_gray: #eee;

.login-container {
  padding: 100px;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  perspective: 700;
  background-image: url('../../assets/Starry.jpg');
  .particles-js {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
    .verifyCode {
      border: 0 !important;
      background: transparent;
      .verifyCode_input {
        width: 65%;
        border: 1px solid #efdada;
        background: #ece5e52e;
        border-radius: 5px;
      }
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .show-yzm {
    position: absolute;
    right: 0;
    top: 0;
    width: 40%;
    text-align: right;
    height: 47px;
    line-height: 47px;
    box-sizing: border-box;
    .verifyCode_img {
      max-width: 100px;
      height: 100%;
      cursor: pointer;
    }
  }
  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }
  ::-webkit-input-placeholder {
    /* Chrome/Opera/Safari */
    color: #ffffff;
  }
  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
