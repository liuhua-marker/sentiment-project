<template>
  <!--<<<<<<< HEAD-->
  <!--  <div class="app-filters">-->
  <!--    <el-form :inline="true" :model="filterParams" class="serach-form-inline">-->
  <!--      <el-form-item-->
  <!--        v-for="item in formOptionList"-->
  <!--        :key="item.paramsName"-->
  <!--        :label="item.label+'：'"-->
  <!--        :prop="item.paramsName"-->
  <!--        :style="`width:${item.lableWidth}`"-->
  <!--        v-if="!item.hidden"-->
  <!--      >-->
  <!--        <component v-bind:is="item.componentsName"-->
  <!--                   size="small"-->
  <!--                   :ref="item.paramsName"-->
  <!--                   v-model="filterParams[item.paramsName]"-->
  <!--                   :serviceObj="item.serviceObject||{}"-->
  <!--                   :type="item.type"-->
  <!--                   :placeholder="item.placeholder"-->
  <!--                   :value-format="item.valueFormat"-->
  <!--                   :readonly="item.readonly"-->
  <!--                   :disabled="item.disabled"-->
  <!--                   :style="`width:${item.width || '100%'}`"-->
  <!--                   :true-label="item.trueLabel"-->
  <!--                   :false-label="item.falseLabel"-->
  <!--                   :multiple="item.multiple"-->
  <!--        >-->
  <!--          <slot v-if="item.componentsName==='el-select'">-->
  <!--            <template>-->
  <!--              <el-option-->
  <!--                v-for="optionItem in item.options "-->
  <!--                :key="optionItem.value "-->
  <!--                :label="optionItem.label"-->
  <!--                :value="optionItem.value "-->
  <!--              ></el-option>-->
  <!--            </template>-->
  <!--=======-->
  <el-card class="app-filters box-card">
    <el-form :inline="true" :model="filterParams" class="serach-form-inline">
      <el-form-item
        v-for="item in formOptionList"
        :key="item.paramsName"
        :label="item.label"
        :prop="item.paramsName"
        :style="`width:${item.lableWidth}`"
        v-if="!item.hidden"
      >
        <component
          v-bind:is="item.componentsName"
          size="small"
          :ref="item.paramsName"
          v-model="filterParams[item.paramsName]"
          :serviceObj="item.serviceObject || {}"
          :type="item.type"
          :placeholder="item.placeholder"
          :value-format="item.valueFormat"
          :readonly="item.readonly"
          :disabled="item.disabled"
          :style="`width:${item.width || '100%'}`"
          :true-label="item.trueLabel"
          :false-label="item.falseLabel"
          :multiple="item.multiple"
          clearable
          @change="handleChange(item.isChange)"
          @keyup.enter.native="handleSearch"
        >
          <slot v-if="item.componentsName === 'el-select'">
            <template>
              <el-option
                v-for="optionItem in item.options"
                :key="optionItem.value"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </template>
          </slot>
        </component>
      </el-form-item>
      <!--&gt;>>>>>> 1074a83eb3a7fa000a02a3c17bb59208004fcb86-->

      <el-form-item>
        <el-button
          v-if="!hiddenSearch"
          type="primary"
          size="small"
          text="查询"
          @click="handleSearch"
        >
          <i class="iconfont icon-search"></i>查询
        </el-button>
        <el-button
          v-if="isReset"
          class="reset"
          size="small"
          text="重置"
          @click="handleReset"
        >
          <i class="iconfont icon-23refresh"></i>重置
        </el-button>
      </el-form-item>
      <el-button
        v-if="showAdd"
        type="primary"
        style="float: right"
        @click="handleAdd"
        >新增</el-button
      >
    </el-form>
  </el-card>
</template>

<script>
import baseSelect from '@/components/select'

export default {
  name: 'filters',
  props: ['options', 'isReset', 'showAdd', 'hiddenSearch'],
  components: { baseSelect },
  data() {
    return {
      filterParams: {},
      changeTimes: 0,
      changeTime: new Date().getTime(),
      formOptionList: [],
    }
  },
  created() {
    this.$nextTick(() => {
      if (!this.options) {
        return
      }
      var filterParams = {}
      this.options.forEach((el) => {
        // console.log(el.paramsName, el.defaultValue)
        filterParams[el.paramsName] = el.defaultValue || ''
      })
      this.filterParams = filterParams
    })
  },
  watch: {
    // options: {
    //   deep: true,
    //   handler(val) {
    //     if (!this.options) {
    //       return
    //     }
    //     var filterParams = {}
    //     this.options.forEach((el) => {
    //       filterParams[el.paramsName] = el.defaultValue || ''
    //     })
    //     this.filterParams = filterParams
    //   },
    // },
  },
  mounted() {
    this.formOptionList = this.options
    this.handleSearch()
  },
  methods: {
    handleSearch() {
      this.changeTimes++
      setTimeout(() => {
        this.changeTimes--
        if (!this.changeTimes) {
          this.$emit('change', this.filterParams)
        }
      }, 200)
    },
    handleChange(val) {
      if (val) {
        this.changeTimes++
        setTimeout(() => {
          this.changeTimes--
          if (!this.changeTimes) {
            this.$emit('handleChange', this.filterParams)
          }
        }, 200)
      }
    },
    handleReset() {
      // 重置各项
      for (let i in this.$refs) {
        this.$refs[i].forEach((el) => {
          if (el && el.reset) {
            el.reset()
          }
        })
      }
    },
    handleAdd() {
      this.$emit('handleAdd')
    },
    search() {
      this.$emit('change', this.filterParams)
    },
  },
}
</script>

<style scoped lang="scss">
.el-form-item {
  margin-bottom: 0;
}
.el-input,
.el-select {
  min-width: 240px;
}
</style>
