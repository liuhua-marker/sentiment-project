<template>
  <el-select :size="size" @change="change" v-model="val" filterable clearable>
    <el-option
      v-for="optionItem in options"
      :key="optionItem.value"
      :label="optionItem.label"
      :value="optionItem.value "
    ></el-option>
  </el-select>
</template>

<script>

export default {
  name: 'dicttypeSelect',
  props: ['value', 'serviceObj', 'size',],
  data() {
    return {
      options: [],
      val: '',
      allOptions: [],
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(val) {
        this.val = val
      }
    },
    serviceObj: {
      deep: true,
      immediate: true,
      handler(val) {
        if(!val){
          return
        }
        this.getOptionsByService()
      }
    }
  },
  mounted() {
    this.val = this.value
    // this.getOptionsByService()  //注释该行，确保只调用一次接口
  },
  methods: {
    getOptionsByService() {
      // console.error(123, serviceObj, index)
      this.serviceObj.service(this.serviceObj.params).then(res => {
        if (res.code === 200) {
          this.allOptions = res.data
          this.options = res.data.map(item => {
            return {
              label: item[this.serviceObj.formatter.label],
              value: item[this.serviceObj.formatter.value]
            }
          })
          this.serviceObj.isShowAll ? this.options.unshift({ label: '全部', value: '' }) : null
        } else {
          console.error(res)
        }
      })
    },
    change(val) {
      var obj = {}
      this.allOptions.some(item => {
        if (item[this.serviceObj.formatter.value] === val) {
          obj = item
        }
      })
      this.$emit('input', val)
      this.$emit('change', val, obj)
    }
  }
}
</script>

<style scoped>

</style>
