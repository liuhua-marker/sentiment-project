<template>
  <div>
    <el-select v-model="dictCode" :placeholder="placeholder" @change="setValue">
      <el-option v-if="nullOpt" value="" :label="nullOpt" />
      <el-option
        v-for="item in dictList"
        :key="item.id"
        :label="item.name"
        :value="item.code"
      />
    </el-select>
  </div>
</template>

<script>
import { getDictByTypeCode } from '@/api/dicttype'
export default {
  name: 'DictSelect',
  props: {
    placeholder: {
      type: String,
      default: '请选择'
    },
    dictTypeCode: {
      type: String,
      required: true
    },
    selectDictCode: {
      type: String,
      default: ''
    },
    nullOptLabel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dictList: [],
      dictCode: this.selectDictCode
    }
  },
  computed: {
    nullOpt() {
      return this.nullOptLabel
    },
    typeCode() {
      return this.dictTypeCode
    }
  },
  watch: {
    typeCode: { // 深度监听，可监听到对象、数组的变化
      handler(newV, oldV) {
        // do something, 可使用this
        this.getDictByTypeCode()
      },
      deep: true
    },
    selectDictCode() {
      this.dictCode = this.selectDictCode
    }
  },
  created() {
    this.getDictByTypeCode()
  },
  methods: {
    async getDictByTypeCode() {
      const res = await getDictByTypeCode(this.dictTypeCode)
      this.dictList = res.data
    },
    setValue(selVal) {
      this.$emit('getSelectedCode', selVal)
    }
  }
}
</script>
