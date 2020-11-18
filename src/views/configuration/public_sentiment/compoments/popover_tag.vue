<template>
  <div>
    <span>
      <el-button v-popover="yuqingtag.id" type="text" icon="el-icon-edit" @click="evaluation" />
    </span>
    <el-popover :ref="yuqingtag.id" v-model="visible" placement="bottom-start" trigger="click">
      <div>
        <div class="sentiment">
          <span class="sentiment_tit">倾向性：</span>
          <el-select
            v-model="yuqingtag.yuqingEvaluationReq.evaluationResult"
            placeholder="请选择"
            style="width: 100px"
          >
            <el-option
              v-for="(val, key ,i) in options"
              :key="i"
              :label="val"
              :value="key"
              :property="val"
            />
          </el-select>
        </div>
        <div class="sentiment">
          <span class="sentiment_tit">等级：</span>
          <el-select
            v-model="yuqingtag.yuqingEvaluationReq.grade"
            placeholder="请选择"
            style="width: 100px"
          >
            <el-option
              v-for="(val, key ,i) in optionContent"
              :key="i"
              :label="key"
              :value="val"
              :property="key"
            />
          </el-select>
        </div>
        <div class="sentiment">
          <span class="sentiment_tit">数据类型：</span>
          <el-select
            v-model="yuqingtag.yuqingEvaluationReq.analysisType"
            placeholder="请选择"
            style="width: 100px"
          >
            <el-option
              v-for="item in optionsSource"
              :key="item.sourceTypeId"
              :label="item.typeName"
              :value="item.typeCode"
              :property="item.typeName"
            />
          </el-select>
        </div>
        <div class="sentiment">
          <el-checkbox-group v-model="yuqingtag.yuqingEvaluationReq.aiMarkList">
            <div v-for="(val, key ,i) in aiMarkList" :key="i" class="sentiment">
              <el-checkbox :label="key">{{ val }}错误</el-checkbox>
            </div>
          </el-checkbox-group>
          <el-checkbox-group v-model="yuqingtag.yuqingEvaluationReq.spiderMarkList">
            <div v-for="(val, key ,i) in spiderMark" :key="i" class="sentiment">
              <el-checkbox :label="key">{{ val }}错误</el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
        <el-button
          type="primary"
          size="mini"
          class="fr"
          @click="sentimentMark(yuqingtag.yuqingEvaluationReq)"
        >确认</el-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { confdatasourcetype } from '@/api/dashboard'
import {
  evaluationResultList,
  getAiMarkList,
  getSpiderMark,
  publicSentimentMark
} from '@/api/public_sentiment/popover'
// import { getToken } from '@/utils/auth'
// import { Message } from 'element-ui'
// import { request } from '@/utils/request'
export default {
  name: 'EditTag',
  props: {
    yuqingtag: {
      type: Object,
      default: function() {
        return {}
      }
    },
    deptid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      aiMarkList: {},
      spiderMark: {},
      yuqingtags: {},
      optionContent: {
        //  等级
        零级: '0',
        一级: '1',
        二级: '2',
        三级: '3',
        四级: '4',
        五级: '5'
      },
      options: {}, //  倾向性
      optionsSource: [], // 数据类型
      sentiment: {},
      visible: false
    }
  },
  computed: {},
  watch: {
    yuqingtag: function(e) {
      return (this.yuqingtags = this.yuqingtag)
    }
  },
  created() {
    this.userInfo = this.$store.getters.userInfo
  },
  destroyed() {},
  methods: {
    // 标准的时间格式转为时间戳
    dateToMs(date) {
      const result = new Date(date).getTime()
      return result
    },
    // 获取选择框数据
    async getWordsTypeId() {
      // 舆情测评类型查询
      evaluationResultList().then(res => {
        this.options = res.data
      })
      //  获取Ai标注列表
      getAiMarkList().then(res => {
        this.aiMarkList = res.data
      })
      // 获取爬虫标注列表
      getSpiderMark().then(res => {
        this.spiderMark = res.data
      })
    },
    evaluation() {
      this.getWordsTypeId()
      this.sourceData()
    },
    // 数据类型
    sourceData() {
      const solutionForm = {
        deptId: this.deptid,
        pageNo: 1,
        pageSize: 100
      }
      confdatasourcetype(solutionForm).then(res => {
        this.optionsSource = res.rows
      })
    },
    // 极性
    async sentimentMark(val) {
      this.sentiment = val
      this.sentiment.analysisId = this.yuqingtag.id
      const res = await publicSentimentMark(this.sentiment)
      if (res.code === 200) {
        this.$message({
          type: 'success',
          message: '保存成功'
        })
        this.visible = false
        this.RefreshData()
      } else {
        this.$message({
          type: 'error',
          dangerouslyUseHTMLString: true,
          message: res.data
        })
      }
    },
    RefreshData() {
      this.$emit('RefreshData')
    }
  }
}
</script>

<style lang="scss" scoped>
.icon {
  position: absolute;
  bottom: 0;
  // left: 750px;
  right: 50px;
}
.sentiment {
  margin-bottom: 10px;
  .sentiment_tit {
    display: inline-block;
    width: 80px;
  }
}
</style>
