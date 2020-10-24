<template>
  <div>
    {{ dictName }}
  </div>
</template>

<script>
import { getByDictCode } from '@/api/dicttype'
export default {
  name: 'DictName',
  props: {
    dictCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dictName: ''
    }
  },
  computed: {
    selectedDictCode() {
      return this.dictCode
    }
  },
  watch: {
    selectedDictCode: { // 深度监听，可监听到对象、数组的变化
      handler(newV, oldV) {
        // do something, 可使用this
        this.getByDictCode()
      },
      deep: true
    }
  },
  created() {
    this.getByDictCode()
  },
  methods: {
    async getByDictCode() {
      const res = await getByDictCode(this.dictCode)
      this.dictName = res.data ? res.data.name : ''
    }
  }
}
</script>
